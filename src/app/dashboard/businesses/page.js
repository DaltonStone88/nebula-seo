'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

function EditModal({ biz, onClose, onSaved }) {
  const router = useRouter()
  const [keywords, setKeywords] = useState(() => {
    const kws = [...(biz.targetKeywords || [])]
    while (kws.length < 2) kws.push('')
    return kws
  })
  const [cities, setCities] = useState(() => {
    const cs = [...(biz.targetCities || [])]
    while (cs.length < 7) cs.push('')
    return cs
  })
  const [form, setForm] = useState({
    name: biz.name || '',
    address: biz.address || '',
    phone: biz.phone || '',
    website: biz.website || '',
    category: biz.category || '',
    gridSize: biz.gridSize || '7x7',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [confirmed, setConfirmed] = useState({})
  const [auditProgress, setAuditProgress] = useState(null) // null = not running, array = running

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1px solid var(--border)', background: 'rgba(232,238,255,0.04)',
    color: 'var(--star-white)', fontSize: 14, fontFamily: 'var(--font-body)',
    outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
  }

  const oldKeywords = biz.targetKeywords || []
  const keywordHistory = Array.isArray(biz.keywordHistory) ? biz.keywordHistory : []

  // Analyse what changed and build warnings when keywords are typed
  const getKeywordState = (i) => {
    const newKw = keywords[i]?.trim() || ''
    const oldKw = (oldKeywords[i] || '').trim()
    if (!oldKw && newKw) return 'new'       // adding to empty slot
    if (oldKw && newKw && newKw !== oldKw) return 'changed'  // replacing existing
    return 'unchanged'
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    // Check any changed keywords have been confirmed
    for (let i = 0; i < keywords.length; i++) {
      if (getKeywordState(i) === 'changed' && !confirmed[i]) {
        setError('Please confirm the keyword change warning(s) before saving.')
        setSaving(false)
        return
      }
    }

    const payload = {
      id: biz.id,
      ...form,
      targetKeywords: keywords.map(k => k.trim()).filter(Boolean),
      targetCities: cities.map(c => c.trim()).filter(Boolean),
    }

    const res = await fetch('/api/businesses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setSaving(false)

    if (data.error === 'KEYWORD_CHANGE_TOO_SOON') {
      setError(data.message)
      return
    }
    if (data.error) {
      setError(data.error)
      return
    }

    if (data.needsAudit) {
      // Collect all keywords that need an audit — both new and changed
      const kwsToAudit = [
        ...(data.addedKeywords || []).map(a => a.keyword),
        ...(data.changedKeywords || []).map(c => c.newKeyword),
      ]

      if (kwsToAudit.length > 0) {
        // Show audit progress overlay BEFORE calling onSaved to prevent unmount
        setAuditProgress(kwsToAudit.map(kw => ({ keyword: kw, done: false, error: false })))

        for (let i = 0; i < kwsToAudit.length; i++) {
          const keyword = kwsToAudit[i]
          try {
            await fetch('/api/places/rank-audit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                businessId: data.business.id,
                keyword,
                gridSize: data.business.gridSize || '7x7',
                spacing: data.business.gridSpacing || 'medium',
              }),
            })
            setAuditProgress(prev => prev.map((p, j) => j === i ? { ...p, done: true } : p))
          } catch (e) {
            setAuditProgress(prev => prev.map((p, j) => j === i ? { ...p, done: true, error: true } : p))
          }
        }
        // All done — notify parent then redirect
        onSaved(data.business)
        router.push('/dashboard/reports?audited=1')
        return
      }
    }

    // No audit needed — just save and close
    onSaved(data.business)
    onClose()
  }

  const changedCount = keywords.filter((_, i) => getKeywordState(i) === 'changed').length
  const addedCount   = keywords.filter((_, i) => getKeywordState(i) === 'new').length
  const allChangesConfirmed = keywords.every((_, i) => getKeywordState(i) !== 'changed' || confirmed[i])

  // Show full-screen audit progress overlay when running
  if (auditProgress) {
    const allDone = auditProgress.every(p => p.done)
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 460, width: '100%', padding: '0 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>🔍</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            {allDone ? 'Audits Complete!' : 'Running Rank Audits'}
          </div>
          <p style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 40, lineHeight: 1.6 }}>
            {allDone ? 'Redirecting to your reports...' : 'Scanning your ranking across the service area. Hang tight.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                    {p.done ? (p.error ? 'Failed — retry from Reports' : 'Audit complete') : 'Scanning ranking grid...'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 20px', overflowY: 'auto' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: 'rgba(10,10,28,0.99)', border: '1px solid var(--border)', borderRadius: 20, padding: '36px', width: '100%', maxWidth: 620 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>Edit Business</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--dim)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {/* Business info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 32 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Business Name</label>
            <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onFocus={e => e.target.style.borderColor = 'rgba(123,47,255,0.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Address</label>
            <input style={inputStyle} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              onFocus={e => e.target.style.borderColor = 'rgba(123,47,255,0.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Phone</label>
            <input style={inputStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              onFocus={e => e.target.style.borderColor = 'rgba(123,47,255,0.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Website</label>
            <input style={inputStyle} value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
              onFocus={e => e.target.style.borderColor = 'rgba(123,47,255,0.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Category</label>
            <input style={inputStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              onFocus={e => e.target.style.borderColor = 'rgba(123,47,255,0.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Grid Size</label>
            <select style={{ ...inputStyle }} value={form.gridSize} onChange={e => setForm(f => ({ ...f, gridSize: e.target.value }))}>
              {['5x5','7x7','10x10','15x15','20x20'].map(s => <option key={s} value={s}>{s} ({parseInt(s)**2} pts)</option>)}
            </select>
          </div>
        </div>

        {/* Target Keywords */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Target Keywords</h3>
          <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 18, lineHeight: 1.6 }}>These are used for rank tracking and AI content generation.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {keywords.map((kw, i) => {
              const state = getKeywordState(i)
              const borderColor = state === 'changed' ? 'rgba(255,184,48,0.6)' : state === 'new' ? 'rgba(0,200,255,0.4)' : 'var(--border)'
              return (
                <div key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(123,47,255,0.15)', border: '1px solid rgba(123,47,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: 'var(--nebula-purple)', flexShrink: 0 }}>{i + 1}</div>
                    <input
                      value={kw}
                      onChange={e => { const k = [...keywords]; k[i] = e.target.value; setKeywords(k); setConfirmed(c => ({ ...c, [i]: false })) }}
                      placeholder={i === 0 ? 'e.g. plumbing repair' : 'e.g. drain cleaning'}
                      style={{ ...inputStyle, borderColor, flex: 1 }}
                      onFocus={e => e.target.style.borderColor = state === 'changed' ? 'rgba(255,184,48,0.8)' : 'rgba(123,47,255,0.5)'}
                      onBlur={e => e.target.style.borderColor = borderColor}
                    />
                    {state === 'new' && <span style={{ fontSize: 11, color: 'var(--nebula-blue)', whiteSpace: 'nowrap' }}>+ New</span>}
                    {state === 'changed' && <span style={{ fontSize: 18 }}>⚠️</span>}
                  </div>

                  {/* Warning for changed keywords */}
                  {state === 'changed' && (
                    <div style={{ marginTop: 10, marginLeft: 34, padding: '14px 16px', borderRadius: 10, background: 'rgba(255,184,48,0.07)', border: '1px solid rgba(255,184,48,0.3)' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,184,48,0.9)', marginBottom: 6 }}>⚠️ Keyword Change Warning</div>
                      <div style={{ fontSize: 12, color: 'var(--dim)', lineHeight: 1.7, marginBottom: 10 }}>
                        You are replacing <strong style={{ color: 'var(--star-white)' }}>"{oldKeywords[i]}"</strong> with <strong style={{ color: 'var(--star-white)' }}>"{kw}"</strong>.<br />
                        All existing ranking history for this keyword will be <strong style={{ color: 'rgba(255,100,100,0.9)' }}>permanently deleted</strong>.<br />
                        Ranking improvements take time to build — changing keywords resets your progress and delays results.<br />
                        <strong style={{ color: 'rgba(255,184,48,0.9)' }}>You can only change each keyword once every 30 days.</strong> The new keyword's report will be synced to your next monthly audit date.
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="checkbox" checked={!!confirmed[i]} onChange={e => setConfirmed(c => ({ ...c, [i]: e.target.checked }))}
                          style={{ width: 14, height: 14, accentColor: 'var(--nebula-purple)' }} />
                        <span style={{ fontSize: 12, color: 'var(--star-white)' }}>I understand and want to proceed with this change</span>
                      </label>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Target Cities */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Target Cities</h3>
          <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 18, lineHeight: 1.6 }}>Up to 7 cities you want to target. Used for hyper-local content generation and service area pages.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {cities.map((city, i) => (
              <input key={i} value={city} onChange={e => { const c = [...cities]; c[i] = e.target.value; setCities(c) }}
                placeholder={`City ${i + 1}`} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(123,47,255,0.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            ))}
          </div>
        </div>

        {/* Audit notice */}
        {(addedCount > 0 || changedCount > 0) && (
          <div style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(0,200,255,0.06)', border: '1px solid rgba(0,200,255,0.2)', marginBottom: 20, fontSize: 13, color: 'var(--dim)', lineHeight: 1.6 }}>
            🔍 <strong style={{ color: 'var(--nebula-blue)' }}>Audit will run automatically</strong> after saving for {addedCount > 0 ? `${addedCount} new keyword${addedCount > 1 ? 's' : ''}` : ''}{addedCount > 0 && changedCount > 0 ? ' and ' : ''}{changedCount > 0 ? `${changedCount} changed keyword${changedCount > 1 ? 's' : ''}` : ''}.
          </div>
        )}

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(255,50,50,0.08)', border: '1px solid rgba(255,50,50,0.3)', marginBottom: 16, fontSize: 13, color: 'rgba(255,100,100,0.9)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '12px 24px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--dim)', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || (changedCount > 0 && !allChangesConfirmed) || keywords.filter(k => k.trim()).length === 0}
            className="btn-primary"
            style={{ padding: '12px 28px', fontSize: 13, opacity: (changedCount > 0 && !allChangesConfirmed) ? 0.5 : 1 }}
          >
            {saving ? '💾 Saving...' : (addedCount > 0 || changedCount > 0) ? '💾 Save & Run Audit' : '💾 Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CancelModal({ biz, onClose, onCancelled }) {
  const [step, setStep] = useState('reason') // reason | retention | offer | confirm
  const [reason, setReason] = useState('')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionTaken, setActionTaken] = useState(null)

  useEffect(() => {
    fetch(`/api/stripe/cancel?businessId=${biz.id}`)
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
  }, [biz.id])

  const reasons = [
    'Too expensive', 'Not seeing results', 'Switching to another tool',
    'Business closed or paused', 'Missing a feature I need', 'Other',
  ]

  const handleAction = async (action) => {
    setLoading(true)
    const res = await fetch('/api/stripe/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: biz.id, action }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      setActionTaken(action)
      if (action === 'discount') setStep('offer_accepted')
      if (action === 'pause') setStep('paused')
      if (action === 'cancel') { setStep('cancelled'); onCancelled() }
    }
  }

  const accessDate = stats?.currentPeriodEnd
    ? new Date(stats.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'end of billing period'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'rgba(10,10,28,0.99)', border: '1px solid var(--border)', borderRadius: 20, padding: '36px', width: '100%', maxWidth: 520 }}>

        {/* Step 1 — Reason */}
        {step === 'reason' && (
          <>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Cancel {biz.name}?</div>
            <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 24, lineHeight: 1.6 }}>Before you go, help us understand why. This takes 10 seconds.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {reasons.map(r => (
                <button key={r} onClick={() => setReason(r)} style={{ padding: '12px 16px', borderRadius: 10, border: `1px solid ${reason === r ? 'rgba(123,47,255,0.5)' : 'var(--border)'}`, background: reason === r ? 'rgba(123,47,255,0.1)' : 'transparent', color: reason === r ? 'var(--star-white)' : 'var(--dim)', cursor: 'pointer', textAlign: 'left', fontSize: 13, fontFamily: 'var(--font-body)' }}>{r}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--dim)', cursor: 'pointer', fontSize: 13 }}>Keep Subscription</button>
              <button onClick={() => reason && setStep('retention')} disabled={!reason} className="btn-primary" style={{ flex: 1, fontSize: 13, padding: '11px', justifyContent: 'center', opacity: reason ? 1 : 0.4 }}>Continue →</button>
            </div>
          </>
        )}

        {/* Step 2 — Retention (show stats) */}
        {step === 'retention' && stats && (
          <>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Here's what you'd be losing</div>
            <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 24, lineHeight: 1.6 }}>NebulaSEO has been working hard for {biz.name}.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Posts Generated', val: stats.postsGenerated, icon: '📝' },
                { label: 'Rank Audits Run', val: stats.auditsRun, icon: '📊' },
                { label: 'Current Avg Rank', val: stats.avgRank ? `#${stats.avgRank}` : '—', icon: '📍' },
                { label: 'Days Active', val: stats.daysActive, icon: '📅' },
              ].map((s, i) => (
                <div key={i} style={{ padding: '16px', borderRadius: 12, background: 'rgba(123,47,255,0.08)', border: '1px solid rgba(123,47,255,0.2)', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--nebula-blue)' }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 20, lineHeight: 1.6 }}>Cancelling will delete all ranking history, generated posts, and content for this location permanently.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid rgba(20,200,100,0.4)', background: 'rgba(20,200,100,0.08)', color: 'rgba(20,200,100,0.9)', cursor: 'pointer', fontSize: 13 }}>Keep Subscription</button>
              <button onClick={() => setStep('offer')} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--dim)', cursor: 'pointer', fontSize: 13 }}>Still want to cancel →</button>
            </div>
          </>
        )}

        {/* Step 3 — Offer */}
        {step === 'offer' && (
          <>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Wait — we have an offer</div>
            <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 24, lineHeight: 1.6 }}>Before you cancel, we'd like to help.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {!stats?.discountUsed && (
                <div style={{ padding: '20px', borderRadius: 14, background: 'rgba(0,200,255,0.08)', border: '1px solid rgba(0,200,255,0.3)' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>💰 10% Off Next Month</div>
                  <div style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 12, lineHeight: 1.6 }}>Get 10% off your next billing cycle — no strings attached. One time offer.</div>
                  <button onClick={() => handleAction('discount')} disabled={loading} className="btn-primary" style={{ fontSize: 12, padding: '9px 20px' }}>{loading ? 'Applying...' : 'Claim 10% Off'}</button>
                </div>
              )}
              {!stats?.pauseUsed && (
                <div style={{ padding: '20px', borderRadius: 14, background: 'rgba(123,47,255,0.08)', border: '1px solid rgba(123,47,255,0.3)' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>⏸️ Pause for 30 Days</div>
                  <div style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 12, lineHeight: 1.6 }}>Keep your data and rankings intact. Your subscription resumes automatically after 30 days. One time offer.</div>
                  <button onClick={() => handleAction('pause')} disabled={loading} style={{ padding: '9px 20px', borderRadius: 10, border: '1px solid rgba(123,47,255,0.4)', background: 'rgba(123,47,255,0.1)', color: 'var(--star-white)', cursor: 'pointer', fontSize: 12 }}>{loading ? 'Pausing...' : 'Pause Subscription'}</button>
                </div>
              )}
            </div>
            <button onClick={() => setStep('confirm')} style={{ width: '100%', padding: '11px', borderRadius: 10, border: '1px solid rgba(255,50,50,0.3)', background: 'rgba(255,50,50,0.05)', color: 'rgba(255,100,100,0.8)', cursor: 'pointer', fontSize: 13 }}>No thanks, cancel anyway</button>
          </>
        )}

        {/* Step 4 — Final confirm */}
        {step === 'confirm' && (
          <>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Final confirmation</div>
            <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 16, lineHeight: 1.6 }}>
              Your subscription will remain active until <strong style={{ color: 'var(--star-white)' }}>{accessDate}</strong>, then your account and all data for <strong style={{ color: 'var(--star-white)' }}>{biz.name}</strong> will be permanently deleted.
            </p>
            <div style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,50,50,0.07)', border: '1px solid rgba(255,50,50,0.25)', fontSize: 13, color: 'rgba(255,120,120,0.9)', marginBottom: 24, lineHeight: 1.6 }}>
              ⚠️ This cannot be undone. All ranking history, posts, and data will be deleted permanently.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--dim)', cursor: 'pointer', fontSize: 13 }}>Keep Subscription</button>
              <button onClick={() => handleAction('cancel')} disabled={loading} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid rgba(255,50,50,0.4)', background: 'rgba(255,50,50,0.1)', color: 'rgba(255,100,100,0.9)', cursor: 'pointer', fontSize: 13 }}>{loading ? 'Cancelling...' : 'Yes, Cancel Subscription'}</button>
            </div>
          </>
        )}

        {/* Offer accepted */}
        {step === 'offer_accepted' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>10% off applied!</div>
            <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 24 }}>Your discount has been applied to your next invoice. Thanks for staying!</p>
            <button onClick={onClose} className="btn-primary" style={{ fontSize: 13, padding: '11px 28px' }}>Back to Dashboard</button>
          </div>
        )}

        {/* Paused */}
        {step === 'paused' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏸️</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Subscription paused</div>
            <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 24 }}>You have full access until {accessDate}. We'll see you when you're ready.</p>
            <button onClick={onClose} className="btn-primary" style={{ fontSize: 13, padding: '11px 28px' }}>Got it</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Businesses() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)
  const [auditProgress, setAuditProgress] = useState(null)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    // Check if returning from successful Stripe checkout
    const params = new URLSearchParams(window.location.search)
    if (params.get('checkout') === 'success') {
      setCheckoutSuccess(true)
      // Poll for the business to be created by webhook, then run audits
      let attempts = 0
      const poll = setInterval(async () => {
        attempts++
        try {
          const res = await fetch('/api/businesses')
          const data = await res.json()
          const list = Array.isArray(data) ? data : []
          setBusinesses(list)
          // Find the newest business (just created by webhook)
          const newest = list[0]
          if (newest && attempts > 1) {
            clearInterval(poll)
            setCheckoutSuccess(false)
            // Run audits for all keywords
            const kws = newest.targetKeywords || []
            if (kws.length > 0) {
              setAuditProgress(kws.map(kw => ({ keyword: kw, done: false, error: false })))
              for (let i = 0; i < kws.length; i++) {
                try {
                  await fetch('/api/places/rank-audit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ businessId: newest.id, keyword: kws[i], gridSize: newest.gridSize || '7x7', spacing: newest.gridSpacing || 'medium' }),
                  })
                  setAuditProgress(prev => prev.map((p, j) => j === i ? { ...p, done: true } : p))
                } catch (e) {
                  setAuditProgress(prev => prev.map((p, j) => j === i ? { ...p, done: true, error: true } : p))
                }
              }
              fetch('/api/automation/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessId: newest.id }),
              }).catch(() => {})
            }
            // Clean URL
            window.history.replaceState({}, '', '/dashboard/businesses')
            setTimeout(() => setAuditProgress(null), 3000)
          }
        } catch (e) { console.error(e) }
        if (attempts > 20) clearInterval(poll) // stop after 40s
      }, 2000)
      setLoading(false)
      return () => clearInterval(poll)
    }

    fetch('/api/businesses')
      .then(r => r.json())
      .then(data => { setBusinesses(Array.isArray(data) ? data : []) })
      .catch(e => console.error('Failed to load businesses', e))
      .finally(() => setLoading(false))
  }, [])

  const filtered = businesses.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      {/* Checkout success overlay */}
      {(checkoutSuccess || auditProgress) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: 460, width: '100%', padding: '0 24px' }}>
            {checkoutSuccess && !auditProgress && (
              <>
                <div style={{ width: 36, height: 36, border: '3px solid rgba(123,47,255,0.3)', borderTopColor: 'var(--nebula-purple)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 24px' }} />
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Payment confirmed! 🎉</div>
                <p style={{ fontSize: 14, color: 'var(--dim)' }}>Setting up your business profile...</p>
              </>
            )}
            {auditProgress && (
              <>
                <div style={{ fontSize: 48, marginBottom: 24 }}>🔍</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                  {auditProgress.every(p => p.done) ? 'All done!' : 'Running First Audits'}
                </div>
                <p style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 32 }}>Scanning your ranking grid. Hang tight.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {auditProgress.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, background: 'rgba(232,238,255,0.03)', border: `1px solid ${p.done ? (p.error ? 'rgba(255,80,80,0.3)' : 'rgba(20,200,100,0.3)') : 'rgba(123,47,255,0.3)'}` }}>
                      <div style={{ width: 24, height: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {p.done ? <span style={{ fontSize: 16 }}>{p.error ? '❌' : '✅'}</span> : <div style={{ width: 18, height: 18, border: '2px solid rgba(123,47,255,0.3)', borderTopColor: 'var(--nebula-purple)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />}
                      </div>
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{p.keyword}</div>
                        <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 2 }}>{p.done ? (p.error ? 'Failed' : 'Complete') : 'Scanning...'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        </div>
      )}

      {cancelling && (
        <CancelModal
          biz={cancelling}
          onClose={() => setCancelling(null)}
          onCancelled={() => {
            setCancelling(null)
            // Refresh businesses list
            fetch('/api/businesses').then(r => r.json()).then(data => setBusinesses(Array.isArray(data) ? data : []))
          }}
        />
      )}

      {editing && (
        <EditModal
          biz={editing}
          onClose={() => setEditing(null)}
          onSaved={updated => {
            setBusinesses(bs => bs.map(b => b.id === updated.id ? { ...b, ...updated } : b))
            setEditing(null)
          }}
        />
      )}

      <div style={{ padding: '20px 36px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, background: 'rgba(6,6,18,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Businesses</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--dim)' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search businesses..."
              style={{ paddingLeft: 36, paddingRight: 16, paddingTop: 9, paddingBottom: 9, borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.04)', color: 'var(--star-white)', fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', width: 220 }} />
          </div>
          <Link href="/dashboard/businesses/add" className="btn-primary" style={{ fontSize: 11, padding: '10px 20px' }}>+ Add Business</Link>
        </div>
      </div>

      <div style={{ padding: '32px 36px', overflowX: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ width: 36, height: 36, border: '3px solid rgba(123,47,255,0.3)', borderTopColor: 'var(--nebula-purple)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {filtered.map((biz, i) => {
              const latestAudit = biz.rankAudits?.[biz.rankAudits.length - 1]
              return (
                <div key={i} style={{ borderRadius: 16, background: 'rgba(232,238,255,0.03)', border: '1px solid var(--border)', padding: '24px', transition: 'all 0.3s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(123,47,255,0.3)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg, rgba(123,47,255,0.3), rgba(0,200,255,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
                      {biz.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{biz.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--dim)', display: 'flex', alignItems: 'center', gap: 4 }}>📍 {biz.address || 'No address'}</div>
                    </div>
                    <div style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(20,200,100,0.1)', border: '1px solid rgba(20,200,100,0.3)', fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(20,200,100,0.9)' }}>
                      {biz.status?.toLowerCase() || 'active'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    {latestAudit && (
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 4 }}>Avg Rank</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--nebula-blue)' }}>{latestAudit.avgRank}</div>
                      </div>
                    )}
                    {biz.targetKeywords?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 4 }}>Keywords</div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {biz.targetKeywords.slice(0, 3).map((kw, j) => (
                            <span key={j} style={{ padding: '2px 8px', borderRadius: 10, background: 'rgba(123,47,255,0.1)', border: '1px solid rgba(123,47,255,0.2)', fontSize: 10, color: 'var(--nebula-purple)' }}>{kw}</span>
                          ))}
                          {biz.targetKeywords.length > 3 && <span style={{ padding: '2px 8px', borderRadius: 10, background: 'rgba(232,238,255,0.05)', fontSize: 10, color: 'var(--dim)' }}>+{biz.targetKeywords.length - 3}</span>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Billing status */}
                  {biz.cancelAtPeriodEnd && (
                    <div style={{ marginBottom: 10, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,184,48,0.08)', border: '1px solid rgba(255,184,48,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,184,48,0.9)' }}>⚠️ Cancels {biz.stripeCurrentPeriodEnd ? new Date(biz.stripeCurrentPeriodEnd).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : 'soon'}</span>
                      <button onClick={async () => {
                        const res = await fetch('/api/stripe/reactivate', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ businessId: biz.id }) })
                        if ((await res.json()).success) setBusinesses(bs => bs.map(b => b.id === biz.id ? { ...b, cancelAtPeriodEnd: false } : b))
                      }} style={{ fontSize: 11, color: 'var(--nebula-blue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Reactivate</button>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={() => setEditing(biz)}
                      style={{ flex: 1, minWidth: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13, color: 'var(--dim)', background: 'rgba(232,238,255,0.03)', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(123,47,255,0.3)'; e.currentTarget.style.color = 'var(--star-white)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--dim)' }}
                    >✏️ Edit</button>
                    <Link href="/dashboard/reports" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13, color: 'var(--nebula-blue)', background: 'rgba(0,200,255,0.05)', fontWeight: 500, transition: 'all 0.2s' }}>
                      Reports →
                    </Link>
                    <button onClick={() => setCancelling(biz)}
                      style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,50,50,0.2)', fontSize: 13, color: 'rgba(255,100,100,0.6)', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}
                      title="Cancel subscription"
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,50,50,0.4)'; e.currentTarget.style.color = 'rgba(255,100,100,0.9)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,50,50,0.2)'; e.currentTarget.style.color = 'rgba(255,100,100,0.6)' }}
                    >✕</button>
                  </div>
                </div>
              )
            })}

            <Link href="/dashboard/businesses/add" style={{ borderRadius: 16, background: 'transparent', border: '2px dashed rgba(232,238,255,0.1)', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, cursor: 'pointer', transition: 'all 0.3s', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(123,47,255,0.4)'; e.currentTarget.style.background = 'rgba(123,47,255,0.03)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(232,238,255,0.1)'; e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2px dashed rgba(123,47,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'var(--nebula-purple)', marginBottom: 12 }}>+</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dim)', marginBottom: 4 }}>Add a Business</div>
              <div style={{ fontSize: 12, color: 'var(--dim2)', textAlign: 'center' }}>Connect a Google Business Profile</div>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
