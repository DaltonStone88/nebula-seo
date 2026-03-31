'use client'

const citations = [
  { name: 'Google Business Profile', status: 'synced', score: 100, icon: '🔍' },
  { name: 'Yelp', status: 'synced', score: 95, icon: '⭐' },
  { name: 'Facebook', status: 'synced', score: 90, icon: '📘' },
  { name: 'Apple Maps', status: 'pending', score: 0, icon: '🍎' },
  { name: 'Bing Places', status: 'synced', score: 85, icon: '🔷' },
  { name: 'Yellow Pages', status: 'synced', score: 80, icon: '📒' },
  { name: 'Angi (Angie\'s List)', status: 'pending', score: 0, icon: '🏠' },
  { name: 'BBB', status: 'synced', score: 88, icon: '✅' },
  { name: 'Foursquare', status: 'synced', score: 78, icon: '📍' },
  { name: 'Nextdoor', status: 'pending', score: 0, icon: '🏘️' },
  { name: 'Thumbtack', status: 'synced', score: 82, icon: '📌' },
  { name: 'HomeAdvisor', status: 'building', score: 0, icon: '🔨' },
]

export default function Citations() {
  const synced = citations.filter(c => c.status === 'synced').length

  return (
    <div>
      <div style={{ padding: '22px 36px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(6,6,18,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50, minHeight: 76 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Citations</h1>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--nebula-blue)' }}>{synced} / {citations.length} directories synced</div>
      </div>

      <div style={{ padding: '32px 36px' }}>
        {/* Progress */}
        <div style={{ borderRadius: 16, padding: '24px 28px', background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 28 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Citation Coverage</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--nebula-blue)' }}>{Math.round(synced / citations.length * 100)}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'rgba(232,238,255,0.08)' }}>
              <div style={{ height: '100%', borderRadius: 4, width: `${synced / citations.length * 100}%`, background: 'linear-gradient(to right, var(--nebula-blue), var(--nebula-purple))', boxShadow: '0 0 10px rgba(123,47,255,0.4)', transition: 'width 1s ease' }} />
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, color: 'var(--nebula-blue)' }}>{synced}</div>
            <div style={{ fontSize: 11, color: 'var(--dim)' }}>SYNCED</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, color: 'var(--nebula-gold)' }}>{citations.filter(c => c.status !== 'synced').length}</div>
            <div style={{ fontSize: 11, color: 'var(--dim)' }}>PENDING</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {citations.map((c, i) => (
            <div key={i} style={{ borderRadius: 14, background: 'rgba(232,238,255,0.02)', border: `1px solid ${c.status === 'synced' ? 'rgba(20,200,100,0.15)' : c.status === 'building' ? 'rgba(255,184,48,0.15)' : 'var(--border)'}`, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 24 }}>{c.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{c.name}</div>
                {c.score > 0 && (
                  <div style={{ height: 4, borderRadius: 2, background: 'rgba(232,238,255,0.08)', width: 80 }}>
                    <div style={{ height: '100%', borderRadius: 2, width: `${c.score}%`, background: 'rgba(20,200,100,0.6)' }} />
                  </div>
                )}
              </div>
              <div style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
                background: c.status === 'synced' ? 'rgba(20,200,100,0.1)' : c.status === 'building' ? 'rgba(255,184,48,0.1)' : 'rgba(232,238,255,0.05)',
                border: `1px solid ${c.status === 'synced' ? 'rgba(20,200,100,0.3)' : c.status === 'building' ? 'rgba(255,184,48,0.3)' : 'var(--border)'}`,
                color: c.status === 'synced' ? 'rgba(20,200,100,0.9)' : c.status === 'building' ? 'rgba(255,184,48,0.9)' : 'var(--dim)',
              }}>{c.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
