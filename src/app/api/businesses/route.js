'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
  const [warnings, setWarnings] = useState([]) // per-keyword warnings
  const [confirmed, setConfirmed] = useState({}) // which warnings user confirmed

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

    onSaved(data.business)

    // If new keywords added or keywords changed, trigger audits and redirect
    if (data.needsAudit) {
      router.push('/dashboard/reports?tab=heatmap')
    }
  }

  const changedCount = keywords.filter((_, i) => getKeywordState(i) === 'changed').length
  const addedCount   = keywords.filter((_, i) => getKeywordState(i) === 'new').length
  const allChangesConfirmed = keywords.every((_, i) => getKeywordState(i) !== 'changed' || confirmed[i])

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

export default function Businesses() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    fetch('/api/businesses')
      .then(r => r.json())
      .then(data => { setBusinesses(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const filtered = businesses.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
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

      <div style={{ padding: '20px 36px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(6,6,18,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
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

      <div style={{ padding: '32px 36px' }}>
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

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setEditing(biz)}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13, color: 'var(--dim)', background: 'rgba(232,238,255,0.03)', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(123,47,255,0.3)'; e.currentTarget.style.color = 'var(--star-white)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--dim)' }}
                    >✏️ Edit</button>
                    <Link href="/dashboard/reports" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13, color: 'var(--nebula-blue)', background: 'rgba(0,200,255,0.05)', fontWeight: 500, transition: 'all 0.2s' }}>
                      Reports →
                    </Link>
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
