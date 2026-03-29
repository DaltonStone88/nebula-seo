'use client'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import Starfield from '../../../components/Starfield'
import Footer from '../../../components/Footer'

export default function ComparisonPage({ competitor, tagline, intro, rows, verdict, ourWins, theirWins }) {
  return (
    <>
      <Starfield />
      <Navbar />
      <style>{`
        .comp-row:hover { background: rgba(232,238,255,0.02) !important; }
        .comp-row:nth-child(odd) { background: rgba(232,238,255,0.01); }
      `}</style>

      {/* Hero */}
      <section style={{ padding: '160px 60px 80px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--nebula-purple)', marginBottom: 16 }}>Comparison</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4.5vw, 56px)', fontWeight: 900, lineHeight: 1.08, marginBottom: 20 }}>
            NebulaSEO vs {competitor}
          </h1>
          <p style={{ fontSize: 16, color: 'var(--dim)', lineHeight: 1.75, marginBottom: 48, maxWidth: 600, margin: '0 auto 48px' }}>
            {tagline}
          </p>

          {/* VS badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, marginBottom: 60 }}>
            <div style={{ padding: '16px 32px', borderRadius: 14, background: 'linear-gradient(135deg, rgba(123,47,255,0.2), rgba(0,200,255,0.1))', border: '1px solid rgba(123,47,255,0.4)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, background: 'linear-gradient(135deg, var(--nebula-blue), var(--nebula-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NEBULASEO</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--dim)', fontWeight: 700 }}>VS</div>
            <div style={{ padding: '16px 32px', borderRadius: 14, background: 'rgba(232,238,255,0.04)', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, color: 'var(--dim)' }}>{competitor.toUpperCase()}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section style={{ padding: '0 60px 60px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <p style={{ fontSize: 15, color: 'var(--dim)', lineHeight: 1.85 }}>{intro}</p>
        </div>
      </section>

      {/* Quick wins summary */}
      <section style={{ padding: '0 60px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ padding: '28px', borderRadius: 16, background: 'rgba(0,200,255,0.05)', border: '1px solid rgba(0,200,255,0.2)' }}>
            <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--nebula-blue)', marginBottom: 16, fontWeight: 600 }}>NebulaSEO is better for</div>
            {ourWins.map((w, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'rgba(232,238,255,0.8)', marginBottom: 10, lineHeight: 1.5 }}>
                <span style={{ color: 'var(--nebula-blue)', flexShrink: 0 }}>✓</span> {w}
              </div>
            ))}
          </div>
          <div style={{ padding: '28px', borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 16, fontWeight: 600 }}>{competitor} is better for</div>
            {theirWins.map((w, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--dim)', marginBottom: 10, lineHeight: 1.5 }}>
                <span style={{ color: 'var(--dim2)', flexShrink: 0 }}>→</span> {w}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature comparison table */}
      <section style={{ padding: '0 60px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900, marginBottom: 32, textAlign: 'center' }}>Feature-by-Feature Comparison</h2>

          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 0, borderRadius: '12px 12px 0 0', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ padding: '14px 20px', background: 'rgba(6,6,18,0.8)', fontSize: 12, color: 'var(--dim2)', letterSpacing: 1 }}>FEATURE</div>
            <div style={{ padding: '14px 20px', background: 'rgba(123,47,255,0.15)', fontSize: 12, fontWeight: 700, textAlign: 'center', color: 'var(--nebula-blue)', letterSpacing: 1 }}>NEBULASEO</div>
            <div style={{ padding: '14px 20px', background: 'rgba(6,6,18,0.6)', fontSize: 12, color: 'var(--dim2)', textAlign: 'center', letterSpacing: 1 }}>{competitor.toUpperCase()}</div>
          </div>

          {rows.map((row, i) => (
            <div key={i} className="comp-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 0, border: '1px solid var(--border)', borderTop: 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(232,238,255,0.01)' }}>
              <div style={{ padding: '14px 20px', fontSize: 13, color: 'var(--dim)', borderRight: '1px solid var(--border)' }}>{row.feature}</div>
              <div style={{ padding: '14px 20px', textAlign: 'center', borderRight: '1px solid var(--border)', fontSize: row.us.startsWith('✓') ? 14 : 13, color: row.us.startsWith('✓') ? 'rgba(20,200,100,0.9)' : row.us.startsWith('✗') ? 'rgba(255,80,80,0.7)' : 'var(--star-white)' }}>
                {row.us}
              </div>
              <div style={{ padding: '14px 20px', textAlign: 'center', fontSize: row.them.startsWith('✓') ? 14 : 13, color: row.them.startsWith('✓') ? 'rgba(20,200,100,0.7)' : row.them.startsWith('✗') ? 'rgba(255,80,80,0.5)' : 'var(--dim)' }}>
                {row.them}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Verdict */}
      <section style={{ padding: '0 60px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900, marginBottom: 24 }}>Our Verdict</h2>
          <p style={{ fontSize: 15, color: 'var(--dim)', lineHeight: 1.85, marginBottom: 40 }}>{verdict}</p>

          <div style={{ padding: '36px', borderRadius: 18, background: 'linear-gradient(135deg, rgba(123,47,255,0.12), rgba(0,200,255,0.06))', border: '1px solid rgba(123,47,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Ready to try NebulaSEO?</div>
              <div style={{ fontSize: 13, color: 'var(--dim)' }}>3-day trial for $1. First audit starts in minutes.</div>
            </div>
            <Link href="/login?signup=true" className="btn-primary" style={{ padding: '14px 36px', fontSize: 12, flexShrink: 0 }}>
              Start $1 Trial →
            </Link>
          </div>
        </div>
      </section>

      {/* Other comparisons */}
      <section style={{ padding: '0 60px 100px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 16 }}>Other comparisons</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {['Paige', 'LocalViking', 'BrightLocal', 'Yext'].filter(c => c !== competitor).map(c => (
              <Link key={c} href={`/compare/nebulaseo-vs-${c.toLowerCase().replace(' ', '')}`} style={{ padding: '8px 20px', borderRadius: 20, border: '1px solid var(--border)', fontSize: 13, color: 'var(--dim)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(123,47,255,0.4)'; e.currentTarget.style.color = 'var(--star-white)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--dim)' }}>
                NebulaSEO vs {c} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
