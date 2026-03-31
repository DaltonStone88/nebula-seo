'use client'
import { useState, useEffect, useRef } from 'react'
import { useBusinessContext } from '../layout'

const POST_TYPE_LABELS = { WHATS_NEW: "What's New", OFFER: 'Offer', EVENT: 'Event' }
const POST_TYPE_ICONS = { WHATS_NEW: '📝', OFFER: '🏷️', EVENT: '📅' }
const POST_TYPE_COLORS = {
  WHATS_NEW: 'rgba(0,200,255,0.15)',
  OFFER: 'rgba(255,184,48,0.15)',
  EVENT: 'rgba(123,47,255,0.15)',
}

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
    inputRef.current.value = ''
  }

  const handleDelete = async (id) => {
    await fetch(`/api/automation/images?id=${id}`, { method: 'DELETE' })
    onImagesChange(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, marginBottom: 12 }}>
        {images.map((img, i) => (
          <div key={img.id} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', aspectRatio: '1' }}>
            <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: 4, left: 4, background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '2px 6px', fontSize: 10, color: '#fff' }}>#{i + 1}</div>
            <button onClick={() => handleDelete(img.id)} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,50,50,0.8)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>x</button>
          </div>
        ))}
        <div onClick={() => inputRef.current.click()} style={{ borderRadius: 10, border: '2px dashed rgba(123,47,255,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', aspectRatio: '1', background: 'rgba(123,47,255,0.03)' }}>
          <span style={{ fontSize: 24, color: 'var(--nebula-purple)' }}>{uploading ? '...' : '+'}</span>
          <span style={{ fontSize: 11, color: 'var(--dim)' }}>{uploading ? 'Uploading...' : 'Add image'}</span>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: 'none' }} />
      <div style={{ fontSize: 11, color: 'var(--dim2)' }}>Images rotate across posts. Upload at least one to enable publishing.</div>
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
  const labelStyle = { display: 'block', fontSize: 11, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6, marginTop: 14 }
  const cardStyle = { borderRadius: 12, border: '1px solid var(--border)', padding: '16px', background: 'rgba(232,238,255,0.02)', marginBottom: 10 }

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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

  if (loading) return <div style={{ color: 'var(--dim)', fontSize: 13 }}>Loading...</div>

  const AddBtn = ({ type }) => (
    <button onClick={() => { setAdding(type); setForm({}) }} style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid rgba(123,47,255,0.4)', background: 'rgba(123,47,255,0.1)', color: 'var(--star-white)', cursor: 'pointer', fontSize: 12 }}>+ Add</button>
  )

  const SaveCancel = ({ disabled }) => (
    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
      <button onClick={handleAdd} disabled={disabled} className="btn-primary" style={{ fontSize: 12, padding: '8px 20px' }}>Save</button>
      <button onClick={() => setAdding(null)} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--dim)', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
    </div>
  )

  return (
    <div>
      {/* Offers */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>🏷️ Offers</div>
          <AddBtn type="offer" />
        </div>
        {adding === 'offer' && (
          <div style={{ ...cardStyle, border: '1px solid rgba(123,47,255,0.3)', marginBottom: 12 }}>
            <label style={labelStyle}>Title *</label>
            <input style={inputStyle} value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. 10% Off First Service" />
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the offer..." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>Coupon Code</label><input style={inputStyle} value={form.couponCode || ''} onChange={e => setForm(f => ({ ...f, couponCode: e.target.value }))} placeholder="SAVE10" /></div>
              <div><label style={labelStyle}>Redeem URL</label><input style={inputStyle} value={form.redeemUrl || ''} onChange={e => setForm(f => ({ ...f, redeemUrl: e.target.value }))} placeholder="https://..." /></div>
              <div><label style={labelStyle}>Start Date</label><input type="date" style={inputStyle} value={form.startDate || ''} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
              <div><label style={labelStyle}>End Date</label><input type="date" style={inputStyle} value={form.endDate || ''} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
            </div>
            <SaveCancel disabled={!form.title} />
          </div>
        )}
        {offers.length === 0 && adding !== 'offer' && <div style={{ fontSize: 12, color: 'var(--dim2)', padding: '10px 0' }}>No offers — AI will generate generic offer posts.</div>}
        {offers.map(o => (
          <div key={o.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{o.title}</div>
                {o.description && <div style={{ fontSize: 12, color: 'var(--dim)' }}>{o.description}</div>}
                <div style={{ fontSize: 11, color: 'var(--dim2)', marginTop: 4, display: 'flex', gap: 12 }}>
                  {o.couponCode && <span>Code: {o.couponCode}</span>}
                  {o.startDate && <span>{new Date(o.startDate).toLocaleDateString()} - {o.endDate ? new Date(o.endDate).toLocaleDateString() : 'ongoing'}</span>}
                </div>
              </div>
              <button onClick={() => handleDelete('offer', o.id)} style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 14 }}>x</button>
            </div>
          </div>
        ))}
      </div>

      {/* Events */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>📅 Events</div>
          <AddBtn type="event" />
        </div>
        {adding === 'event' && (
          <div style={{ ...cardStyle, border: '1px solid rgba(123,47,255,0.3)', marginBottom: 12 }}>
            <label style={labelStyle}>Title *</label>
            <input style={inputStyle} value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Free Consultation Weekend" />
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the event..." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>Start Date</label><input type="date" style={inputStyle} value={form.startDate || ''} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
              <div><label style={labelStyle}>End Date</label><input type="date" style={inputStyle} value={form.endDate || ''} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
            </div>
            <SaveCancel disabled={!form.title} />
          </div>
        )}
        {events.length === 0 && adding !== 'event' && <div style={{ fontSize: 12, color: 'var(--dim2)', padding: '10px 0' }}>No events — AI will generate generic event posts.</div>}
        {events.map(ev => (
          <div key={ev.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{ev.title}</div>
                {ev.description && <div style={{ fontSize: 12, color: 'var(--dim)' }}>{ev.description}</div>}
                {(ev.startDate || ev.endDate) && <div style={{ fontSize: 11, color: 'var(--dim2)', marginTop: 4 }}>{ev.startDate ? new Date(ev.startDate).toLocaleDateString() : ''}{ev.endDate ? ` - ${new Date(ev.endDate).toLocaleDateString()}` : ''}</div>}
              </div>
              <button onClick={() => handleDelete('event', ev.id)} style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 14 }}>x</button>
            </div>
          </div>
        ))}
      </div>

      {/* What's New */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>📝 What's New</div>
          <AddBtn type="update" />
        </div>
        {adding === 'update' && (
          <div style={{ ...cardStyle, border: '1px solid rgba(123,47,255,0.3)', marginBottom: 12 }}>
            <label style={labelStyle}>Title (optional)</label>
            <input style={inputStyle} value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. New Service Added" />
            <label style={labelStyle}>Content *</label>
            <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} value={form.content || ''} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="e.g. We now offer emergency same-day service..." />
            <SaveCancel disabled={!form.content} />
          </div>
        )}
        {updates.length === 0 && adding !== 'update' && <div style={{ fontSize: 12, color: 'var(--dim2)', padding: '10px 0' }}>No updates — AI will use keywords and cities only.</div>}
        {updates.map(u => (
          <div key={u.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                {u.title && <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{u.title}</div>}
                <div style={{ fontSize: 12, color: 'var(--dim)' }}>{u.content}</div>
              </div>
              <button onClick={() => handleDelete('update', u.id)} style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 14, marginLeft: 12, flexShrink: 0 }}>x</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PostCard({ post, images: initialImages, onUpdate, onDelete, businessId }) {
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(post.content)
  const [selectedImage, setSelectedImage] = useState(post.imageUrl)
  const [saving, setSaving] = useState(false)
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [images, setImages] = useState(initialImages)
  const [uploading, setUploading] = useState(false)
  const uploadRef = useRef()

  // Keep images in sync when parent updates
  useEffect(() => { setImages(initialImages) }, [initialImages])

  const handleApprove = async () => {
    setSaving(true)
    const res = await fetch('/api/automation/posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: post.id, status: 'APPROVED', content, imageUrl: selectedImage }),
    })
    const updated = await res.json()
    if (!updated.error) onUpdate(updated)
    setSaving(false); setEditing(false)
  }

  const handleSaveChanges = async () => {
    setSaving(true)
    const res = await fetch('/api/automation/posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: post.id, content, imageUrl: selectedImage }),
    })
    const updated = await res.json()
    if (!updated.error) onUpdate(updated)
    setSaving(false); setEditing(false)
  }

  const handleReject = async () => {
    await fetch('/api/automation/posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: post.id, status: 'REJECTED' }),
    })
    onDelete(post.id)
  }

  const handleUploadNew = async (e) => {
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
        if (!img.error) {
          setImages(prev => [...prev, img])
          setSelectedImage(img.url)
        }
      } catch (e) { console.error(e) }
    }
    setUploading(false)
    setShowImagePicker(false)
    if (uploadRef.current) uploadRef.current.value = ''
  }

  const hasImage = !!selectedImage
  const scheduledDate = post.scheduledFor ? new Date(post.scheduledFor).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''

  return (
    <div style={{ borderRadius: 16, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.02)', overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(6,6,18,0.4)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: POST_TYPE_COLORS[post.postType], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{POST_TYPE_ICONS[post.postType]}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{POST_TYPE_LABELS[post.postType]}</div>
          <div style={{ fontSize: 11, color: 'var(--dim)' }}>{post.keyword} · {post.city}{scheduledDate ? ` · ${scheduledDate}` : ''}</div>
        </div>
        {!hasImage && <div style={{ padding: '4px 10px', borderRadius: 20, background: 'rgba(255,100,50,0.1)', border: '1px solid rgba(255,100,50,0.3)', fontSize: 11, color: 'rgba(255,150,100,0.9)' }}>No image</div>}
      </div>

      <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 160px', gap: 20 }}>
        <div>
          {editing
            ? <textarea value={content} onChange={e => setContent(e.target.value)} style={{ width: '100%', minHeight: 140, padding: '12px', borderRadius: 10, border: '1px solid rgba(123,47,255,0.4)', background: 'rgba(232,238,255,0.04)', color: 'var(--star-white)', fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            : <p style={{ fontSize: 13, color: 'var(--dim)', lineHeight: 1.7, margin: 0 }}>{content}</p>
          }
          {post.postType === 'OFFER' && post.offerTitle && (
            <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,184,48,0.07)', border: '1px solid rgba(255,184,48,0.2)', fontSize: 12 }}>
              <span style={{ color: 'rgba(255,184,48,0.9)', fontWeight: 600 }}>Offer: </span>
              <span style={{ color: 'var(--dim)' }}>{post.offerTitle}</span>
              {post.offerCode && <span style={{ color: 'var(--nebula-blue)', marginLeft: 8 }}>Code: {post.offerCode}</span>}
            </div>
          )}
          {post.postType === 'EVENT' && post.eventTitle && (
            <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(123,47,255,0.07)', border: '1px solid rgba(123,47,255,0.2)', fontSize: 12 }}>
              <span style={{ color: 'var(--nebula-purple)', fontWeight: 600 }}>Event: </span>
              <span style={{ color: 'var(--dim)' }}>{post.eventTitle}</span>
              {post.eventStart && <span style={{ color: 'var(--dim2)', marginLeft: 8 }}>{new Date(post.eventStart).toLocaleDateString()}</span>}
            </div>
          )}
        </div>

        <div>
          {selectedImage
            ? <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={selectedImage} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                <button onClick={() => setShowImagePicker(true)} style={{ position: 'absolute', bottom: 6, right: 6, padding: '4px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', fontSize: 11, cursor: 'pointer' }}>Change</button>
              </div>
            : <div onClick={() => setShowImagePicker(true)} style={{ borderRadius: 10, border: '2px dashed rgba(255,100,50,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', aspectRatio: '1', background: 'rgba(255,100,50,0.03)' }}>
                <span style={{ fontSize: 24 }}>🖼️</span>
                <span style={{ fontSize: 11, color: 'rgba(255,150,100,0.8)', textAlign: 'center' }}>Add image</span>
              </div>
          }
        </div>
      </div>

      {/* Image Picker Modal */}
      {showImagePicker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => { if (e.target === e.currentTarget) setShowImagePicker(false) }}>
          <div style={{ background: 'rgba(10,10,28,0.99)', border: '1px solid var(--border)', borderRadius: 20, padding: 28, maxWidth: 520, width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Select Image</div>
            <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 20 }}>Choose from your library or upload a new image.</div>

            {/* Upload new */}
            <div
              onClick={() => uploadRef.current?.click()}
              style={{ borderRadius: 12, border: '2px dashed rgba(123,47,255,0.4)', padding: '18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', background: 'rgba(123,47,255,0.04)', marginBottom: 20, transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(123,47,255,0.7)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(123,47,255,0.4)'}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(123,47,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {uploading ? '⏳' : '⬆️'}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{uploading ? 'Uploading...' : 'Upload new image'}</div>
                <div style={{ fontSize: 11, color: 'var(--dim)' }}>JPG, PNG, WebP — added to your library</div>
              </div>
            </div>
            <input ref={uploadRef} type="file" accept="image/*" multiple onChange={handleUploadNew} style={{ display: 'none' }} />

            {/* Existing images */}
            {images.length > 0 && (
              <>
                <div style={{ fontSize: 11, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Your Library ({images.length})</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {images.map(img => (
                    <div key={img.id} onClick={() => { setSelectedImage(img.url); setShowImagePicker(false) }}
                      style={{ borderRadius: 10, overflow: 'hidden', border: `2px solid ${selectedImage === img.url ? 'var(--nebula-purple)' : 'var(--border)'}`, cursor: 'pointer', aspectRatio: '1', position: 'relative', transition: 'border-color 0.2s' }}>
                      <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {selectedImage === img.url && (
                        <div style={{ position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: '50%', background: 'var(--nebula-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>✓</div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {images.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--dim)', fontSize: 13 }}>
                No images in your library yet. Upload one above.
              </div>
            )}

            <button onClick={() => setShowImagePicker(false)} style={{ marginTop: 20, padding: '9px 20px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--dim)', cursor: 'pointer', fontSize: 12, width: '100%' }}>Close</button>
          </div>
        </div>
      )}

      <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(6,6,18,0.3)' }}>
        {editing ? (
          <>
            <button onClick={handleSaveChanges} disabled={saving} className="btn-primary" style={{ fontSize: 12, padding: '8px 20px' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
            <button onClick={() => { setEditing(false); setContent(post.content) }} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--dim)', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
          </>
        ) : (
          <>
            <button onClick={handleApprove} disabled={saving || !hasImage} className="btn-primary" style={{ fontSize: 12, padding: '8px 20px' }} title={!hasImage ? 'Add an image first' : ''}>{saving ? '...' : 'Approve'}</button>
            <button onClick={() => setEditing(true)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.04)', color: 'var(--star-white)', cursor: 'pointer', fontSize: 12 }}>Edit</button>
            <button onClick={handleReject} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,50,50,0.3)', background: 'rgba(255,50,50,0.05)', color: 'rgba(255,100,100,0.8)', cursor: 'pointer', fontSize: 12 }}>Reject</button>
            {!hasImage && <span style={{ fontSize: 11, color: 'rgba(255,150,100,0.8)' }}>Add an image to approve this post</span>}
          </>
        )}
      </div>
    </div>
  )
}

export default function Automation() {
  const { selectedBiz } = useBusinessContext()
  const [tab, setTab] = useState('queue')
  const [posts, setPosts] = useState([])
  const [approvedPosts, setApprovedPosts] = useState([])
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedBiz?.id) { setLoading(false); return }
    loadData()
  }, [selectedBiz?.id])

  // Also reload when tab becomes visible (handles navigation back from add business)
  useEffect(() => {
    const onFocus = () => { if (selectedBiz?.id) loadData() }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [selectedBiz?.id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [postsRes, approvedRes, imagesRes] = await Promise.all([
        fetch(`/api/automation/posts?businessId=${selectedBiz.id}&status=PENDING`),
        fetch(`/api/automation/posts?businessId=${selectedBiz.id}&status=APPROVED`),
        fetch(`/api/automation/images?businessId=${selectedBiz.id}`),
      ])
      const [postsData, approvedData, imagesData] = await Promise.all([
        postsRes.json(), approvedRes.json(), imagesRes.json(),
      ])
      setPosts(Array.isArray(postsData) ? postsData : [])
      setApprovedPosts(Array.isArray(approvedData) ? approvedData : [])
      setImages(Array.isArray(imagesData) ? imagesData : [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const tabStyle = (t) => ({
    padding: '8px 20px', borderRadius: 20,
    border: tab === t ? '1px solid rgba(123,47,255,0.5)' : '1px solid var(--border)',
    background: tab === t ? 'rgba(123,47,255,0.15)' : 'transparent',
    color: tab === t ? 'var(--star-white)' : 'var(--dim)',
    fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)',
  })

  if (!selectedBiz) return (
    <div>
      <div style={{ padding: '22px 36px', borderBottom: '1px solid var(--border)', background: 'rgba(6,6,18,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50, minHeight: 76 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Automation</h1>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', textAlign: 'center', padding: '0 40px' }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>⚡</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 10 }}>No Business Selected</div>
        <p style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 28, maxWidth: 360, lineHeight: 1.7 }}>Add a business to start generating AI-powered Google Business Profile posts automatically each month.</p>
        <a href="/dashboard/businesses/add" className="btn-primary" style={{ fontSize: 13, padding: '12px 28px', textDecoration: 'none' }}>+ Add Your First Business</a>
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ padding: '22px 36px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(6,6,18,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50, minHeight: 76 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Automation</h1>
          <div style={{ fontSize: 13, color: 'var(--dim)' }}>{selectedBiz.name}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={tabStyle('queue')} onClick={() => setTab('queue')}>
              Queue {posts.length > 0 && <span style={{ marginLeft: 6, padding: '1px 7px', borderRadius: 10, background: 'rgba(123,47,255,0.3)', fontSize: 11 }}>{posts.length}</span>}
            </button>
            <button style={tabStyle('history')} onClick={() => setTab('history')}>History</button>
          </div>
        </div>
      </div>

      <div style={{ padding: '32px 36px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ width: 36, height: 36, border: '3px solid rgba(123,47,255,0.3)', borderTopColor: 'var(--nebula-purple)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : tab === 'queue' ? (
          posts.length === 0
            ? <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 10 }}>No Posts Pending Approval</div>
                <p style={{ fontSize: 14, color: 'var(--dim)', maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>Your AI posts are generated automatically each month. Add offers, events, and images in <a href="/dashboard/business-settings" style={{ color: 'var(--nebula-blue)' }}>Business Settings</a> for better results.</p>
              </div>
            : <>
                <div style={{ marginBottom: 20, padding: '14px 20px', borderRadius: 14, background: 'rgba(0,200,255,0.06)', border: '1px solid rgba(0,200,255,0.2)', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: 24 }}>📋</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{posts.length} posts awaiting approval</div>
                    <div style={{ fontSize: 12, color: 'var(--dim)' }}>Review, edit if needed, then approve. Posts without images cannot be approved.</div>
                  </div>
                </div>
                {posts.map(post => (
                  <PostCard key={post.id} post={post} images={images} businessId={selectedBiz.id}
                    onUpdate={updated => setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))}
                    onDelete={id => setPosts(prev => prev.filter(p => p.id !== id))}
                  />
                ))}
              </>
        ) : (
          approvedPosts.length === 0
            ? <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--dim)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📜</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No approved posts yet</div>
                <div style={{ fontSize: 13 }}>Approved posts will appear here.</div>
              </div>
            : approvedPosts.map(post => (
                <div key={post.id} style={{ borderRadius: 14, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.02)', padding: '18px 20px', marginBottom: 12, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: POST_TYPE_COLORS[post.postType], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{POST_TYPE_ICONS[post.postType]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{POST_TYPE_LABELS[post.postType]}</span>
                      <span style={{ fontSize: 11, color: 'var(--dim)' }}>{post.keyword} · {post.city}</span>
                      <span style={{ fontSize: 11, color: 'rgba(20,200,100,0.9)', marginLeft: 'auto' }}>Approved {post.approvedAt ? new Date(post.approvedAt).toLocaleDateString() : ''}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--dim)', margin: 0, lineHeight: 1.6 }}>{post.content.slice(0, 200)}{post.content.length > 200 ? '...' : ''}</p>
                  </div>
                  {post.imageUrl && <img src={post.imageUrl} alt="" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
                </div>
              ))
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
