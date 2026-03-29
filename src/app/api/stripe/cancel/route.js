import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// GET — fetch cancellation context (stats for the retention screen)
export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const businessId = searchParams.get('businessId')

  try {
    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: session.user.id },
      include: {
        automationPosts: { where: { status: 'PUBLISHED' } },
        rankAudits: true,
        automations: true,
      },
    })
    if (!business) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Build stats for retention screen
    const stats = {
      postsGenerated: business.automationPosts.length,
      auditsRun: business.rankAudits.length,
      avgRank: business.avgRank,
      daysActive: Math.ceil((new Date() - new Date(business.createdAt)) / (1000 * 60 * 60 * 24)),
      discountUsed: business.discountUsed,
      pauseUsed: business.pauseUsed,
      currentPeriodEnd: business.stripeCurrentPeriodEnd,
    }

    return NextResponse.json(stats)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST — handle cancellation actions
export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId, action } = await req.json()
  // action: 'discount' | 'pause' | 'cancel'

  try {
    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: session.user.id },
    })
    if (!business) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (!business.stripeSubscriptionId) return NextResponse.json({ error: 'No subscription found' }, { status: 400 })

    if (action === 'discount') {
      if (business.discountUsed) return NextResponse.json({ error: 'Discount already used' }, { status: 400 })

      // Apply a 10% off coupon for the next invoice
      const coupon = await stripe.coupons.create({
        percent_off: 10,
        duration: 'once',
        metadata: { businessId, userId: session.user.id },
      })
      await stripe.subscriptions.update(business.stripeSubscriptionId, {
        coupon: coupon.id,
      })
      await prisma.business.update({
        where: { id: businessId },
        data: { discountUsed: true },
      })
      return NextResponse.json({ success: true, action: 'discount' })
    }

    if (action === 'pause') {
      if (business.pauseUsed) return NextResponse.json({ error: 'Pause already used' }, { status: 400 })

      // Cancel at period end (acts as a 30-day pause since they keep access till then)
      // When they come back we resume — for now just mark cancel_at_period_end
      await stripe.subscriptions.update(business.stripeSubscriptionId, {
        cancel_at_period_end: true,
      })
      await prisma.business.update({
        where: { id: businessId },
        data: { pauseUsed: true, cancelAtPeriodEnd: true },
      })
      return NextResponse.json({ success: true, action: 'pause', accessUntil: business.stripeCurrentPeriodEnd })
    }

    if (action === 'cancel') {
      // Final cancellation — cancel at period end
      await stripe.subscriptions.update(business.stripeSubscriptionId, {
        cancel_at_period_end: true,
      })
      await prisma.business.update({
        where: { id: businessId },
        data: { cancelAtPeriodEnd: true },
      })
      // Actual deletion happens in the webhook when the period ends
      return NextResponse.json({ success: true, action: 'cancel', accessUntil: business.stripeCurrentPeriodEnd })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e) {
    console.error('Cancel error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
