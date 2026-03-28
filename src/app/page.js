'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Starfield from '../components/Starfield'
import Footer from '../components/Footer'

const features = [
  { icon: '🤖', num: '01', name: 'AI SEO Agent', desc: 'Your always-on co-pilot that monitors, optimizes, and reports on your local presence 24/7 without lifting a finger.' },
  { icon: '📍', num: '02', name: 'GBP Autopilot', desc: 'Auto-generate posts, respond to Q&As, update business info, and keep your Google Business Profile perfectly dialed in.' },
  { icon: '✍️', num: '03', name: 'Hyper-Local Content', desc: 'AI-generated blog posts, service pages, and location content targeting the exact keywords for your city and niche.' },
  { icon: '⭐', num: '04', name: 'Review Intelligence', desc: 'Automatically respond to reviews with personalized, brand-consistent replies. Boost star ratings on autopilot.' },
  { icon: '📊', num: '05', name: 'Rank Grid Tracker', desc: 'Visualize exactly where you rank across your city with a heatmap-style local rank tracker updated in real time.' },
  { icon: '🔗', num: '06', name: 'Citation Builder', desc: 'Automatically build and sync your listings across 80+ directories for bulletproof NAP consistency.' },
]

const testimonials = [
  { text: '"NebulaSEO completely replaced our manual SEO workflow. Clients see ranking jumps within 30 days. An absolute agency game-changer."', name: 'Jason Miller', role: 'Founder, Apex Digital Agency', initials: 'JM' },
  { text: '"The AI GBP posts alone are worth the price. Publishing 4x more content for clients with zero extra labor. Margins have never been better."', name: 'Sarah Rodriguez', role: 'CEO, LocalRank Pro', initials: 'SR' },
  { text: '"Switched from another platform and saw measurable ranking improvements in weeks. White-label reports look stunning — clients think we have a team of 10."', name: 'Tyler Kim', role: 'Director, Vortex Marketing', initials: 'TK' },
]

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target) } })
    }, { threshold: 0.1 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

export default function Home() {
  useReveal()

  return (
    <>
      <Starfield />
      <Navbar />

      <style>{`
        .reveal { opacity: 0; transform: translateY(35px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .reveal.revealed { opacity: 1; transform: translateY(0); }
        .delay1 { transition-delay: 0.1s; }
        .delay2 { transition-delay: 0.2s; }
        .delay3 { transition-delay: 0.3s; }
        .delay4 { transition-delay: 0.4s; }
        .feat-card:hover .feat-icon { transform: scale(1.12); filter: drop-shadow(0 0 16px var(--nebula-purple)); }
        .feat-card:hover { background: rgba(232,238,255,0.04) !important; border-color: var(--border-purple) !important; }
        .feat-card:hover::before { opacity: 1 !important; }
        .testi-card:hover { transform: translateY(-5px); border-color: rgba(0,200,255,0.2) !important; background: rgba(0,200,255,0.03) !important; }
      `}</style>

      {/* HERO */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '120px 60px 80px', position: 'relative', overflow: 'hidden', zIndex: 1,
      }}>
        {/* Orbs */}
        {[
          { w: 500, bg: 'rgba(123,47,255,0.2)', top: '-120px', left: '-120px', delay: '0s' },
          { w: 400, bg: 'rgba(255,45,154,0.15)', bottom: '-80px', right: '-80px', delay: '3s' },
          { w: 300, bg: 'rgba(0,200,255,0.12)', top: '35%', left: '58%', delay: '1.5s' },
        ].map((o, i) => (
          <div key={i} style={{
            position: 'absolute', width: o.w, height: o.w, borderRadius: '50%',
            background: `radial-gradient(circle, ${o.bg}, transparent 70%)`,
            filter: 'blur(60px)', pointerEvents: 'none',
            top: o.top, bottom: o.bottom, left: o.left, right: o.right,
            animation: `drift 8s ${o.delay} ease-in-out infinite`,
          }} />
        ))}

        {/* Planet */}
        <div style={{
          position: 'absolute', right: '-180px', top: '50%', transform: 'translateY(-50%)',
          width: 560, height: 560, borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, #1a0a3a, #05021a)',
          boxShadow: 'inset -60px -30px 60px rgba(123,47,255,0.4), inset 30px 30px 60px rgba(0,200,255,0.08), 0 0 100px rgba(123,47,255,0.25)',
          animation: 'drift 10s ease-in-out infinite', opacity: 0.55,
          pointerEvents: 'none',
        }} />

        <div style={{ animation: 'fadeUp 0.8s ease both', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 20px', border: '1px solid rgba(0,200,255,0.3)', borderRadius: 30, background: 'rgba(0,200,255,0.05)', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--nebula-blue)', marginBottom: 40 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--nebula-blue)', boxShadow: '0 0 10px var(--nebula-blue)', animation: 'pulse 1.5s ease-in-out infinite', display: 'inline-block' }} />
          AI-Powered Local SEO Platform
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(52px, 8vw, 108px)', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-2px', marginBottom: 32, animation: 'fadeUp 0.8s 0.15s ease both' }}>
          <span style={{ display: 'block' }}>DOMINATE</span>
          <span className="gradient-text" style={{ display: 'block', filter: 'drop-shadow(0 0 30px rgba(123,47,255,0.4))' }}>EVERY SEARCH</span>
        </h1>

        <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--dim)', maxWidth: 600, lineHeight: 1.7, fontWeight: 300, marginBottom: 52, animation: 'fadeUp 0.8s 0.3s ease both' }}>
          NebulaSEO is your AI-powered local SEO co-pilot. Automate your Google Business Profile, generate hyper-local content, and outrank competitors — across the galaxy.
        </p>

        <div style={{ display: 'flex', gap: 20, alignItems: 'center', animation: 'fadeUp 0.8s 0.45s ease both' }}>
          <Link href="/login?signup=true" className="btn-primary" style={{ fontSize: 13, padding: '16px 44px' }}>🚀 Launch Your Rankings</Link>
          <Link href="/how-it-works" className="btn-ghost" style={{ padding: '16px 36px' }}>See How It Works →</Link>
        </div>

        <div style={{ position: 'absolute', bottom: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--dim2)', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', animation: 'fadeUp 1s 1s ease both' }}>
          <div style={{ width: 1, height: 50, background: 'linear-gradient(to bottom, var(--nebula-blue), transparent)', animation: 'pulse 2s ease-in-out infinite' }} />
          Explore
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ padding: '28px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', overflow: 'hidden', background: 'rgba(123,47,255,0.02)', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', animation: 'marquee 28s linear infinite', width: 'max-content' }}>
          {[...Array(2)].map((_, rep) =>
            ['Google Business Optimization', 'AI Content Generation', 'Review Management', 'Citation Building', 'Rank Tracking', 'Competitor Analysis', 'Local Link Building', 'Schema Markup'].map((item, i) => (
              <div key={`${rep}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '0 50px', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(232,238,255,0.25)', whiteSpace: 'nowrap' }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--nebula-purple)', boxShadow: '0 0 8px var(--nebula-purple)', display: 'inline-block' }} />
                {item}
              </div>
            ))
          )}
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid var(--border)', position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto' }}>
        {[
          { num: '50K+', label: 'Businesses Served' },
          { num: '340%', label: 'Avg. Ranking Increase' },
          { num: '98%', label: 'Client Retention' },
          { num: '24hrs', label: 'Saved Per Month' },
        ].map((s, i) => (
          <div key={i} className="reveal" style={{ padding: '48px 30px', textAlign: 'center', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 900, background: 'linear-gradient(135deg, var(--nebula-blue), var(--nebula-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 8 }}>{s.num}</div>
            <div style={{ fontSize: 11, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <section id="features" style={{ padding: '130px 60px', maxWidth: 1380, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="reveal" style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--nebula-blue)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 28, height: 1, background: 'var(--nebula-blue)', boxShadow: '0 0 6px var(--nebula-blue)', display: 'inline-block' }} />
          Core Features
        </div>
        <h2 className="reveal" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 70, maxWidth: 580 }}>
          Everything you need to <span className="gradient-text">conquer local search</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {features.map((f, i) => (
            <div key={i} className={`reveal feat-card delay${(i % 3) + 1}`} style={{
              padding: '44px 38px', background: 'rgba(232,238,255,0.02)',
              border: '1px solid var(--border)', position: 'relative', overflow: 'hidden',
              transition: 'all 0.4s', cursor: 'default',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(to right, transparent, var(--nebula-purple), transparent)', opacity: 0, transition: 'opacity 0.4s' }} className="feat-top-line" />
              <div className="feat-icon" style={{ fontSize: 34, marginBottom: 24, display: 'block', transition: 'all 0.4s' }}>{f.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>{f.name}</div>
              <p style={{ fontSize: 13, color: 'var(--dim)', lineHeight: 1.7, fontWeight: 300 }}>{f.desc}</p>
              <div style={{ position: 'absolute', bottom: 16, right: 20, fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 900, color: 'rgba(123,47,255,0.05)', lineHeight: 1 }}>{f.num}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS TEASER */}
      <section style={{ padding: '100px 60px', background: 'linear-gradient(to bottom, transparent, rgba(123,47,255,0.04), transparent)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div className="reveal" style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--nebula-blue)', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ width: 28, height: 1, background: 'var(--nebula-blue)', display: 'inline-block' }} />
            Process
          </div>
          <h2 className="reveal" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 70 }}>
            Up and running in <span className="gradient-text">four steps</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 27, left: '12.5%', width: '75%', height: 1, background: 'linear-gradient(to right, var(--nebula-purple), var(--nebula-pink), var(--nebula-blue))', opacity: 0.25 }} />
            {[
              { n: '01', t: 'Connect', d: 'Link your Google Business Profile and website in seconds.' },
              { n: '02', t: 'Analyze', d: 'Our AI scans your entire local SEO footprint and finds every gap.' },
              { n: '03', t: 'Optimize', d: 'NebulaSEO executes your full strategy automatically.' },
              { n: '04', t: 'Dominate', d: 'Watch rankings climb. Get white-label reports showing undeniable ROI.' },
            ].map((s, i) => (
              <div key={i} className={`reveal delay${i + 1}`} style={{ padding: '0 24px', textAlign: 'left' }}>
                <div style={{ width: 54, height: 54, borderRadius: '50%', border: '1px solid rgba(123,47,255,0.5)', background: 'var(--deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--nebula-purple)', marginBottom: 28, position: 'relative', zIndex: 1, boxShadow: '0 0 20px rgba(123,47,255,0.2)' }}>{s.n}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{s.t}</div>
                <p style={{ fontSize: 13, color: 'var(--dim)', lineHeight: 1.7, fontWeight: 300 }}>{s.d}</p>
              </div>
            ))}
          </div>
          <div className="reveal" style={{ marginTop: 60 }}>
            <Link href="/how-it-works" className="btn-ghost">See Full Results & Case Studies →</Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '120px 60px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="reveal" style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--nebula-blue)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 28, height: 1, background: 'var(--nebula-blue)', display: 'inline-block' }} />
            Testimonials
          </div>
          <h2 className="reveal" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, marginBottom: 70, maxWidth: 560 }}>
            Agencies already <span className="gradient-text">in orbit</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {testimonials.map((t, i) => (
              <div key={i} className={`reveal testi-card delay${i + 1}`} style={{
                padding: '36px', borderRadius: 20, border: '1px solid var(--border)',
                background: 'rgba(232,238,255,0.02)', transition: 'all 0.4s',
              }}>
                <div style={{ color: 'var(--nebula-gold)', fontSize: 14, marginBottom: 18, letterSpacing: 2 }}>★★★★★</div>
                <p style={{ fontSize: 14, color: 'rgba(232,238,255,0.75)', lineHeight: 1.75, marginBottom: 26, fontStyle: 'italic' }}>{t.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{t.initials}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--dim)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '140px 60px', textAlign: 'center', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 700, height: 350, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(123,47,255,0.14), transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', animation: 'drift 6s ease-in-out infinite' }} />
        <h2 className="reveal" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 68px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 22 }}>
          Ready to <span className="gradient-text" style={{ filter: 'drop-shadow(0 0 20px rgba(123,47,255,0.4))' }}>launch?</span>
        </h2>
        <p className="reveal delay1" style={{ fontSize: 18, color: 'var(--dim)', marginBottom: 52, fontWeight: 300 }}>
          Join thousands of agencies already dominating local search.
        </p>
        <div className="reveal delay2">
          <Link href="/login?signup=true" className="btn-primary" style={{ fontSize: 14, padding: '18px 52px' }}>🚀 Start Your Free Trial</Link>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes drift { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-16px); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </>
  )
}
