import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'

// GET — fetch images for a business
export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const businessId = searchParams.get('businessId')

  try {
    const business = await prisma.business.findFirst({ where: { id: businessId, userId: session.user.id } })
    if (!business) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const images = await prisma.businessImage.findMany({
      where: { businessId },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(images)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST — upload an image
export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const businessId = formData.get('businessId')

    if (!file || !businessId) return NextResponse.json({ error: 'file and businessId required' }, { status: 400 })

    const business = await prisma.business.findFirst({ where: { id: businessId, userId: session.user.id } })
    if (!business) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Upload to Vercel Blob
    const filename = `${businessId}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const blob = await put(filename, file, { access: 'public' })

    // Get current max sort order
    const maxOrder = await prisma.businessImage.aggregate({
      where: { businessId },
      _max: { sortOrder: true },
    })

    const image = await prisma.businessImage.create({
      data: {
        businessId,
        url: blob.url,
        filename: file.name,
        size: file.size,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    })

    return NextResponse.json(image)
  } catch (e) {
    console.error('Image upload error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE — remove an image
export async function DELETE(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  try {
    const image = await prisma.businessImage.findFirst({
      where: { id, business: { userId: session.user.id } },
    })
    if (!image) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Delete from Vercel Blob
    try { await del(image.url) } catch (e) { console.error('Blob delete error:', e) }

    await prisma.businessImage.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
