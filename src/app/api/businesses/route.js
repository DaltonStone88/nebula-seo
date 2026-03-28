import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const businesses = await prisma.business.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { reviews: true, posts: true, automations: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(businesses)
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const business = await prisma.business.create({
    data: {
      name: body.name,
      address: body.address,
      city: body.city,
      state: body.state,
      zip: body.zip,
      phone: body.phone,
      website: body.website,
      category: body.category,
      placeId: body.placeId,
      userId: session.user.id,
    },
  })

  return NextResponse.json(business)
}
