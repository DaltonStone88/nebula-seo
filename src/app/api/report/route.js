import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')
  const auditId = searchParams.get('auditId')

  if (!auditId) return NextResponse.json({ error: 'auditId required' }, { status: 400 })

  const validSecret = secret && secret === process.env.NEXTAUTH_SECRET
  let session = null

  if (!validSecret) {
    session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const audit = await prisma.rankAudit.findFirst({
    where: { id: auditId, ...(session ? { business: { userId: session.user.id } } : {}) },
    include: { business: true },
  })
  if (!audit) return NextResponse.json({ error: 'Audit not found' }, { status: 404 })

  const business = audit.business

  const baselineAudit = await prisma.rankAudit.findFirst({
    where: { businessId: business.id, keyword: audit.keyword, isBaseline: true },
  })

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  let competitors = []
  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${business.lat},${business.lng}&radius=5000&keyword=${encodeURIComponent(audit.keyword)}&key=${apiKey}`)
    const data = await res.json()
    if (data.results) {
      competitors = data.results.slice(0, 8).map((p, i) => ({
        name: p.name,
        address: p.vicinity,
        rating: p.rating,
        placeId: p.place_id,
        avgRank: i + 1,
      }))
    }
  } catch (e) {
    console.error('Failed to fetch competitors', e)
  }

  const leadData = {
    calls: business.totalCalls || 0,
    directions: business.totalDirections || 0,
    clicks: business.totalClicks || 0,
    total: (business.totalCalls || 0) + (business.totalDirections || 0) + (business.totalClicks || 0),
    estimatedValue: ((business.totalCalls || 0) + (business.totalDirections || 0) + (business.totalClicks || 0)) * 150,
  }

  return NextResponse.json({
    audit,
    business,
    baselineAudit: baselineAudit?.id !== audit.id ? baselineAudit : null,
    competitors,
    leadData,
  })
}
