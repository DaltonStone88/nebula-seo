'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Starfield from '../../components/Starfield'
import Footer from '../../components/Footer'

const features = [
  { category: 'Rank Tracking', items: [
    'Monthly rank audit per keyword',
    'Visual heatmap across service area',
    'Baseline vs latest comparison',
    'Multi-keyword tracking',
    'PDF rank report',
  ]},
  { category: 'AI Content', items: [
    '10 GBP posts generated per month',
    'Posts tailored to keywords + cities',
    'Offer, Event & What\'s New post types',
    'Manual approval or auto-publish',
    'Image library with rotation',
  ]},
  { category: 'Reviews', items: [
    'Review monitoring dashboard',
    'AI-drafted review responses',
    'Review request link generation',
    'Review feed with filters',
    '(Requires GBP connection)',
  ]},
  { category: 'Reporting', items: [
    'White-label PDF reports',
    'Monthly audit history',
    'Before/after heatmap comparison',
    'Top competitor analysis',
    'Market opportunity estimate',
  ]},
  { category: 'Platform', items: [
    'Multi-location dashboard',
    'Business Settings per location',
    'Cancel any location anytime',
    'Crisp live chat support',
    'White-label branding (coming soon)',
  ]},
]

const faqs = [
  { q: 'Is there a free trial?', a: 'Yes — try NebulaSEO for 3 days for just $1. Your first rank audit and 10 AI posts start automatically right after signup. No commitment.' },
  { q: 'How does per-location billing work?', a: 'Each business location is its own subscription at $79/month. You can add as many locations as you want. Cancel any individual location from your dashboard without affecting others.' },
  { q: 'Can I manage multiple locations from one account?', a: 'Yes. All your locations appear in one dashboard. Switch between them with a single click from the sidebar.' },
  { q: 'Do posts publish automatically or do I approve them?', a: 'You choose. Enable auto-publish to let NebulaSEO handle everything, or use the approval queue to review and edit each post before it goes live.' },
  { q: 'When do posts generate?', a: 'For new locations, posts generate immediately after payment confirms. For existing locations, posts regenerate at the start of each billing cycle.' },
  { q: 'What happens to my data if I cancel?', a: 'All data — rank history, posts, audits, images — is permanently deleted when your subscription ends. We don\'t retain or sell your data.' },
  { q: 'Is there a white-label option?', a: 'White-label is coming soon. You\'ll be able to brand PDF reports and the dashboard with your agency name and logo.' },
  { q: 'Do you offer refunds?', a: 'We offer a $1 trial specifically so you can test before committing. We don\'t offer refunds on monthly subscriptions, but you can cancel at any time and keep access until your billing period ends.' },
]

export default function Pricing() {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <>
      <Starfield />
      <Navbar />
      <style>{`
        html, body { overflow-x: hidden; }
        .faq-item { transition: border-color 0.2s; cursor: pointer; }
        .faq-item:hover { border-color: rgba(123,47,255,0.3) !important; }
        @media(max-width:768px){
          .pricing-hero { padding: 120px 20px 60px !important; }
          .pricing-card { padding: 32px 20px !important; }
          .pricing-card-features { grid-template-columns: 1fr !important; }
          .pricing-feature-grid { grid-template-columns: 1fr !important; }
          .pricing-section { padding: 60px 20px !important; }
          .pricing-compare-links { flex-direction: column; align-items: flex-start; }
          .pricing-faq-section { padding: 0 20px 80px !important; }
        }
      `}</style>

      {/* Hero */}
      <section className="pricing-hero" style={{ padding: '160px 60px 80px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--nebula-purple)', marginBottom: 16 }}>Pricing</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 20 }}>
            One price.<br /><span className="gradient-text">All features.</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--dim)', lineHeight: 1.75, marginBottom: 48 }}>
            No tiers. No upsells. No "contact sales." Every location gets every feature for $79/month.
          </p>

          {/* Main pricing card */}
          <div className="pricing-card" style={{ padding: '52px', borderRadius: 24, background: 'linear-gradient(135deg, rgba(123,47,255,0.12), rgba(0,200,255,0.06))', border: '1px solid rgba(123,47,255,0.35)', position: 'relative', overflow: 'hidden', marginBottom: 16, boxShadow: '0 0 80px rgba(123,47,255,0.12)' }}>
            <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', padding: '5px 20px', borderRadius: '0 0 12px 12px', background: 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-pink))', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
              Start with $1 Trial
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 72, fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>
              $79
            </div>
            <div style={{ fontSize: 15, color: 'var(--dim)', marginBottom: 40 }}>per location · per month · cancel anytime</div>
            <div className="pricing-card-features" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, textAlign: 'left', marginBottom: 44 }}>
              {[
                '✓  Monthly rank audits + heatmaps',
                '✓  10 AI GBP posts per month',
                '✓  Post approval queue',
                '✓  White-label PDF reports',
                '✓  Review management (coming soon)',
                '✓  Multi-location dashboard',
                '✓  Manual or auto-publish',
                '✓  Cancel anytime, no contracts',
              ].map((f, i) => (
                <div key={i} style={{ fontSize: 13, color: 'rgba(232,238,255,0.75)', display: 'flex', alignItems: 'center', gap: 8 }}>{f}</div>
              ))}
            </div>
            <Link href="/login?signup=true" className="btn-primary" style={{ padding: '16px 52px', fontSize: 13, display: 'inline-flex' }}>
              Start $1 Trial — 3 Days →
            </Link>
            <div style={{ marginTop: 14, fontSize: 12, color: 'var(--dim2)' }}>$79/mo after trial · No setup fees</div>
          </div>

          <div style={{ fontSize: 13, color: 'var(--dim2)' }}>
            Managing multiple locations? Each gets its own subscription.{' '}
            <Link href="/login?signup=true" style={{ color: 'var(--nebula-blue)' }}>Add as many as you need →</Link>
          </div>
        </div>
      </section>

      {/* Full feature breakdown */}
      <section className="pricing-section" style={{ padding: '80px 60px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 900, marginBottom: 12 }}>Everything included</h2>
            <p style={{ fontSize: 15, color: 'var(--dim)', lineHeight: 1.7 }}>No add-ons. No feature gates. Every location gets the full platform.</p>
          </div>
          <div className="pricing-feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {features.map((cat, i) => (
              <div key={i} style={{ padding: '28px', borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--nebula-blue)', marginBottom: 16, fontWeight: 600 }}>{cat.category}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {cat.items.map((item, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--dim)', lineHeight: 1.5 }}>
                      <span style={{ color: 'rgba(20,200,100,0.7)', flexShrink: 0, marginTop: 1 }}>✓</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compare */}
      <section style={{ padding: '40px 60px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 20 }}>See how NebulaSEO stacks up against the competition</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['Paige', 'LocalViking', 'BrightLocal', 'Yext'].map(c => (
              <Link key={c} href={`/compare/nebulaseo-vs-${c.toLowerCase().replace(' ', '')}`} style={{ padding: '8px 20px', borderRadius: 20, border: '1px solid var(--border)', fontSize: 13, color: 'var(--dim)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(123,47,255,0.4)'; e.currentTarget.style.color = 'var(--star-white)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--dim)' }}>
                NebulaSEO vs {c} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="pricing-faq-section" style={{ padding: '0 60px 120px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, marginBottom: 10 }}>Pricing FAQs</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {faqs.map((f, i) => (
              <div key={i} className="faq-item" onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ borderRadius: 12, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.02)', overflow: 'hidden' }}>
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
