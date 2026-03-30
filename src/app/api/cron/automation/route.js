import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const maxDuration = 300

// Runs daily at 6am UTC — generates posts for businesses whose billing day matches today
export async function GET(req) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const today = new Date()
    const todayDay = today.getDate()

    // Get all active businesses where today matches their billing day
    // Also handle end-of-month: if billing day is 29/30/31 and today is last day of month
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    const isLastDay = todayDay === lastDayOfMonth

    const businesses = await prisma.business.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { billingDay: todayDay },
          // If today is last day of month, also generate for businesses with billingDay > lastDayOfMonth
          ...(isLastDay ? [{ billingDay: { gt: lastDayOfMonth } }] : []),
          // Fallback: businesses with no billingDay set, use old 28-day logic
          {
            billingDay: null,
            OR: [
              { lastPostGeneratedAt: null },
              { lastPostGeneratedAt: { lt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) } },
            ]
          }
        ]
      },
      select: { id: true, name: true, userId: true },
    })

    const results = []
    const baseUrl = process.env.NEXTAUTH_URL || 'https://www.nebulaseo.com'

    for (const business of businesses) {
      try {
        const res = await fetch(`${baseUrl}/api/automation/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-cron-secret': process.env.CRON_SECRET || '',
          },
          body: JSON.stringify({ businessId: business.id, fromCron: true }),
        })
        const data = await res.json()
        results.push({ businessId: business.id, name: business.name, success: !data.error, error: data.error })
      } catch (e) {
        results.push({ businessId: business.id, name: business.name, success: false, error: e.message })
      }
    }

    return NextResponse.json({ success: true, date: todayDay, processed: results.length, results })
  } catch (e) {
    console.error('Cron error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
