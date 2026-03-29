import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (e) {
    console.error('Webhook signature error:', e.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object
        if (session.mode !== 'subscription') break

        const metadata = session.metadata || {}
        const userId = metadata.userId
        const businessData = metadata.businessData ? JSON.parse(metadata.businessData) : null

        if (!userId || !businessData) break

        const subscription = await stripe.subscriptions.retrieve(session.subscription)

        // Create the business now that payment is confirmed
        const business = await prisma.business.create({
          data: {
            name: businessData.name,
            address: businessData.address,
            city: businessData.city,
            state: businessData.state,
            zip: businessData.zip,
            phone: businessData.phone,
            website: businessData.website,
            category: businessData.category,
            placeId: businessData.placeId,
            lat: businessData.lat,
            lng: businessData.lng,
            targetKeywords: businessData.targetKeywords || [],
            targetCities: businessData.targetCities || [],
            gridSize: businessData.gridSize || '7x7',
            userId,
            status: 'ACTIVE',
            stripeSubscriptionId: subscription.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        })

        // Store businessId on the subscription for future webhook lookups
        await stripe.subscriptions.update(subscription.id, {
          metadata: { ...subscription.metadata, businessId: business.id },
        })

        console.log('Business created after payment:', business.id)
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object
        const businessId = sub.metadata?.businessId
        if (!businessId) break

        await prisma.business.update({
          where: { id: businessId },
          data: {
            stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            status: sub.status === 'active' ? 'ACTIVE' : sub.status === 'paused' ? 'PAUSED' : 'ACTIVE',
          },
        })
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object
        const businessId = sub.metadata?.businessId
        if (!businessId) break

        // Subscription fully ended — delete the business and all its data
        await prisma.business.delete({ where: { id: businessId } })
        console.log('Business deleted after subscription ended:', businessId)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const subId = invoice.subscription
        if (!subId) break

        const business = await prisma.business.findFirst({
          where: { stripeSubscriptionId: subId },
        })
        if (!business) break

        // Mark as paused on payment failure — Stripe will retry automatically
        await prisma.business.update({
          where: { id: business.id },
          data: { status: 'PAUSED' },
        })
        console.log('Business paused due to payment failure:', business.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (e) {
    console.error('Webhook handler error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
