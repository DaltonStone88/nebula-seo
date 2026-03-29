'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const RANK_COLORS = {
  1: '#1ec85a', 2: '#1ec85a', 3: '#1ec85a',
  4: '#6bc94a', 5: '#6bc94a', 6: '#6bc94a', 7: '#6bc94a',
  8: '#c8c020', 9: '#c8c020', 10: '#c8c020',
  11: '#e07820', 12: '#e07820', 13: '#e07820', 14: '#e07820', 15: '#e07820',
}
function getRankColor(rank) {
  if (rank === '20+' || rank > 15) return '#b01414'
  return RANK_COLORS[rank] || '#b01414'
}
function latLngToPixel(lat, lng, centerLat, centerLng, zoom, mapW, mapH) {
  const scale = Math.pow(2, zoom)
  const worldSize = 256 * scale
  const x = (lng - centerLng) / 360 * worldSize
  const latRad = lat * Math.PI / 180
  const centerLatRad = centerLat * Math.PI / 180
  const y = -(Math.log(Math.tan(Math.PI / 4 + latRad / 2)) - Math.log(Math.tan(Math.PI / 4 + centerLatRad / 2))) / (2 * Math.PI) * worldSize
  return { px: mapW / 2 + x, py: mapH / 2 + y }
}

function HeatmapGrid({ audit, title, subtitle, business, onDownload }) {
  if (!audit) return (
    <div style={{ flex: 1, borderRadius: 16, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 480 }}>
      <div style={{ textAlign: 'center', color: 'var(--dim)', fontSize: 14 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
        No audit data yet
      </div>
    </div>
  )
  const gridData = Array.isArray(audit.gridData) ? audit.gridData : []
  const gridSize = audit.gridSize || '7x7'
  const cols = parseInt(gridSize.split('x')[0])
  const centerLat = business?.lat || 0
  const centerLng = business?.lng || 0
  const zoom = cols <= 5 ? 14 : cols <= 7 ? 13 : cols <= 10 ? 12 : 11
  const mapW = 640; const mapH = 480
  const circleSize = cols <= 7 ? 28 : cols <= 10 ? 22 : 16
  const fontSize = cols <= 7 ? 9 : cols <= 10 ? 8 : 7
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  return (
    <div style={{ flex: 1, borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', background: '#1a1a2e' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(6,6,18,0.95)' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{title}</div>
          <div style={{ fontSize: 11, color: 'var(--dim)' }}>{subtitle}</div>
        </div>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'var(--dim)', marginBottom: 1 }}>Avg Rank</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>{audit.avgRank}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'var(--dim)', marginBottom: 1 }}>Top 3</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--nebula-blue)' }}>{audit.top3Percent}%</div>
          </div>
          {onDownload && (
            <button onClick={() => onDownload(audit.id)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(232,238,255,0.15)', background: 'rgba(232,238,255,0.05)', color: 'var(--dim)', cursor: 'pointer', fontSize: 11 }}>⬇ PDF</button>
          )}
        </div>
      </div>
      <div style={{ position: 'relative', width: '100%', paddingBottom: '75%' }}>
        <img src={`https://maps.googleapis.com/maps/api/staticmap?center=${centerLat},${centerLng}&zoom=${zoom}&size=${mapW}x${mapH}&scale=2&style=feature:all|element:labels.text.fill|color:0x888888&style=feature:road|color:0x2a2a3a&style=feature:water|color:0x0a0a2f&style=feature:landscape|color:0x1a1a2e&style=feature:poi|visibility:off&key=${apiKey}`}
          alt="map" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0 }}>
          {gridData.map((cell, i) => {
            const { px, py } = latLngToPixel(cell.lat, cell.lng, centerLat, centerLng, zoom, mapW, mapH)
            const pct_x = (px / mapW) * 100
            const pct_y = (py / mapH) * 100
            if (pct_x < 0 || pct_x > 100 || pct_y < 0 || pct_y > 100) return null
            return (
              <div key={i} style={{ position: 'absolute', left: `${pct_x}%`, top: `${pct_y}%`, transform: 'translate(-50%,-50%)', width: circleSize, height: circleSize, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize, fontWeight: 800, background: getRankColor(cell.rank), color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.5)', zIndex: 1 }}>{cell.rank}</div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ReportsContent() {
  const searchParams = useSearchParams()
  const [view, setView] = useState(searchParams.get('tab') === 'heatmap' ? 'heatmap' : 'reports')
  const [businesses, setBusinesses] = useState([])
  const [selectedBiz, setSelectedBiz] = useState(null)
  const [selectedKeyword, setSelectedKeyword] = useState(0)
  const [gridSize, setGridSize] = useState('7x7')
  const [spacing, setSpacing] = useState('medium')
  const [running, setRunning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [baselineFull, setBaselineFull] = useState(null)
  const [latestFull, setLatestFull] = useState(null)
  const [downloading, setDownloading] = useState(null)

  const downloadReport = async (auditId) => {
    setDownloading(auditId)
    try {
      const res = await fetch(`/api/report/pdf?auditId=${auditId}`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to generate PDF')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `seo-report-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      alert('Failed to generate report: ' + e.message)
    }
    setDownloading(null)
  }

  const buildReportHTML = (data) => {
    const { audit, business, baselineAudit, competitors } = data
    const gridData = Array.isArray(audit.gridData) ? audit.gridData : []
    const cols = parseInt((audit.gridSize || '7x7').split('x')[0])
    const zoom = cols <= 5 ? 14 : cols <= 7 ? 13 : cols <= 10 ? 12 : 11
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    const top3Pct = audit.top3Percent || 0
    const avgRank = audit.avgRank || 20
    const visibilityScore = Math.round((top3Pct * 0.7) + (Math.max(0, 20 - avgRank) / 20 * 100 * 0.3))
    const reportDate = new Date(audit.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const hasImprovement = baselineAudit && baselineAudit.id !== audit.id
    const improvementPct = hasImprovement ? Math.round(((baselineAudit.avgRank - audit.avgRank) / baselineAudit.avgRank) * 100) : null
    const mapW = 640, mapH = 480
    const circleSize = cols <= 7 ? 28 : cols <= 10 ? 22 : 16

    const circlesHTML = gridData.map(cell => {
      const scale = Math.pow(2, zoom)
      const worldSize = 256 * scale
      const x = (cell.lng - business.lng) / 360 * worldSize
      const latRad = cell.lat * Math.PI / 180
      const centerLatRad = business.lat * Math.PI / 180
      const y = -(Math.log(Math.tan(Math.PI/4 + latRad/2)) - Math.log(Math.tan(Math.PI/4 + centerLatRad/2))) / (2*Math.PI) * worldSize
      const px = mapW/2 + x, py = mapH/2 + y
      const pct_x = (px/mapW)*100, pct_y = (py/mapH)*100
      if (pct_x < 0 || pct_x > 100 || pct_y < 0 || pct_y > 100) return ''
      const color = cell.rank === '20+' || cell.rank > 15 ? '#b01414' : cell.rank <= 3 ? '#1ec85a' : cell.rank <= 7 ? '#6bc94a' : cell.rank <= 10 ? '#c8c020' : '#e07820'
      return `<div style="position:absolute;left:${pct_x}%;top:${pct_y}%;transform:translate(-50%,-50%);width:${circleSize}px;height:${circleSize}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;background:${color};color:#fff;box-shadow:0 2px 6px rgba(0,0,0,0.5);z-index:1;">${cell.rank}</div>`
    }).join('')

    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${business.lat},${business.lng}&zoom=${zoom}&size=${mapW}x${mapH}&scale=2&style=feature:all|element:labels.text.fill|color:0x888888&style=feature:road|color:0x2a2a3a&style=feature:water|color:0x0a0a2f&style=feature:landscape|color:0x1a1a2e&style=feature:poi|visibility:off&key=${apiKey}`

    const competitorsHTML = (competitors || []).slice(0, 6).map((comp, i) => {
      const compScore = Math.round(100 - (comp.avgRank / 20 * 100))
      const isYou = comp.placeId === business.placeId
      return `<div style="display:flex;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid #f0f0f0;">
        <div style="width:32px;height:32px;border-radius:50%;background:${isYou ? '#7b2fff' : '#e8e8e8'};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:${isYou ? '#fff' : '#666'};flex-shrink:0;">${i+1}</div>
        <div style="flex:1;"><div style="font-size:14px;font-weight:${isYou?700:400};color:${isYou?'#7b2fff':'#1a1a2e'};">${comp.name}${isYou?' ← You':''}</div><div style="font-size:11px;color:#888;">Avg rank #${comp.avgRank?.toFixed(1)||'N/A'}</div></div>
        <div style="width:140px;height:8px;border-radius:4px;background:#f0f0f0;overflow:hidden;"><div style="height:100%;border-radius:4px;width:${Math.min(100,Math.max(0,compScore))}%;background:${isYou?'#7b2fff':'#ccc'};"></div></div>
        <div style="font-size:13px;font-weight:700;color:${isYou?'#7b2fff':'#888'};width:30px;text-align:right;">${compScore}</div>
      </div>`
    }).join('')

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>SEO Report - ${business.name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', Arial, sans-serif; background: #fff; color: #1a1a2e; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  @page { size: A4; margin: 0; }
  @media print {
    .page { page-break-after: always; page-break-inside: avoid; }
    .page:last-child { page-break-after: auto; }
  }
  .page { width: 210mm; min-height: 297mm; padding: 50px 60px; display: flex; flex-direction: column; }
</style>
</head>
<body>

<!-- PAGE 1: COVER -->
<div class="page" style="background:linear-gradient(135deg,#0a0a1f,#1a0a3a,#0a1a3a);color:#fff;justify-content:space-between;">
  <div style="display:flex;justify-content:space-between;align-items:center;">
    <div style="font-weight:900;font-size:20px;letter-spacing:3px;">NEBULASEO</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:2px;text-transform:uppercase;">Local SEO Performance Report</div>
  </div>
  <div>
    <div style="font-size:11px;color:rgba(123,200,255,0.8);letter-spacing:4px;text-transform:uppercase;margin-bottom:20px;">Monthly Report · ${reportDate}</div>
    <div style="font-size:52px;font-weight:900;line-height:1.1;margin-bottom:12px;">${business.name}</div>
    <div style="font-size:16px;color:rgba(255,255,255,0.5);margin-bottom:48px;">${business.address}</div>
    <div style="display:inline-flex;align-items:baseline;gap:8px;background:rgba(123,47,255,0.25);border:1px solid rgba(123,47,255,0.4);border-radius:20px;padding:16px 32px;margin-bottom:48px;">
      <div style="font-size:72px;font-weight:900;line-height:1;">${visibilityScore}</div>
      <div style="font-size:24px;color:rgba(255,255,255,0.5);">/100</div>
      <div style="font-size:14px;color:rgba(123,200,255,0.8);margin-left:8px;letter-spacing:1px;">LOCAL VISIBILITY SCORE</div>
    </div>
    <div style="display:flex;gap:48px;">
      <div><div style="font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Average Ranking</div><div style="font-size:22px;font-weight:700;color:#00c8ff;">#${audit.avgRank}</div></div>
      <div><div style="font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Top 3 Visibility</div><div style="font-size:22px;font-weight:700;color:#7b2fff;">${audit.top3Percent}%</div></div>
      <div><div style="font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Keyword Tracked</div><div style="font-size:22px;font-weight:700;color:#fff;">${audit.keyword}</div></div>
    </div>
  </div>
  <div style="font-size:11px;color:rgba(255,255,255,0.2);">Confidential · Prepared by NebulaSEO</div>
</div>

<!-- PAGE 2: VISIBILITY -->
<div class="page">
  <div style="font-size:11px;color:#7b2fff;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px;">Section 01</div>
  <div style="font-size:36px;font-weight:900;margin-bottom:4px;">Your Visibility</div>
  <div style="font-size:36px;font-weight:900;color:#7b2fff;margin-bottom:40px;">At a Glance</div>
  <div style="display:flex;align-items:center;gap:40px;margin-bottom:40px;padding:32px;background:#f8f8ff;border-radius:20px;border:1px solid #eee;">
    <div style="text-align:center;flex-shrink:0;">
      <div style="position:relative;width:140px;height:140px;">
        <svg viewBox="0 0 140 140" style="transform:rotate(-90deg);width:140px;height:140px;">
          <circle cx="70" cy="70" r="55" fill="none" stroke="#eee" stroke-width="14"/>
          <circle cx="70" cy="70" r="55" fill="none" stroke="#7b2fff" stroke-width="14" stroke-linecap="round" stroke-dasharray="${2*Math.PI*55*visibilityScore/100} ${2*Math.PI*55}"/>
        </svg>
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <div style="font-size:38px;font-weight:900;">${visibilityScore}</div>
          <div style="font-size:12px;color:#888;">/100</div>
        </div>
      </div>
      <div style="font-size:12px;color:#888;margin-top:8px;">Local Visibility Score</div>
    </div>
    <div style="flex:1;">
      <div style="font-size:18px;font-weight:700;margin-bottom:12px;">${visibilityScore >= 80 ? '🏆 Excellent visibility in your market.' : visibilityScore >= 60 ? '📈 Strong visibility with room to grow.' : '⚠️ Your visibility needs improvement.'}</div>
      <div style="font-size:14px;color:#555;line-height:1.8;">When potential customers search for <strong>"${audit.keyword}"</strong> in your area, your business appears in the <strong>top 3 results ${audit.top3Percent}% of the time</strong>.${hasImprovement && improvementPct > 0 ? ` That's a ${improvementPct}% improvement compared to your baseline.` : ''}</div>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-bottom:32px;">
    <div style="padding:24px;border-radius:16px;background:#fff;border:1px solid #eee;box-shadow:0 4px 20px rgba(0,0,0,0.05);">
      <div style="font-size:24px;margin-bottom:10px;">📍</div>
      <div style="font-size:11px;color:#888;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Where You Rank</div>
      <div style="font-size:32px;font-weight:900;color:#00c8ff;margin-bottom:8px;">#${audit.avgRank}</div>
      <div style="font-size:12px;color:#666;line-height:1.5;">Average position when customers search near your location</div>
    </div>
    <div style="padding:24px;border-radius:16px;background:#fff;border:1px solid #eee;box-shadow:0 4px 20px rgba(0,0,0,0.05);">
      <div style="font-size:24px;margin-bottom:10px;">👁️</div>
      <div style="font-size:11px;color:#888;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Top 3 Visibility</div>
      <div style="font-size:32px;font-weight:900;color:#7b2fff;margin-bottom:8px;">${audit.top3Percent}%</div>
      <div style="font-size:12px;color:#666;line-height:1.5;">Of your service area you appear in top 3 results</div>
    </div>
    <div style="padding:24px;border-radius:16px;background:#fff;border:1px solid #eee;box-shadow:0 4px 20px rgba(0,0,0,0.05);">
      <div style="font-size:24px;margin-bottom:10px;">📊</div>
      <div style="font-size:11px;color:#888;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Grid Coverage</div>
      <div style="font-size:32px;font-weight:900;color:#ff2d9a;margin-bottom:8px;">${gridData.length} pts</div>
      <div style="font-size:12px;color:#666;line-height:1.5;">Locations checked across your ${audit.gridSize} service area</div>
    </div>
  </div>
  ${hasImprovement ? `<div style="padding:20px 24px;border-radius:16px;background:linear-gradient(135deg,#f0fff8,#e8f4ff);border:1px solid #c8eedd;display:flex;align-items:center;gap:16px;">
    <div style="font-size:32px;">${improvementPct > 0 ? '📈' : '📉'}</div>
    <div><div style="font-size:15px;font-weight:700;margin-bottom:4px;">${improvementPct > 0 ? `Your ranking improved ${improvementPct}% since your last report` : `Your ranking changed ${improvementPct}% since your last report`}</div>
    <div style="font-size:13px;color:#555;">Baseline avg rank: <strong>${baselineAudit.avgRank}</strong> → Current avg rank: <strong>${audit.avgRank}</strong></div></div>
  </div>` : ''}
</div>

<!-- PAGE 3: HEATMAP -->
<div class="page">
  <div style="font-size:11px;color:#7b2fff;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px;">Section 02</div>
  <div style="font-size:36px;font-weight:900;margin-bottom:8px;">Your Ranking Map</div>
  <div style="font-size:14px;color:#666;margin-bottom:24px;line-height:1.6;">Each circle shows your position when a customer searches <strong>"${audit.keyword}"</strong> from that location.</div>
  <div style="border-radius:16px;overflow:hidden;border:1px solid #e0e0e0;margin-bottom:16px;">
    <div style="padding:14px 20px;background:#1a1a2e;display:flex;justify-content:space-between;align-items:center;">
      <div><div style="font-size:13px;color:rgba(255,255,255,0.5);">Keyword: <span style="color:#00c8ff;">${audit.keyword}</span></div><div style="font-size:11px;color:rgba(255,255,255,0.3);">${reportDate} · ${audit.gridSize} grid</div></div>
      <div style="display:flex;gap:20px;">
        <div style="text-align:right;"><div style="font-size:10px;color:rgba(255,255,255,0.4);">Avg Rank</div><div style="font-size:20px;font-weight:800;color:#fff;">${audit.avgRank}</div></div>
        <div style="text-align:right;"><div style="font-size:10px;color:rgba(255,255,255,0.4);">Top 3</div><div style="font-size:20px;font-weight:800;color:#7b2fff;">${audit.top3Percent}%</div></div>
      </div>
    </div>
    <div style="position:relative;width:100%;padding-bottom:75%;background:#1a1a2e;">
      <img src="${mapUrl}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" crossorigin="anonymous"/>
      <div style="position:absolute;inset:0;">${circlesHTML}</div>
    </div>
  </div>
  <div style="display:flex;gap:16px;align-items:center;">
    <span style="font-size:12px;color:#888;">Rank:</span>
    ${[{bg:'#1ec85a',l:'#1–3'},{bg:'#6bc94a',l:'#4–7'},{bg:'#c8c020',l:'#8–10'},{bg:'#e07820',l:'#11–15'},{bg:'#b01414',l:'16+'}].map(x=>`<div style="display:flex;align-items:center;gap:5px;"><div style="width:12px;height:12px;border-radius:50%;background:${x.bg};"></div><span style="font-size:11px;color:#666;">${x.l}</span></div>`).join('')}
  </div>
</div>

<!-- PAGE 4: MARKET POSITION -->
<div class="page">
  <div style="font-size:11px;color:#7b2fff;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px;">Section 03</div>
  <div style="font-size:36px;font-weight:900;margin-bottom:8px;">Your Market Position</div>
  <div style="font-size:14px;color:#666;margin-bottom:32px;">How you compare to other businesses competing for the same customers.</div>
  <div style="padding:24px 28px;border-radius:16px;background:linear-gradient(135deg,#f0eeff,#e8f4ff);border:2px solid #7b2fff;margin-bottom:24px;display:flex;align-items:center;gap:20px;">
    <div style="width:48px;height:48px;border-radius:50%;background:#7b2fff;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:#fff;flex-shrink:0;">★</div>
    <div style="flex:1;"><div style="font-size:16px;font-weight:700;margin-bottom:4px;">${business.name}</div><div style="font-size:14px;color:#555;">Average ranking <strong>#${audit.avgRank}</strong> · Top 3 visibility <strong>${audit.top3Percent}%</strong></div></div>
    <div style="text-align:right;"><div style="font-size:11px;color:#888;margin-bottom:2px;">Your Score</div><div style="font-size:36px;font-weight:900;color:#7b2fff;">${visibilityScore}</div></div>
  </div>
  <div style="font-size:14px;font-weight:700;margin-bottom:12px;">Top competitors in your area:</div>
  ${competitorsHTML}
</div>

<!-- PAGE 5: SUMMARY -->
<div class="page">
  <div style="font-size:11px;color:#7b2fff;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px;">Section 04</div>
  <div style="font-size:36px;font-weight:900;margin-bottom:8px;">30-Day Summary</div>
  <div style="font-size:14px;color:#666;margin-bottom:40px;">Everything at a glance for ${reportDate}.</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:40px;">
    ${[
      {icon:'🎯',label:'Local Visibility Score',value:`${visibilityScore}/100`,desc:'Your overall local search performance'},
      {icon:'📊',label:'Average Ranking',value:`#${audit.avgRank}`,desc:`For "${audit.keyword}"`},
      {icon:'🏆',label:'Top 3 Placements',value:`${audit.top3Percent}%`,desc:'Of your service area where you rank #1–3'},
      {icon:'📍',label:'Grid Points Scanned',value:gridData.length,desc:`Across your ${audit.gridSize} service area`},
    ].map(s=>`<div style="padding:24px;border-radius:16px;background:#f8f8ff;border:1px solid #eee;display:flex;gap:16px;align-items:center;">
      <div style="font-size:32px;">${s.icon}</div>
      <div><div style="font-size:11px;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">${s.label}</div>
      <div style="font-size:28px;font-weight:900;color:#7b2fff;line-height:1;margin-bottom:4px;">${s.value}</div>
      <div style="font-size:12px;color:#888;">${s.desc}</div></div>
    </div>`).join('')}
  </div>
  <div style="margin-top:auto;padding-top:32px;border-top:1px solid #eee;display:flex;justify-content:space-between;align-items:center;">
    <div><div style="font-size:16px;font-weight:700;margin-bottom:4px;">NebulaSEO</div><div style="font-size:12px;color:#888;">Local SEO Performance Report · ${reportDate}</div></div>
    <div style="font-size:11px;color:#ccc;">Powered by NebulaSEO</div>
  </div>
</div>

</body>
</html>`
  }

  const fetchBusinesses = async () => {
    try {
      const res = await fetch('/api/businesses')
      const data = await res.json()
      const list = Array.isArray(data) ? data : []
      setBusinesses(list)
      if (!selectedBiz && list.length > 0) setSelectedBiz(list[0])
      else if (selectedBiz) {
        const updated = list.find(b => b.id === selectedBiz.id)
        if (updated) setSelectedBiz(updated)
      }
    } catch (e) {
      console.error('Failed to load businesses', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBusinesses() }, [])

  const keyword = selectedBiz?.targetKeywords?.[selectedKeyword]
  const [fullAuditsByKeyword, setFullAuditsByKeyword] = useState({})

  useEffect(() => {
    if (!selectedBiz?.id) return
    const keywords = selectedBiz.targetKeywords || []
    if (keywords.length === 0) return
    setFullAuditsByKeyword({})
    setBaselineFull(null); setLatestFull(null)
    keywords.forEach(kw => {
      fetch(`/api/places/rank-audit?businessId=${selectedBiz.id}&keyword=${encodeURIComponent(kw)}`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const base = data.find(a => a.isBaseline) || data[0]
            const lat = data[data.length - 1]
            setFullAuditsByKeyword(prev => ({ ...prev, [kw]: { baseline: base, latest: lat } }))
            if (kw === keywords[0]) {
              setBaselineFull(base)
              setLatestFull(lat)
            }
          }
        })
    })
  }, [selectedBiz?.id])

  const runAudit = async () => {
    if (!selectedBiz || !keyword) return
    setRunning(true)
    try {
      await fetch('/api/places/rank-audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ businessId: selectedBiz.id, keyword, gridSize, spacing }) })
      await fetchBusinesses()
      const res = await fetch(`/api/places/rank-audit?businessId=${selectedBiz.id}&keyword=${encodeURIComponent(keyword)}`)
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setBaselineFull(data.find(a => a.isBaseline) || data[0])
        setLatestFull(data[data.length - 1])
      }
    } catch (e) { console.error(e) }
    setRunning(false)
  }

  const keywordAudits = selectedBiz?.rankAudits?.filter(a => a.keyword === keyword) || []
  const baselineAudit = keywordAudits.find(a => a.isBaseline)
  const latestAudit = keywordAudits[keywordAudits.length - 1]
  const hasImprovement = baselineAudit && latestAudit && baselineAudit.id !== latestAudit.id
  const improvementPct = hasImprovement ? Math.round(((baselineAudit.avgRank - latestAudit.avgRank) / baselineAudit.avgRank) * 100) : null

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}><div style={{ width: 36, height: 36, border: '3px solid rgba(123,47,255,0.3)', borderTopColor: 'var(--nebula-purple)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>

  if (!selectedBiz) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', textAlign: 'center', padding: '0 40px' }}>
      <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg, rgba(123,47,255,0.2), rgba(0,200,255,0.1))', border: '1px solid rgba(123,47,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 28 }}>📊</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 10 }}>No Reports Yet</div>
      <p style={{ fontSize: 14, color: 'var(--dim)', lineHeight: 1.8, maxWidth: 400, marginBottom: 32 }}>
        Reports are generated from rank audits run against your businesses. Add a business to get started — your first audit runs automatically.
      </p>
      <a href="/dashboard/businesses/add" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, background: 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-pink))', color: '#fff', fontWeight: 600, fontSize: 13, fontFamily: 'var(--font-body)', textDecoration: 'none' }}>
        + Add Your First Business
      </a>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const selectStyle = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(6,6,18,0.8)', color: 'var(--star-white)', fontSize: 13, outline: 'none' }

  return (
    <div>
      <div style={{ padding: '20px 36px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(6,6,18,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Reports</h1>
        {selectedBiz && <div style={{ fontSize: 13, color: 'var(--dim)' }}>{selectedBiz.name}</div>}
      </div>

      <div style={{ padding: '32px 36px' }}>
        {view === 'heatmap' ? (
          !selectedBiz?.lat ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--dim)' }}><div style={{ fontSize: 48, marginBottom: 16 }}>📍</div><div>Add a business to run rank audits.</div></div>
          ) : (
            <>
              <div style={{ borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)', padding: '20px 24px', marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 16, alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Keyword</label>
                    <select value={selectedKeyword} onChange={e => setSelectedKeyword(Number(e.target.value))} style={selectStyle}>
                      {(selectedBiz.targetKeywords||[]).map((kw,i) => <option key={i} value={i}>{kw}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Grid Size</label>
                    <select value={gridSize} onChange={e => setGridSize(e.target.value)} style={selectStyle}>
                      {['5x5','7x7','10x10','15x15','20x20'].map(s => <option key={s} value={s}>{s} ({parseInt(s)**2} pts)</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Spacing</label>
                    <select value={spacing} onChange={e => setSpacing(e.target.value)} style={selectStyle}>
                      <option value="small">Tight (~0.35 mi)</option>
                      <option value="medium">Standard (~0.6 mi)</option>
                      <option value="large">Regional (~1 mi)</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={runAudit} disabled={running || !selectedBiz.targetKeywords?.length} className="btn-primary" style={{ fontSize: 12, padding: '11px 24px', justifyContent: 'center', whiteSpace: 'nowrap' }}>
                      {running ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />Running...</span> : '🔍 Run Audit'}
                    </button>
                    {latestFull && (
                      <button onClick={() => downloadReport(latestFull.id)} disabled={!!downloading} style={{ padding: '11px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.04)', color: downloading ? 'var(--dim)' : 'var(--star-white)', cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>
                        {downloading ? '⏳...' : '⬇ PDF'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {hasImprovement && (
                <div style={{ borderRadius: 14, padding: '16px 24px', background: 'linear-gradient(135deg,rgba(0,200,255,0.08),rgba(123,47,255,0.06))', border: '1px solid rgba(0,200,255,0.2)', marginBottom: 20, display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div><div style={{ fontSize: 10, color: 'var(--dim)', marginBottom: 3 }}>Keyword</div><div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>{keyword}</div></div>
                  <div><div style={{ fontSize: 10, color: 'var(--dim)', marginBottom: 3 }}>Improvement</div><div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: improvementPct > 0 ? 'var(--nebula-blue)' : 'var(--nebula-pink)' }}>{improvementPct > 0 ? '+' : ''}{improvementPct}%</div></div>
                  <div><div style={{ fontSize: 10, color: 'var(--dim)', marginBottom: 3 }}>Baseline</div><div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>{baselineAudit.avgRank}</div></div>
                  <div><div style={{ fontSize: 10, color: 'var(--dim)', marginBottom: 3 }}>Current</div><div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--nebula-blue)' }}>{latestAudit.avgRank}</div></div>
                  <div><div style={{ fontSize: 10, color: 'var(--dim)', marginBottom: 3 }}>Top 3</div><div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--nebula-blue)' }}>{latestAudit.top3Percent}%</div></div>
                  <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--dim)' }}>{keywordAudits.length} audits</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 16 }}>
                <HeatmapGrid audit={baselineFull} title="Baseline Audit" subtitle={baselineFull ? new Date(baselineFull.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'No baseline yet'} business={selectedBiz} onDownload={downloadReport} />
                <HeatmapGrid audit={latestFull?.id !== baselineFull?.id ? latestFull : null} title="Latest Audit" subtitle={latestFull?.id !== baselineFull?.id ? new Date(latestFull.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'Run another audit to compare'} business={selectedBiz} onDownload={downloadReport} />
              </div>

              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--dim)' }}>Rank:</span>
                {[{bg:'#1ec85a',label:'#1–3'},{bg:'#6bc94a',label:'#4–7'},{bg:'#c8c020',label:'#8–10'},{bg:'#e07820',label:'#11–15'},{bg:'#b01414',label:'16+'}].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 2, background: l.bg }} />
                    <span style={{ fontSize: 11, color: 'var(--dim)' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </>
          )
        ) : (
          <div>
            {selectedBiz && (() => {
              const allAudits = (selectedBiz.rankAudits || [])
              const lastAudit = [...allAudits].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
              const nextDate = lastAudit ? new Date(new Date(lastAudit.createdAt).getTime() + 30*24*60*60*1000) : null
              const daysLeft = nextDate ? Math.max(0, Math.ceil((nextDate - new Date()) / (1000*60*60*24))) : null
              const pct = nextDate ? Math.min(100, Math.round(((30 - daysLeft) / 30) * 100)) : 0
              const kwList = selectedBiz.targetKeywords || []

              return (
                <>
                  {/* Countdown banner */}
                  <div style={{ borderRadius: 16, padding: '18px 24px', background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 10 }}>
                        {daysLeft === null ? '📊 No audits run yet' : daysLeft === 0 ? '🟢 Next audit runs today' : `⏰ Next audit in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: 'rgba(232,238,255,0.08)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 3, width: nextDate ? `${pct}%` : '0%', background: 'linear-gradient(90deg, var(--nebula-purple), var(--nebula-blue))' }} />
                      </div>
                    </div>
                    {nextDate && (
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 10, color: 'var(--dim)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 1 }}>Next audit</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>{nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      </div>
                    )}
                  </div>

                  {/* One row per keyword */}
                  {kwList.map((kw, i) => {
                    const kwAudits = allAudits.filter(a => a.keyword === kw)
                    const latest = kwAudits[kwAudits.length - 1]
                    const baseline = kwAudits.find(a => a.isBaseline)
                    const imp = baseline && latest && baseline.id !== latest.id ? Math.round(((baseline.avgRank - latest.avgRank) / baseline.avgRank) * 100) : null
                    const cols = latest ? parseInt((latest.gridSize || '7x7').split('x')[0]) : 7
                    const zoom = cols <= 5 ? 14 : cols <= 7 ? 13 : cols <= 10 ? 12 : 11
                    const mapW = 640, mapH = 480
                    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                    // Use full audit data (with gridData) from the per-keyword fetch
                    const fullBaseline = fullAuditsByKeyword[kw]?.baseline || null
                    const fullLatest = fullAuditsByKeyword[kw]?.latest || null

                    return (
                      <div key={i} style={{ borderRadius: 16, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.02)', marginBottom: 28, overflow: 'hidden' }}>
                        {/* Header row */}
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(6,6,18,0.4)' }}>
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--nebula-blue)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 3 }}>Keyword {i+1}</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>{kw}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                            {imp !== null && (
                              <div style={{ fontSize: 13, fontWeight: 600, color: imp > 0 ? 'rgba(20,200,100,0.9)' : 'var(--nebula-pink)' }}>
                                {imp > 0 ? `↑ ${imp}% improvement` : `↓ ${Math.abs(imp)}% decline`}
                              </div>
                            )}
                            {latest && (
                              <button onClick={() => downloadReport(latest.id)} disabled={!!downloading} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(123,47,255,0.4)', background: 'rgba(123,47,255,0.15)', color: 'var(--star-white)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                {downloading === latest.id ? '⏳ Generating...' : '⬇ Download PDF'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Two heatmaps: LEFT=baseline, RIGHT=latest or placeholder */}
                        {(() => {
                          const mapCircleSize = cols <= 7 ? 28 : cols <= 10 ? 22 : 16
                          const mapCircleFontSize = cols <= 7 ? 9 : cols <= 10 ? 8 : 7

                          const renderMap = (audit, label) => {
                            const aGridData = audit ? (Array.isArray(audit.gridData) ? audit.gridData : []) : []
                            return (
                              <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', background: '#1a1a2e' }}>
                                {/* Map header */}
                                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(6,6,18,0.95)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--star-white)', fontFamily: 'var(--font-display)' }}>{label}</div>
                                    <div style={{ fontSize: 10, color: 'var(--dim)', marginTop: 2 }}>{audit ? new Date(audit.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Upcoming'}</div>
                                  </div>
                                  {audit && (
                                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                                      <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 9, color: 'var(--dim)' }}>Avg</div>
                                        <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--nebula-blue)', fontFamily: 'var(--font-display)' }}>{audit.avgRank}</div>
                                      </div>
                                      <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 9, color: 'var(--dim)' }}>Top 3</div>
                                        <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--nebula-purple)', fontFamily: 'var(--font-display)' }}>{audit.top3Percent}%</div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {/* Map body */}
                                <div style={{ position: 'relative', paddingBottom: '75%' }}>
                                  {audit ? (
                                    <>
                                      <img src={`https://maps.googleapis.com/maps/api/staticmap?center=${selectedBiz.lat},${selectedBiz.lng}&zoom=${zoom}&size=${mapW}x${mapH}&scale=2&style=feature:all|element:labels.text.fill|color:0x888888&style=feature:road|color:0x2a2a3a&style=feature:water|color:0x0a0a2f&style=feature:landscape|color:0x1a1a2e&style=feature:poi|visibility:off&key=${apiKey}`}
                                        alt="map" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                      <div style={{ position: 'absolute', inset: 0 }}>
                                        {aGridData.map((cell, ci) => {
                                          const sc = Math.pow(2, zoom), ws = 256 * sc
                                          const x = (cell.lng - selectedBiz.lng) / 360 * ws
                                          const lr = cell.lat * Math.PI / 180, cr = selectedBiz.lat * Math.PI / 180
                                          const y = -(Math.log(Math.tan(Math.PI/4 + lr/2)) - Math.log(Math.tan(Math.PI/4 + cr/2))) / (2*Math.PI) * ws
                                          const px = mapW/2 + x, py = mapH/2 + y
                                          const px2 = (px/mapW)*100, py2 = (py/mapH)*100
                                          if (px2 < 0 || px2 > 100 || py2 < 0 || py2 > 100) return null
                                          const color = cell.rank === '20+' || cell.rank > 15 ? '#b01414' : cell.rank <= 3 ? '#1ec85a' : cell.rank <= 7 ? '#6bc94a' : cell.rank <= 10 ? '#c8c020' : '#e07820'
                                          return <div key={ci} style={{ position: 'absolute', left: `${px2}%`, top: `${py2}%`, transform: 'translate(-50%,-50%)', width: mapCircleSize, height: mapCircleSize, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: mapCircleFontSize, fontWeight: 800, background: color, color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.5)', zIndex: 1 }}>{cell.rank}</div>
                                        })}
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <img src={`https://maps.googleapis.com/maps/api/staticmap?center=${selectedBiz.lat},${selectedBiz.lng}&zoom=${zoom}&size=${mapW}x${mapH}&scale=2&style=feature:all|element:labels.text.fill|color:0x888888&style=feature:road|color:0x2a2a3a&style=feature:water|color:0x0a0a2f&style=feature:landscape|color:0x1a1a2e&style=feature:poi|visibility:off&key=${apiKey}`}
                                        alt="map" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(2px)', transform: 'scale(1.05)' }} />
                                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,6,18,0.78)' }} />
                                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
                                        <div style={{ fontSize: 32 }}>🔄</div>
                                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, color: '#fff' }}>Next Audit</div>
                                        {nextDate && <>
                                          <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 900, color: 'var(--nebula-blue)', lineHeight: 1 }}>{daysLeft}</div>
                                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>day{daysLeft !== 1 ? 's' : ''} remaining</div>
                                          </div>
                                          <div style={{ width: '75%', height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: 'linear-gradient(90deg, var(--nebula-purple), var(--nebula-blue))' }} />
                                          </div>
                                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>{nextDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                        </>}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            )
                          }

                          const hasMultiple = kwAudits.length >= 2
                          const rightAudit = hasMultiple ? (fullLatest || latest) : null

                          // Right side: if only 1 audit, show a clean "next audit" card instead of blurred map
                          const renderNextAuditCard = () => (
                            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', background: 'rgba(232,238,255,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12, textAlign: 'center' }}>
                              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(123,47,255,0.1)', border: '1px solid rgba(123,47,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📅</div>
                              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700 }}>Next Audit</div>
                              {nextDate && (
                                <>
                                  <div style={{ fontSize: 13, color: 'var(--dim)', lineHeight: 1.6 }}>
                                    Your next ranking audit is scheduled for
                                  </div>
                                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--nebula-blue)' }}>
                                    {nextDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                  </div>
                                  <div style={{ width: '80%', height: 5, borderRadius: 3, background: 'rgba(232,238,255,0.08)', overflow: 'hidden', marginTop: 4 }}>
                                    <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: 'linear-gradient(90deg, var(--nebula-purple), var(--nebula-blue))' }} />
                                  </div>
                                  <div style={{ fontSize: 12, color: 'var(--dim)' }}>{daysLeft} day{daysLeft !== 1 ? 's' : ''} away</div>
                                </>
                              )}
                            </div>
                          )

                          // If no audit exists at all for this keyword, show pending on both sides
                          const neitherAudit = !baseline && !latest && !fullBaseline && !fullLatest
                          if (neitherAudit) {
                            return (
                              <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center' }}>
                                <div style={{ width: 52, height: 52, border: '3px solid rgba(123,47,255,0.3)', borderTopColor: 'var(--nebula-purple)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginTop: 8 }}>Audit Generating</div>
                                <div style={{ fontSize: 13, color: 'var(--dim)' }}>Your first rank audit is being run now. Refresh in a minute.</div>
                              </div>
                            )
                          }

                          return (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, padding: '20px' }}>
                              {renderMap(fullBaseline || fullLatest || baseline || latest, 'Baseline Audit')}
                              {hasMultiple ? renderMap(rightAudit, 'Latest Audit') : renderNextAuditCard()}
                            </div>
                          )
                        })()}
                      </div>
                    )
                  })}
                </>
              )
            })()}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default function Reports() {
  return (
    <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}><div style={{width:36,height:36,border:'3px solid rgba(123,47,255,0.3)',borderTopColor:'var(--nebula-purple)',borderRadius:'50%',animation:'spin 0.7s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>}>
      <ReportsContent />
    </Suspense>
  )
}
