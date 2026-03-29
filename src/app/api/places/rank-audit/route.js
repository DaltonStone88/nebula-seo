import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateGrid, checkRankAtPoint, calculateStats } from '@/lib/rankAudit'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId, keyword, gridSize, spacing } = await req.json()

  const business = await prisma.business.findFirst({
    where: { id: businessId, userId: session.user.id },
  })
  if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  if (!business.lat || !business.lng) return NextResponse.json({ error: 'Business location not set' }, { status: 400 })
  if (!business.placeId) return NextResponse.json({ error: 'Business Place ID not set' }, { status: 400 })

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const points = generateGrid(business.lat, business.lng, gridSize, spacing)

  const gridData = []
  for (const point of points) {
    // Match by Place ID for accuracy
    const rank = await checkRankAtPoint(point.lat, point.lng, keyword, business.placeId, apiKey)
    gridData.push({ ...point, rank })
    await new Promise(r => setTimeout(r, 150))
  }

  const { avgRank, top3Percent } = calculateStats(gridData)

  const existingAudits = await prisma.rankAudit.count({
    where: { businessId, keyword },
  })

  const audit = await prisma.rankAudit.create({
    data: {
      businessId,
      keyword,
      gridData,
      avgRank,
      top3Percent,
      gridSize: gridSize || '7x7',
      isBaseline: existingAudits === 0,
    },
  })

  await prisma.business.update({
    where: { id: businessId },
    data: { avgRank },
  })

  return NextResponse.json({ audit, gridData, avgRank, top3Percent })
}

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const businessId = searchParams.get('businessId')
  const keyword = searchParams.get('keyword')

  const audits = await prisma.rankAudit.findMany({
    where: {
      business: { userId: session.user.id },
      ...(businessId && { businessId }),
      ...(keyword && { keyword }),
    },
    orderBy: { createdAt: 'asc' },
    include: { business: { select: { name: true } } },
  })

  return NextResponse.json(audits)
}
