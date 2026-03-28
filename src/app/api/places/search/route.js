import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')
  if (!query) return NextResponse.json({ error: 'Query required' }, { status: 400 })

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`
  )
  const data = await res.json()

  const results = (data.results || []).slice(0, 5).map(place => ({
    placeId: place.place_id,
    name: place.name,
    address: place.formatted_address,
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
    category: place.types?.[0]?.replace(/_/g, ' ') || '',
    rating: place.rating || 0,
    totalRatings: place.user_ratings_total || 0,
  }))

  return NextResponse.json(results)
}
