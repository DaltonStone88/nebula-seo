import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId } = await req.json()

  try {
    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: session.user.id },
    })
    if (!business?.stripeSubscriptionId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await stripe.subscriptions.update(business.stripeSubscriptionId, {
      cancel_at_period_end: false,
    })
    await prisma.business.update({
      where: { id: businessId },
      data: { cancelAtPeriodEnd: false, status: 'ACTIVE' },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
