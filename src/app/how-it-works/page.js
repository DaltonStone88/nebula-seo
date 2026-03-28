'use client'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Starfield from '../../components/Starfield'
import Footer from '../../components/Footer'

const steps = [
  {
    num: '01', title: 'Connect Your Business',
    desc: 'Link your Google Business Profile and website in under 60 seconds. No technical knowledge required — just connect your Google account and we handle everything else.',
    detail: ['One-click Google OAuth connection', 'Automatic profile data import', 'Keyword research initiated instantly', 'Competitor landscape scanned'],
    icon: '🔌',
  },
  {
    num: '02', title: 'AI Analyzes Everything',
    desc: 'Our AI engine runs a full audit of your local SEO presence — ranking positions, GBP completeness, citation consistency, review velocity, and content gaps.',
    detail: ['Local rank grid heatmap generated', 'Citation audit across 80+ directories', 'Review sentiment analysis', 'Competitor gap analysis'],
    icon: '🧠',
  },
  {
    num: '03', title: 'Automated Optimization',
    desc: 'NebulaSEO executes a comprehensive optimization strategy automatically. AI-generated GBP posts, citation building, review responses, and hyper-local content — all on autopilot.',
    detail: ['GBP posts published on schedule', 'Citations built and synced', 'Reviews responded to within hours', 'Local content pages created'],
    icon: '⚡',
  },
  {
    num: '04', title: 'Track & Report Results',
    desc: 'Watch your rankings climb in real time on the rank grid heatmap. Generate white-label PDF reports to show clients undeniable ROI with before/after ranking comparisons.',
    detail: ['Live rank grid heatmap updates', 'Before vs. after comparisons', 'White-label PDF reports', 'Lead action tracking (calls, clicks, directions)'],
    icon: '📈',
  },
]

const results = [
  { metric: '478%', label: 'Ranking Improvement', sub: 'Average for plumbing clients in 30 days', color: 'var(--nebula-blue)' },
  { metric: '6100%', label: 'Search View Increase', sub: 'Google Business Profile view growth', color: 'var(--nebula-purple)' },
  { metric: '44', label: 'Direction Requests', sub: 'Monthly avg. from local map pack', color: 'var(--nebula-pink)' },
  { metric: '3→#1', label: 'Pack Position', sub: 'From outside top 20 to #1 in 60 days', color: 'var(--nebula-gold)' },
]

export default function HowItWorks() {
  return (
    <>
      <Starfield opacity={0.6} />
      <Navbar />

      <main style={{ position: 'relative', zIndex: 1, paddingTop: 120 }}>
        {/* HERO */}
        <section style={{ textAlign: 'center', padding: '80px 60px 100px' }}>
          <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--nebula-blue)', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ width: 28, height: 1, background: 'var(--nebula-blue)', display: 'inline-block' }} />
            How It Works
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 72px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, animation: 'fadeUp 0.8s ease both' }}>
            From zero to <span style={{ background: 'linear-gradient(135deg, var(--nebula-blue), var(--nebula-purple), var(--nebula-pink))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>rank #1</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--dim)', fontWeight: 300, maxWidth: 580, margin: '0 auto', lineHeight: 1.7, animation: 'fadeUp 0.8s 0.15s ease both' }}>
            NebulaSEO automates your entire local SEO operation so you can focus on running your business — not chasing rankings.
          </p>
        </section>

        {/* STEPS */}
        <section style={{ padding: '0 60px 120px', maxWidth: 1100, margin: '0 auto' }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center',
              marginBottom: 100, direction: i % 2 === 1 ? 'rtl' : 'ltr',
            }}>
              <div style={{ direction: 'ltr' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', border: '1px solid rgba(123,47,255,0.5)', background: 'var(--deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--nebula-purple)', boxShadow: '0 0 20px rgba(123,47,255,0.2)', flexShrink: 0 }}>{step.num}</div>
                  <span style={{ fontSize: 32 }}>{step.icon}</span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, lineHeight: 1.2, marginBottom: 18 }}>{step.title}</h2>
                <p style={{ fontSize: 15, color: 'var(--dim)', lineHeight: 1.75, marginBottom: 28, fontWeight: 300 }}>{step.desc}</p>
                <ul style={{ listStyle: 'none' }}>
                  {step.detail.map((d, j) => (
                    <li key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid rgba(232,238,255,0.04)', fontSize: 13, color: 'rgba(232,238,255,0.7)' }}>
                      <span style={{ color: 'var(--nebula-blue)', marginTop: 1 }}>◆</span>{d}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ direction: 'ltr' }}>
                <div style={{
                  borderRadius: 24, border: '1px solid var(--border)',
                  background: 'rgba(232,238,255,0.02)',
                  padding: 40, minHeight: 280,
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                  position: 'relative', overflow: 'hidden',
                  boxShadow: 'inset 0 0 60px rgba(123,47,255,0.04)',
                }}>
                  <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at ${i % 2 === 0 ? '70% 30%' : '30% 70%'}, rgba(123,47,255,0.08), transparent 60%)` }} />
                  <div style={{ fontSize: 72, marginBottom: 20 }}>{step.icon}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 900, color: 'rgba(123,47,255,0.15)' }}>{step.num}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: 3, color: 'var(--dim)', textTransform: 'uppercase', marginTop: 8 }}>{step.title}</div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* RESULTS */}
        <section style={{ padding: '80px 60px 120px', background: 'linear-gradient(to bottom, transparent, rgba(123,47,255,0.04), transparent)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 70 }}>
              <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--nebula-blue)', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <span style={{ width: 28, height: 1, background: 'var(--nebula-blue)', display: 'inline-block' }} />
                Real Results
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700 }}>
                Numbers that <span style={{ background: 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-pink))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>speak for themselves</span>
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
              {results.map((r, i) => (
                <div key={i} style={{
                  padding: '36px 28px', borderRadius: 20, border: '1px solid var(--border)',
                  background: 'rgba(232,238,255,0.02)', textAlign: 'center',
                  transition: 'all 0.4s',
                }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 900, color: r.color, marginBottom: 10, filter: `drop-shadow(0 0 15px ${r.color})` }}>{r.metric}</div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{r.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--dim)', lineHeight: 1.5 }}>{r.sub}</div>
                </div>
              ))}
            </div>

            {/* Heatmap Visual */}
            <div style={{ marginTop: 60, borderRadius: 24, border: '1px solid var(--border)', overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>
              <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Rank Grid Heatmap</div>
                  <div style={{ fontSize: 12, color: 'var(--dim)' }}>Keyword: plumbing repair • O'Fallon, MO</div>
                </div>
                <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
                  <div><span style={{ color: 'var(--dim)', marginRight: 8 }}>Baseline Avg:</span><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>19.01</span></div>
                  <div><span style={{ color: 'var(--dim)', marginRight: 8 }}>Current Avg:</span><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--nebula-blue)' }}>5.37</span></div>
                  <div style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(0,200,255,0.1)', border: '1px solid rgba(0,200,255,0.3)', color: 'var(--nebula-blue)', fontSize: 12, fontWeight: 700 }}>+478% 🔥</div>
                </div>
              </div>
              <div style={{ padding: 32, display: 'flex', gap: 16 }}>
                {/* Baseline heatmap */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Before — Feb 2026</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                    {Array.from({ length: 49 }, (_, i) => {
                      const val = Math.random() > 0.15 ? '20+' : Math.floor(Math.random() * 6 + 14)
                      const isHigh = val === '20+' || (typeof val === 'number' && val >= 14)
                      return (
                        <div key={i} style={{
                          width: '100%', aspectRatio: '1', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-display)',
                          background: isHigh ? 'rgba(180,20,20,0.7)' : 'rgba(220,80,20,0.6)',
                          color: 'rgba(255,255,255,0.9)',
                        }}>{val}</div>
                      )
                    })}
                  </div>
                </div>
                <div style={{ width: 1, background: 'var(--border)' }} />
                {/* Improved heatmap */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--nebula-blue)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>After — Mar 2026</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                    {Array.from({ length: 49 }, (_, i) => {
                      const r = Math.random()
                      let val, bg
                      if (r < 0.12) { val = Math.floor(Math.random() * 3 + 1); bg = 'rgba(20,160,80,0.8)' }
                      else if (r < 0.28) { val = Math.floor(Math.random() * 4 + 4); bg = 'rgba(60,180,60,0.7)' }
                      else if (r < 0.5) { val = Math.floor(Math.random() * 5 + 8); bg = 'rgba(200,160,20,0.7)' }
                      else if (r < 0.72) { val = Math.floor(Math.random() * 4 + 13); bg = 'rgba(220,100,20,0.65)' }
                      else { val = '20+'; bg = 'rgba(160,20,20,0.6)' }
                      return (
                        <div key={i} style={{
                          width: '100%', aspectRatio: '1', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-display)',
                          background: bg, color: 'rgba(255,255,255,0.9)',
                        }}>{val}</div>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div style={{ padding: '16px 32px', borderTop: '1px solid var(--border)', display: 'flex', gap: 20, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--dim)', marginRight: 4 }}>Rank Legend:</span>
                {[{ bg: 'rgba(20,160,80,0.8)', label: '#1–3' }, { bg: 'rgba(60,180,60,0.7)', label: '#4–7' }, { bg: 'rgba(200,160,20,0.7)', label: '#8–12' }, { bg: 'rgba(220,100,20,0.65)', label: '#13–17' }, { bg: 'rgba(160,20,20,0.6)', label: '18+' }].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 14, height: 14, borderRadius: 3, background: l.bg }} />
                    <span style={{ fontSize: 11, color: 'var(--dim)' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '100px 60px 140px', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', width: 600, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(123,47,255,0.12), transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 56px)', fontWeight: 900, marginBottom: 22 }}>
            Ready to <span style={{ background: 'linear-gradient(135deg, var(--nebula-blue), var(--nebula-purple), var(--nebula-pink))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>start climbing?</span>
          </h2>
          <p style={{ fontSize: 17, color: 'var(--dim)', marginBottom: 44, fontWeight: 300 }}>No contracts. No fluff. Just rankings.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link href="/login?signup=true" className="btn-primary" style={{ fontSize: 13, padding: '16px 44px' }}>🚀 Start Free Trial</Link>
            <Link href="/pricing" className="btn-ghost">View Pricing →</Link>
          </div>
        </section>
      </main>

      <Footer />
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </>
  )
}
