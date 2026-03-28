import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateGrid, checkRankAtPoint, calculateStats } from '@/lib/rankAudit'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId, keyword, gridSize, spacing } = await req.json()

  // Verify business belongs to user
  const business = await prisma.business.findFirst({
    where: { id: businessId, userId: session.user.id },
  })
  if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  if (!business.lat || !business.lng) return NextResponse.json({ error: 'Business location not set' }, { status: 400 })

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  // Generate grid points
  const points = generateGrid(business.lat, business.lng, gridSize, spacing)

  // Check rank at each point (with small delay to avoid rate limiting)
  const gridData = []
  for (const point of points) {
    const rank = await checkRankAtPoint(point.lat, point.lng, keyword, business.name, apiKey)
    gridData.push({ ...point, rank })
    // Small delay to be respectful of API rate limits
    await new Promise(r => setTimeout(r, 100))
  }

  const { avgRank, top3Percent } = calculateStats(gridData)

  // Check if this is the first audit (baseline)
  const existingAudits = await prisma.rankAudit.count({
    where: { businessId, keyword },
  })

  // Save to database
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

  // Update business avg rank
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

  const where = {
    business: { userId: session.user.id },
    ...(businessId && { businessId }),
    ...(keyword && { keyword }),
  }

  const audits = await prisma.rankAudit.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    include: { business: { select: { name: true } } },
  })

  return NextResponse.json(audits)
}
