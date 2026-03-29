import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { hasSeenOnboarding: true, name: true, email: true },
  })
  return NextResponse.json(user)
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { hasSeenOnboarding: body.hasSeenOnboarding ?? true },
  })
  return NextResponse.json({ success: true })
}
