// Rank Audit Engine
// Generates a grid of points around a business location,
// searches Google Places API at each point for the keyword,
// and records where the business appears in results.

const GRID_SIZES = {
  '5x5': { cols: 5, rows: 5 },
  '7x7': { cols: 7, rows: 7 },
  '10x10': { cols: 10, rows: 10 },
  '15x15': { cols: 15, rows: 15 },
  '20x20': { cols: 20, rows: 20 },
}

// Spacing options in degrees (approx miles)
// 0.005 deg ≈ 0.35 miles, 0.009 ≈ 0.6 miles, 0.014 ≈ 1 mile
const SPACING = {
  small: 0.005,   // ~0.35 mi — tight urban grid
  medium: 0.009,  // ~0.6 mi — standard
  large: 0.014,   // ~1 mi — regional
}

export function generateGrid(centerLat, centerLng, gridSize = '7x7', spacing = 'medium') {
  const { cols, rows } = GRID_SIZES[gridSize] || GRID_SIZES['7x7']
  const step = SPACING[spacing] || SPACING.medium
  const points = []

  const halfCols = Math.floor(cols / 2)
  const halfRows = Math.floor(rows / 2)

  for (let row = -halfRows; row <= halfRows; row++) {
    for (let col = -halfCols; col <= halfCols; col++) {
      points.push({
        lat: centerLat + (row * step),
        lng: centerLng + (col * step),
        row: row + halfRows,
        col: col + halfCols,
      })
    }
  }

  // Trim to exact grid size
  return points.slice(0, cols * rows)
}

export async function checkRankAtPoint(lat, lng, keyword, businessName, apiKey) {
  try {
    const radius = 2000 // 2km search radius at each point
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`

    const res = await fetch(url)
    const data = await res.json()

    if (!data.results || data.results.length === 0) return '20+'

    // Check if our business appears in results
    const businessNameLower = businessName.toLowerCase()
    const rank = data.results.findIndex(place =>
      place.name.toLowerCase().includes(businessNameLower) ||
      businessNameLower.includes(place.name.toLowerCase())
    )

    if (rank === -1) return '20+'
    return rank + 1 // 1-indexed
  } catch (e) {
    return '20+'
  }
}

export function calculateStats(gridData) {
  const ranks = gridData.map(p => p.rank === '20+' ? 21 : p.rank)
  const avgRank = ranks.reduce((a, b) => a + b, 0) / ranks.length
  const top3Count = ranks.filter(r => r <= 3).length
  const top3Percent = (top3Count / ranks.length) * 100

  return {
    avgRank: Math.round(avgRank * 100) / 100,
    top3Percent: Math.round(top3Percent * 100) / 100,
  }
}

export { GRID_SIZES, SPACING }
