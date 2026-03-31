import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const businessId = searchParams.get('businessId')
  const status = searchParams.get('status')

  try {
    let query = `
      SELECT ap.* FROM "AutomationPost" ap
      JOIN "Business" b ON b.id = ap."businessId"
      WHERE b."userId" = '${session.user.id}'
    `
    if (businessId) query += ` AND ap."businessId" = '${businessId}'`
    if (status) query += ` AND ap.status = '${status}'`
    query += ` ORDER BY ap."scheduledFor" ASC`

    const posts = await prisma.$queryRawUnsafe(query)
    return NextResponse.json(posts)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...updates } = body

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  try {
    const existing = await prisma.automationPost.findFirst({
      where: { id, business: { userId: session.user.id } },
    })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const allowed = ['content', 'imageUrl', 'status', 'postType', 'offerTitle', 'offerCode',
      'offerUrl', 'offerTerms', 'offerStart', 'offerEnd', 'eventTitle', 'eventStart',
      'eventEnd', 'scheduledFor', 'approvedAt']
    const data = {}
    for (const key of allowed) {
      if (updates[key] !== undefined) data[key] = updates[key]
    }

    if (updates.status === 'APPROVED') data.approvedAt = new Date()

    const post = await prisma.automationPost.update({ where: { id }, data })
    return NextResponse.json(post)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  try {
    const existing = await prisma.automationPost.findFirst({
      where: { id, business: { userId: session.user.id } },
    })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.automationPost.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
