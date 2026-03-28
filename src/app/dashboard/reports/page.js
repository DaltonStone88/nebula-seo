'use client'
import { useState } from 'react'
import Link from 'next/link'

function Heatmap({ improved }) {
  const cells = Array.from({ length: 100 }, (_, i) => {
    const r = Math.random()
    if (!improved) return { val: Math.random() > 0.15 ? '20+' : Math.floor(Math.random() * 6 + 14), type: 'bad' }
    let val, type
    if (r < 0.1) { val = Math.floor(Math.random() * 3 + 1); type = 'top' }
    else if (r < 0.25) { val = Math.floor(Math.random() * 4 + 4); type = 'good' }
    else if (r < 0.48) { val = Math.floor(Math.random() * 5 + 8); type = 'mid' }
    else if (r < 0.72) { val = Math.floor(Math.random() * 4 + 13); type: 'warn' }
    else { val = '20+'; type = 'bad' }
    return { val, type }
  })

  const colors = { top: 'rgba(20,200,90,0.85)', good: 'rgba(70,190,70,0.75)', mid: 'rgba(220,170,20,0.75)', warn: 'rgba(220,110,30,0.7)', bad: 'rgba(170,25,25,0.75)' }
  const getColor = (c) => {
    if (!improved) return c.val === '20+' || c.val >= 15 ? colors.bad : colors.warn
    return colors[c.type] || colors.bad
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 3, padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 12 }}>
      {cells.map((c, i) => (
        <div key={i} style={{
          aspectRatio: '1', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-display)',
          background: getColor(c), color: 'rgba(255,255,255,0.92)',
          transition: 'transform 0.15s',
          cursor: 'default',
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >{c.val}</div>
      ))}
    </div>
  )
}

export default function Reports() {
  const [view, setView] = useState('reports')

  return (
    <div>
      <div style={{ padding: '20px 36px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(6,6,18,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Reports</h1>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 4 }}>
            {['reports', 'heatmap'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '7px 18px', borderRadius: 7, border: 'none', cursor: 'pointer',
                background: view === v ? 'rgba(123,47,255,0.25)' : 'transparent',
                color: view === v ? 'var(--star-white)' : 'var(--dim)',
                fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: view === v ? 600 : 400,
                textTransform: 'capitalize', transition: 'all 0.2s',
              }}>{v === 'heatmap' ? 'Heatmap Audits' : 'Performance'}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, background: 'rgba(232,238,255,0.04)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 13, color: 'var(--dim)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>🏢</span> Authority Plumbing & Drain <span style={{ fontSize: 10 }}>▼</span>
            </span>
          </div>
          <button className="btn-primary" style={{ padding: '9px 20px', fontSize: 11 }}>+ Create Report</button>
          <button style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.04)', color: 'var(--dim)', cursor: 'pointer', fontSize: 14 }}>⬇</button>
        </div>
      </div>

      <div style={{ padding: '32px 36px' }}>
        {view === 'reports' ? (
          <>
            {/* Banner */}
            <div style={{ borderRadius: 16, padding: '20px 28px', background: 'linear-gradient(135deg, rgba(0,200,255,0.15), rgba(123,47,255,0.1))', border: '1px solid rgba(0,200,255,0.25)', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--nebula-blue)' }}>⏰ 30 days until your next ranking audit!</div>
              <div style={{ fontSize: 12, color: 'var(--dim)' }}>Heatmap will auto-generate on Apr 26, 2026</div>
            </div>

            {/* Lead Actions */}
            <div style={{ borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)', padding: '28px', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Lead Actions — Since Feb 24, 2026</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', gap: 2 }}>
                <div style={{ padding: '20px', background: 'rgba(123,47,255,0.08)', borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 900, color: 'var(--nebula-purple)', lineHeight: 1 }}>58</div>
                  <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 6 }}>Total actions</div>
                  <div style={{ fontSize: 12, color: 'rgba(20,200,100,0.9)', marginTop: 4 }}>Est. value $8,700</div>
                </div>
                {[
                  { icon: '📞', label: 'Lifetime calls', val: '2' },
                  { icon: '🗺️', label: 'Lifetime direction requests', val: '44' },
                  { icon: '🖱️', label: 'Lifetime website clicks', val: '12' },
                ].map((m, i) => (
                  <div key={i} style={{ padding: '20px 24px', borderRadius: 12, background: 'rgba(232,238,255,0.02)', border: '1px solid rgba(232,238,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 24 }}>{m.icon}</span>
                      <span style={{ fontSize: 13, color: 'var(--dim)' }}>{m.label}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900 }}>{m.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Competitor */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
              <div style={{ borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)', padding: '28px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Views on Google
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 400 }}>
                    <span style={{ color: 'var(--nebula-blue)', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--nebula-blue)', display: 'inline-block' }} />Google Search</span>
                    <span style={{ color: 'var(--nebula-purple)', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--nebula-purple)', display: 'inline-block' }} />Google Maps</span>
                  </div>
                </h2>
                {/* Mock chart bars */}
                <div style={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: 3, padding: '0 4px' }}>
                  {Array.from({ length: 30 }, (_, i) => {
                    const h1 = Math.random() * 80 + 5
                    const h2 = Math.random() * 50 + 5
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 2 }}>
                        <div style={{ height: `${h2}%`, background: 'rgba(123,47,255,0.5)', borderRadius: '2px 2px 0 0' }} />
                        <div style={{ height: `${h1}%`, background: 'rgba(0,200,255,0.5)', borderRadius: '2px 2px 0 0' }} />
                      </div>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--dim)' }}>Search views</span>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: 'var(--nebula-blue)' }}>61 <span style={{ fontSize: 13, color: 'rgba(20,200,100,0.8)', fontFamily: 'var(--font-body)', fontWeight: 400 }}>6100% ↑</span></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 11, color: 'var(--dim)' }}>Map views</span>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: 'var(--nebula-purple)' }}>24 <span style={{ fontSize: 13, color: 'rgba(20,200,100,0.8)', fontFamily: 'var(--font-body)', fontWeight: 400 }}>↑</span></div>
                  </div>
                </div>
              </div>

              <div style={{ borderRadius: 16, padding: '24px', background: 'linear-gradient(135deg, rgba(123,47,255,0.12), rgba(255,45,154,0.07))', border: '1px solid rgba(123,47,255,0.3)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, marginBottom: 16 }}>🎯 Top Competitor</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(232,238,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔧</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Hosack Plumbing, Heating & Cooling</div>
                    <div style={{ fontSize: 11, color: 'var(--dim)' }}>110 W Pitman St, O'Fallon, MO 63356</div>
                  </div>
                </div>
                <div style={{ color: 'var(--nebula-gold)', marginBottom: 6 }}>★★★★★</div>
                <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 16 }}>707 Google Reviews</div>
                <div style={{ padding: '14px', borderRadius: 10, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(232,238,255,0.08)' }}>
                  <div style={{ fontSize: 12, color: 'var(--dim)', lineHeight: 1.7 }}>
                    Est. <strong style={{ color: 'var(--star-white)' }}>4,200 people</strong> searching nearby each month, worth an estimated <strong style={{ color: 'var(--nebula-pink)' }}>$630,000/month.</strong>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* HEATMAP VIEW */
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Heatmap Audits</h2>
                <div style={{ fontSize: 13, color: 'var(--dim)' }}>Keyword: <span style={{ color: 'var(--nebula-blue)' }}>plumbing repair</span></div>
              </div>
              <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
                <span style={{ color: 'var(--dim)' }}>Baseline: <strong style={{ color: 'var(--star-white)' }}>19.5</strong></span>
                <span style={{ color: 'var(--dim)' }}>Latest: <strong style={{ color: 'var(--nebula-blue)' }}>5.37</strong></span>
                <span style={{ color: 'rgba(20,200,100,0.9)', fontWeight: 600 }}>Change: +478% 🔥</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {[
                { label: 'Baseline Audit — Feb 17 2026', sub: 'Average ranking: 19.01 • Top 3: 0%', improved: false },
                { label: 'Latest — Mar 26 2026', sub: 'Average ranking: 5.37 • Top 3: 4.73% • Improvement: 478% 🔥', improved: true },
              ].map((h, i) => (
                <div key={i} style={{ borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: `1px solid ${i === 1 ? 'rgba(0,200,255,0.2)' : 'var(--border)'}`, overflow: 'hidden' }}>
                  <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', background: i === 1 ? 'rgba(0,200,255,0.04)' : 'transparent' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{h.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--dim)' }}>{h.sub}</div>
                  </div>
                  <Heatmap improved={h.improved} />
                </div>
              ))}
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 16 }}>
              <span style={{ fontSize: 11, color: 'var(--dim)' }}>Rank legend:</span>
              {[{ bg: 'rgba(20,200,90,0.85)', label: '#1–3' }, { bg: 'rgba(70,190,70,0.75)', label: '#4–7' }, { bg: 'rgba(220,170,20,0.75)', label: '#8–12' }, { bg: 'rgba(220,110,30,0.7)', label: '#13–17' }, { bg: 'rgba(170,25,25,0.75)', label: '18+' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: l.bg }} />
                  <span style={{ fontSize: 11, color: 'var(--dim)' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
