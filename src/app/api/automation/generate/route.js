import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Generate randomized schedule dates for the month
// 10 posts spread across the month, min 2 days apart, weighted toward weekdays
function generateScheduleDates(count = 10, startDate = new Date()) {
  const dates = []
  const start = new Date(startDate)
  start.setDate(1) // Start of month
  const end = new Date(start)
  end.setMonth(end.getMonth() + 1)
  end.setDate(0) // Last day of month
  const daysInMonth = end.getDate()

  // Pick random days ensuring min 2-day gaps
  const usedDays = new Set()
  let attempts = 0
  while (dates.length < count && attempts < 200) {
    attempts++
    // Weight toward weekdays (Mon-Fri) — pick a random day with slight weekday bias
    const day = Math.floor(Math.random() * daysInMonth) + 1
    const testDate = new Date(start)
    testDate.setDate(day)
    const dow = testDate.getDay() // 0=Sun, 6=Sat

    // Skip if too close to another date
    let tooClose = false
    for (const used of usedDays) {
      if (Math.abs(used - day) < 2) { tooClose = true; break }
    }
    if (tooClose) continue

    // Weekday bias — skip weekends 60% of the time
    if ((dow === 0 || dow === 6) && Math.random() < 0.6) continue

    usedDays.add(day)
    // Post at a random business-hours time (8am-5pm)
    const hour = 8 + Math.floor(Math.random() * 9)
    testDate.setHours(hour, 0, 0, 0)
    dates.push(new Date(testDate))
  }

  return dates.sort((a, b) => a - b)
}

// Decide post type distribution for 10 posts
// Roughly: 5 What's New, 3 Offers, 2 Events (adjusts based on available content)
function distributePostTypes(hasOffers, hasEvents, count = 10) {
  const types = []
  if (hasOffers && hasEvents) {
    for (let i = 0; i < count; i++) {
      if (i < 5) types.push('WHATS_NEW')
      else if (i < 8) types.push('OFFER')
      else types.push('EVENT')
    }
  } else if (hasOffers) {
    for (let i = 0; i < count; i++) {
      types.push(i < 6 ? 'WHATS_NEW' : 'OFFER')
    }
  } else if (hasEvents) {
    for (let i = 0; i < count; i++) {
      types.push(i < 7 ? 'WHATS_NEW' : 'EVENT')
    }
  } else {
    for (let i = 0; i < count; i++) types.push('WHATS_NEW')
  }
  // Shuffle
  return types.sort(() => Math.random() - 0.5)
}

async function generatePost({ type, business, keyword, city, offer, event, update }) {
  const businessContext = `
Business Name: ${business.name}
Category: ${business.category || 'local business'}
Location: ${business.address || ''}
Target Keywords: ${(business.targetKeywords || []).join(', ')}
Target Cities: ${(business.targetCities || []).join(', ')}
Website: ${business.website || ''}
`

  let prompt = ''

  if (type === 'WHATS_NEW') {
    const updateContext = update ? `\nRecent Update to highlight: "${update.title ? update.title + ': ' : ''}${update.content}"` : ''
    prompt = `You are an expert local SEO copywriter. Write a Google Business Profile "What's New" post for the following business.

${businessContext}
Focus keyword for this post: "${keyword}"
Target city for this post: "${city}"
${updateContext}

Requirements:
- 150-300 words
- Naturally include the keyword "${keyword}" and mention "${city}" or the service area
- Sound authentic, helpful, and local — NOT spammy
- Include a clear call to action at the end (call us, visit us, book today, etc.)
- Do NOT include phone numbers
- Do NOT use hashtags
- Do NOT use generic filler phrases like "we are excited to announce"
- Make it specific to the business category and services
- Write in second person where appropriate ("your home", "your business")

Return ONLY the post text, nothing else.`

  } else if (type === 'OFFER') {
    const offerContext = offer ? `
Offer Details:
- Title: ${offer.title}
- Description: ${offer.description || ''}
- Coupon Code: ${offer.couponCode || 'N/A'}
- Terms: ${offer.terms || 'Contact us for details'}
` : ''

    prompt = `You are an expert local SEO copywriter. Write a Google Business Profile "Offer" post for the following business.

${businessContext}
Focus keyword for this post: "${keyword}"
Target city for this post: "${city}"
${offerContext}

Requirements:
- 100-200 words
- Naturally include the keyword "${keyword}" and mention "${city}"  
- Create urgency without being pushy
- Clearly state the offer value
- Include a call to action
- Do NOT include phone numbers
- Do NOT use hashtags
- If no offer details provided, create a compelling generic service offer appropriate for this business type

Return ONLY the post text, nothing else.`

  } else if (type === 'EVENT') {
    const eventContext = event ? `
Event Details:
- Title: ${event.title}
- Description: ${event.description || ''}
- Dates: ${event.startDate ? new Date(event.startDate).toLocaleDateString() : 'upcoming'} - ${event.endDate ? new Date(event.endDate).toLocaleDateString() : ''}
` : ''

    prompt = `You are an expert local SEO copywriter. Write a Google Business Profile "Event" post for the following business.

${businessContext}
Focus keyword for this post: "${keyword}"
Target city for this post: "${city}"
${eventContext}

Requirements:
- 100-200 words
- Naturally include the keyword "${keyword}" and mention "${city}"
- Build excitement and encourage attendance or participation
- Include a call to action
- Do NOT include phone numbers
- Do NOT use hashtags
- If no event details provided, create a compelling community engagement event appropriate for this business type

Return ONLY the post text, nothing else.`
  }

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  })

  return message.content[0].text.trim()
}

export async function POST(req) {
  const body = await req.json()
  const { businessId, fromCron } = body

  // Allow cron calls with secret header, otherwise require session
  const cronSecret = req.headers.get('x-cron-secret')
  const isValidCron = fromCron && cronSecret === process.env.CRON_SECRET

  if (!isValidCron) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!businessId) return NextResponse.json({ error: 'businessId required' }, { status: 400 })

  try {
    // Load business with all content
    const business = await prisma.business.findFirst({
      where: { id: businessId },
      include: {
        offers: { where: { active: true } },
        events: { where: { active: true } },
        updates: { where: { active: true } },
        images: { orderBy: { sortOrder: 'asc' } },
      },
    })
    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

    const keywords = business.targetKeywords || []
    const cities = business.targetCities || []

    if (keywords.length === 0) return NextResponse.json({ error: 'Business has no target keywords' }, { status: 400 })
    if (cities.length === 0) return NextResponse.json({ error: 'Business has no target cities' }, { status: 400 })

    // Delete any existing pending posts for this billing period
    const periodStart = new Date()
    periodStart.setDate(1)
    periodStart.setHours(0, 0, 0, 0)
    await prisma.automationPost.deleteMany({
      where: { businessId, status: 'PENDING', scheduledFor: { gte: periodStart } },
    })

    const POST_COUNT = 10
    const schedDates = generateScheduleDates(POST_COUNT)
    const postTypes = distributePostTypes(
      business.offers.length > 0,
      business.events.length > 0,
      POST_COUNT
    )

    // Build keyword/city pairs — cycle through all combos evenly
    const pairs = []
    for (let i = 0; i < POST_COUNT; i++) {
      pairs.push({
        keyword: keywords[i % keywords.length],
        city: cities[i % cities.length],
      })
    }
    // Shuffle pairs so keyword/city combos are spread throughout the month
    pairs.sort(() => Math.random() - 0.5)

    const generatedPosts = []
    let imageIndex = 0

    for (let i = 0; i < POST_COUNT; i++) {
      const type = postTypes[i]
      const { keyword, city } = pairs[i]
      const scheduledFor = schedDates[i] || new Date()

      // Pick relevant content
      const offer = type === 'OFFER' && business.offers.length > 0
        ? business.offers[i % business.offers.length]
        : null
      const event = type === 'EVENT' && business.events.length > 0
        ? business.events[i % business.events.length]
        : null
      const update = type === 'WHATS_NEW' && business.updates.length > 0
        ? business.updates[i % business.updates.length]
        : null

      // Pick image (round robin)
      const image = business.images.length > 0
        ? business.images[imageIndex % business.images.length]
        : null
      if (business.images.length > 0) imageIndex++

      // Generate content
      let content
      try {
        content = await generatePost({ type, business, keyword, city, offer, event, update })
      } catch (e) {
        console.error('Generation failed for post', i, e)
        content = `Visit ${business.name} in ${city} for professional ${keyword} services. Contact us today to learn more about how we can help you.`
      }

      const postData = {
        businessId,
        content,
        postType: type,
        keyword,
        city,
        scheduledFor,
        status: 'PENDING',
        imageUrl: image?.url || null,
        imageIndex: image ? (imageIndex - 1) % business.images.length : null,
      }

      // Add type-specific fields
      if (offer) {
        postData.offerTitle = offer.title
        postData.offerCode = offer.couponCode
        postData.offerUrl = offer.redeemUrl
        postData.offerTerms = offer.terms
        postData.offerStart = offer.startDate
        postData.offerEnd = offer.endDate
      }
      if (event) {
        postData.eventTitle = event.title
        postData.eventStart = event.startDate
        postData.eventEnd = event.endDate
      }

      generatedPosts.push(postData)
    }

    // Save all posts
    await prisma.automationPost.createMany({ data: generatedPosts })

    // Log automation activity
    await prisma.automation.create({
      data: {
        businessId,
        type: 'GBP_POST',
        status: 'SUCCESS',
        description: `Generated ${POST_COUNT} posts for the month`,
        details: { count: POST_COUNT, keywords, cities },
      },
    })

    return NextResponse.json({ success: true, count: POST_COUNT })
  } catch (e) {
    console.error('Generation error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
