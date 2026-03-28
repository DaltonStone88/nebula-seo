'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Starfield from '../../components/Starfield'
import Footer from '../../components/Footer'

const plans = [
  {
    name: 'Orbit', price: 97, tagline: 'Perfect for single-location businesses',
    features: ['1 Business Location', 'AI GBP Post Generation (4x/week)', 'Review Response Automation', 'Monthly SEO Report', 'Citation Sync (40 directories)', 'Basic Rank Tracking'],
    cta: 'Start Orbiting', featured: false,
  },
  {
    name: 'Nebula', price: 297, tagline: 'For agencies managing multiple clients',
    features: ['Up to 10 Locations', 'Everything in Orbit', 'Hyper-Local Content Engine', 'Local Rank Grid Heatmap', 'White-Label PDF Reports', 'Priority Support', 'Competitor Analysis'],
    cta: 'Enter the Nebula', featured: true,
  },
  {
    name: 'Galaxy', price: 797, tagline: 'Enterprise agencies at unlimited scale',
    features: ['Unlimited Locations', 'Everything in Nebula', 'Custom AI Model Training', 'Full API Access', 'Dedicated Account Manager', 'SLA Guarantee', 'Custom Integrations'],
    cta: 'Reach the Galaxy', featured: false,
  },
]

const faqs = [
  { q: 'Is there a free trial?', a: 'Yes — all plans come with a 14-day free trial. No credit card required to start.' },
  { q: 'Can I manage multiple clients from one account?', a: 'Absolutely. The Nebula and Galaxy plans are built for agencies managing multiple business locations from a single dashboard.' },
  { q: 'What is white-label reporting?', a: 'Nebula and Galaxy plans include PDF reports you can brand with your own agency logo and send directly to clients — they never need to know NebulaSEO powers it.' },
  { q: 'How does the AI GBP posting work?', a: 'Our AI analyzes your business category, keywords, and service area, then automatically generates and publishes Google Business Profile posts on a schedule you control.' },
  { q: 'Can I cancel anytime?', a: 'Yes, all plans are month-to-month with no long-term contracts. Cancel with one click from your dashboard.' },
  { q: 'Do you support multi-location businesses?', a: 'Yes. Each "location" counts as one slot in your plan. The Galaxy plan supports unlimited locations with no cap.' },
]

export default function Pricing() {
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <>
      <Starfield opacity={0.6} />
      <Navbar />

      <style>{`
        .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .plan-card:hover { transform: translateY(-8px); }
      `}</style>

      <main style={{ position: 'relative', zIndex: 1, paddingTop: 120 }}>
        {/* HERO */}
        <section style={{ textAlign: 'center', padding: '80px 60px 100px' }}>
          <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--nebula-blue)', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ width: 28, height: 1, background: 'var(--nebula-blue)', display: 'inline-block' }} />
            Pricing
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 72px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20, animation: 'fadeUp 0.8s ease both' }}>
            Simple, <span style={{ background: 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-pink))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>scalable pricing</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--dim)', fontWeight: 300, marginBottom: 44, animation: 'fadeUp 0.8s 0.15s ease both' }}>
            No long-term contracts. Cancel anytime. 14-day free trial on all plans.
          </p>

          {/* Toggle */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, background: 'rgba(232,238,255,0.04)', border: '1px solid var(--border)', borderRadius: 40, padding: '8px 20px', animation: 'fadeUp 0.8s 0.25s ease both' }}>
            <span style={{ fontSize: 13, color: annual ? 'var(--dim)' : 'var(--star-white)', fontWeight: 500 }}>Monthly</span>
            <div onClick={() => setAnnual(!annual)} style={{ width: 48, height: 26, borderRadius: 13, background: annual ? 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-pink))' : 'rgba(232,238,255,0.15)', cursor: 'pointer', position: 'relative', transition: 'all 0.3s', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 3, left: annual ? 24 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.3s', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }} />
            </div>
            <span style={{ fontSize: 13, color: annual ? 'var(--star-white)' : 'var(--dim)', fontWeight: 500 }}>Annual <span style={{ color: 'var(--nebula-blue)', fontSize: 11 }}>–20%</span></span>
          </div>
        </section>

        {/* PLANS */}
        <section style={{ padding: '0 60px 100px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {plans.map((plan, i) => (
              <div key={i} className="plan-card" style={{
                padding: '44px 38px', borderRadius: 24,
                border: plan.featured ? '1px solid rgba(123,47,255,0.5)' : '1px solid var(--border)',
                background: plan.featured
                  ? 'linear-gradient(135deg, rgba(123,47,255,0.1), rgba(255,45,154,0.05))'
                  : 'rgba(232,238,255,0.02)',
                position: 'relative', overflow: 'hidden',
                boxShadow: plan.featured ? '0 0 60px rgba(123,47,255,0.12), inset 0 0 60px rgba(123,47,255,0.02)' : 'none',
                transition: 'all 0.4s',
              }}>
                {plan.featured && (
                  <div style={{ position: 'absolute', top: 22, right: 22, padding: '5px 14px', borderRadius: 20, background: 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-pink))', fontSize: 10, letterSpacing: 2, fontWeight: 700, textTransform: 'uppercase' }}>
                    Most Popular
                  </div>
                )}
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, letterSpacing: 3, color: 'var(--dim)', textTransform: 'uppercase', marginBottom: 22 }}>{plan.name}</div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 18, color: 'var(--dim)', verticalAlign: 'top', lineHeight: '2.2' }}>$</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 900, lineHeight: 1 }}>
                    {annual ? Math.round(plan.price * 0.8) : plan.price}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--dim)', marginLeft: 4 }}>/mo</span>
                </div>
                {annual && <div style={{ fontSize: 11, color: 'var(--nebula-blue)', marginBottom: 6 }}>Billed ${Math.round(plan.price * 0.8 * 12)}/yr</div>}
                <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 36, lineHeight: 1.5 }}>{plan.tagline}</p>
                <ul style={{ listStyle: 'none', marginBottom: 36 }}>
                  {plan.features.map((f, fi) => (
                    <li key={fi} style={{ padding: '11px 0', borderBottom: '1px solid rgba(232,238,255,0.05)', fontSize: 13, color: 'rgba(232,238,255,0.75)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--nebula-blue)', fontSize: 11, marginTop: 2 }}>◆</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login?signup=true" style={{
                  display: 'block', width: '100%', padding: '15px', borderRadius: 12,
                  textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 11,
                  letterSpacing: 2, fontWeight: 700, textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all 0.3s',
                  background: plan.featured ? 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-pink))' : 'transparent',
                  border: plan.featured ? 'none' : '1px solid rgba(232,238,255,0.15)',
                  color: 'var(--star-white)',
                  boxShadow: plan.featured ? '0 0 30px rgba(123,47,255,0.3)' : 'none',
                }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* COMPARE */}
        <section style={{ padding: '0 60px 120px', maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 48 }}>What's included</h2>
          <div style={{ border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', background: 'rgba(123,47,255,0.05)', padding: '18px 28px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--dim)' }}>Feature</div>
              {['Orbit', 'Nebula', 'Galaxy'].map(p => <div key={p} style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', textAlign: 'center' }}>{p}</div>)}
            </div>
            {[
              ['AI GBP Posts', '4/week', '7/week', 'Unlimited'],
              ['Business Locations', '1', 'Up to 10', 'Unlimited'],
              ['Rank Grid Heatmap', '✗', '✓', '✓'],
              ['White-Label Reports', '✗', '✓', '✓'],
              ['Review Responses', '✓', '✓', '✓'],
              ['Citation Directories', '40', '80+', '80+'],
              ['Competitor Tracking', '✗', '✓', '✓'],
              ['API Access', '✗', '✗', '✓'],
              ['Dedicated Manager', '✗', '✗', '✓'],
            ].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '16px 28px', borderBottom: i < 8 ? '1px solid rgba(232,238,255,0.04)' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(232,238,255,0.01)' }}>
                <div style={{ fontSize: 13, color: 'rgba(232,238,255,0.7)' }}>{row[0]}</div>
                {row.slice(1).map((v, j) => (
                  <div key={j} style={{ fontSize: 13, textAlign: 'center', color: v === '✗' ? 'rgba(232,238,255,0.2)' : v === '✓' ? 'var(--nebula-blue)' : 'var(--star-white)', fontFamily: v === '✓' || v === '✗' ? 'inherit' : 'var(--font-display)', fontWeight: v !== '✓' && v !== '✗' ? 700 : 400 }}>{v}</div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '0 60px 140px', maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 52 }}>Frequently asked <span style={{ background: 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-pink))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>questions</span></h2>
          {faqs.map((faq, i) => (
            <div key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 0' }}>
                <span style={{ fontSize: 15, fontWeight: 500 }}>{faq.q}</span>
                <span style={{ color: 'var(--nebula-purple)', fontSize: 20, transition: 'transform 0.3s', transform: openFaq === i ? 'rotate(45deg)' : 'none', flexShrink: 0, marginLeft: 16 }}>+</span>
              </div>
              <div style={{ maxHeight: openFaq === i ? 200 : 0, overflow: 'hidden', transition: 'max-height 0.4s ease', fontSize: 14, color: 'var(--dim)', lineHeight: 1.75, paddingBottom: openFaq === i ? 20 : 0 }}>
                {faq.a}
              </div>
            </div>
          ))}
        </section>
      </main>

      <Footer />
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </>
  )
}
