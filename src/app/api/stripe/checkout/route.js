import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessData } = await req.json()
  // businessData contains the pending business info to create after payment

  const baseUrl = process.env.NEXTAUTH_URL || 'https://www.nebulaseo.com'

  try {
    // Get or create Stripe customer for this user
    let customerId = null
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })

    if (user.stripeCustomerId) {
      customerId = user.stripeCustomerId
    } else {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: { userId: session.user.id },
      })
      customerId = customer.id
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customer.id },
      })
    }

    // Store pending business data in metadata so webhook can create it after payment
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      }],
      success_url: `${baseUrl}/dashboard/businesses?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard/businesses/add?checkout=cancelled`,
      subscription_data: {
        metadata: {
          userId: session.user.id,
          businessData: JSON.stringify(businessData),
        },
      },
      metadata: {
        userId: session.user.id,
        businessData: JSON.stringify(businessData),
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (e) {
    console.error('Stripe checkout error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
