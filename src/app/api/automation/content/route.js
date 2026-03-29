import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET — fetch all content (offers, events, updates) for a business
export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const businessId = searchParams.get('businessId')
  if (!businessId) return NextResponse.json({ error: 'businessId required' }, { status: 400 })

  try {
    // Verify ownership
    const business = await prisma.business.findFirst({ where: { id: businessId, userId: session.user.id } })
    if (!business) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const [offers, events, updates] = await Promise.all([
      prisma.businessOffer.findMany({ where: { businessId }, orderBy: { createdAt: 'desc' } }),
      prisma.businessEvent.findMany({ where: { businessId }, orderBy: { createdAt: 'desc' } }),
      prisma.businessUpdate.findMany({ where: { businessId }, orderBy: { createdAt: 'desc' } }),
    ])

    return NextResponse.json({ offers, events, updates })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST — create an offer, event, or update
export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { type, businessId, ...data } = body

  if (!businessId || !type) return NextResponse.json({ error: 'businessId and type required' }, { status: 400 })

  try {
    const business = await prisma.business.findFirst({ where: { id: businessId, userId: session.user.id } })
    if (!business) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    let result
    if (type === 'offer') {
      result = await prisma.businessOffer.create({ data: { businessId, ...data } })
    } else if (type === 'event') {
      result = await prisma.businessEvent.create({ data: { businessId, ...data } })
    } else if (type === 'update') {
      result = await prisma.businessUpdate.create({ data: { businessId, ...data } })
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PATCH — update an offer, event, or update
export async function PATCH(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { type, id, ...data } = body

  if (!type || !id) return NextResponse.json({ error: 'type and id required' }, { status: 400 })

  try {
    let result
    if (type === 'offer') {
      const existing = await prisma.businessOffer.findFirst({ where: { id, business: { userId: session.user.id } } })
      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      result = await prisma.businessOffer.update({ where: { id }, data })
    } else if (type === 'event') {
      const existing = await prisma.businessEvent.findFirst({ where: { id, business: { userId: session.user.id } } })
      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      result = await prisma.businessEvent.update({ where: { id }, data })
    } else if (type === 'update') {
      const existing = await prisma.businessUpdate.findFirst({ where: { id, business: { userId: session.user.id } } })
      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      result = await prisma.businessUpdate.update({ where: { id }, data })
    }

    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE — remove an offer, event, or update
export async function DELETE(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const id = searchParams.get('id')

  try {
    if (type === 'offer') {
      await prisma.businessOffer.deleteMany({ where: { id, business: { userId: session.user.id } } })
    } else if (type === 'event') {
      await prisma.businessEvent.deleteMany({ where: { id, business: { userId: session.user.id } } })
    } else if (type === 'update') {
      await prisma.businessUpdate.deleteMany({ where: { id, business: { userId: session.user.id } } })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
