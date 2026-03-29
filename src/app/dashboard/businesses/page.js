'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

function EditModal({ biz, onClose, onSave }) {
  const [form, setForm] = useState({
    name: biz.name || '',
    address: biz.address || '',
    phone: biz.phone || '',
    website: biz.website || '',
    category: biz.category || '',
    targetKeywords: (biz.targetKeywords || []).join(', '),
    targetCities: (biz.targetCities || []).join(', '),
    gridSize: biz.gridSize || '7x7',
  })
  const [saving, setSaving] = useState(false)

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.04)', color: 'var(--star-white)', fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', fontSize: 11, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      id: biz.id,
      name: form.name,
      address: form.address,
      phone: form.phone,
      website: form.website,
      category: form.category,
      targetKeywords: form.targetKeywords.split(',').map(k => k.trim()).filter(Boolean),
      targetCities: form.targetCities.split(',').map(c => c.trim()).filter(Boolean),
      gridSize: form.gridSize,
    }
    const res = await fetch('/api/businesses', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const updated = await res.json()
    setSaving(false)
    if (!updated.error) onSave(updated)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: 'rgba(10,10,28,0.98)', border: '1px solid var(--border)', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Edit Business</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--dim)', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Business Name</label>
            <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Address</label>
            <input style={inputStyle} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Website</label>
            <input style={inputStyle} value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <input style={inputStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Grid Size</label>
            <select style={{ ...inputStyle }} value={form.gridSize} onChange={e => setForm(f => ({ ...f, gridSize: e.target.value }))}>
              {['5x5','7x7','10x10','15x15','20x20'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Target Keywords <span style={{ color: 'var(--dim2)', textTransform: 'none', letterSpacing: 0 }}>(comma separated)</span></label>
            <input style={inputStyle} value={form.targetKeywords} onChange={e => setForm(f => ({ ...f, targetKeywords: e.target.value }))} placeholder="plumber near me, emergency plumber..." />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Target Cities <span style={{ color: 'var(--dim2)', textTransform: 'none', letterSpacing: 0 }}>(comma separated)</span></label>
            <input style={inputStyle} value={form.targetCities} onChange={e => setForm(f => ({ ...f, targetCities: e.target.value }))} placeholder="St. Louis, O'Fallon, Chesterfield..." />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={onClose} style={{ padding: '10px 24px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--dim)', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ padding: '10px 24px', fontSize: 13 }}>
            {saving ? 'Saving...' : 'Save Changes'}
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

  const load = () => {
    fetch('/api/businesses')
      .then(r => r.json())
      .then(data => { setBusinesses(Array.isArray(data) ? data : []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const filtered = businesses.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      {editing && (
        <EditModal
          biz={editing}
          onClose={() => setEditing(null)}
          onSave={updated => {
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
                    <button
                      onClick={() => setEditing(biz)}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13, color: 'var(--dim)', background: 'rgba(232,238,255,0.03)', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(123,47,255,0.3)'; e.currentTarget.style.color = 'var(--star-white)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--dim)' }}
                    >
                      ✏️ Edit
                    </button>
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
