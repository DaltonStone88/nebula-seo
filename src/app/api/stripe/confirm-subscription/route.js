import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { paymentMethodId, businessData } = await req.json()

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user.stripeCustomerId) return NextResponse.json({ error: 'No customer found' }, { status: 400 })

    // Attach payment method to customer and set as default
    await stripe.paymentMethods.attach(paymentMethodId, { customer: user.stripeCustomerId })
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    })

    // Create the subscription with $1 trial (3 days)
    const subscription = await stripe.subscriptions.create({
      customer: user.stripeCustomerId,
      items: [{ price: process.env.STRIPE_PRICE_ID }],
      default_payment_method: paymentMethodId,
      trial_end: Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60), // 3 days from now
      add_invoice_items: [{
        price_data: {
          currency: 'usd',
          product: process.env.STRIPE_PRODUCT_ID,
          unit_amount: 100, // $1.00
        },
      }],
      metadata: {
        userId: session.user.id,
        businessData: JSON.stringify(businessData),
      },
      expand: ['latest_invoice.payment_intent'],
    })

    // Check payment status
    const invoice = subscription.latest_invoice
    const paymentIntent = invoice?.payment_intent

    if (subscription.status === 'active' || subscription.status === 'trialing') {
      // Payment succeeded — create the business now
      const business = await prisma.business.create({
        data: {
          name: businessData.name,
          address: businessData.address,
          city: businessData.city,
          state: businessData.state,
          zip: businessData.zip,
          phone: businessData.phone || '',
          website: businessData.website || '',
          category: businessData.category || '',
          placeId: businessData.placeId || '',
          lat: businessData.lat,
          lng: businessData.lng,
          targetKeywords: businessData.targetKeywords || [],
          targetCities: businessData.targetCities || [],
          gridSize: '7x7',
          userId: session.user.id,
          status: 'ACTIVE',
          stripeSubscriptionId: subscription.id,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      })

      // Update subscription metadata with businessId for future webhook events
      await stripe.subscriptions.update(subscription.id, {
        metadata: { ...subscription.metadata, businessId: business.id },
      })

      return NextResponse.json({ success: true, businessId: business.id, status: 'active' })
    }

    if (paymentIntent?.status === 'requires_action') {
      return NextResponse.json({
        status: 'requires_action',
        clientSecret: paymentIntent.client_secret,
      })
    }

    return NextResponse.json({ error: 'Payment failed', status: subscription.status }, { status: 400 })
  } catch (e) {
    console.error('Confirm subscription error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
