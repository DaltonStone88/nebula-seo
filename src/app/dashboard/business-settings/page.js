'use client'
import { useState, useEffect } from 'react'
import { useBusinessContext } from '../layout'
import { useRouter } from 'next/navigation'

export default function BusinessSettings() {
  const { selectedBiz, setSelectedBiz, businesses, setBusinesses } = useBusinessContext()
  const router = useRouter()
  const [tab, setTab] = useState('general')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // General form state
  const [form, setForm] = useState({
    name: '', address: '', phone: '', website: '', category: '', gridSize: '7x7', gridSpacing: 'medium',
  })
  const [keywords, setKeywords] = useState(['', ''])
  const [cities, setCities] = useState(['', '', '', '', '', '', ''])

  // Report settings
  const [reportSettings, setReportSettings] = useState({
    sendReports: false, reportEmail: '', reportFrequency: 'monthly',
  })

  // Automation settings
  const [autoSettings, setAutoSettings] = useState({
    postsPerMonth: 10, postDays: 'weekdays', gridSize: '7x7', spacing: 'medium',
  })

  useEffect(() => {
    if (!selectedBiz) return
    setForm({
      name: selectedBiz.name || '',
      address: selectedBiz.address || '',
      phone: selectedBiz.phone || '',
      website: selectedBiz.website || '',
      category: selectedBiz.category || '',
      gridSize: selectedBiz.gridSize || '7x7',
      gridSpacing: selectedBiz.gridSpacing || 'medium',
    })
    const kws = [...(selectedBiz.targetKeywords || [])]
    while (kws.length < 2) kws.push('')
    setKeywords(kws)
    const cs = [...(selectedBiz.targetCities || [])]
    while (cs.length < 7) cs.push('')
    setCities(cs)
  }, [selectedBiz?.id])

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: '1px solid var(--border)', background: 'rgba(232,238,255,0.04)',
    color: 'var(--star-white)', fontSize: 13, fontFamily: 'var(--font-body)',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
  }
  const labelStyle = {
    display: 'block', fontSize: 11, color: 'var(--dim)',
    letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8,
  }

  const handleSave = async () => {
    if (!selectedBiz) return
    setSaving(true)
    const res = await fetch('/api/businesses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: selectedBiz.id,
        ...form,
        targetKeywords: keywords.map(k => k.trim()).filter(Boolean),
        targetCities: cities.map(c => c.trim()).filter(Boolean),
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (data.business || !data.error) {
      const updated = data.business || data
      setSelectedBiz(prev => ({ ...prev, ...updated }))
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: '🏢' },
    { id: 'automation', label: 'Automation', icon: '⚡' },
    { id: 'reports', label: 'Reports', icon: '📊' },
    { id: 'audit', label: 'Rank Audit', icon: '🗺️' },
  ]

  if (!selectedBiz) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🏢</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 10 }}>No Business Selected</div>
      <p style={{ fontSize: 14, color: 'var(--dim)' }}>Select a business from the sidebar to manage its settings.</p>
    </div>
  )

  return (
    <div>
      <div style={{ padding: '20px 36px', borderBottom: '1px solid var(--border)', background: 'rgba(6,6,18,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Business Settings</h1>
          <div style={{ fontSize: 13, color: 'var(--dim)' }}>{selectedBiz.name}</div>
        </div>
        {(tab === 'general') && (
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
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

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 28, marginTop: 8, marginBottom: 28 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Target Keywords</h3>
                <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 18, lineHeight: 1.6 }}>Used for rank tracking and AI content generation. You can change each keyword once every 30 days.</p>
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
                <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 18, lineHeight: 1.6 }}>Up to 7 cities for hyper-local content generation and rank tracking.</p>
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
              <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 28, lineHeight: 1.6 }}>Configure how AI-generated content is created for this business each month.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ padding: '24px', borderRadius: 14, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>GBP Posts</div>
                  <div style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 18, lineHeight: 1.6 }}>10 posts are generated per month, spread across randomized days. Each post targets a specific keyword and city combination from your profile.</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Post Distribution</label>
                      <select style={{ ...inputStyle, background: 'rgba(6,6,18,0.8)' }} value={autoSettings.postDays} onChange={e => setAutoSettings(s => ({ ...s, postDays: e.target.value }))}>
                        <option value="weekdays">Weekday-weighted (recommended)</option>
                        <option value="any">Any day of the week</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '24px', borderRadius: 14, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Content & Images</div>
                  <div style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 14, lineHeight: 1.6 }}>Manage your offers, events, updates, and image library that the AI uses as context.</div>
                  <a href="/dashboard/automation" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 10, border: '1px solid rgba(123,47,255,0.4)', background: 'rgba(123,47,255,0.1)', color: 'var(--star-white)', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                    Go to Automation Settings →
                  </a>
                </div>

                <div style={{ padding: '24px', borderRadius: 14, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Review Responses</div>
                  <div style={{ fontSize: 13, color: 'var(--dim)', lineHeight: 1.6 }}>AI-generated review responses are available once your Google Business Profile is connected. Responses are drafted and require your approval before being sent.</div>
                  <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,184,48,0.06)', border: '1px solid rgba(255,184,48,0.2)', fontSize: 12, color: 'rgba(255,184,48,0.8)' }}>
                    ⏳ Waiting for GBP API approval
                  </div>
                </div>
              </div>
            </>
          )}

          {/* REPORTS */}
          {tab === 'reports' && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Report Settings</h2>
              <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 28, lineHeight: 1.6 }}>Configure how and when reports are generated and delivered for this business.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ padding: '24px', borderRadius: 14, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Automated Reports</div>
                  <div style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 18, lineHeight: 1.6 }}>Automatically send PDF reports to your client after each monthly audit.</div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 16 }}>
                    <input type="checkbox" checked={reportSettings.sendReports} onChange={e => setReportSettings(s => ({ ...s, sendReports: e.target.checked }))} style={{ width: 16, height: 16, accentColor: 'var(--nebula-purple)' }} />
                    <span style={{ fontSize: 13 }}>Send reports automatically after each audit</span>
                  </label>
                  {reportSettings.sendReports && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
                  <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,184,48,0.06)', border: '1px solid rgba(255,184,48,0.2)', fontSize: 12, color: 'rgba(255,184,48,0.8)' }}>
                    ⏳ Email delivery requires email provider setup (coming soon)
                  </div>
                </div>

                <div style={{ padding: '24px', borderRadius: 14, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>White Label</div>
                  <div style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 14, lineHeight: 1.6 }}>Brand reports with your agency name instead of NebulaSEO. Configure your agency branding in Account Settings.</div>
                  <a href="/dashboard/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 10, border: '1px solid rgba(123,47,255,0.4)', background: 'rgba(123,47,255,0.1)', color: 'var(--star-white)', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                    Go to Account Settings →
                  </a>
                </div>
              </div>
            </>
          )}

          {/* RANK AUDIT */}
          {tab === 'audit' && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Rank Audit Settings</h2>
              <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 28, lineHeight: 1.6 }}>Configure the grid size and spacing used when running rank audits for this business.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ padding: '24px', borderRadius: 14, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Grid Configuration</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Grid Size</label>
                      <select style={{ ...inputStyle, background: 'rgba(6,6,18,0.8)' }} value={form.gridSize} onChange={e => setForm(f => ({ ...f, gridSize: e.target.value }))}>
                        {['5x5','7x7','10x10','15x15','20x20'].map(s => <option key={s} value={s}>{s} ({parseInt(s)**2} points)</option>)}
                      </select>
                      <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 6 }}>Larger grids give more detail but take longer to run</div>
                    </div>
                    <div>
                      <label style={labelStyle}>Grid Spacing</label>
                      <select style={{ ...inputStyle, background: 'rgba(6,6,18,0.8)' }} value={form.gridSpacing} onChange={e => setForm(f => ({ ...f, gridSpacing: e.target.value }))}>
                        <option value="small">Tight (~0.35 mi) — dense urban areas</option>
                        <option value="medium">Standard (~0.6 mi) — most businesses</option>
                        <option value="large">Regional (~1 mi) — large service areas</option>
                      </select>
                      <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 6 }}>Match to your typical service radius</div>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '24px', borderRadius: 14, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Audit Schedule</div>
                  <div style={{ fontSize: 13, color: 'var(--dim)', lineHeight: 1.6, marginBottom: 14 }}>Rank audits run automatically every 30 days from when the business was first added. You can also run them manually from the Reports tab at any time.</div>
                  <a href="/dashboard/reports" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 10, border: '1px solid rgba(0,200,255,0.4)', background: 'rgba(0,200,255,0.08)', color: 'var(--nebula-blue)', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                    Go to Reports →
                  </a>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ fontSize: 12, padding: '10px 24px' }}>
                    {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Grid Settings'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
