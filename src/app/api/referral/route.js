import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET — fetch referral stats, commissions, and withdrawals
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      referralCode: true,
      plaidBankName: true,
      plaidAccountMask: true,
      plaidAccountId: true,
      referrals: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          businesses: { select: { id: true, name: true, status: true } },
        },
      },
      commissions: {
        orderBy: { createdAt: 'desc' },
        select: { id: true, amount: true, month: true, status: true, paidOut: true, createdAt: true, referredUserId: true, businessId: true },
      },
      withdrawals: {
        orderBy: { createdAt: 'desc' },
        select: { id: true, amount: true, status: true, adminNote: true, createdAt: true, processedAt: true, plaidBankName: true, plaidAccountMask: true },
      },
    },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const totalEarned = user.commissions.reduce((sum, c) => sum + c.amount, 0)
  const availableBalance = user.commissions
    .filter(c => c.status === 'AVAILABLE' && !c.paidOut)
    .reduce((sum, c) => sum + c.amount, 0)
  const pendingWithdrawals = user.withdrawals
    .filter(w => w.status === 'PENDING')
    .reduce((sum, w) => sum + w.amount, 0)

  return NextResponse.json({
    referralCode: user.referralCode,
    bankConnected: !!user.plaidAccountId,
    bankName: user.plaidBankName,
    accountMask: user.plaidAccountMask,
    referrals: user.referrals,
    commissions: user.commissions,
    withdrawals: user.withdrawals,
    stats: {
      totalReferrals: user.referrals.length,
      activeReferrals: user.referrals.filter(r => r.businesses.some(b => b.status === 'ACTIVE')).length,
      totalEarned: Math.round(totalEarned * 100) / 100,
      availableBalance: Math.round(availableBalance * 100) / 100,
      pendingWithdrawals: Math.round(pendingWithdrawals * 100) / 100,
    },
  })
}

// POST — request a withdrawal
export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action, amount, plaidPublicToken, plaidAccountId, plaidBankName, plaidAccountMask } = await req.json()

  // ── Connect bank account via Plaid ──────────────────────────────────────────
  if (action === 'connect_bank') {
    if (!plaidPublicToken || !plaidAccountId) {
      return NextResponse.json({ error: 'Plaid token and account ID required' }, { status: 400 })
    }

    try {
      // Exchange public token for access token via Plaid API
      const plaidRes = await fetch('https://sandbox.plaid.com/item/public_token/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.PLAID_CLIENT_ID,
          secret: process.env.PLAID_SECRET,
          public_token: plaidPublicToken,
        }),
      })
      const plaidData = await plaidRes.json()

      if (plaidData.error_code) {
        return NextResponse.json({ error: plaidData.error_message }, { status: 400 })
      }

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          plaidAccessToken: plaidData.access_token,
          plaidAccountId,
          plaidBankName,
          plaidAccountMask,
        },
      })

      return NextResponse.json({ success: true, bankName: plaidBankName, accountMask: plaidAccountMask })
    } catch (e) {
      console.error('Plaid connect error:', e)
      return NextResponse.json({ error: 'Failed to connect bank account' }, { status: 500 })
    }
  }

  // ── Request a withdrawal ───────────────────────────────────────────────────
  if (action === 'withdraw') {
    if (!amount || amount < 10) {
      return NextResponse.json({ error: 'Minimum withdrawal is $10' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        commissions: { where: { paidOut: false } },
      },
    })

    if (!user.plaidAccountId) {
      return NextResponse.json({ error: 'Please connect your bank account first' }, { status: 400 })
    }

    const availableBalance = user.commissions.reduce((sum, c) => sum + c.amount, 0)
    if (amount > availableBalance) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    // Check no pending withdrawal already exists using raw query to avoid enum issue
    const existing = await prisma.$queryRaw`
      SELECT id FROM "WithdrawalRequest" 
      WHERE "userId" = ${session.user.id} AND status = 'PENDING' 
      LIMIT 1
    `
    if (existing.length > 0) {
      return NextResponse.json({ error: 'You already have a pending withdrawal request' }, { status: 400 })
    }

    // Create withdrawal using raw query to avoid enum issue
    const withdrawalId = `wr_${Math.random().toString(36).substring(2, 18)}`
    await prisma.$executeRaw`
      INSERT INTO "WithdrawalRequest" ("id", "createdAt", "updatedAt", "userId", "amount", "status", "plaidAccountId", "plaidBankName", "plaidAccountMask")
      VALUES (${withdrawalId}, NOW(), NOW(), ${session.user.id}, ${amount}, 'PENDING', ${user.plaidAccountId || null}, ${user.plaidBankName || null}, ${user.plaidAccountMask || null})
    `

    // Mark commissions as withdrawn up to the requested amount only
    let remaining = amount
    for (const commission of user.commissions) {
      if (remaining <= 0) break
      if (commission.amount <= remaining) {
        // Mark entire commission as withdrawn
        await prisma.$executeRaw`
          UPDATE "ReferralCommission" 
          SET status = 'WITHDRAWN', "paidOut" = true, "withdrawalId" = ${withdrawalId}
          WHERE id = ${commission.id}
        `
        remaining = Math.round((remaining - commission.amount) * 100) / 100
      }
      // If commission is larger than remaining, leave it — don't partially mark it
    }

    return NextResponse.json({ success: true, withdrawal: { id: withdrawalId } })
  }

  // ── Disconnect bank ────────────────────────────────────────────────────────
  if (action === 'disconnect_bank') {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { plaidAccessToken: null, plaidAccountId: null, plaidBankName: null, plaidAccountMask: null },
    })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
