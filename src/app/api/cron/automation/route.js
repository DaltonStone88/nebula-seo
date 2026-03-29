import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const maxDuration = 300

// This runs on the 1st of every month at 6am UTC
// Configured in vercel.json
export async function GET(req) {
  // Verify this is coming from Vercel cron
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all active businesses
    const businesses = await prisma.business.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, userId: true },
    })

    const results = []
    for (const business of businesses) {
      try {
        const baseUrl = process.env.NEXTAUTH_URL || 'https://www.nebulaseo.com'
        const res = await fetch(`${baseUrl}/api/automation/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Pass a special header to bypass session auth for cron
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

    console.log('Cron automation results:', results)
    return NextResponse.json({ success: true, processed: results.length, results })
  } catch (e) {
    console.error('Cron error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
