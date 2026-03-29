'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddBusiness() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [auditProgress, setAuditProgress] = useState([]) // { keyword, done, error }
  const [step, setStep] = useState(1) // 1=search, 2=keywords, 3=running

  const [keywords, setKeywords] = useState(['', ''])
  const [cities, setCities] = useState(['', '', '', '', '', '', ''])

  const search = async () => {
    if (!query.trim()) return
    setSearching(true)
    setResults([])
    try {
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data)
    } catch (e) { console.error(e) }
    setSearching(false)
  }

  const save = async () => {
    setSaving(true)
    const filteredKeywords = keywords.filter(k => k.trim())
    const filteredCities = cities.filter(c => c.trim())

    try {
      // 1. Create the business
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selected.name,
          address: selected.address,
          placeId: selected.placeId,
          lat: selected.lat,
          lng: selected.lng,
          category: selected.category,
          targetKeywords: filteredKeywords,
          targetCities: filteredCities,
        }),
      })
      const biz = await res.json()

      // 2. Show audit running step
      setStep(3)
      setAuditProgress(filteredKeywords.map(kw => ({ keyword: kw, done: false, error: false })))

      // 3. Run audits for each keyword sequentially
      for (let i = 0; i < filteredKeywords.length; i++) {
        const kw = filteredKeywords[i]
        try {
          await fetch('/api/places/rank-audit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              businessId: biz.id,
              keyword: kw,
              gridSize: biz.gridSize || '7x7',
              spacing: biz.gridSpacing || 'medium',
            }),
          })
          setAuditProgress(prev => prev.map((p, j) => j === i ? { ...p, done: true } : p))
        } catch (e) {
          setAuditProgress(prev => prev.map((p, j) => j === i ? { ...p, done: true, error: true } : p))
        }
      }

      // 4. Kick off post generation in the background (don't await — let it run async)
      fetch('/api/automation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: biz.id }),
      }).catch(e => console.error('Post generation failed:', e))

      // 5. Redirect to reports
      router.push('/dashboard/reports')
    } catch (e) {
      console.error(e)
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1px solid var(--border)', background: 'rgba(232,238,255,0.04)',
    color: 'var(--star-white)', fontSize: 14, fontFamily: 'var(--font-body)',
    outline: 'none', transition: 'border-color 0.2s',
  }

  return (
    <div>
      <div style={{ padding: '20px 36px', borderBottom: '1px solid var(--border)', background: 'rgba(6,6,18,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', gap: 16 }}>
        {step < 3 && <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 20, padding: 0, lineHeight: 1 }}>←</button>}
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Add a Business</h1>
      </div>

      <div style={{ padding: '48px 36px', maxWidth: 700, margin: '0 auto' }}>

        {/* Step indicators */}
        {step < 3 && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 48 }}>
            {['Find Business', 'Set Keywords'].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
                  background: step > i + 1 ? 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-pink))' : step === i + 1 ? 'rgba(123,47,255,0.2)' : 'rgba(232,238,255,0.05)',
                  border: step === i + 1 ? '1px solid rgba(123,47,255,0.5)' : '1px solid var(--border)',
                  color: step >= i + 1 ? 'var(--star-white)' : 'var(--dim)',
                }}>{step > i + 1 ? '✓' : i + 1}</div>
                <span style={{ fontSize: 13, color: step === i + 1 ? 'var(--star-white)' : 'var(--dim)', fontWeight: step === i + 1 ? 600 : 400 }}>{s}</span>
                {i < 1 && <div style={{ width: 40, height: 1, background: 'var(--border)', margin: '0 4px' }} />}
              </div>
            ))}
          </div>
        )}

        {/* STEP 1 — Search */}
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
                  <div key={i} onClick={() => { setSelected(biz); setStep(2) }} style={{ padding: '18px 20px', borderRadius: 14, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.02)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 16 }}
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

        {/* STEP 2 — Keywords & Cities */}
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
              <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 20, lineHeight: 1.6 }}>These will be used for rank tracking and AI content generation. Choose the main services you want to rank for.</p>
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
              <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 20, lineHeight: 1.6 }}>Up to 7 cities you want to target. Used for hyper-local content generation and service area pages.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {cities.map((city, i) => (
                  <input key={i} value={city} onChange={e => { const c = [...cities]; c[i] = e.target.value; setCities(c) }}
                    placeholder={`City ${i + 1}`} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(123,47,255,0.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                ))}
              </div>
            </div>

            <button onClick={save} disabled={saving || keywords.filter(k => k.trim()).length === 0} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 13 }}>
              {saving ? '🚀 Adding Business...' : '🚀 Add Business & Run First Audit'}
            </button>
            {keywords.filter(k => k.trim()).length === 0 && (
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--dim)', marginTop: 10 }}>Enter at least one keyword to continue</p>
            )}
          </div>
        )}

        {/* STEP 3 — Running audits */}
        {step === 3 && (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 24 }}>🚀</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Running Your First Audits</div>
            <p style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 48, lineHeight: 1.6 }}>We're scanning your ranking across the service area for each keyword. This takes a minute — hang tight.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400, margin: '0 auto' }}>
              {auditProgress.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 14, background: 'rgba(232,238,255,0.03)', border: `1px solid ${p.done ? (p.error ? 'rgba(255,80,80,0.3)' : 'rgba(20,200,100,0.3)') : 'rgba(123,47,255,0.3)'}` }}>
                  <div style={{ width: 28, height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.done
                      ? <span style={{ fontSize: 18 }}>{p.error ? '❌' : '✅'}</span>
                      : <div style={{ width: 20, height: 20, border: '2px solid rgba(123,47,255,0.3)', borderTopColor: 'var(--nebula-purple)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    }
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.keyword}</div>
                    <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 2 }}>
                      {p.done ? (p.error ? 'Failed — you can retry from Reports' : 'Audit complete') : 'Scanning ranking grid...'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}
      </div>
    </div>
  )
}
