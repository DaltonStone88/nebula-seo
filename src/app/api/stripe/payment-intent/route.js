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

  try {
    // Get or create Stripe customer
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

    // Create a SetupIntent to collect payment method, then create subscription on confirm
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      metadata: {
        userId: session.user.id,
        businessData: JSON.stringify(businessData),
      },
    })

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      customerId,
    })
  } catch (e) {
    console.error('Payment intent error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
