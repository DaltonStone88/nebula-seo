'use client'
import { useState, useEffect, useRef } from 'react'
import { useBusinessContext } from '../layout'

// ── Reusable sub-components ────────────────────────────────────────────────

function ImageUpload({ businessId, images, onImagesChange }) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef()

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('businessId', businessId)
      try {
        const res = await fetch('/api/automation/images', { method: 'POST', body: formData })
        const img = await res.json()
        if (!img.error) onImagesChange(prev => [...prev, img])
      } catch (e) { console.error(e) }
    }
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDelete = async (id) => {
    await fetch(`/api/automation/images?id=${id}`, { method: 'DELETE' })
    onImagesChange(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 12, marginBottom: 12 }}>
        {images.map((img, i) => (
          <div key={img.id} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', aspectRatio: '1' }}>
            <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: 4, left: 4, background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '2px 6px', fontSize: 10, color: '#fff' }}>#{i + 1}</div>
            <button onClick={() => handleDelete(img.id)} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,50,50,0.85)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>x</button>
          </div>
        ))}
        <div onClick={() => inputRef.current?.click()} style={{ borderRadius: 10, border: '2px dashed rgba(123,47,255,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', aspectRatio: '1', background: 'rgba(123,47,255,0.03)' }}>
          <span style={{ fontSize: 22, color: 'var(--nebula-purple)' }}>{uploading ? '...' : '+'}</span>
          <span style={{ fontSize: 11, color: 'var(--dim)' }}>{uploading ? 'Uploading...' : 'Add image'}</span>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: 'none' }} />
      <div style={{ fontSize: 11, color: 'var(--dim2)' }}>Images rotate across posts in order. You need at least one image to approve posts for publishing.</div>
    </div>
  )
}

function ContentSection({ businessId }) {
  const [offers, setOffers] = useState([])
  const [events, setEvents] = useState([])
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(null)
  const [form, setForm] = useState({})

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.04)', color: 'var(--star-white)', fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', fontSize: 11, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6, marginTop: 12 }
  const cardStyle = { borderRadius: 12, border: '1px solid var(--border)', padding: '14px', background: 'rgba(232,238,255,0.02)', marginBottom: 8 }

  useEffect(() => {
    fetch(`/api/automation/content?businessId=${businessId}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) { setOffers(data.offers || []); setEvents(data.events || []); setUpdates(data.updates || []) }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [businessId])

  const handleAdd = async () => {
    const res = await fetch('/api/automation/content', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: adding, businessId, ...form }),
    })
    const item = await res.json()
    if (!item.error) {
      if (adding === 'offer') setOffers(p => [item, ...p])
      if (adding === 'event') setEvents(p => [item, ...p])
      if (adding === 'update') setUpdates(p => [item, ...p])
      setAdding(null); setForm({})
    }
  }

  const handleDelete = async (type, id) => {
    await fetch(`/api/automation/content?type=${type}&id=${id}`, { method: 'DELETE' })
    if (type === 'offer') setOffers(p => p.filter(x => x.id !== id))
    if (type === 'event') setEvents(p => p.filter(x => x.id !== id))
    if (type === 'update') setUpdates(p => p.filter(x => x.id !== id))
  }

  const AddBtn = ({ type }) => (
    <button onClick={() => { setAdding(type); setForm({}) }} style={{ padding: '5px 14px', borderRadius: 8, border: '1px solid rgba(123,47,255,0.4)', background: 'rgba(123,47,255,0.1)', color: 'var(--star-white)', cursor: 'pointer', fontSize: 12 }}>+ Add</button>
  )
  const SaveCancel = ({ disabled }) => (
    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
      <button onClick={handleAdd} disabled={disabled} className="btn-primary" style={{ fontSize: 12, padding: '8px 18px' }}>Save</button>
      <button onClick={() => setAdding(null)} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--dim)', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
    </div>
  )

  if (loading) return <div style={{ color: 'var(--dim)', fontSize: 13 }}>Loading...</div>

  return (
    <div>
      {/* Offers */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>🏷️ Offers</div>
          <AddBtn type="offer" />
        </div>
        {adding === 'offer' && (
          <div style={{ ...cardStyle, border: '1px solid rgba(123,47,255,0.3)', marginBottom: 10 }}>
            <label style={labelStyle}>Title *</label>
            <input style={inputStyle} value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. 10% Off First Service" />
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the offer..." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><label style={labelStyle}>Coupon Code</label><input style={inputStyle} value={form.couponCode || ''} onChange={e => setForm(f => ({ ...f, couponCode: e.target.value }))} placeholder="SAVE10" /></div>
              <div><label style={labelStyle}>Redeem URL</label><input style={inputStyle} value={form.redeemUrl || ''} onChange={e => setForm(f => ({ ...f, redeemUrl: e.target.value }))} placeholder="https://..." /></div>
              <div><label style={labelStyle}>Start Date</label><input type="date" style={inputStyle} value={form.startDate || ''} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
              <div><label style={labelStyle}>End Date</label><input type="date" style={inputStyle} value={form.endDate || ''} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
            </div>
            <SaveCancel disabled={!form.title} />
          </div>
        )}
        {offers.length === 0 && adding !== 'offer' && <div style={{ fontSize: 12, color: 'var(--dim2)', padding: '6px 0' }}>No offers — AI will generate generic offer posts.</div>}
        {offers.map(o => (
          <div key={o.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{o.title}</div>
                {o.description && <div style={{ fontSize: 12, color: 'var(--dim)' }}>{o.description}</div>}
                <div style={{ fontSize: 11, color: 'var(--dim2)', marginTop: 3, display: 'flex', gap: 10 }}>
                  {o.couponCode && <span>Code: {o.couponCode}</span>}
                  {o.startDate && <span>{new Date(o.startDate).toLocaleDateString()} – {o.endDate ? new Date(o.endDate).toLocaleDateString() : 'ongoing'}</span>}
                </div>
              </div>
              <button onClick={() => handleDelete('offer', o.id)} style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>x</button>
            </div>
          </div>
        ))}
      </div>

      {/* Events */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>📅 Events</div>
          <AddBtn type="event" />
        </div>
        {adding === 'event' && (
          <div style={{ ...cardStyle, border: '1px solid rgba(123,47,255,0.3)', marginBottom: 10 }}>
            <label style={labelStyle}>Title *</label>
            <input style={inputStyle} value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Free Consultation Weekend" />
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the event..." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><label style={labelStyle}>Start Date</label><input type="date" style={inputStyle} value={form.startDate || ''} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
              <div><label style={labelStyle}>End Date</label><input type="date" style={inputStyle} value={form.endDate || ''} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
            </div>
            <SaveCancel disabled={!form.title} />
          </div>
        )}
        {events.length === 0 && adding !== 'event' && <div style={{ fontSize: 12, color: 'var(--dim2)', padding: '6px 0' }}>No events — AI will generate generic event posts.</div>}
        {events.map(ev => (
          <div key={ev.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{ev.title}</div>
                {ev.description && <div style={{ fontSize: 12, color: 'var(--dim)' }}>{ev.description}</div>}
                {(ev.startDate || ev.endDate) && <div style={{ fontSize: 11, color: 'var(--dim2)', marginTop: 3 }}>{ev.startDate ? new Date(ev.startDate).toLocaleDateString() : ''}{ev.endDate ? ` – ${new Date(ev.endDate).toLocaleDateString()}` : ''}</div>}
              </div>
              <button onClick={() => handleDelete('event', ev.id)} style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>x</button>
            </div>
          </div>
        ))}
      </div>

      {/* What's New */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>📝 What's New</div>
          <AddBtn type="update" />
        </div>
        {adding === 'update' && (
          <div style={{ ...cardStyle, border: '1px solid rgba(123,47,255,0.3)', marginBottom: 10 }}>
            <label style={labelStyle}>Title (optional)</label>
            <input style={inputStyle} value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. New Service Added" />
            <label style={labelStyle}>Content *</label>
            <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} value={form.content || ''} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="e.g. We now offer emergency same-day service..." />
            <SaveCancel disabled={!form.content} />
          </div>
        )}
        {updates.length === 0 && adding !== 'update' && <div style={{ fontSize: 12, color: 'var(--dim2)', padding: '6px 0' }}>No updates — AI will use keywords and cities only.</div>}
        {updates.map(u => (
          <div key={u.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                {u.title && <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{u.title}</div>}
                <div style={{ fontSize: 12, color: 'var(--dim)' }}>{u.content}</div>
              </div>
              <button onClick={() => handleDelete('update', u.id)} style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 14, marginLeft: 10, flexShrink: 0 }}>x</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function BusinessSettings() {
  const { selectedBiz, setSelectedBiz } = useBusinessContext()
  const [tab, setTab] = useState('general')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [images, setImages] = useState([])

  const [form, setForm] = useState({ name: '', address: '', phone: '', website: '', category: '', gridSize: '7x7', gridSpacing: 'medium' })
  const [keywords, setKeywords] = useState(['', ''])
  const [cities, setCities] = useState(['', '', '', '', '', '', ''])
  const [reportSettings, setReportSettings] = useState({ sendReports: false, reportEmail: '', reportFrequency: 'monthly' })

  useEffect(() => {
    if (!selectedBiz) return
    setForm({
      name: selectedBiz.name || '', address: selectedBiz.address || '',
      phone: selectedBiz.phone || '', website: selectedBiz.website || '',
      category: selectedBiz.category || '', gridSize: selectedBiz.gridSize || '7x7',
      gridSpacing: selectedBiz.gridSpacing || 'medium',
    })
    const kws = [...(selectedBiz.targetKeywords || [])]
    while (kws.length < 2) kws.push('')
    setKeywords(kws)
    const cs = [...(selectedBiz.targetCities || [])]
    while (cs.length < 7) cs.push('')
    setCities(cs)
  }, [selectedBiz?.id])

  useEffect(() => {
    if (!selectedBiz?.id) return
    fetch(`/api/automation/images?businessId=${selectedBiz.id}`)
      .then(r => r.json())
      .then(data => setImages(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [selectedBiz?.id])

  const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.04)', color: 'var(--star-white)', fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }
  const labelStyle = { display: 'block', fontSize: 11, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }
  const sectionStyle = { padding: '24px', borderRadius: 14, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)', marginBottom: 20 }

  const handleSave = async () => {
    if (!selectedBiz) return
    setSaving(true)
    const res = await fetch('/api/businesses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: selectedBiz.id, ...form,
        targetKeywords: keywords.map(k => k.trim()).filter(Boolean),
        targetCities: cities.map(c => c.trim()).filter(Boolean),
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (!data.error) {
      const updated = data.business || data
      setSelectedBiz(prev => ({ ...prev, ...updated }))
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: '🏢' },
    { id: 'automation', label: 'Automation', icon: '⚡' },
    { id: 'reports', label: 'Reports & Audits', icon: '📊' },
  ]

  if (!selectedBiz) return (
    <div>
      <div style={{ minHeight: 72, padding: '0 36px', borderBottom: '1px solid var(--border)', background: 'rgba(6,6,18,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Business Settings</h1>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', textAlign: 'center', padding: '0 40px' }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>🏢</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 10 }}>No Business Selected</div>
        <p style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 28, maxWidth: 360, lineHeight: 1.7 }}>Add a business to manage its keywords, cities, automation content, and report settings.</p>
        <a href="/dashboard/businesses/add" className="btn-primary" style={{ fontSize: 13, padding: '12px 28px', textDecoration: 'none' }}>+ Add Your First Business</a>
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ padding: '20px 36px', borderBottom: '1px solid var(--border)', background: 'rgba(6,6,18,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50, , display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Business Settings</h1>
          <div style={{ fontSize: 13, color: 'var(--dim)' }}>{selectedBiz.name}</div>
        </div>
        {tab === 'general' && (
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ fontSize: 12, padding: '9px 24px' }}>
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
          </button>
        )}
      </div>

      <div style={{ padding: '32px 36px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 28 }}>
        {/* Sidebar */}
        <div style={{ borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)', padding: '10px', height: 'fit-content' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '11px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: tab === t.id ? 'rgba(123,47,255,0.15)' : 'transparent',
              color: tab === t.id ? 'var(--star-white)' : 'var(--dim)',
              fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
              fontFamily: 'var(--font-body)', textAlign: 'left', transition: 'all 0.2s',
              borderLeft: tab === t.id ? '2px solid var(--nebula-purple)' : '2px solid transparent',
              marginBottom: 2,
            }}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)', padding: '32px' }}>

          {/* GENERAL */}
          {tab === 'general' && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 28 }}>General Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Business Name</label>
                  <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = 'rgba(123,47,255,0.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Address</label>
                  <input style={inputStyle} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = 'rgba(123,47,255,0.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input style={inputStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = 'rgba(123,47,255,0.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <div>
                  <label style={labelStyle}>Website</label>
                  <input style={inputStyle} value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = 'rgba(123,47,255,0.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <div>
                  <label style={labelStyle}>Category</label>
                  <input style={inputStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = 'rgba(123,47,255,0.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 28, marginBottom: 28 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Target Keywords</h3>
                <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 18, lineHeight: 1.6 }}>Used for rank tracking and AI content. You can change each keyword once every 30 days.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {keywords.map((kw, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(123,47,255,0.15)', border: '1px solid rgba(123,47,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--nebula-purple)', flexShrink: 0 }}>{i + 1}</div>
                      <input value={kw} onChange={e => { const k = [...keywords]; k[i] = e.target.value; setKeywords(k) }}
                        placeholder={i === 0 ? 'e.g. plumbing repair' : 'e.g. drain cleaning'}
                        style={{ ...inputStyle, flex: 1 }}
                        onFocus={e => e.target.style.borderColor = 'rgba(123,47,255,0.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 28 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Target Cities</h3>
                <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 18, lineHeight: 1.6 }}>Up to 7 cities for hyper-local content and rank tracking. These are also used as the service area in your reports.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {cities.map((city, i) => (
                    <input key={i} value={city} onChange={e => { const c = [...cities]; c[i] = e.target.value; setCities(c) }}
                      placeholder={`City ${i + 1}`} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'rgba(123,47,255,0.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* AUTOMATION */}
          {tab === 'automation' && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Automation Settings</h2>
              <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 28, lineHeight: 1.6 }}>Add offers, events, and updates to give the AI context when generating posts. Upload images that will rotate across all generated posts.</p>

              <div style={sectionStyle}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Post Content</div>
                <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 20, lineHeight: 1.6 }}>The more context you provide, the more specific and effective your posts will be. If left blank, the AI generates posts using only your keywords and cities.</p>
                <ContentSection businessId={selectedBiz.id} />
              </div>

              <div style={sectionStyle}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Image Library</div>
                <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 20, lineHeight: 1.6 }}>Upload images to use in your GBP posts. Images are assigned in rotation. You must have at least one image to approve posts for publishing.</p>
                <ImageUpload businessId={selectedBiz.id} images={images} onImagesChange={setImages} />
              </div>

              <div style={sectionStyle}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Review Responses</div>
                <div style={{ fontSize: 13, color: 'var(--dim)', lineHeight: 1.6 }}>AI-drafted review responses require your Google Business Profile to be connected. Drafts will require approval before sending.</div>
                <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,184,48,0.06)', border: '1px solid rgba(255,184,48,0.2)', fontSize: 12, color: 'rgba(255,184,48,0.8)' }}>⏳ Waiting for GBP API approval</div>
              </div>
            </>
          )}

          {/* REPORTS & AUDITS */}
          {tab === 'reports' && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Reports & Audits</h2>
              <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 28, lineHeight: 1.6 }}>Configure how reports are generated and delivered, and set up your rank audit grid.</p>

              {/* Service area note */}
              <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(0,200,255,0.05)', border: '1px solid rgba(0,200,255,0.15)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
                <span style={{ fontSize: 18 }}>📍</span>
                <span style={{ color: 'var(--dim)' }}>Your service area (cities and keywords) is configured in <a href="#" onClick={e => { e.preventDefault(); document.querySelector('[data-tab="general"]')?.click(); setTab('general') }} style={{ color: 'var(--nebula-blue)' }}>General Settings</a>. Changes there will affect both reports and rank audits.</span>
              </div>

              <div style={sectionStyle}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Rank Audit Grid</div>
                <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 18, lineHeight: 1.6 }}>Configure the grid used when running rank audits. This controls how many points are checked across your service area.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Grid Size</label>
                    <select style={{ ...inputStyle, background: 'rgba(6,6,18,0.8)' }} value={form.gridSize} onChange={e => setForm(f => ({ ...f, gridSize: e.target.value }))}>
                      {['5x5','7x7','10x10','15x15','20x20'].map(s => <option key={s} value={s}>{s} ({parseInt(s)**2} points)</option>)}
                    </select>
                    <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 6 }}>Larger grids give more detail but take longer</div>
                  </div>
                  <div>
                    <label style={labelStyle}>Grid Spacing</label>
                    <select style={{ ...inputStyle, background: 'rgba(6,6,18,0.8)' }} value={form.gridSpacing} onChange={e => setForm(f => ({ ...f, gridSpacing: e.target.value }))}>
                      <option value="small">Tight (~0.35 mi) — dense urban</option>
                      <option value="medium">Standard (~0.6 mi) — most businesses</option>
                      <option value="large">Regional (~1 mi) — large service area</option>
                    </select>
                    <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 6 }}>Match to your typical service radius</div>
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ fontSize: 12, padding: '9px 22px' }}>
                    {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Grid Settings'}
                  </button>
                </div>
              </div>

              <div style={sectionStyle}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Audit Schedule</div>
                <div style={{ fontSize: 13, color: 'var(--dim)', lineHeight: 1.6, marginBottom: 14 }}>Rank audits run automatically every 30 days. You can also run them manually from the Reports tab at any time.</div>
                <a href="/dashboard/reports" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(0,200,255,0.3)', background: 'rgba(0,200,255,0.06)', color: 'var(--nebula-blue)', fontSize: 13, textDecoration: 'none' }}>Go to Reports →</a>
              </div>

              <div style={sectionStyle}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Automated Report Delivery</div>
                <div style={{ fontSize: 13, color: 'var(--dim)', lineHeight: 1.6, marginBottom: 14 }}>Automatically send PDF reports to your client after each monthly audit.</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 14 }}>
                  <input type="checkbox" checked={reportSettings.sendReports} onChange={e => setReportSettings(s => ({ ...s, sendReports: e.target.checked }))} style={{ width: 16, height: 16, accentColor: 'var(--nebula-purple)' }} />
                  <span style={{ fontSize: 13 }}>Send reports automatically after each audit</span>
                </label>
                {reportSettings.sendReports && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Client Email</label>
                      <input type="email" style={inputStyle} value={reportSettings.reportEmail} onChange={e => setReportSettings(s => ({ ...s, reportEmail: e.target.value }))} placeholder="client@email.com"
                        onFocus={e => e.target.style.borderColor = 'rgba(123,47,255,0.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Frequency</label>
                      <select style={{ ...inputStyle, background: 'rgba(6,6,18,0.8)' }} value={reportSettings.reportFrequency} onChange={e => setReportSettings(s => ({ ...s, reportFrequency: e.target.value }))}>
                        <option value="monthly">Monthly (after each audit)</option>
                        <option value="weekly">Weekly summary</option>
                      </select>
                    </div>
                  </div>
                )}
                <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,184,48,0.06)', border: '1px solid rgba(255,184,48,0.2)', fontSize: 12, color: 'rgba(255,184,48,0.8)' }}>
                  ⏳ Email delivery requires email provider setup (coming soon)
                </div>
              </div>

              <div style={sectionStyle}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>White Label Reports</div>
                <div style={{ fontSize: 13, color: 'var(--dim)', lineHeight: 1.6, marginBottom: 14 }}>Brand reports with your agency name. Configure your agency name and logo in Account Settings.</div>
                <a href="/dashboard/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(123,47,255,0.3)', background: 'rgba(123,47,255,0.08)', color: 'var(--star-white)', fontSize: 13, textDecoration: 'none' }}>Account Settings →</a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
