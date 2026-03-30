import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Generate a short unique referral code
function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

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

        // Credit referral commission if this user was referred
        try {
          const user = await prisma.user.findUnique({ where: { id: userId } })
          if (user?.referredById) {
            const month = new Date().toISOString().slice(0, 7) // "2026-03"
            // Check if commission already exists for this business+month
            const existing = await prisma.referralCommission.findFirst({
              where: { referredUserId: userId, businessId: business.id, month },
            })
            if (!existing) {
              await prisma.referralCommission.create({
                data: {
                  referrerId: user.referredById,
                  referredUserId: userId,
                  businessId: business.id,
                  amount: 15.80, // 20% of $79
                  month,
                  status: 'AVAILABLE',
                },
              })
            }
          }
        } catch (commErr) {
          console.error('Commission credit error:', commErr)
        }

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

      case 'invoice.paid': {
        const invoice = event.data.object
        // Only process subscription renewals (not first payment — that's handled by checkout.session.completed)
        if (!invoice.subscription || invoice.billing_reason !== 'subscription_cycle') break
        const subId = invoice.subscription
        const business = await prisma.business.findFirst({ where: { stripeSubscriptionId: subId } })
        if (!business) break
        // Credit recurring commission if the business owner was referred
        try {
          const user = await prisma.user.findUnique({ where: { id: business.userId } })
          if (user?.referredById) {
            const month = new Date().toISOString().slice(0, 7)
            const existing = await prisma.referralCommission.findFirst({
              where: { referredUserId: business.userId, businessId: business.id, month },
            })
            if (!existing) {
              await prisma.referralCommission.create({
                data: {
                  referrerId: user.referredById,
                  referredUserId: business.userId,
                  businessId: business.id,
                  amount: 15.80,
                  month,
                  status: 'AVAILABLE',
                },
              })
            }
          }
        } catch (commErr) {
          console.error('Recurring commission error:', commErr)
        }
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
