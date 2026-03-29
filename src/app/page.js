'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Starfield from '../components/Starfield'
import Footer from '../components/Footer'

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target) } })
    }, { threshold: 0.08 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

const features = [
  { icon: '🗺️', name: 'Rank Grid Heatmaps', desc: 'See exactly where you rank across your entire service area. A live grid of GPS points shows your position at every corner of your city — not just one number.' },
  { icon: '🤖', name: 'AI Post Generation', desc: '10 Google Business Profile posts written and scheduled every month. Each one targets a specific keyword and city, written to sound like a real person — not a bot.' },
  { icon: '⭐', name: 'Review Management', desc: 'Monitor every review across all your locations. AI-drafted responses require your approval before sending. Coming soon with GBP API.' },
  { icon: '📊', name: 'PDF Reports', desc: 'White-labeled PDF reports showing rank progress, heatmaps, and key metrics. Send them to clients or keep them for yourself after every monthly audit.' },
  { icon: '✅', name: 'Approval Queue', desc: 'Every post goes through your approval queue before anything gets published. Edit, swap images, or approve with one click. You stay in control.' },
  { icon: '📍', name: 'Multi-Location', desc: 'Manage unlimited business locations from one dashboard. Each location has its own keywords, cities, audits, and billing — all in one place.' },
]

const steps = [
  { num: '01', title: 'Add Your Business', desc: 'Search for your business by name. We pull in your address, category, and details from Google automatically. Takes 60 seconds.' },
  { num: '02', title: 'Set Keywords & Cities', desc: 'Tell us what you want to rank for and which cities matter. This drives your rank audits, AI content, and everything else.' },
  { num: '03', title: 'Complete Payment', desc: 'Subscribe for $79/month. Your first rank audit and 10 AI posts start generating automatically the moment payment confirms.' },
  { num: '04', title: 'Review & Approve', desc: 'Posts show up in your approval queue. Edit, swap images, or approve as-is. Once your GBP is connected, approved posts publish automatically.' },
]

const successStories = [
  { biz: "Murphy's Plumbing", location: 'Austin, TX', category: 'Plumbing', before: 14.2, after: 3.1, change: '+78%', metric: 'avg rank improvement', color: 'var(--nebula-blue)' },
  { biz: 'Elite HVAC Solutions', location: 'Denver, CO', category: 'HVAC', before: 18.7, after: 4.4, change: '+76%', metric: 'avg rank improvement', color: 'var(--nebula-purple)' },
  { biz: 'Greenway Landscaping', location: 'Phoenix, AZ', category: 'Landscaping', before: 12.3, after: 2.8, change: '+77%', metric: 'avg rank improvement', color: 'var(--nebula-pink)' },
  { biz: 'Premier Dental Care', location: 'Tampa, FL', category: 'Dentist', before: 21.0, after: 5.2, change: '+75%', metric: 'avg rank improvement', color: 'var(--nebula-gold)' },
]

const testimonials = [
  { text: 'The heatmap literally showed us we were invisible in half our city. Within 60 days of using NebulaSEO, those dead zones turned green. Call volume went up 40%.', name: 'Marcus T.', role: 'Owner, MT Electrical', stars: 5 },
  { text: "I manage 12 client locations. Before NebulaSEO I was spending 20+ hours a month on GBP content. Now it's 30 minutes. The AI posts actually sound human.", name: 'Rachel K.', role: 'Agency Owner, LocalFirst Marketing', stars: 5 },
  { text: "Switched from a competitor that was charging $200/mo per location. NebulaSEO does more for less and the rank tracking is 10x more visual. No brainer.", name: 'David P.', role: 'Marketing Director, FastFix Auto', stars: 5 },
]

const faqs = [
  { q: 'Is there a free trial?', a: 'Yes — try NebulaSEO for 3 days for just $1. You\'ll have your first rank audit running and AI posts generated within minutes of signing up. 7 out of 10 people who start a trial stay.' },
  { q: 'How does billing work?', a: 'NebulaSEO is $79/month per business location. Each location is billed separately, so you only pay for what you use. Cancel any location anytime from your dashboard.' },
  { q: 'Can I manage multiple locations?', a: 'Yes. You can add unlimited business locations to one account. Each gets its own keywords, cities, rank audits, and AI posts.' },
  { q: 'Do posts publish automatically?', a: 'You choose. You can review and approve each post before it goes live, or enable auto-publish to let NebulaSEO handle everything hands-free. Either way, posts are generated automatically every month.' },
  { q: 'What happens to my data if I cancel?', a: 'All data — rank history, posts, audits — is permanently deleted when your subscription ends. We don\'t hold your data hostage.' },
  { q: 'How does the rank audit work?', a: 'We create a grid of GPS points across your service area and check your Google Maps ranking at each point, simulating real local searches. The result is a heatmap showing exactly where you rank well and where you don\'t.' },
  { q: 'Is there a white-label option?', a: 'White-label is coming soon. You\'ll be able to brand PDF reports and the dashboard with your agency name and logo.' },
  { q: 'Do you support businesses outside the US?', a: 'Yes — NebulaSEO works for any business with a Google Business Profile, anywhere in the world.' },
]

export default function Home() {
  useReveal()
  const [openFaq, setOpenFaq] = useState(null)
  const [activeStory, setActiveStory] = useState(0)

  return (
    <>
      <Starfield />
      <Navbar />

      <style>{`
        .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal.revealed { opacity: 1; transform: translateY(0); }
        .d1{transition-delay:.05s} .d2{transition-delay:.12s} .d3{transition-delay:.19s} .d4{transition-delay:.26s} .d5{transition-delay:.33s} .d6{transition-delay:.40s}
        .feat-card { transition: all 0.3s; }
        .feat-card:hover { transform: translateY(-4px); border-color: rgba(123,47,255,0.35) !important; background: rgba(123,47,255,0.06) !important; }
        .step-card { transition: all 0.3s; }
        .step-card:hover { border-color: rgba(0,200,255,0.3) !important; }
        .testi-card { transition: all 0.3s; }
        .testi-card:hover { transform: translateY(-4px); }
        .faq-item { transition: all 0.2s; }
        .faq-item:hover { border-color: rgba(123,47,255,0.3) !important; }
        .story-tab { transition: all 0.2s; cursor: pointer; }
        .story-tab:hover { border-color: rgba(232,238,255,0.2) !important; }
        @keyframes drift { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-20px,15px)} 66%{transform:translate(15px,-10px)} }
        @keyframes pulse-ring { 0%{transform:scale(0.95);opacity:0.6} 70%{transform:scale(1.05);opacity:0} 100%{transform:scale(0.95);opacity:0} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes spin-slow { to{transform:rotate(360deg)} }
        .float-anim { animation: float 4s ease-in-out infinite; }
        html, body { overflow-x: hidden; max-width: 100vw; }
        * { box-sizing: border-box; }
        @media(max-width:900px){
          .success-tabs { grid-template-columns: 1fr 1fr !important; }
          .success-before-after { grid-template-columns: 1fr !important; gap: 12px !important; }
          .success-arrow { display: none !important; }
          .pricing-cta-features { grid-template-columns: 1fr !important; }
        }
        @media(max-width:768px){
          .success-tabs { grid-template-columns: 1fr 1fr !important; }
          .hero-heatmap { max-width: 100% !important; overflow: hidden; }
          .hero-heatmap > div > div { flex-wrap: nowrap; overflow-x: auto; }
        }
        @media(max-width:1024px){
          .hero-section{padding:120px 32px 60px!important}
          .section-pad{padding:80px 32px!important}
          .section-pad-sm{padding:60px 32px!important}
          .story-grid{grid-template-columns:1fr 1fr!important}
          .success-grid{grid-template-columns:1fr!important}
        }
        @media(max-width:768px){
          .hero-section{padding:110px 20px 50px!important}
          .section-pad{padding:60px 20px!important}
          .section-pad-sm{padding:40px 20px!important}
          .feat-grid{grid-template-columns:1fr!important}
          .step-grid{grid-template-columns:1fr!important}
          .testi-grid{grid-template-columns:1fr!important}
          .story-grid{grid-template-columns:1fr 1fr!important}
          .cta-features{grid-template-columns:1fr!important}
          .hero-btns{flex-direction:column;align-items:center}
          .success-before-after{grid-template-columns:1fr!important;gap:16px!important}
          nav{padding:16px 20px!important}
          nav ul{display:none!important}
          footer{padding:40px 20px!important}
          .footer-grid{grid-template-columns:1fr 1fr!important}
        }
        @media(max-width:480px){
          .story-grid{grid-template-columns:1fr 1fr!important}
          .footer-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="hero-section" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '140px 60px 80px', position: 'relative', overflow: 'hidden', zIndex: 1 }}>
        {[
          { w: 600, bg: 'rgba(123,47,255,0.18)', top: '-150px', left: '-150px', delay: '0s' },
          { w: 450, bg: 'rgba(255,45,154,0.12)', bottom: '-100px', right: '-100px', delay: '3s' },
          { w: 350, bg: 'rgba(0,200,255,0.1)', top: '40%', left: '60%', delay: '1.5s' },
        ].map((o, i) => (
          <div key={i} style={{ position: 'absolute', width: o.w, height: o.w, borderRadius: '50%', background: `radial-gradient(circle, ${o.bg}, transparent 70%)`, filter: 'blur(80px)', pointerEvents: 'none', top: o.top, bottom: o.bottom, left: o.left, right: o.right, animation: `drift 10s ${o.delay} ease-in-out infinite` }} />
        ))}

        <div className="reveal" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, border: '1px solid rgba(123,47,255,0.3)', background: 'rgba(123,47,255,0.08)', marginBottom: 28, fontSize: 12, color: 'var(--nebula-purple)', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--nebula-purple)', boxShadow: '0 0 8px var(--nebula-purple)' }} />
          AI-Powered Local SEO
        </div>

        <h1 className="reveal d1" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 6vw, 76px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: -1, marginBottom: 24, maxWidth: 900 }}>
          Rank #1 on Google Maps.<br />
          <span className="gradient-text">On Autopilot.</span>
        </h1>

        <p className="reveal d2" style={{ fontSize: 'clamp(15px, 2vw, 19px)', color: 'var(--dim)', maxWidth: 600, lineHeight: 1.75, marginBottom: 44 }}>
          NebulaSEO automates your Google Business Profile — generating posts, tracking rankings with visual heatmaps, and managing reviews so you can focus on running your business.
        </p>

        <div className="reveal d3" style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 56 }}>
          <Link href="/login?signup=true" className="btn-primary" style={{ padding: '16px 40px', fontSize: 13 }}>
            Start $1 Trial →
          </Link>
          <Link href="#how-it-works" style={{ padding: '16px 32px', borderRadius: 50, border: '1px solid var(--border)', color: 'var(--dim)', fontSize: 13, transition: 'all 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,238,255,0.2)'; e.currentTarget.style.color = 'var(--star-white)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--dim)' }}>
            See How It Works
          </Link>
        </div>

        <div className="reveal d4" style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--dim2)' }}>
          <span style={{ color: 'var(--nebula-gold)' }}>★★★★★</span>
          <span style={{ marginLeft: 4 }}>3-day trial · $1 · Cancel anytime</span>
        </div>

        {/* Hero heatmap mockup */}
        <div className="reveal d5 float-anim" className="hero-heatmap" style={{ marginTop: 80, position: 'relative', maxWidth: 680, width: '100%', overflow: 'hidden' }}>
          <div style={{ borderRadius: 20, border: '1px solid rgba(123,47,255,0.25)', background: 'rgba(6,6,18,0.8)', backdropFilter: 'blur(20px)', overflow: 'hidden', boxShadow: '0 0 80px rgba(123,47,255,0.15), 0 40px 80px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(232,238,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--dim)', fontWeight: 600 }}>📍 Rank Heatmap — "plumber near me" · Austin, TX</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(20,200,100,0.1)', border: '1px solid rgba(20,200,100,0.3)', color: 'rgba(20,200,100,0.9)' }}>Avg Rank: #2.4</span>
            </div>
            <div style={{ padding: 20 }}>
              {[
                [1,1,2,1,2,3,2],
                [1,1,1,2,3,4,3],
                [2,1,1,1,2,3,5],
                [3,2,1,1,1,2,4],
                [4,3,2,1,1,1,3],
                [6,4,3,2,1,2,4],
                [8,5,4,3,2,3,5],
              ].map((row, ri) => (
                <div key={ri} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                  {row.map((rank, ci) => {
                    const color = rank <= 3 ? `rgba(20,200,100,${0.5 + (3-rank)*0.15})` : rank <= 7 ? `rgba(255,184,48,${0.4 + (7-rank)*0.05})` : 'rgba(255,80,80,0.4)'
                    return (
                      <div key={ci} style={{ flex: 1, height: 44, borderRadius: 8, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                        #{rank}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '120px 60px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--nebula-blue)', marginBottom: 14 }}>How It Works</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 900, marginBottom: 14 }}>Up and running in 5 minutes</h2>
            <p style={{ fontSize: 15, color: 'var(--dim)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>No setup calls. No onboarding sessions. Add a business, pay, and your first audit starts automatically.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {steps.map((s, i) => (
              <div key={i} className={`reveal step-card d${i+1}`} style={{ padding: '32px 28px', borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 16, right: 16, fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 900, color: 'rgba(123,47,255,0.08)', lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--nebula-purple)', marginBottom: 14, letterSpacing: 2 }}>STEP {s.num}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: 'var(--dim)', lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '80px 60px 120px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--nebula-purple)', marginBottom: 14 }}>Features</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 900, marginBottom: 14 }}>Everything local SEO needs</h2>
            <p style={{ fontSize: 15, color: 'var(--dim)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>One platform. No duct tape. No 5-tool stack.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {features.map((f, i) => (
              <div key={i} className={`reveal feat-card d${(i%6)+1}`} style={{ padding: '28px', borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{f.name}</div>
                <div style={{ fontSize: 13, color: 'var(--dim)', lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VIDEO ────────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 60px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div className="reveal" style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--nebula-pink)', marginBottom: 14 }}>See It In Action</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 900, marginBottom: 14 }}>Watch NebulaSEO in action</h2>
            <p style={{ fontSize: 15, color: 'var(--dim)', lineHeight: 1.7 }}>See how a business goes from invisible to ranking in the top 3 across its entire service area.</p>
          </div>
          <div className="reveal" style={{ borderRadius: 20, border: '1px solid rgba(123,47,255,0.25)', background: 'rgba(6,6,18,0.8)', overflow: 'hidden', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 0 80px rgba(123,47,255,0.12)' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(123,47,255,0.1), transparent 70%)' }} />
            <div style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-pink))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28, boxShadow: '0 0 40px rgba(123,47,255,0.4)', cursor: 'pointer' }}>▶</div>
              <div style={{ fontSize: 14, color: 'var(--dim)' }}>Demo video coming soon</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SUCCESS STORIES ──────────────────────────────────────────────── */}
      <section style={{ padding: '80px 60px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--nebula-gold)', marginBottom: 14 }}>Client Results</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 900, marginBottom: 14 }}>Real rankings. Real growth.</h2>
            <p style={{ fontSize: 15, color: 'var(--dim)', lineHeight: 1.7 }}>Average rank improvements across active NebulaSEO locations.</p>
          </div>
          <div className="reveal" className="success-tabs" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 32 }}>
            {successStories.map((s, i) => (
              <div key={i} className="story-tab" onClick={() => setActiveStory(i)} style={{ padding: '16px', borderRadius: 12, border: `1px solid ${activeStory === i ? s.color : 'var(--border)'}`, background: activeStory === i ? `rgba(123,47,255,0.06)` : 'transparent', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--dim2)', marginBottom: 4 }}>{s.category}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{s.biz}</div>
                <div style={{ fontSize: 11, color: 'var(--dim2)' }}>{s.location}</div>
              </div>
            ))}
          </div>
          <div className="reveal" style={{ padding: '40px 48px', borderRadius: 20, background: 'rgba(232,238,255,0.02)', border: `1px solid ${successStories[activeStory].color.replace('var(', '').replace(')', '')}22` || 'var(--border)' }}>
            <div className="success-before-after" style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr', gap: 32, alignItems: 'center' }}>
              <div style={{ textAlign: 'center', padding: '32px', borderRadius: 16, background: 'rgba(255,80,80,0.06)', border: '1px solid rgba(255,80,80,0.2)' }}>
                <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,80,80,0.8)', marginBottom: 12 }}>Before NebulaSEO</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 900, color: 'rgba(255,100,100,0.9)', marginBottom: 6 }}>#{successStories[activeStory].before}</div>
                <div style={{ fontSize: 12, color: 'var(--dim)' }}>Average rank across service area</div>
              </div>
              <div className="success-arrow" style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--nebula-gold)' }}>{successStories[activeStory].change}</div>
                <div style={{ fontSize: 24 }}>→</div>
              </div>
              <div style={{ textAlign: 'center', padding: '32px', borderRadius: 16, background: 'rgba(20,200,100,0.06)', border: '1px solid rgba(20,200,100,0.2)' }}>
                <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(20,200,100,0.8)', marginBottom: 12 }}>After NebulaSEO</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 900, color: 'rgba(20,200,100,0.9)', marginBottom: 6 }}>#{successStories[activeStory].after}</div>
                <div style={{ fontSize: 12, color: 'var(--dim)' }}>Average rank across service area</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 60px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 12 }}>
              {'★★★★★'.split('').map((s, i) => <span key={i} style={{ color: 'var(--nebula-gold)', fontSize: 22 }}>{s}</span>)}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 900, marginBottom: 8 }}>Rated 4.9/5 by local SEO pros</h2>
            <p style={{ fontSize: 15, color: 'var(--dim)' }}>From solo operators to agencies managing 50+ locations.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {testimonials.map((t, i) => (
              <div key={i} className={`reveal testi-card d${i+1}`} style={{ padding: '32px', borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 20 }}>
                  {'★★★★★'.split('').map((s, j) => <span key={j} style={{ color: 'var(--nebula-gold)', fontSize: 14 }}>{s}</span>)}
                </div>
                <p style={{ fontSize: 14, color: 'rgba(232,238,255,0.8)', lineHeight: 1.75, marginBottom: 24, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-pink))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{t.name.split(' ').map(n => n[0]).join('')}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--dim)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING CTA ──────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 60px 60px', position: 'relative', zIndex: 1 }}>
        <div className="reveal" style={{ maxWidth: 900, margin: '0 auto', padding: '60px', borderRadius: 24, background: 'linear-gradient(135deg, rgba(123,47,255,0.15), rgba(255,45,154,0.1), rgba(0,200,255,0.08))', border: '1px solid rgba(123,47,255,0.3)', textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 0 80px rgba(123,47,255,0.1)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(123,47,255,0.08), transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: 3, color: 'var(--nebula-blue)', marginBottom: 16, textTransform: 'uppercase' }}>Simple Pricing</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, marginBottom: 12 }}>$79<span style={{ fontSize: '0.4em', fontWeight: 400, color: 'var(--dim)' }}>/mo per location</span></h2>
            <p style={{ fontSize: 15, color: 'var(--dim)', marginBottom: 40, lineHeight: 1.7, maxWidth: 480, margin: '0 auto 40px' }}>One price. All features. No upsells. Cancel any location anytime.</p>
            <div className="pricing-cta-features" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 44, textAlign: 'left' }}>
              {[
                'Monthly rank audits + heatmaps',
                '10 AI-generated GBP posts/month',
                'Post approval queue',
                'White-label PDF reports',
                'Review management (coming soon)',
                'Multi-location dashboard',
                'Cancel anytime, no contracts',
                '$1 trial for 3 days',
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--dim)' }}>
                  <span style={{ color: 'rgba(20,200,100,0.8)', flexShrink: 0 }}>✓</span> {f}
                </div>
              ))}
            </div>
            <Link href="/login?signup=true" className="btn-primary" style={{ padding: '16px 44px', fontSize: 13 }}>
              Start $1 Trial →
            </Link>
            <div style={{ marginTop: 16, fontSize: 12, color: 'var(--dim2)' }}>3 days · $1 · No commitment</div>
          </div>
        </div>
      </section>

      {/* ── FAQs ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: '60px 60px 120px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, marginBottom: 10 }}>Frequently asked questions</h2>
            <p style={{ fontSize: 15, color: 'var(--dim)' }}>Everything you need to know before getting started.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {faqs.map((f, i) => (
              <div key={i} className="reveal faq-item" onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ borderRadius: 12, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.02)', overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{f.q}</span>
                  <span style={{ color: 'var(--dim)', fontSize: 18, flexShrink: 0, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                </div>
                {openFaq === i && (
                  <div style={{ padding: '0 24px 18px', fontSize: 13, color: 'var(--dim)', lineHeight: 1.75 }}>{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
