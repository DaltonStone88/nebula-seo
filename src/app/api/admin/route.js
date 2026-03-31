import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'stonemdalton@gmail.com'

function isAdmin(session) {
  return session?.user?.email === ADMIN_EMAIL
}

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  if (action === 'overview') {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true, name: true, email: true, createdAt: true, plan: true,
          businesses: {
            select: {
              id: true, name: true, status: true, cancelAtPeriodEnd: true,
              stripeCurrentPeriodEnd: true, avgRank: true, lastPostGeneratedAt: true,
            }
          },
          commissions: {
            select: { amount: true, paidOut: true }
          },
          _count: { select: { referrals: true } }
        },
        orderBy: { createdAt: 'desc' }
      })

      const now = new Date()
      const activeBusinesses = users.flatMap(u => u.businesses.filter(b => b.status === 'ACTIVE'))
      const mrr = activeBusinesses.length * 79
      const newThisMonth = users.filter(u => {
        const d = new Date(u.createdAt)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }).length
      const churnedThisMonth = users.flatMap(u => u.businesses).filter(b =>
        b.cancelAtPeriodEnd && b.stripeCurrentPeriodEnd && new Date(b.stripeCurrentPeriodEnd) > now
      ).length

      const allWithdrawals = await prisma.$queryRaw`
        SELECT w.id, w.amount, w.status, w."createdAt", w."plaidBankName", w."plaidAccountMask", w."userId",
          u.name as "userName", u.email as "userEmail", u."plaidAccessToken", u."plaidAccountId"
        FROM "WithdrawalRequest" w
        JOIN "User" u ON u.id = w."userId"
        ORDER BY w."createdAt" ASC
      `
      const pendingWithdrawals = allWithdrawals.filter(w => w.status === 'PENDING').map(w => ({
        id: w.id, amount: w.amount, status: w.status, createdAt: w.createdAt,
        plaidBankName: w.plaidBankName, plaidAccountMask: w.plaidAccountMask,
        user: { name: w.userName, email: w.userEmail, plaidAccessToken: w.plaidAccessToken, plaidAccountId: w.plaidAccountId }
      }))
      const totalCommissions = users.flatMap(u => u.commissions).reduce((s, c) => s + c.amount, 0)
      const totalWithdrawn = allWithdrawals.filter(w => w.status === 'APPROVED' || w.status === 'PAID').reduce((s, w) => s + w.amount, 0)
      const totalOutstanding = Math.max(0, totalCommissions - totalWithdrawn)

      return NextResponse.json({
        stats: {
          totalUsers: users.length,
          activeBusinesses,
          mrr,
          newUsersThisMonth: newThisMonth,
          churnedThisMonth,
          totalOutstandingBalance: Math.round(totalOutstanding * 100) / 100,
          pendingWithdrawals: pendingWithdrawals.length,
        },
        users: users.map(u => ({
          ...u,
          activeLocations: u.businesses.filter(b => b.status === 'ACTIVE').length,
          mrr: u.businesses.filter(b => b.status === 'ACTIVE').length * 79,
          outstandingBalance: Math.round(Math.max(0,
            u.commissions.reduce((s, c) => s + c.amount, 0) -
            allWithdrawals.filter(w => w.userId === u.id && (w.status === 'APPROVED' || w.status === 'PAID')).reduce((s, w) => s + w.amount, 0)
          ) * 100) / 100,
          hasPendingWithdrawal: allWithdrawals.some(w => w.userId === u.id && w.status === 'PENDING'),
        })),
        withdrawals: pendingWithdrawals,
      })
    } catch (e) {
      console.error('Admin overview error:', e)
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  if (action === 'businesses') {
    try {
      const businesses = await prisma.business.findMany({
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { rankAudits: true, automationPosts: true, reviews: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(businesses)
    } catch (e) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  if (action === 'referrals') {
    try {
      const commissions = await prisma.referralCommission.findMany({
        include: { referrer: { select: { name: true, email: true, id: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
      const withdrawals = await prisma.$queryRaw`
        SELECT "userId", amount, status FROM "WithdrawalRequest"
        WHERE status IN ('APPROVED', 'PAID')
      `
      const byReferrer = {}
      for (const c of commissions) {
        const key = c.referrerId
        if (!byReferrer[key]) byReferrer[key] = { referrer: c.referrer, totalEarned: 0, availableBalance: 0, commissions: [] }
        byReferrer[key].totalEarned += c.amount
        byReferrer[key].availableBalance += c.amount
        byReferrer[key].commissions.push(c)
      }
      // Deduct approved/paid withdrawals
      for (const w of withdrawals) {
        if (byReferrer[w.userId]) {
          byReferrer[w.userId].availableBalance = Math.max(0, byReferrer[w.userId].availableBalance - Number(w.amount))
        }
      }
      return NextResponse.json(Object.values(byReferrer))
    } catch (e) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  if (action === 'automation') {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const businesses = await prisma.business.findMany({
        select: {
          id: true, name: true, lastPostGeneratedAt: true, status: true,
          targetKeywords: true, targetCities: true,
          user: { select: { email: true } },
          _count: { select: { automationPosts: true } }
        }
      })
      const active = businesses.filter(b => b.status === 'ACTIVE')
      const flagged = active.filter(b =>
        !b.targetKeywords?.length || !b.targetCities?.length ||
        !b.lastPostGeneratedAt || new Date(b.lastPostGeneratedAt) < thirtyDaysAgo
      )
      return NextResponse.json({ businesses: active, flagged })
    } catch (e) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  if (action === 'plaid_numbers') {
    try {
      const withdrawalId = searchParams.get('withdrawalId')
      if (!withdrawalId) return NextResponse.json({ error: 'withdrawalId required' }, { status: 400 })
      const withdrawal = await prisma.withdrawalRequest.findUnique({
        where: { id: withdrawalId },
        include: { user: { select: { plaidAccessToken: true, plaidAccountId: true } } }
      })
      if (!withdrawal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      if (!withdrawal.user.plaidAccessToken) return NextResponse.json({ error: 'No Plaid token' }, { status: 400 })

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
        accountName: account?.name, accountType: account?.subtype,
        accountNumber: numbers?.account, routingNumber: numbers?.routing,
        wireRouting: numbers?.wire_routing, bankName: withdrawal.plaidBankName, mask: withdrawal.plaidAccountMask,
      })
    } catch (e) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { action, withdrawalId, userId, adminNote } = await req.json()

    if (action === 'approve_withdrawal') {
      await prisma.withdrawalRequest.update({ where: { id: withdrawalId }, data: { status: 'APPROVED', adminNote, processedAt: new Date() } })
      return NextResponse.json({ success: true })
    }
    if (action === 'mark_paid') {
      await prisma.withdrawalRequest.update({ where: { id: withdrawalId }, data: { status: 'PAID', processedAt: new Date() } })
      return NextResponse.json({ success: true })
    }
    if (action === 'reject_withdrawal') {
      await prisma.withdrawalRequest.update({ where: { id: withdrawalId }, data: { status: 'REJECTED', adminNote } })
      return NextResponse.json({ success: true })
    }
    if (action === 'delete_user') {
      await prisma.user.delete({ where: { id: userId } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e) {
    console.error('Admin POST error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
