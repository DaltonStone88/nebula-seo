'use client'
import { useState, useEffect } from 'react'

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

function HeatmapGrid({ audit, title, subtitle }) {
  if (!audit) return (
    <div style={{ flex: 1, borderRadius: 16, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ textAlign: 'center', color: 'var(--dim)', fontSize: 14 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
        No audit data yet
      </div>
    </div>
  )

  const gridData = Array.isArray(audit.gridData) ? audit.gridData : []
  const gridSize = audit.gridSize || '7x7'
  const cols = parseInt(gridSize.split('x')[0])

  return (
    <div style={{ flex: 1, borderRadius: 16, border: '1px solid var(--border)', background: 'rgba(0,0,0,0.3)', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 11, color: 'var(--dim)' }}>{subtitle}</div>
        </div>
        <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 2 }}>Avg Rank</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>{audit.avgRank}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 2 }}>Top 3</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--nebula-blue)' }}>{audit.top3Percent}%</div>
          </div>
        </div>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 3 }}>
          {gridData.map((cell, i) => (
            <div key={i} title={`Rank: ${cell.rank}`} style={{
              aspectRatio: '1', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: cols > 15 ? 7 : cols > 10 ? 8 : 9,
              fontWeight: 700, fontFamily: 'var(--font-display)',
              background: getRankColor(cell.rank),
              color: 'rgba(255,255,255,0.95)',
              transition: 'transform 0.15s',
              cursor: 'default',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >{cell.rank}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Reports() {
  const [view, setView] = useState('reports')
  const [businesses, setBusinesses] = useState([])
  const [selectedBiz, setSelectedBiz] = useState(null)
  const [selectedKeyword, setSelectedKeyword] = useState(0)
  const [gridSize, setGridSize] = useState('7x7')
  const [spacing, setSpacing] = useState('medium')
  const [running, setRunning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [baselineFull, setBaselineFull] = useState(null)
  const [latestFull, setLatestFull] = useState(null)

  const fetchBusinesses = async () => {
    const res = await fetch('/api/businesses')
    const data = await res.json()
    setBusinesses(data)
    if (!selectedBiz && data.length > 0) setSelectedBiz(data[0])
    else if (selectedBiz) {
      const updated = data.find(b => b.id === selectedBiz.id)
      if (updated) setSelectedBiz(updated)
    }
    setLoading(false)
  }

  useEffect(() => { fetchBusinesses() }, [])

  const keyword = selectedBiz?.targetKeywords?.[selectedKeyword]

  useEffect(() => {
    if (!selectedBiz?.id || !keyword) return
    fetch(`/api/places/rank-audit?businessId=${selectedBiz.id}&keyword=${encodeURIComponent(keyword)}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setBaselineFull(data.find(a => a.isBaseline) || data[0])
          setLatestFull(data[data.length - 1])
        } else {
          setBaselineFull(null)
          setLatestFull(null)
        }
      })
  }, [selectedBiz?.id, keyword])

  const runAudit = async () => {
    if (!selectedBiz || !keyword) return
    setRunning(true)
    try {
      await fetch('/api/places/rank-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: selectedBiz.id, keyword, gridSize, spacing }),
      })
      await fetchBusinesses()
      // Refetch full audit data
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
  const improvementPct = hasImprovement
    ? Math.round(((baselineAudit.avgRank - latestAudit.avgRank) / baselineAudit.avgRank) * 100)
    : null

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
      <div style={{ width: 36, height: 36, border: '3px solid rgba(123,47,255,0.3)', borderTopColor: 'var(--nebula-purple)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div>
      <div style={{ padding: '20px 36px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(6,6,18,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Reports</h1>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 4 }}>
            {[['reports', 'Performance'], ['heatmap', 'Heatmap Audits']].map(([v, l]) => (
              <button key={v} onClick={() => setView(v)} style={{ padding: '7px 18px', borderRadius: 7, border: 'none', cursor: 'pointer', background: view === v ? 'rgba(123,47,255,0.25)' : 'transparent', color: view === v ? 'var(--star-white)' : 'var(--dim)', fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: view === v ? 600 : 400, transition: 'all 0.2s' }}>{l}</button>
            ))}
          </div>
        </div>
        {businesses.length > 0 && (
          <select onChange={e => setSelectedBiz(businesses.find(b => b.id === e.target.value))} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(6,6,18,0.8)', color: 'var(--star-white)', fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none' }}>
            {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
      </div>

      <div style={{ padding: '32px 36px' }}>
        {view === 'heatmap' ? (
          !selectedBiz?.lat ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--dim)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📍</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 8 }}>No business location found</div>
              <div style={{ fontSize: 14 }}>Add a business to run rank audits.</div>
            </div>
          ) : (
            <>
              <div style={{ borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)', padding: '24px', marginBottom: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Keyword</label>
                    <select value={selectedKeyword} onChange={e => setSelectedKeyword(Number(e.target.value))} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(6,6,18,0.8)', color: 'var(--star-white)', fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none' }}>
                      {(selectedBiz.targetKeywords || []).map((kw, i) => <option key={i} value={i}>{kw}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Grid Size</label>
                    <select value={gridSize} onChange={e => setGridSize(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(6,6,18,0.8)', color: 'var(--star-white)', fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none' }}>
                      {['5x5','7x7','10x10','15x15','20x20'].map(s => <option key={s} value={s}>{s} ({parseInt(s)**2} pts)</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Spacing</label>
                    <select value={spacing} onChange={e => setSpacing(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(6,6,18,0.8)', color: 'var(--star-white)', fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none' }}>
                      <option value="small">Tight (~0.35 mi)</option>
                      <option value="medium">Standard (~0.6 mi)</option>
                      <option value="large">Regional (~1 mi)</option>
                    </select>
                  </div>
                  <button onClick={runAudit} disabled={running || !selectedBiz.targetKeywords?.length} className="btn-primary" style={{ fontSize: 12, padding: '11px 20px', justifyContent: 'center' }}>
                    {running ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />Running...</span> : '🔍 Run Audit'}
                  </button>
                </div>
              </div>

              {hasImprovement && (
                <div style={{ borderRadius: 16, padding: '20px 24px', background: 'linear-gradient(135deg, rgba(0,200,255,0.08), rgba(123,47,255,0.06))', border: '1px solid rgba(0,200,255,0.2)', marginBottom: 24, display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div><div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 4 }}>Keyword</div><div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>{keyword}</div></div>
                  <div><div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 4 }}>Improvement</div><div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, color: improvementPct > 0 ? 'var(--nebula-blue)' : 'var(--nebula-pink)' }}>{improvementPct > 0 ? '+' : ''}{improvementPct}% {improvementPct > 20 ? '🔥' : ''}</div></div>
                  <div><div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 4 }}>Baseline Avg</div><div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>{baselineAudit.avgRank}</div></div>
                  <div><div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 4 }}>Current Avg</div><div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--nebula-blue)' }}>{latestAudit.avgRank}</div></div>
                  <div><div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 4 }}>Top 3 Placements</div><div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--nebula-blue)' }}>{latestAudit.top3Percent}%</div></div>
                  <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--dim)' }}>{keywordAudits.length} audits total</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 20 }}>
                <HeatmapGrid audit={baselineFull} title="Baseline Audit" subtitle={baselineFull ? new Date(baselineFull.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No baseline yet'} />
                <HeatmapGrid audit={latestFull?.id !== baselineFull?.id ? latestFull : null} title="Latest Audit" subtitle={latestFull?.id !== baselineFull?.id ? new Date(latestFull.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Run an audit to compare'} />
              </div>

              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 16 }}>
                <span style={{ fontSize: 11, color: 'var(--dim)' }}>Rank:</span>
                {[{ bg: '#1ec85a', label: '#1–3' }, { bg: '#6bc94a', label: '#4–7' }, { bg: '#c8c020', label: '#8–10' }, { bg: '#e07820', label: '#11–15' }, { bg: '#b01414', label: '16+' }].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 14, height: 14, borderRadius: 3, background: l.bg }} />
                    <span style={{ fontSize: 11, color: 'var(--dim)' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </>
          )
        ) : (
          <div>
            <div style={{ borderRadius: 16, padding: '20px 28px', background: 'linear-gradient(135deg, rgba(0,200,255,0.1), rgba(123,47,255,0.06))', border: '1px solid rgba(0,200,255,0.2)', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--nebula-blue)' }}>⏰ Next ranking audit in 30 days</div>
              <button onClick={() => setView('heatmap')} className="btn-primary" style={{ fontSize: 11, padding: '10px 20px' }}>Run Manual Audit →</button>
            </div>
            {selectedBiz && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {(selectedBiz.targetKeywords || []).map((kw, i) => {
                  const kwAudits = (selectedBiz.rankAudits || []).filter(a => a.keyword === kw)
                  const latest = kwAudits[kwAudits.length - 1]
                  const baseline = kwAudits.find(a => a.isBaseline)
                  const imp = baseline && latest && baseline.id !== latest.id ? Math.round(((baseline.avgRank - latest.avgRank) / baseline.avgRank) * 100) : null
                  return (
                    <div key={i} style={{ borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)', padding: '24px' }}>
                      <div style={{ fontSize: 11, color: 'var(--nebula-blue)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Keyword {i + 1}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>{kw}</div>
                      {latest ? (
                        <>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, color: 'var(--nebula-blue)', marginBottom: 4 }}>{latest.avgRank}</div>
                          <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 8 }}>Average ranking</div>
                          {imp !== null && <div style={{ fontSize: 13, fontWeight: 600, color: imp > 0 ? 'rgba(20,200,100,0.9)' : 'var(--nebula-pink)' }}>{imp > 0 ? `↑ ${imp}% improvement` : `↓ ${Math.abs(imp)}% decline`}</div>}
                          <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4 }}>Top 3: {latest.top3Percent}%</div>
                        </>
                      ) : (
                        <div style={{ fontSize: 13, color: 'var(--dim)' }}>No audit yet — <button onClick={() => { setView('heatmap'); setSelectedKeyword(i) }} style={{ background: 'none', border: 'none', color: 'var(--nebula-blue)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)' }}>run one now</button></div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
