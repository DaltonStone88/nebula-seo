'use client'
import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

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
  const y = -(Math.log(Math.tan(Math.PI/4 + latRad/2)) - Math.log(Math.tan(Math.PI/4 + centerLatRad/2))) / (2*Math.PI) * worldSize
  return { px: mapW/2 + x, py: mapH/2 + y }
}

const PAGE = { width: '794px', minHeight: '1123px', boxSizing: 'border-box', padding: '60px 70px', position: 'relative', overflow: 'hidden' }
const BRAND = '#7b2fff'

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
    fetch(url).then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [auditId])

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'Arial', color:'#333' }}>Generating report...</div>
  if (!data || data.error) return <div style={{ padding:40 }}>Report not found.</div>

  const { audit, business, baselineAudit, competitors, leadData } = data
  const gridData = Array.isArray(audit.gridData) ? audit.gridData : []
  const cols = parseInt((audit.gridSize || '7x7').split('x')[0])
  const zoom = cols <= 5 ? 14 : cols <= 7 ? 13 : cols <= 10 ? 12 : 11
  const mapW = 640, mapH = 480
  const circleSize = cols <= 7 ? 22 : cols <= 10 ? 17 : 13
  const circleFontSize = cols <= 7 ? 8 : 7
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const top3Pct = audit.top3Percent || 0
  const avgRank = audit.avgRank || 20
  const visibilityScore = Math.round((top3Pct * 0.7) + (Math.max(0, 20 - avgRank) / 20 * 100 * 0.3))
  const hasImprovement = baselineAudit && baselineAudit.id !== audit.id
  const improvementPct = hasImprovement ? Math.round(((baselineAudit.avgRank - audit.avgRank) / baselineAudit.avgRank) * 100) : null
  const reportDate = new Date(audit.createdAt).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })
  const brandName = whitelabel ? agencyName : 'NebulaSEO'
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${business.lat},${business.lng}&zoom=${zoom}&size=${mapW}x${mapH}&scale=2&style=feature:all|element:labels.text.fill|color:0x666666&style=feature:road|color:0xe8e8e8&style=feature:water|color:0xc8d8f0&style=feature:landscape|color:0xf5f5f5&style=feature:poi|visibility:off&style=feature:transit|visibility:off&key=${apiKey}`

  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: `
      @page { size: A4; margin: 0; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
      body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; }
      @media print {
        .page { page-break-after: always; page-break-inside: avoid; }
        .page:last-child { page-break-after: auto; }
      }
    ` }} />

    <div style={{ fontFamily:"'Helvetica Neue', Arial, sans-serif", background:'#fff', width:'794px' }}>

      {/* PAGE 1 — COVER */}
      <div className="page" style={{ ...PAGE, background:'linear-gradient(135deg, #0a0a1f 0%, #1a0a3a 55%, #0a1a3a 100%)', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
        <div style={{ position:'absolute', top:-80, right:-80, width:360, height:360, borderRadius:'50%', background:'radial-gradient(circle, rgba(123,47,255,0.25), transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-40, left:-40, width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,200,255,0.12), transparent 70%)', pointerEvents:'none' }} />
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', position:'relative' }}>
          <div style={{ fontWeight:900, fontSize:20, letterSpacing:3, color:'#fff' }}>{brandName.toUpperCase()}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', letterSpacing:2, textTransform:'uppercase' }}>Local SEO Performance Report</div>
        </div>
        <div style={{ position:'relative' }}>
          <div style={{ fontSize:11, color:'rgba(123,200,255,0.8)', letterSpacing:4, textTransform:'uppercase', marginBottom:18 }}>Monthly Report · {reportDate}</div>
          <div style={{ fontSize:48, fontWeight:900, color:'#fff', lineHeight:1.1, marginBottom:10 }}>{business.name}</div>
          <div style={{ fontSize:15, color:'rgba(255,255,255,0.45)', marginBottom:44 }}>{business.address}</div>
          <div style={{ display:'inline-flex', alignItems:'baseline', gap:8, background:'rgba(123,47,255,0.2)', border:'1px solid rgba(123,47,255,0.4)', borderRadius:16, padding:'14px 28px', marginBottom:44 }}>
            <div style={{ fontSize:64, fontWeight:900, color:'#fff', lineHeight:1 }}>{visibilityScore}</div>
            <div style={{ fontSize:22, color:'rgba(255,255,255,0.45)', fontWeight:300 }}>/100</div>
            <div style={{ fontSize:13, color:'rgba(123,200,255,0.8)', marginLeft:8, letterSpacing:1 }}>LOCAL VISIBILITY SCORE</div>
          </div>
          <div style={{ display:'flex', gap:44 }}>
            {[{label:'Average Ranking', value:`#${audit.avgRank}`, color:'#00c8ff'}, {label:'Top 3 Visibility', value:`${audit.top3Percent}%`, color:BRAND}, {label:'Keyword Tracked', value:audit.keyword, color:'#fff'}].map((s,i) => (
              <div key={i}>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', letterSpacing:2, textTransform:'uppercase', marginBottom:5 }}>{s.label}</div>
                <div style={{ fontSize:20, fontWeight:700, color:s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.18)', position:'relative' }}>Confidential · Prepared by {brandName}</div>
      </div>

      {/* PAGE 2 — VISIBILITY */}
      <div className="page" style={{ ...PAGE, background:'#fff', display:'flex', flexDirection:'column' }}>
        <div style={{ fontSize:10, color:BRAND, letterSpacing:4, textTransform:'uppercase', marginBottom:6 }}>Section 01</div>
        <div style={{ fontSize:32, fontWeight:900, color:'#1a1a2e', marginBottom:3 }}>Your Visibility</div>
        <div style={{ fontSize:32, fontWeight:900, color:BRAND, marginBottom:36 }}>At a Glance</div>
        <div style={{ display:'flex', alignItems:'center', gap:40, marginBottom:36, padding:'28px 32px', background:'#f8f8ff', borderRadius:18, border:'1px solid #eee' }}>
          <div style={{ textAlign:'center', flexShrink:0 }}>
            <div style={{ position:'relative', width:130, height:130, margin:'0 auto' }}>
              <svg viewBox="0 0 130 130" style={{ transform:'rotate(-90deg)', width:130, height:130 }}>
                <circle cx="65" cy="65" r="52" fill="none" stroke="#eeeef8" strokeWidth="13"/>
                <circle cx="65" cy="65" r="52" fill="none" stroke={BRAND} strokeWidth="13" strokeLinecap="round" strokeDasharray={`${2*Math.PI*52*visibilityScore/100} ${2*Math.PI*52}`}/>
              </svg>
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                <div style={{ fontSize:34, fontWeight:900, color:'#1a1a2e', lineHeight:1 }}>{visibilityScore}</div>
                <div style={{ fontSize:11, color:'#999' }}>/100</div>
              </div>
            </div>
            <div style={{ fontSize:11, color:'#999', marginTop:8 }}>Local Visibility Score</div>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:700, color:'#1a1a2e', marginBottom:12, lineHeight:1.4 }}>
              {visibilityScore >= 80 ? '🏆 Excellent visibility in your market.' : visibilityScore >= 60 ? '📈 Strong visibility with room to grow.' : '⚠️ Your visibility needs improvement.'}
            </div>
            <div style={{ fontSize:13, color:'#555', lineHeight:1.8 }}>
              When potential customers search for <strong>"{audit.keyword}"</strong> in your area, your business appears in the <strong>top 3 results {audit.top3Percent}% of the time</strong>.{hasImprovement && improvementPct > 0 ? ` That's a ${improvementPct}% improvement compared to your baseline.` : ''}
            </div>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:18, marginBottom:28 }}>
          {[
            {icon:'📍', title:'Where You Rank', value:`#${audit.avgRank}`, desc:`Average position when customers search near your location`, color:'#00c8ff'},
            {icon:'👁️', title:'Top 3 Visibility', value:`${audit.top3Percent}%`, desc:'Of your service area you appear in top 3 results', color:BRAND},
            {icon:'📊', title:'Grid Coverage', value:`${gridData.length} pts`, desc:`Locations checked across your ${audit.gridSize} service area`, color:'#ff2d9a'},
          ].map((c,i) => (
            <div key={i} style={{ padding:'22px 20px', borderRadius:14, background:'#fff', border:'1px solid #eee', boxShadow:'0 2px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize:24, marginBottom:10 }}>{c.icon}</div>
              <div style={{ fontSize:10, color:'#999', letterSpacing:2, textTransform:'uppercase', marginBottom:5 }}>{c.title}</div>
              <div style={{ fontSize:28, fontWeight:900, color:c.color, marginBottom:6, lineHeight:1 }}>{c.value}</div>
              <div style={{ fontSize:11, color:'#777', lineHeight:1.5 }}>{c.desc}</div>
            </div>
          ))}
        </div>
        {hasImprovement && (
          <div style={{ padding:'20px 24px', borderRadius:14, background:'linear-gradient(135deg,#f0fff8,#e8f4ff)', border:'1px solid #c8eedd', display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ fontSize:28 }}>{improvementPct > 0 ? '📈' : '📉'}</div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'#1a1a2e', marginBottom:3 }}>{improvementPct > 0 ? `Your ranking improved ${improvementPct}% since your last report` : `Your ranking changed ${improvementPct}% since your last report`}</div>
              <div style={{ fontSize:12, color:'#555' }}>Baseline avg rank: <strong>{baselineAudit.avgRank}</strong> → Current avg rank: <strong>{audit.avgRank}</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* PAGE 3 — HEATMAP */}
      <div className="page" style={{ ...PAGE, background:'#fff', display:'flex', flexDirection:'column' }}>
        <div style={{ fontSize:10, color:BRAND, letterSpacing:4, textTransform:'uppercase', marginBottom:6 }}>Section 02</div>
        <div style={{ fontSize:32, fontWeight:900, color:'#1a1a2e', marginBottom:6 }}>Your Ranking Map</div>
        <div style={{ fontSize:13, color:'#666', marginBottom:22, lineHeight:1.6, maxWidth:560 }}>
          Each circle shows your position when a customer searches <strong>"{audit.keyword}"</strong> from that location. Green = top results. Red = hard to find.
        </div>
        <div style={{ borderRadius:16, overflow:'hidden', border:'1px solid #ddd', marginBottom:16 }}>
          <div style={{ padding:'13px 18px', background:'#1a1a2e', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>Keyword: <span style={{ color:'#00c8ff' }}>{audit.keyword}</span></div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{reportDate} · {audit.gridSize} grid</div>
            </div>
            <div style={{ display:'flex', gap:20 }}>
              <div style={{ textAlign:'right' }}><div style={{ fontSize:9, color:'rgba(255,255,255,0.4)' }}>Avg Rank</div><div style={{ fontSize:18, fontWeight:800, color:'#fff' }}>{audit.avgRank}</div></div>
              <div style={{ textAlign:'right' }}><div style={{ fontSize:9, color:'rgba(255,255,255,0.4)' }}>Top 3</div><div style={{ fontSize:18, fontWeight:800, color:BRAND }}>{audit.top3Percent}%</div></div>
            </div>
          </div>
          <div style={{ position:'relative', width:'100%', paddingBottom:'70%', background:'#1a1a2e' }}>
            <img src={mapUrl} alt="map" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
            <div style={{ position:'absolute', inset:0 }}>
              {gridData.map((cell, i) => {
                const { px, py } = latLngToPixel(cell.lat, cell.lng, business.lat, business.lng, zoom, mapW, mapH)
                const pct_x = (px/mapW)*100, pct_y = (py/mapH)*100
                if (pct_x < 0 || pct_x > 100 || pct_y < 0 || pct_y > 100) return null
                return (
                  <div key={i} style={{ position:'absolute', left:`${pct_x}%`, top:`${pct_y}%`, transform:'translate(-50%,-50%)', width:circleSize, height:circleSize, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:circleFontSize, fontWeight:800, background:getRankColor(cell.rank), color:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,0.4)', zIndex:1 }}>{cell.rank}</div>
                )
              })}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:14, alignItems:'center', flexWrap:'wrap' }}>
          <span style={{ fontSize:11, color:'#888' }}>Rank:</span>
          {[{bg:'#1a9e50',l:'#1–3 Top'},{bg:'#5aaa35',l:'#4–7 Good'},{bg:'#b8a800',l:'#8–10'},{bg:'#d06000',l:'#11–15'},{bg:'#a01010',l:'16+ Not Visible'}].map(x => (
            <div key={x.l} style={{ display:'flex', alignItems:'center', gap:5 }}>
              <div style={{ width:11, height:11, borderRadius:'50%', background:x.bg, flexShrink:0 }} />
              <span style={{ fontSize:10, color:'#777' }}>{x.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PAGE 4 — PERFORMANCE */}
      <div className="page" style={{ ...PAGE, background:'#fff', display:'flex', flexDirection:'column' }}>
        <div style={{ fontSize:10, color:BRAND, letterSpacing:4, textTransform:'uppercase', marginBottom:6 }}>Section 03</div>
        <div style={{ fontSize:32, fontWeight:900, color:'#1a1a2e', marginBottom:6 }}>Business Performance</div>
        <div style={{ fontSize:13, color:'#666', marginBottom:40, lineHeight:1.6 }}>Real actions customers took after finding your business on Google.</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:22, marginBottom:40 }}>
          {[
            {icon:'📞', label:'Phone Calls', value:leadData?.calls||0, desc:'Customers who called directly from Google'},
            {icon:'🗺️', label:'Direction Requests', value:leadData?.directions||0, desc:'Customers who asked for directions'},
            {icon:'🖱️', label:'Website Visits', value:leadData?.clicks||0, desc:'Customers who visited your website from Google'},
          ].map((m,i) => (
            <div key={i} style={{ padding:'28px 22px', borderRadius:18, background:'#f8f8ff', border:'1px solid #eeeef8', textAlign:'center' }}>
              <div style={{ fontSize:32, marginBottom:10 }}>{m.icon}</div>
              <div style={{ fontSize:42, fontWeight:900, color:BRAND, lineHeight:1, marginBottom:5 }}>{m.value}</div>
              <div style={{ fontSize:13, fontWeight:700, color:'#1a1a2e', marginBottom:6 }}>{m.label}</div>
              <div style={{ fontSize:11, color:'#888', lineHeight:1.5 }}>{m.desc}</div>
            </div>
          ))}
        </div>
        {leadData?.estimatedValue > 0 && (
          <div style={{ padding:'28px 36px', borderRadius:18, background:'linear-gradient(135deg,#1a0a3a,#0a1a3a)', color:'#fff', display:'flex', alignItems:'center', gap:28 }}>
            <div style={{ fontSize:40 }}>💰</div>
            <div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', letterSpacing:2, textTransform:'uppercase', marginBottom:5 }}>Estimated Lead Value</div>
              <div style={{ fontSize:40, fontWeight:900, color:'#fff', lineHeight:1 }}>${leadData.estimatedValue.toLocaleString()}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginTop:5 }}>Based on total customer interactions</div>
            </div>
          </div>
        )}
      </div>

      {/* PAGE 5 — MARKET POSITION */}
      <div className="page" style={{ ...PAGE, background:'#fff', display:'flex', flexDirection:'column' }}>
        <div style={{ fontSize:10, color:BRAND, letterSpacing:4, textTransform:'uppercase', marginBottom:6 }}>Section 04</div>
        <div style={{ fontSize:32, fontWeight:900, color:'#1a1a2e', marginBottom:6 }}>Your Market Position</div>
        <div style={{ fontSize:13, color:'#666', marginBottom:36, lineHeight:1.6 }}>How you compare to other businesses competing for the same customers.</div>
        <div style={{ padding:'24px 28px', borderRadius:18, background:'linear-gradient(135deg,#f0eeff,#e8f4ff)', border:`2px solid ${BRAND}`, marginBottom:28, display:'flex', alignItems:'center', gap:20 }}>
          <div style={{ width:50, height:50, borderRadius:'50%', background:BRAND, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:900, color:'#fff', flexShrink:0 }}>★</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#1a1a2e', marginBottom:3 }}>{business.name}</div>
            <div style={{ fontSize:13, color:'#555' }}>Average ranking <strong>#{audit.avgRank}</strong> · Top 3 visibility <strong>{audit.top3Percent}%</strong> of your service area</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:10, color:'#999', marginBottom:2 }}>Your Score</div>
            <div style={{ fontSize:32, fontWeight:900, color:BRAND }}>{visibilityScore}</div>
          </div>
        </div>
        {competitors && competitors.length > 0 && (
          <>
            <div style={{ fontSize:13, fontWeight:700, color:'#1a1a2e', marginBottom:14 }}>Top competitors in your area:</div>
            {competitors.slice(0,6).map((comp,i) => {
              const compScore = Math.round(100 - (comp.avgRank/20*100))
              const isYou = comp.placeId === business.placeId
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 0', borderBottom:'1px solid #f0f0f0' }}>
                  <div style={{ width:30, height:30, borderRadius:'50%', background:isYou?BRAND:'#e8e8e8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:isYou?'#fff':'#666', flexShrink:0 }}>{i+1}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:isYou?700:400, color:isYou?BRAND:'#1a1a2e' }}>{comp.name}{isYou?' ← You':''}</div>
                    <div style={{ fontSize:10, color:'#999' }}>Avg rank #{comp.avgRank?.toFixed(1)||'N/A'}</div>
                  </div>
                  <div style={{ width:140 }}>
                    <div style={{ height:7, borderRadius:4, background:'#f0f0f0', overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:4, width:`${Math.min(100,Math.max(0,compScore))}%`, background:isYou?BRAND:'#ccc' }} />
                    </div>
                  </div>
                  <div style={{ fontSize:12, fontWeight:700, color:isYou?BRAND:'#999', width:30, textAlign:'right' }}>{compScore}</div>
                </div>
              )
            })}
          </>
        )}
      </div>

      {/* PAGE 6 — SUMMARY */}
      <div className="page" style={{ ...PAGE, background:'#fff', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:10, color:BRAND, letterSpacing:4, textTransform:'uppercase', marginBottom:6 }}>Section 05</div>
          <div style={{ fontSize:32, fontWeight:900, color:'#1a1a2e', marginBottom:6 }}>30-Day Summary</div>
          <div style={{ fontSize:13, color:'#666', marginBottom:36, lineHeight:1.6 }}>Everything at a glance for {reportDate}.</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:36 }}>
            {[
              {label:'Local Visibility Score', value:`${visibilityScore}/100`, icon:'🎯', desc:'Your overall local search performance'},
              {label:'Average Ranking', value:`#${audit.avgRank}`, icon:'📊', desc:`For "${audit.keyword}"`},
              {label:'Top 3 Placements', value:`${audit.top3Percent}%`, icon:'🏆', desc:'Of your service area where you rank #1–3'},
              {label:'Total Lead Actions', value:(leadData?.total||0).toString(), icon:'👥', desc:'Calls, directions, and website visits'},
            ].map((s,i) => (
              <div key={i} style={{ padding:'24px', borderRadius:14, background:'#f8f8ff', border:'1px solid #eeeef8', display:'flex', gap:16, alignItems:'center' }}>
                <div style={{ fontSize:30 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize:10, color:'#999', letterSpacing:1, textTransform:'uppercase', marginBottom:3 }}>{s.label}</div>
                  <div style={{ fontSize:28, fontWeight:900, color:BRAND, lineHeight:1, marginBottom:3 }}>{s.value}</div>
                  <div style={{ fontSize:11, color:'#999' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ paddingTop:28, borderTop:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'#1a1a2e', marginBottom:3 }}>{brandName}</div>
            <div style={{ fontSize:11, color:'#999' }}>Local SEO Performance Report · {reportDate}</div>
          </div>
          {!whitelabel && <div style={{ fontSize:10, color:'#ccc' }}>Powered by NebulaSEO</div>}
        </div>
      </div>

    </div>
    </>
  )
}
