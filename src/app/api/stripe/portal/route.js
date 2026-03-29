import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Billing portal — manage payment method
export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user.stripeCustomerId) return NextResponse.json({ error: 'No billing account found' }, { status: 400 })

    const baseUrl = process.env.NEXTAUTH_URL || 'https://www.nebulaseo.com'
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/dashboard/settings`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
