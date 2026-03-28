'use client'
import Link from 'next/link'

const automations = [
  { biz: 'Advanced Wildlife Control LLC', action: 'Published a post to Google Business Profile', time: '21 hours ago', type: 'post' },
  { biz: 'Authority Plumbing & Drain', action: 'Sent report', time: '23 hours ago', type: 'report' },
  { biz: 'Authority Plumbing & Drain', action: 'Published a post to Google Business Profile', time: '23 hours ago', type: 'post' },
  { biz: 'Advanced Wildlife Control LLC', action: 'Published a post to Google Business Profile', time: '2 days ago', type: 'post' },
  { biz: 'Advanced Wildlife Control LLC', action: 'Published a post to Google Business Profile', time: '3 days ago', type: 'post' },
  { biz: 'Authority Plumbing & Drain', action: 'Published a post to Google Business Profile', time: '5 days ago', type: 'post' },
  { biz: 'Advanced Wildlife Control LLC', action: 'FAQs generated', time: '6 days ago', type: 'content' },
  { biz: 'Advanced Wildlife Control LLC', action: 'FAQs generated', time: '6 days ago', type: 'content' },
]

const typeIcon = { post: '📝', report: '📊', content: '✍️', review: '⭐' }
const typeColor = { post: 'rgba(0,200,255,0.15)', report: 'rgba(123,47,255,0.15)', content: 'rgba(255,184,48,0.15)', review: 'rgba(255,45,154,0.15)' }

export default function Dashboard() {
  const half = Math.ceil(automations.length / 2)
  const col1 = automations.slice(0, half)
  const col2 = automations.slice(half)

  return (
    <div style={{ padding: '0' }}>
      {/* Top bar */}
      <div style={{ padding: '20px 36px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(6,6,18,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--dim)' }}>Overview for:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, background: 'rgba(232,238,255,0.05)', border: '1px solid var(--border)', cursor: 'pointer' }}>
            <span style={{ fontSize: 14 }}>🌐</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>All Businesses</span>
            <span style={{ color: 'var(--dim)', fontSize: 10 }}>▼</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--nebula-pink)', position: 'absolute', top: -2, right: -2, boxShadow: '0 0 6px var(--nebula-pink)' }} />
            <button style={{ background: 'rgba(232,238,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', color: 'var(--dim)', cursor: 'pointer', fontSize: 16 }}>🔔</button>
          </div>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-pink))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', cursor: 'pointer' }}>DS</div>
        </div>
      </div>

      <div style={{ padding: '32px 36px' }}>
        {/* Hero Banner */}
        <div style={{
          borderRadius: 20, padding: '28px 36px',
          background: 'linear-gradient(135deg, rgba(123,47,255,0.2), rgba(255,45,154,0.15), rgba(0,200,255,0.1))',
          border: '1px solid rgba(123,47,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 32, overflow: 'hidden', position: 'relative',
          boxShadow: '0 0 60px rgba(123,47,255,0.1)',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(123,47,255,0.05), transparent)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 13, color: 'rgba(232,238,255,0.6)', marginBottom: 4 }}>Relax, Dalton Stone —</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>We've got it covered! 🚀</div>
          </div>
          <div style={{ display: 'flex', gap: 24, position: 'relative' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: 'var(--nebula-blue)' }}>12</div>
              <div style={{ fontSize: 11, color: 'var(--dim)', letterSpacing: 1 }}>TASKS TODAY</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: 'var(--nebula-pink)' }}>2</div>
              <div style={{ fontSize: 11, color: 'var(--dim)', letterSpacing: 1 }}>BUSINESSES</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: 'var(--nebula-purple)' }}>98%</div>
              <div style={{ fontSize: 11, color: 'var(--dim)', letterSpacing: 1 }}>HEALTH SCORE</div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Lead Actions', val: '58', sub: 'Est. value $8,700', icon: '💰', color: 'var(--nebula-blue)' },
            { label: 'Lifetime Calls', val: '2', sub: 'Since Feb 24, 2026', icon: '📞', color: 'var(--nebula-purple)' },
            { label: 'Direction Requests', val: '44', sub: 'Lifetime total', icon: '🗺️', color: 'var(--nebula-pink)' },
            { label: 'Website Clicks', val: '12', sub: 'Lifetime total', icon: '🖱️', color: 'var(--nebula-gold)' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '24px', borderRadius: 16, background: 'rgba(232,238,255,0.03)', border: '1px solid var(--border)', transition: 'all 0.3s' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--dim)' }}>{s.label}</span>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, color: s.color, filter: `drop-shadow(0 0 10px ${s.color})` }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
          {/* Recent Automations */}
          <div style={{ borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700 }}>Recent Automations</h2>
              <Link href="/dashboard/automation" style={{ fontSize: 12, color: 'var(--nebula-blue)' }}>View all →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              {[col1, col2].map((col, ci) => (
                <div key={ci} style={{ borderRight: ci === 0 ? '1px solid var(--border)' : 'none' }}>
                  {col.map((a, i) => (
                    <div key={i} style={{ padding: '16px 24px', borderBottom: '1px solid rgba(232,238,255,0.04)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: typeColor[a.type], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{typeIcon[a.type]}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2, lineHeight: 1.4 }}>
                          <span style={{ color: 'var(--dim)' }}>{a.action} to </span>
                          <span style={{ color: 'var(--nebula-blue)', fontSize: 12, fontWeight: 600 }}>{a.biz}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'rgba(20,200,100,0.2)', border: '1px solid rgba(20,200,100,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>✓</div>
                          <span style={{ fontSize: 11, color: 'var(--dim2)' }}>{a.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar widgets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Top Competitor */}
            <div style={{ borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)', padding: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, marginBottom: 16 }}>🎯 Top Competitor</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(232,238,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔧</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Hosack Plumbing, Heating & Cooling</div>
                  <div style={{ fontSize: 11, color: 'var(--dim)' }}>110 W Pitman St, O'Fallon, MO</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>{'★★★★★'.split('').map((s, i) => <span key={i} style={{ color: 'var(--nebula-gold)' }}>{s}</span>)}</div>
              <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 14 }}>707 Google Reviews</div>
              <div style={{ padding: '14px', borderRadius: 10, background: 'rgba(123,47,255,0.1)', border: '1px solid rgba(123,47,255,0.25)' }}>
                <div style={{ fontSize: 12, color: 'var(--dim)', lineHeight: 1.6 }}>
                  Est. <strong style={{ color: 'var(--star-white)' }}>4,200 people</strong> searching for this type of business near you each month worth an est. <strong style={{ color: 'var(--nebula-blue)' }}>$630,000/month.</strong>
                </div>
              </div>
            </div>

            {/* My Tasks */}
            <div style={{ borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)', padding: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, marginBottom: 16 }}>📋 My Tasks</h3>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 13, color: 'var(--dim)', fontWeight: 300 }}>You don't have any tasks to do!</div>
                <div style={{ fontSize: 11, color: 'var(--dim2)', marginTop: 4 }}>NebulaSEO has everything covered.</div>
              </div>
            </div>

            {/* Next Audit */}
            <div style={{ borderRadius: 16, padding: '20px', background: 'linear-gradient(135deg, rgba(0,200,255,0.1), rgba(123,47,255,0.08))', border: '1px solid rgba(0,200,255,0.2)' }}>
              <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--nebula-blue)', marginBottom: 8 }}>Next Ranking Audit</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: 'var(--nebula-blue)' }}>30 <span style={{ fontSize: 14, fontWeight: 400 }}>days</span></div>
              <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 4 }}>Heatmap comparison will be generated automatically</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
