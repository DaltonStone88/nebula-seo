const GRID_SIZES = {
  '5x5': { cols: 5, rows: 5 },
  '7x7': { cols: 7, rows: 7 },
  '10x10': { cols: 10, rows: 10 },
  '15x15': { cols: 15, rows: 15 },
  '20x20': { cols: 20, rows: 20 },
}

const SPACING = {
  small: 0.005,
  medium: 0.009,
  large: 0.014,
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

  return points.slice(0, cols * rows)
}

export async function checkRankAtPoint(lat, lng, keyword, placeId, apiKey) {
  try {
    const radius = 3000
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`

    const res = await fetch(url)
    const data = await res.json()

    if (!data.results || data.results.length === 0) return '20+'

    // Match by Place ID — exact and reliable
    const rank = data.results.findIndex(place => place.place_id === placeId)

    if (rank === -1) return '20+'
    return rank + 1
  } catch (e) {
    return '20+'
  }
}

export function calculateStats(gridData) {
  const ranks = gridData.map(p => p.rank === '20+' ? 21 : Number(p.rank))
  const avgRank = ranks.reduce((a, b) => a + b, 0) / ranks.length
  const top3Count = ranks.filter(r => r <= 3).length
  const top3Percent = (top3Count / ranks.length) * 100

  return {
    avgRank: Math.round(avgRank * 100) / 100,
    top3Percent: Math.round(top3Percent * 100) / 100,
  }
}

export { GRID_SIZES, SPACING }
