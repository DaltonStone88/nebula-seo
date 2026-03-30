import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET — called after OAuth login when ?ref=CODE was in the login URL
// Applies the referral code to the newly signed-in user, then redirects to dashboard
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const ref = searchParams.get('ref')
  const next = searchParams.get('next') || '/dashboard'

  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.redirect(new URL('/login', req.url))

  if (ref) {
    try {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } })

      // Only apply if not already referred and not referring themselves
      if (user && !user.referredById) {
        const referrer = await prisma.user.findUnique({ where: { referralCode: ref.toUpperCase() } })
        if (referrer && referrer.id !== session.user.id) {
          await prisma.user.update({
            where: { id: session.user.id },
            data: { referredById: referrer.id },
          })
        }
      }
    } catch (e) {
      console.error('Referral apply error:', e)
    }
  }

  return NextResponse.redirect(new URL(next, req.url))
}
