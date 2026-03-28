import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const automations = await prisma.automation.findMany({
    where: {
      business: { userId: session.user.id },
    },
    include: { business: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return NextResponse.json(automations)
}
