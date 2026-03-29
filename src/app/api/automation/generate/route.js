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

async function generatePost({ type, business, keyword, city, offer, event, update, postIndex }) {
  const allKeywords = (business.targetKeywords || []).join(', ')
  const allCities = (business.targetCities || []).join(', ')

  const angles = [
    'Focus on the problem the customer is experiencing and how this business solves it.',
    'Focus on what makes this business different from competitors in the area.',
    'Focus on the speed and convenience of the service.',
    'Focus on the long-term value and peace of mind the service provides.',
    'Focus on a specific scenario or situation a local customer might be in right now.',
    'Focus on trust, experience, and reputation in the local community.',
    'Focus on the process — what happens when a customer reaches out.',
    'Focus on a seasonal or timely reason why now is the right time.',
    'Open with a question the target customer is probably asking themselves.',
    'Open with a relatable local situation, then introduce the business as the solution.',
  ]
  const angle = angles[postIndex % angles.length]

  const baseContext = `Business: ${business.name}
Category: ${business.category || 'local business'}
Address: ${business.address || ''}
All target keywords: ${allKeywords}
All target cities: ${allCities}
Website: ${business.website || ''}`

  const exampleStyle = `Study these two high-quality GBP posts and match their style exactly:

EXAMPLE 1: "Animals can get into attics, crawl spaces, and sheds fast, and the mess can grow even faster. Advanced Wildlife Control LLC is a local animal control service that helps homeowners and businesses in Sullivan, Rolla, Washington, Cuba, and Union, MO handle the problem the right way. We provide wildlife removal and animal removal service for common Missouri critters, and we focus on safe, humane results. If you have been searching for raccoon removal near me, bat removal near me, or squirrel removal, we can inspect the entry points and help stop repeat issues. We also handle skunk removal when odors and digging become a problem. Reach out today to schedule an inspection and get a plan that fits your property."

EXAMPLE 2: "Unwanted wildlife around your home or business can turn into damage fast. Advanced Wildlife Control LLC is a local animal control service that helps property owners in and around Sullivan, Rolla, Washington, Cuba, and Union with safe, humane wildlife removal. If you have been searching for raccoon removal near me, bat removal near me, or squirrel removal, we can inspect the problem, remove the animals, and help block entry points to keep them from coming back. We also handle skunk removal when odor or digging becomes an issue. Reach out today to schedule an inspection and get the problem handled."

Notice how these examples:
- Open with the customer problem or situation, never the business name
- Mention the business name naturally in the middle
- Use natural search-style phrasing like "searching for X near me"
- List multiple related services and multiple cities naturally
- End with a simple direct CTA
- Sound like a real person, not a marketing bot`

  let prompt = ''

  if (type === 'WHATS_NEW') {
    const updateContext = update
      ? `Specific update to highlight: "${update.title ? update.title + ' — ' : ''}${update.content}"`
      : ''

    prompt = `You are an expert local SEO copywriter specializing in Google Business Profile posts.

${baseContext}

${exampleStyle}

Now write a unique "What's New" GBP post for ${business.name} following this exact style.

This post must use this specific angle: ${angle}
Focus keyword: "${keyword}"
Target city: "${city}"
${updateContext ? 'Context to work in: ' + updateContext : ''}

Requirements:
- 150-300 words
- Open with the customer problem or situation — never start with the business name
- Mention "${keyword}" and "${city}" naturally
- Mention other related services
- Reference other target cities (${allCities}) where natural
- Business name appears naturally in the middle
- End with a simple CTA
- NO phone numbers, NO hashtags, NO "we are excited/proud to announce"
- Must sound completely different from a generic template

Return ONLY the post text, nothing else.`

  } else if (type === 'OFFER') {
    const offerContext = offer
      ? `Offer: ${offer.title}${offer.description ? ' — ' + offer.description : ''}${offer.couponCode ? ' | Code: ' + offer.couponCode : ''}${offer.terms ? ' | Terms: ' + offer.terms : ''}`
      : `Create a realistic offer for a ${business.category || 'local service'} business such as a free estimate, seasonal discount, or first-time customer deal.`

    prompt = `You are an expert local SEO copywriter specializing in Google Business Profile posts.

${baseContext}

${exampleStyle}

Write a unique "Offer" GBP post for ${business.name} following this exact style.

This post must use this specific angle: ${angle}
Focus keyword: "${keyword}"
Target city: "${city}"
${offerContext}

Requirements:
- 150-250 words
- Open with the customer's problem or need, not the offer
- Present the offer clearly with natural urgency
- Mention "${keyword}" and "${city}" naturally
- Reference other target cities where natural
- Business name appears naturally
- End with a clear CTA
- NO phone numbers, NO hashtags

Return ONLY the post text, nothing else.`

  } else if (type === 'EVENT') {
    const eventContext = event
      ? `Event: ${event.title}${event.description ? ' — ' + event.description : ''}${event.startDate ? ' | Date: ' + new Date(event.startDate).toLocaleDateString() : ''}${event.endDate ? ' to ' + new Date(event.endDate).toLocaleDateString() : ''}`
      : `Create a realistic event for a ${business.category || 'local service'} business such as a free inspection day, open house, or community promotion.`

    prompt = `You are an expert local SEO copywriter specializing in Google Business Profile posts.

${baseContext}

${exampleStyle}

Write a unique "Event" GBP post for ${business.name} following this exact style.

This post must use this specific angle: ${angle}
Focus keyword: "${keyword}"
Target city: "${city}"
${eventContext}

Requirements:
- 150-250 words
- Open with why this event matters to the local customer
- Mention "${keyword}" and "${city}" naturally
- Reference other target cities where natural
- Business name appears naturally
- End with a clear CTA
- NO phone numbers, NO hashtags

Return ONLY the post text, nothing else.`
  }

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 600,
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
