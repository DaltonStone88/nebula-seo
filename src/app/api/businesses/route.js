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
      rankAudits: {
        orderBy: { createdAt: 'asc' },
        select: { id: true, keyword: true, avgRank: true, top3Percent: true, isBaseline: true, createdAt: true, gridSize: true, keywordChangedAt: true, keywordChangedFrom: true, daysTracked: true },
      },
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
      lat: body.lat,
      lng: body.lng,
      targetKeywords: body.targetKeywords || [],
      targetCities: body.targetCities || [],
      gridSize: body.gridSize || '7x7',
      userId: session.user.id,
      keywordHistory: (body.targetKeywords || []).map(kw => ({ keyword: kw, changedAt: new Date().toISOString(), changedFrom: null })),
    },
  })

  return NextResponse.json(business)
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, targetKeywords: newKeywords, ...rest } = body

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const existing = await prisma.business.findFirst({ where: { id, userId: session.user.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const now = new Date()
  const allowedFields = ['name', 'address', 'city', 'state', 'zip', 'phone', 'website', 'category', 'targetCities', 'gridSize', 'gridSpacing', 'status']
  const data = {}
  for (const key of allowedFields) {
    if (rest[key] !== undefined) data[key] = rest[key]
  }

  // ── Keyword change logic ────────────────────────────────────────────────────
  const changedKeywords = []   // { index, oldKeyword, newKeyword }
  const addedKeywords   = []   // brand new slots being filled
  const keywordHistory  = Array.isArray(existing.keywordHistory) ? [...existing.keywordHistory] : []

  if (newKeywords) {
    const oldKeywords = existing.targetKeywords || []

    for (let i = 0; i < newKeywords.length; i++) {
      const newKw = newKeywords[i]?.trim() || ''
      const oldKw = (oldKeywords[i] || '').trim()

      if (!newKw) continue // empty slot, skip

      if (!oldKw && newKw) {
        // Brand new keyword being added
        addedKeywords.push({ index: i, keyword: newKw })
        keywordHistory[i] = { keyword: newKw, changedAt: now.toISOString(), changedFrom: null }
      } else if (oldKw && newKw !== oldKw) {
        // Existing keyword being changed — check 30-day limit
        const histEntry = keywordHistory[i]
        if (histEntry?.changedAt) {
          const daysSince = (now - new Date(histEntry.changedAt)) / (1000 * 60 * 60 * 24)
          if (daysSince < 30) {
            const daysRemaining = Math.ceil(30 - daysSince)
            return NextResponse.json({
              error: 'KEYWORD_CHANGE_TOO_SOON',
              keyword: oldKw,
              daysRemaining,
              message: `You can only change each keyword once every 30 days. "${oldKw}" was last changed ${Math.floor(daysSince)} days ago. Please wait ${daysRemaining} more day${daysRemaining !== 1 ? 's' : ''}.`
            }, { status: 429 })
          }
        }
        changedKeywords.push({ index: i, oldKeyword: oldKw, newKeyword: newKw })
        keywordHistory[i] = { keyword: newKw, changedAt: now.toISOString(), changedFrom: oldKw }
      }
    }

    data.targetKeywords = newKeywords.map(k => k?.trim()).filter(Boolean)
    data.keywordHistory = keywordHistory
  }

  const business = await prisma.business.update({ where: { id }, data })

  // ── Delete old audits for changed keywords, mark new baseline needed ────────
  for (const changed of changedKeywords) {
    // Remove all existing audits for the old keyword
    await prisma.rankAudit.deleteMany({ where: { businessId: id, keyword: changed.oldKeyword } })
  }

  return NextResponse.json({
    business,
    changedKeywords,
    addedKeywords,
    needsAudit: changedKeywords.length > 0 || addedKeywords.length > 0,
  })
}
