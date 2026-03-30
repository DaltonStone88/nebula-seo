import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const res = await fetch('https://production.plaid.com/link/token/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.PLAID_CLIENT_ID,
        secret: process.env.PLAID_SECRET,
        user: { client_user_id: session.user.id },
        client_name: 'NebulaSEO',
        products: ['auth'],
        country_codes: ['US'],
        language: 'en',
      }),
    })

    const data = await res.json()

    if (data.error_code) {
      console.error('Plaid link token error:', data)
      return NextResponse.json({ error: data.error_message }, { status: 400 })
    }

    return NextResponse.json({ link_token: data.link_token })
  } catch (e) {
    console.error('Plaid link token error:', e)
    return NextResponse.json({ error: 'Failed to create Plaid link token' }, { status: 500 })
  }
}
