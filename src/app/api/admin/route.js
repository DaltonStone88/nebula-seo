import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

function isAdmin(session, req) {
  const adminEmail = process.env.ADMIN_EMAIL || 'stonemdalton@gmail.com'
  return session?.user?.email === adminEmail
}

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session, req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  // ── Overview stats ─────────────────────────────────────────────────────────
  if (action === 'overview') {
    const [users, businesses, withdrawals, commissions] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true, name: true, email: true, createdAt: true, plan: true,
          stripeCustomerId: true,
          businesses: {
            select: {
              id: true, name: true, status: true, stripeSubscriptionId: true,
              stripeCurrentPeriodEnd: true, cancelAtPeriodEnd: true, createdAt: true,
              avgRank: true, lastPostGeneratedAt: true,
              _count: { select: { rankAudits: true, automationPosts: true } }
            }
          },
          commissions: {
            where: { status: 'AVAILABLE', paidOut: false },
            select: { amount: true }
          },
          withdrawals: {
            where: { status: 'PENDING' },
            select: { amount: true, id: true }
          },
          _count: { select: { referrals: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.business.count({ where: { status: 'ACTIVE' } }),
      prisma.withdrawalRequest.findMany({
        where: { status: 'PENDING' },
        include: {
          user: { select: { name: true, email: true, plaidAccessToken: true, plaidAccountId: true, plaidBankName: true, plaidAccountMask: true } }
        },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.referralCommission.aggregate({
        _sum: { amount: true },
        where: { status: 'AVAILABLE', paidOut: false }
      }),
    ])

    const activeBusinesses = users.flatMap(u => u.businesses.filter(b => b.status === 'ACTIVE'))
    const mrr = activeBusinesses.length * 79
    const newThisMonth = users.filter(u => {
      const d = new Date(u.createdAt)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
    const churnedThisMonth = users.flatMap(u => u.businesses).filter(b => {
      return b.cancelAtPeriodEnd && b.stripeCurrentPeriodEnd &&
        new Date(b.stripeCurrentPeriodEnd) > new Date() // cancelling but not yet ended
    }).length

    const totalOutstandingBalance = commissions._sum.amount || 0

    return NextResponse.json({
      stats: {
        totalUsers: users.length,
        activeBusinesses,
        mrr,
        newUsersThisMonth: newThisMonth,
        churnedThisMonth,
        totalOutstandingBalance: Math.round(totalOutstandingBalance * 100) / 100,
        pendingWithdrawals: withdrawals.length,
      },
      users: users.map(u => ({
        ...u,
        activeLocations: u.businesses.filter(b => b.status === 'ACTIVE').length,
        mrr: u.businesses.filter(b => b.status === 'ACTIVE').length * 79,
        outstandingBalance: Math.round(u.commissions.reduce((s, c) => s + c.amount, 0) * 100) / 100,
        hasPendingWithdrawal: u.withdrawals.length > 0,
      })),
      withdrawals,
    })
  }

  // ── All businesses ─────────────────────────────────────────────────────────
  if (action === 'businesses') {
    const businesses = await prisma.business.findMany({
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { rankAudits: true, automationPosts: true, reviews: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(businesses)
  }

  // ── Referral tree ──────────────────────────────────────────────────────────
  if (action === 'referrals') {
    const commissions = await prisma.referralCommission.findMany({
      include: {
        referrer: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    const byReferrer = {}
    for (const c of commissions) {
      const key = c.referrerId
      if (!byReferrer[key]) {
        byReferrer[key] = {
          referrer: c.referrer,
          totalEarned: 0,
          availableBalance: 0,
          commissions: [],
        }
      }
      byReferrer[key].totalEarned += c.amount
      if (!c.paidOut) byReferrer[key].availableBalance += c.amount
      byReferrer[key].commissions.push(c)
    }
    return NextResponse.json(Object.values(byReferrer))
  }

  // ── Automation health ──────────────────────────────────────────────────────
  if (action === 'automation') {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const businesses = await prisma.business.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true, name: true, lastPostGeneratedAt: true, billingDay: true,
        targetKeywords: true, targetCities: true,
        user: { select: { email: true } },
        _count: { select: { automationPosts: true } }
      }
    })
    const flagged = businesses.filter(b => {
      const noPostsRecently = !b.lastPostGeneratedAt || new Date(b.lastPostGeneratedAt) < thirtyDaysAgo
      const noKeywords = !b.targetKeywords?.length
      const noCities = !b.targetCities?.length
      return noPostsRecently || noKeywords || noCities
    })
    return NextResponse.json({ businesses, flagged })
  }

  // ── Fetch Plaid account/routing for a withdrawal ───────────────────────────
  if (action === 'plaid_numbers') {
    const withdrawalId = searchParams.get('withdrawalId')
    if (!withdrawalId) return NextResponse.json({ error: 'withdrawalId required' }, { status: 400 })

    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalId },
      include: { user: { select: { plaidAccessToken: true, plaidAccountId: true } } }
    })
    if (!withdrawal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (!withdrawal.user.plaidAccessToken) return NextResponse.json({ error: 'No Plaid token for this user' }, { status: 400 })

    const plaidEnv = process.env.PLAID_ENV === 'production' ? 'production' : 'sandbox'
    const res = await fetch(`https://${plaidEnv}.plaid.com/auth/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.PLAID_CLIENT_ID,
        secret: process.env.PLAID_SECRET,
        access_token: withdrawal.user.plaidAccessToken,
      }),
    })
    const data = await res.json()
    if (data.error_code) return NextResponse.json({ error: data.error_message }, { status: 400 })

    const account = data.accounts?.find(a => a.account_id === withdrawal.user.plaidAccountId) || data.accounts?.[0]
    const numbers = data.numbers?.ach?.find(n => n.account_id === account?.account_id)

    return NextResponse.json({
      accountName: account?.name,
      accountType: account?.subtype,
      accountNumber: numbers?.account,
      routingNumber: numbers?.routing,
      wireRouting: numbers?.wire_routing,
      bankName: withdrawal.plaidBankName,
      mask: withdrawal.plaidAccountMask,
    })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session, req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action, withdrawalId, userId, adminNote } = await req.json()

  // ── Approve withdrawal ─────────────────────────────────────────────────────
  if (action === 'approve_withdrawal') {
    await prisma.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: { status: 'APPROVED', adminNote, processedAt: new Date() }
    })
    return NextResponse.json({ success: true })
  }

  // ── Mark withdrawal as paid ────────────────────────────────────────────────
  if (action === 'mark_paid') {
    await prisma.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: { status: 'PAID', processedAt: new Date() }
    })
    return NextResponse.json({ success: true })
  }

  // ── Reject withdrawal ──────────────────────────────────────────────────────
  if (action === 'reject_withdrawal') {
    const withdrawal = await prisma.withdrawalRequest.findUnique({ where: { id: withdrawalId } })
    if (!withdrawal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: { status: 'REJECTED', adminNote }
    })

    // Re-credit the commissions so the user can withdraw again
    await prisma.referralCommission.updateMany({
      where: { withdrawalId },
      data: { status: 'AVAILABLE', paidOut: false, withdrawalId: null }
    })

    return NextResponse.json({ success: true })
  }

  // ── Delete user ────────────────────────────────────────────────────────────
  if (action === 'delete_user') {
    await prisma.user.delete({ where: { id: userId } })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
