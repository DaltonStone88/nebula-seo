'use client'
import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

const PRINT_CSS = `
  @page {
    size: A4;
    margin: 0;
  }
  @media print {
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { margin: 0 !important; padding: 0 !important; }
    .report-page { 
      page-break-after: always !important;
      page-break-inside: avoid !important;
      width: 210mm !important;
      min-height: 297mm !important;
      box-sizing: border-box !important;
    }
    .report-page:last-child { page-break-after: auto !important; }
  }
`

const RANK_COLORS = {
  1: '#1a9e50', 2: '#1a9e50', 3: '#1a9e50',
  4: '#5aaa35', 5: '#5aaa35', 6: '#5aaa35', 7: '#5aaa35',
  8: '#b8a800', 9: '#b8a800', 10: '#b8a800',
  11: '#d06000', 12: '#d06000', 13: '#d06000', 14: '#d06000', 15: '#d06000',
}
function getRankColor(rank) {
  if (rank === '20+' || rank > 15) return '#a01010'
  return RANK_COLORS[rank] || '#a01010'
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

export default function ReportPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const auditId = params.id
  const whitelabel = searchParams.get('wl') === '1'
  const agencyName = searchParams.get('agency') || 'NebulaSEO'
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const secret = searchParams.get('secret') || ''
    const url = secret 
      ? `/api/report?auditId=${auditId}&secret=${encodeURIComponent(secret)}`
      : `/api/report?auditId=${auditId}`
    fetch(url)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [auditId])

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Georgia, serif', color: '#333' }}>Loading report...</div>
  if (!data || data.error) return <div style={{ padding: 40, fontFamily: 'Georgia, serif' }}>Report not found.</div>

  const { audit, business, baselineAudit, competitors, automationCount, leadData } = data
  const gridData = Array.isArray(audit.gridData) ? audit.gridData : []
  const cols = parseInt((audit.gridSize || '7x7').split('x')[0])
  const zoom = cols <= 5 ? 14 : cols <= 7 ? 13 : cols <= 10 ? 12 : 11
  const mapW = 640
  const mapH = 480
  const circleSize = cols <= 7 ? 24 : cols <= 10 ? 18 : 14
  const fontSize = cols <= 7 ? 8 : cols <= 10 ? 7 : 6
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  // Calculate visibility score (0-100)
  const top3Pct = audit.top3Percent || 0
  const avgRank = audit.avgRank || 20
  const visibilityScore = Math.round((top3Pct * 0.7) + (Math.max(0, 20 - avgRank) / 20 * 100 * 0.3))

  // Improvement
  const hasImprovement = baselineAudit && baselineAudit.id !== audit.id
  const improvementPct = hasImprovement
    ? Math.round(((baselineAudit.avgRank - audit.avgRank) / baselineAudit.avgRank) * 100)
    : null

  const reportDate = new Date(audit.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const brandColor = '#7b2fff'
  const brandName = whitelabel ? agencyName : 'NebulaSEO'

  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${business.lat},${business.lng}&zoom=${zoom}&size=${mapW}x${mapH}&scale=2&style=feature:all|element:labels.text.fill|color:0x666666&style=feature:road|color:0xe0e0e0&style=feature:water|color:0xc8d8f0&style=feature:landscape|color:0xf5f5f5&style=feature:poi|visibility:off&style=feature:transit|visibility:off&key=${apiKey}`

  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
    <div className="report-wrapper" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", color: '#1a1a2e', background: '#fff', width: '100%' }}>

      {/* ── PAGE 1: COVER ─────────────────────────────── */}
      <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, #0a0a1f 0%, #1a0a3a 50%, #0a1a3a 100%)`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '60px 70px', position: 'relative', overflow: 'hidden', width: '100%' }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,47,255,0.2), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -50, left: -50, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,200,255,0.1), transparent 70%)', pointerEvents: 'none' }} />

        {/* Brand */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: 3, color: '#fff', opacity: 0.9 }}>{brandName.toUpperCase()}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase' }}>Local SEO Performance Report</div>
        </div>

        {/* Main content */}
        <div>
          <div style={{ fontSize: 11, color: 'rgba(123,200,255,0.8)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 20 }}>Monthly Report · {reportDate}</div>
          <div style={{ fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 12 }}>{business.name}</div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 48 }}>{business.address}</div>

          {/* Big score */}
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8, background: 'rgba(123,47,255,0.2)', border: '1px solid rgba(123,47,255,0.4)', borderRadius: 20, padding: '16px 32px', marginBottom: 48 }}>
            <div style={{ fontSize: 72, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{visibilityScore}</div>
            <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>/100</div>
            <div style={{ fontSize: 14, color: 'rgba(123,200,255,0.8)', marginLeft: 8, letterSpacing: 1 }}>LOCAL VISIBILITY SCORE</div>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 48 }}>
            {[
              { label: 'Average Ranking', value: `#${audit.avgRank}`, color: '#00c8ff' },
              { label: 'Top 3 Visibility', value: `${audit.top3Percent}%`, color: '#7b2fff' },
              { label: 'Keyword Tracked', value: audit.keyword, color: '#fff' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: 1 }}>Confidential · Prepared by {brandName}</div>
      </div>

      {/* ── PAGE 2: EXECUTIVE SUMMARY ─────────────────── */}
      <div style={{ minHeight: '100vh', padding: '0', background: '#fff' }}>
        <div style={{ fontSize: 11, color: brandColor, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Section 01</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: '#1a1a2e', marginBottom: 6 }}>Your Visibility</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: brandColor, marginBottom: 48 }}>At a Glance</div>

        {/* Score gauge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 48, marginBottom: 56, padding: '36px 40px', background: '#f8f8ff', borderRadius: 24, border: '1px solid #eeeefc' }}>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto' }}>
              <svg viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="80" cy="80" r="65" fill="none" stroke="#eeeefc" strokeWidth="16" />
                <circle cx="80" cy="80" r="65" fill="none" stroke={brandColor} strokeWidth="16" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 65 * visibilityScore / 100} ${2 * Math.PI * 65}`} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 42, fontWeight: 900, color: '#1a1a2e', lineHeight: 1 }}>{visibilityScore}</div>
                <div style={{ fontSize: 12, color: '#888', letterSpacing: 1 }}>/ 100</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 10 }}>Local Visibility Score</div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 16, lineHeight: 1.4 }}>
              {visibilityScore >= 80 ? '🏆 Excellent visibility in your market.' : visibilityScore >= 60 ? '📈 Strong visibility with room to grow.' : '⚠️ Your visibility needs improvement.'}
            </div>
            <div style={{ fontSize: 14, color: '#555', lineHeight: 1.8 }}>
              When potential customers search for <strong>"{audit.keyword}"</strong> in your area, your business appears in the <strong>top 3 results {audit.top3Percent}% of the time</strong>.
              {hasImprovement && improvementPct > 0 && ` That's a ${improvementPct}% improvement compared to your baseline.`}
            </div>
          </div>
        </div>

        {/* Key insight cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 40 }}>
          {[
            {
              icon: '📍',
              title: 'Where You Rank',
              value: `#${audit.avgRank}`,
              desc: `Average position when customers search "${audit.keyword}" near your location`,
              color: '#00c8ff',
            },
            {
              icon: '👁️',
              title: 'Top 3 Visibility',
              value: `${audit.top3Percent}%`,
              desc: 'Of the area you serve, you appear in the top 3 search results',
              color: brandColor,
            },
            {
              icon: '📊',
              title: 'Grid Coverage',
              value: `${gridData.length} pts`,
              desc: `Locations checked across your ${audit.gridSize} service area map`,
              color: '#ff2d9a',
            },
          ].map((card, i) => (
            <div key={i} style={{ padding: '28px 24px', borderRadius: 16, background: '#fff', border: '1px solid #eee', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{card.icon}</div>
              <div style={{ fontSize: 11, color: '#888', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>{card.title}</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: card.color, marginBottom: 8, lineHeight: 1 }}>{card.value}</div>
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>{card.desc}</div>
            </div>
          ))}
        </div>

        {hasImprovement && (
          <div style={{ padding: '24px 28px', borderRadius: 16, background: 'linear-gradient(135deg, #f0fff8, #e8f4ff)', border: '1px solid #c8eedd', display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontSize: 36 }}>{improvementPct > 0 ? '📈' : '📉'}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>
                {improvementPct > 0 ? `Your ranking improved ${improvementPct}% since your last report` : `Your ranking changed ${improvementPct}% since your last report`}
              </div>
              <div style={{ fontSize: 13, color: '#555' }}>
                Baseline average rank: <strong>{baselineAudit.avgRank}</strong> → Current average rank: <strong>{audit.avgRank}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── PAGE 3: HEATMAP ───────────────────────────── */}
      <div style={{ minHeight: '100vh', padding: '0', background: '#fff' }}>
        <div style={{ fontSize: 11, color: brandColor, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Section 02</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: '#1a1a2e', marginBottom: 6 }}>Your Ranking Map</div>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 32, lineHeight: 1.6, maxWidth: 600 }}>
          Each circle below shows your position when a potential customer searches <strong>"{audit.keyword}"</strong> from that location. Green means you're in the top results. The darker the red, the harder you are to find.
        </div>

        {/* Heatmap */}
        <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #e0e0e0', marginBottom: 24, position: 'relative' }}>
          {/* Stats bar */}
          <div style={{ padding: '16px 24px', background: '#1a1a2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>Keyword: <span style={{ color: '#00c8ff' }}>{audit.keyword}</span></div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{reportDate} · {audit.gridSize} grid</div>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Avg Rank</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{audit.avgRank}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Top 3</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#7b2fff' }}>{audit.top3Percent}%</div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div style={{ position: 'relative', width: '100%', paddingBottom: '75%', background: '#1a1a2e' }}>
            <img src={mapUrl} alt="map" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 8 }}>
              {gridData.map((cell, i) => {
                const { px, py } = latLngToPixel(cell.lat, cell.lng, business.lat, business.lng, zoom, mapW, mapH)
                const pct_x = (px / mapW) * 100
                const pct_y = (py / mapH) * 100
                if (pct_x < 0 || pct_x > 100 || pct_y < 0 || pct_y > 100) return null
                return (
                  <div key={i} style={{
                    position: 'absolute',
                    left: `${pct_x}%`, top: `${pct_y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: circleSize, height: circleSize, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize, fontWeight: 800,
                    background: getRankColor(cell.rank),
                    color: '#fff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                    zIndex: 1,
                  }}>{cell.rank}</div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 12, color: '#888' }}>Ranking Position:</span>
          {[{ bg: '#1a9e50', label: '#1–3 Top Results' }, { bg: '#5aaa35', label: '#4–7 Good' }, { bg: '#b8a800', label: '#8–10 Average' }, { bg: '#d06000', label: '#11–15 Below Average' }, { bg: '#a01010', label: '#16+ Not Visible' }].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: l.bg, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#666' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── PAGE 4: PERFORMANCE ───────────────────────── */}
      <div style={{ minHeight: '100vh', padding: '0', background: '#fff' }}>
        <div style={{ fontSize: 11, color: brandColor, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Section 03</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: '#1a1a2e', marginBottom: 6 }}>Business Performance</div>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 48, lineHeight: 1.6 }}>
          Real actions customers took after finding your business on Google.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 48 }}>
          {[
            { icon: '📞', label: 'Phone Calls', value: leadData?.calls || 0, desc: 'Customers who called directly from Google' },
            { icon: '🗺️', label: 'Direction Requests', value: leadData?.directions || 0, desc: 'Customers who asked for directions to your location' },
            { icon: '🖱️', label: 'Website Visits', value: leadData?.clicks || 0, desc: 'Customers who visited your website from Google' },
          ].map((m, i) => (
            <div key={i} style={{ padding: '32px 28px', borderRadius: 20, background: '#f8f8ff', border: '1px solid #eeeefc', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{m.icon}</div>
              <div style={{ fontSize: 48, fontWeight: 900, color: brandColor, lineHeight: 1, marginBottom: 6 }}>{m.value}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>{m.label}</div>
              <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>{m.desc}</div>
            </div>
          ))}
        </div>

        {leadData?.estimatedValue > 0 && (
          <div style={{ padding: '32px 40px', borderRadius: 20, background: 'linear-gradient(135deg, #1a0a3a, #0a1a3a)', color: '#fff', display: 'flex', alignItems: 'center', gap: 32 }}>
            <div style={{ fontSize: 48 }}>💰</div>
            <div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Estimated Lead Value</div>
              <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', lineHeight: 1 }}>${leadData.estimatedValue.toLocaleString()}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>Based on total customer interactions since your campaign began</div>
            </div>
          </div>
        )}
      </div>

      {/* ── PAGE 5: MARKET POSITION ───────────────────── */}
      <div style={{ minHeight: '100vh', padding: '0', background: '#fff' }}>
        <div style={{ fontSize: 11, color: brandColor, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Section 04</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: '#1a1a2e', marginBottom: 6 }}>Your Market Position</div>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 48, lineHeight: 1.6 }}>
          How you compare to other businesses competing for the same customers.
        </div>

        {/* Your position highlight */}
        <div style={{ padding: '28px 32px', borderRadius: 20, background: 'linear-gradient(135deg, #f0eeff, #e8f4ff)', border: `2px solid ${brandColor}`, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: brandColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#fff', flexShrink: 0 }}>★</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>{business.name}</div>
            <div style={{ fontSize: 14, color: '#555' }}>Average ranking <strong>#{audit.avgRank}</strong> · Top 3 visibility <strong>{audit.top3Percent}%</strong> of your service area</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Your Score</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: brandColor }}>{visibilityScore}</div>
          </div>
        </div>

        {/* Competitor table */}
        {competitors && competitors.length > 0 && (
          <>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: 16 }}>Top competitors in your area:</div>
            {competitors.slice(0, 6).map((comp, i) => {
              const compScore = Math.round(100 - (comp.avgRank / 20 * 100))
              const isYou = comp.placeId === business.placeId
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: isYou ? brandColor : '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: isYou ? '#fff' : '#666', flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: isYou ? 700 : 400, color: isYou ? brandColor : '#1a1a2e' }}>{comp.name} {isYou ? '← You' : ''}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>Avg rank #{comp.avgRank?.toFixed(1) || 'N/A'}</div>
                  </div>
                  <div style={{ width: 160 }}>
                    <div style={{ height: 8, borderRadius: 4, background: '#f0f0f0', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 4, width: `${Math.min(100, Math.max(0, compScore))}%`, background: isYou ? brandColor : '#ccc', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isYou ? brandColor : '#888', width: 40, textAlign: 'right' }}>{compScore}</div>
                </div>
              )
            })}
          </>
        )}
      </div>

      {/* ── PAGE 6: SUMMARY ───────────────────────────── */}
      <div style={{ minHeight: '100vh', padding: '0', background: '#fff' }}>
        <div style={{ fontSize: 11, color: brandColor, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Section 05</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: '#1a1a2e', marginBottom: 6 }}>30-Day Summary</div>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 48, lineHeight: 1.6 }}>Everything at a glance for {reportDate}.</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 48 }}>
          {[
            { label: 'Local Visibility Score', value: `${visibilityScore}/100`, icon: '🎯', desc: 'Your overall local search performance' },
            { label: 'Average Ranking', value: `#${audit.avgRank}`, icon: '📊', desc: `For "${audit.keyword}"` },
            { label: 'Top 3 Placements', value: `${audit.top3Percent}%`, icon: '🏆', desc: 'Of your service area where you rank #1-3' },
            { label: 'Total Lead Actions', value: (leadData?.total || 0).toString(), icon: '👥', desc: 'Calls, directions, and website visits' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '28px', borderRadius: 16, background: '#f8f8ff', border: '1px solid #eeeefc', display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ fontSize: 36 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 11, color: '#888', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: brandColor, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'auto', paddingTop: 40, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>{brandName}</div>
            <div style={{ fontSize: 12, color: '#888' }}>Local SEO Performance Report · {reportDate}</div>
          </div>
          {!whitelabel && (
            <div style={{ fontSize: 11, color: '#ccc' }}>Powered by NebulaSEO</div>
          )}
        </div>
      </div>

    </div>
    </>
  )
}
