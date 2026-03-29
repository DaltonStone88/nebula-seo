'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function AddBusiness() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [searching, setSearching] = useState(false)
  const [step, setStep] = useState(1) // 1=search, 2=keywords, 3=payment, 4=running

  const [keywords, setKeywords] = useState(['', ''])
  const [cities, setCities] = useState(['', '', '', '', '', '', ''])

  // Payment state
  const [stripeLoaded, setStripeLoaded] = useState(false)
  const [stripeInstance, setStripeInstance] = useState(null)
  const [cardElement, setCardElement] = useState(null)
  const [clientSecret, setClientSecret] = useState(null)
  const [paymentError, setPaymentError] = useState(null)
  const [paying, setPaying] = useState(false)
  const cardRef = useRef(null)

  // Audit/generation state
  const [auditProgress, setAuditProgress] = useState([])
  const [postsGenerating, setPostsGenerating] = useState(false)
  const [allDone, setAllDone] = useState(false)

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1px solid var(--border)', background: 'rgba(232,238,255,0.04)',
    color: 'var(--star-white)', fontSize: 14, fontFamily: 'var(--font-body)',
    outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
  }

  // Load Stripe.js once
  useEffect(() => {
    if (window.Stripe) { setStripeLoaded(true); return }
    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3/'
    script.onload = () => setStripeLoaded(true)
    document.head.appendChild(script)
  }, [])

  // Mount card element when we enter step 3
  useEffect(() => {
    if (step !== 3 || !stripeLoaded || !clientSecret || !cardRef.current) return

    const stripe = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    setStripeInstance(stripe)
    const elements = stripe.elements()
    const card = elements.create('card', {
      style: {
        base: {
          color: '#e8eeff',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          '::placeholder': { color: 'rgba(232,238,255,0.3)' },
        },
        invalid: { color: '#ff6464' },
      },
    })
    card.mount(cardRef.current)
    setCardElement(card)
    return () => { try { card.unmount() } catch (e) {} }
  }, [step, stripeLoaded, clientSecret])

  const search = async () => {
    if (!query.trim()) return
    setSearching(true)
    setResults([])
    try {
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(query)}`)
      setResults(await res.json())
    } catch (e) { console.error(e) }
    setSearching(false)
  }

  const goToPayment = async () => {
    const filteredKeywords = keywords.filter(k => k.trim())
    const filteredCities = cities.filter(c => c.trim())
    try {
      const res = await fetch('/api/stripe/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessData: {
            name: selected.name, address: selected.address, placeId: selected.placeId,
            lat: selected.lat, lng: selected.lng, category: selected.category,
            targetKeywords: filteredKeywords, targetCities: filteredCities,
          },
        }),
      })
      const data = await res.json()
      if (data.error) { alert('Error: ' + data.error); return }
      setClientSecret(data.clientSecret)
      setStep(3)
    } catch (e) { alert('Error: ' + e.message) }
  }

  const handlePay = async () => {
    if (!stripeInstance || !cardElement) return
    setPaying(true)
    setPaymentError(null)

    const filteredKeywords = keywords.filter(k => k.trim())
    const filteredCities = cities.filter(c => c.trim())
    const businessData = {
      name: selected.name, address: selected.address, placeId: selected.placeId,
      lat: selected.lat, lng: selected.lng, category: selected.category,
      targetKeywords: filteredKeywords, targetCities: filteredCities,
    }

    try {
      const { setupIntent, error } = await stripeInstance.confirmCardSetup(clientSecret, {
        payment_method: { card: cardElement },
      })

      if (error) { setPaymentError(error.message); setPaying(false); return }

      const res = await fetch('/api/stripe/confirm-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: setupIntent.payment_method, businessData }),
      })
      const data = await res.json()

      if (data.error) { setPaymentError(data.error); setPaying(false); return }

      if (data.status === 'requires_action') {
        const { error: actionError } = await stripeInstance.handleCardAction(data.clientSecret)
        if (actionError) { setPaymentError(actionError.message); setPaying(false); return }
      }

      // Payment succeeded — move to step 4 and run everything
      setPaying(false)
      setStep(4)
      setAuditProgress(filteredKeywords.map(kw => ({ keyword: kw, done: false, error: false })))

      for (let i = 0; i < filteredKeywords.length; i++) {
        try {
          await fetch('/api/places/rank-audit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ businessId: data.businessId, keyword: filteredKeywords[i], gridSize: '7x7', spacing: 'medium' }),
          })
          setAuditProgress(prev => prev.map((p, j) => j === i ? { ...p, done: true } : p))
        } catch (e) {
          setAuditProgress(prev => prev.map((p, j) => j === i ? { ...p, done: true, error: true } : p))
        }
      }

      setPostsGenerating(true)
      try {
        await fetch('/api/automation/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: data.businessId }),
        })
      } catch (e) { console.error('Post generation failed:', e) }
      setPostsGenerating(false)
      setAllDone(true)

    } catch (e) { setPaymentError(e.message); setPaying(false) }
  }

  const steps = ['Find Business', 'Keywords & Cities', 'Payment']

  return (
    <div>
      <div style={{ padding: '20px 36px', borderBottom: '1px solid var(--border)', background: 'rgba(6,6,18,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', gap: 16 }}>
        {step < 4 && (
          <button onClick={() => step === 1 ? router.back() : setStep(s => s - 1)} style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 20, padding: 0, lineHeight: 1 }}>←</button>
        )}
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Add a Business</h1>
      </div>

      <div style={{ padding: '48px 36px', maxWidth: 680, margin: '0 auto' }}>

        {step < 4 && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 48 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
                  background: step > i + 1 ? 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-pink))' : step === i + 1 ? 'rgba(123,47,255,0.2)' : 'rgba(232,238,255,0.05)',
                  border: step === i + 1 ? '1px solid rgba(123,47,255,0.5)' : '1px solid var(--border)',
                  color: step >= i + 1 ? 'var(--star-white)' : 'var(--dim)',
                }}>{step > i + 1 ? '✓' : i + 1}</div>
                <span style={{ fontSize: 13, color: step === i + 1 ? 'var(--star-white)' : 'var(--dim)', fontWeight: step === i + 1 ? 600 : 400 }}>{s}</span>
                {i < steps.length - 1 && <div style={{ width: 32, height: 1, background: 'var(--border)', margin: '0 4px' }} />}
              </div>
            ))}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Find your business</h2>
            <p style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 32, lineHeight: 1.6 }}>Search for your business name. We'll pull in the address, location, and details automatically.</p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
                placeholder="e.g. Authority Plumbing O'Fallon MO" style={{ ...inputStyle, flex: 1 }}
                onFocus={e => e.target.style.borderColor = 'rgba(123,47,255,0.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              <button onClick={search} disabled={searching} className="btn-primary" style={{ fontSize: 12, padding: '12px 24px', flexShrink: 0 }}>
                {searching ? '...' : '🔍 Search'}
              </button>
            </div>
            {results.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {results.map((biz, i) => (
                  <div key={i} onClick={() => { setSelected(biz); setStep(2) }}
                    style={{ padding: '18px 20px', borderRadius: 14, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.02)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 16 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(123,47,255,0.4)'; e.currentTarget.style.background = 'rgba(123,47,255,0.05)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'rgba(232,238,255,0.02)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(123,47,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🏢</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{biz.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--dim)' }}>{biz.address}</div>
                    </div>
                    {biz.rating > 0 && (
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ color: 'var(--nebula-gold)', fontSize: 13 }}>★ {biz.rating}</div>
                        <div style={{ fontSize: 11, color: 'var(--dim)' }}>{biz.totalRatings} reviews</div>
                      </div>
                    )}
                    <div style={{ color: 'var(--nebula-blue)', fontSize: 18 }}>→</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && selected && (
          <div>
            <div style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(0,200,255,0.05)', border: '1px solid rgba(0,200,255,0.2)', marginBottom: 36, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(0,200,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏢</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: 'var(--dim)' }}>{selected.address}</div>
              </div>
              <button onClick={() => setStep(1)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 12 }}>Change</button>
            </div>

            <div style={{ marginBottom: 36 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Target Keywords</h3>
              <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 20, lineHeight: 1.6 }}>Used for rank tracking and AI content generation. Choose the main services you want to rank for.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {keywords.map((kw, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(123,47,255,0.15)', border: '1px solid rgba(123,47,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: 'var(--nebula-purple)', flexShrink: 0 }}>{i + 1}</div>
                    <input value={kw} onChange={e => { const k = [...keywords]; k[i] = e.target.value; setKeywords(k) }}
                      placeholder={i === 0 ? 'e.g. plumbing repair' : 'e.g. drain cleaning'} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'rgba(123,47,255,0.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 40 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Target Cities</h3>
              <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 20, lineHeight: 1.6 }}>Up to 7 cities for hyper-local content and rank tracking.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {cities.map((city, i) => (
                  <input key={i} value={city} onChange={e => { const c = [...cities]; c[i] = e.target.value; setCities(c) }}
                    placeholder={`City ${i + 1}`} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(123,47,255,0.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                ))}
              </div>
            </div>

            <button onClick={goToPayment} disabled={keywords.filter(k => k.trim()).length === 0} className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 14 }}>
              Continue to Payment →
            </button>
            {keywords.filter(k => k.trim()).length === 0 && (
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--dim)', marginTop: 10 }}>Enter at least one keyword to continue</p>
            )}
          </div>
        )}

        {/* STEP 3 — Payment */}
        {step === 3 && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Complete your subscription</h2>
            <p style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 32, lineHeight: 1.6 }}>Your first rank audit and AI-generated posts start automatically after payment.</p>

            {/* Order summary */}
            <div style={{ padding: '20px 24px', borderRadius: 14, background: 'rgba(123,47,255,0.08)', border: '1px solid rgba(123,47,255,0.25)', marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{selected?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--dim)' }}>{selected?.address}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900 }}>$79<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--dim)' }}>/mo</span></div>
                  <div style={{ fontSize: 11, color: 'var(--dim)' }}>billed monthly · cancel anytime</div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid rgba(232,238,255,0.08)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  `${keywords.filter(k=>k.trim()).length} keyword${keywords.filter(k=>k.trim()).length>1?'s':''} tracked`,
                  `${cities.filter(c=>c.trim()).length} target cit${cities.filter(c=>c.trim()).length>1?'ies':'y'}`,
                  'Monthly rank audits with heatmaps',
                  '10 AI-generated GBP posts/month',
                  'Post approval queue',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--dim)' }}>
                    <span style={{ color: 'rgba(20,200,100,0.8)', flexShrink: 0 }}>✓</span> {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Card input */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Card Details</label>
              <div ref={cardRef} style={{ padding: '14px 16px', borderRadius: 10, border: `1px solid ${paymentError ? 'rgba(255,80,80,0.5)' : 'var(--border)'}`, background: 'rgba(232,238,255,0.04)', minHeight: 46 }} />
              {paymentError && (
                <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,100,100,0.9)' }}>⚠️ {paymentError}</div>
              )}
            </div>

            <button onClick={handlePay} disabled={paying || !cardElement} className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 14 }}>
              {paying
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                    Processing...
                  </span>
                : '🔒 Subscribe — $79/mo'
              }
            </button>
            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: 'var(--dim2)' }}>
              Secured by Stripe · Cancel anytime · No hidden fees
            </div>
          </div>
        )}

        {/* STEP 4 — Running */}
        {step === 4 && (
          <div style={{ textAlign: 'center', paddingTop: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>{allDone ? '🎉' : '🚀'}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
              {allDone ? "You're all set!" : 'Setting Everything Up'}
            </div>
            <p style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 40, lineHeight: 1.6 }}>
              {allDone ? 'Audits complete and posts are ready to review in the Automation tab.' : 'Running your first rank audits and generating AI posts. Hang tight.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 420, margin: '0 auto 32px' }}>
              {auditProgress.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, background: 'rgba(232,238,255,0.03)', border: `1px solid ${p.done ? (p.error ? 'rgba(255,80,80,0.3)' : 'rgba(20,200,100,0.3)') : 'rgba(123,47,255,0.3)'}` }}>
                  <div style={{ width: 24, height: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.done ? <span style={{ fontSize: 16 }}>{p.error ? '❌' : '✅'}</span>
                      : <div style={{ width: 18, height: 18, border: '2px solid rgba(123,47,255,0.3)', borderTopColor: 'var(--nebula-purple)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />}
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.keyword}</div>
                    <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 2 }}>
                      {p.done ? (p.error ? 'Failed — retry from Reports' : 'Audit complete') : 'Scanning ranking grid...'}
                    </div>
                  </div>
                </div>
              ))}

              {auditProgress.length > 0 && auditProgress.every(p => p.done) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, background: 'rgba(232,238,255,0.03)', border: `1px solid ${allDone ? 'rgba(20,200,100,0.3)' : 'rgba(123,47,255,0.3)'}` }}>
                  <div style={{ width: 24, height: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {allDone ? <span style={{ fontSize: 16 }}>✅</span>
                      : <div style={{ width: 18, height: 18, border: '2px solid rgba(123,47,255,0.3)', borderTopColor: 'var(--nebula-purple)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />}
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Generating AI posts</div>
                    <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 2 }}>
                      {allDone ? '10 posts ready to review in Automation' : 'Creating 10 posts for this month...'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {allDone && (
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button onClick={() => router.push('/dashboard/reports')} className="btn-primary" style={{ fontSize: 13, padding: '12px 28px' }}>
                  View Reports →
                </button>
                <button onClick={() => router.push('/dashboard/automation')} style={{ padding: '12px 28px', borderRadius: 30, border: '1px solid var(--border)', background: 'transparent', color: 'var(--dim)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  Review Posts →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
