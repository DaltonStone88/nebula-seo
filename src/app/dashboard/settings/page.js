'use client'
import { useState } from 'react'

export default function Settings() {
  const [tab, setTab] = useState('profile')
  const [saved, setSaved] = useState(false)

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs = ['profile', 'agency', 'notifications', 'billing', 'integrations']

  return (
    <div>
      <div style={{ padding: '20px 36px', borderBottom: '1px solid var(--border)', background: 'rgba(6,6,18,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Settings</h1>
      </div>

      <div style={{ padding: '32px 36px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 28 }}>
        {/* Sidebar */}
        <div style={{ borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)', padding: '12px', height: 'fit-content' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '11px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: tab === t ? 'rgba(123,47,255,0.15)' : 'transparent',
              color: tab === t ? 'var(--star-white)' : 'var(--dim)',
              fontSize: 13, fontWeight: tab === t ? 600 : 400,
              fontFamily: 'var(--font-body)', textAlign: 'left',
              textTransform: 'capitalize', transition: 'all 0.2s',
              borderLeft: tab === t ? '2px solid var(--nebula-purple)' : '2px solid transparent',
            }}>{t}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)', padding: '32px' }}>
          {tab === 'profile' && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 28 }}>Profile Settings</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                {[
                  { label: 'First Name', val: 'Dalton', type: 'text' },
                  { label: 'Last Name', val: 'Stone', type: 'text' },
                  { label: 'Email Address', val: 'dalton@nebulaseo.com', type: 'email' },
                  { label: 'Phone Number', val: '+1 (555) 000-0000', type: 'tel' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ display: 'block', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 8 }}>{f.label}</label>
                    <input defaultValue={f.val} type={f.type} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.04)', color: 'var(--star-white)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(123,47,255,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 8 }}>Time Zone</label>
                <select style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(6,6,18,0.8)', color: 'var(--star-white)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none' }}>
                  <option>America/Chicago (CST)</option>
                  <option>America/New_York (EST)</option>
                  <option>America/Los_Angeles (PST)</option>
                  <option>America/Denver (MST)</option>
                </select>
              </div>
            </>
          )}

          {tab === 'agency' && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 28 }}>Agency Settings</h2>
              <div style={{ display: 'grid', gap: 20, marginBottom: 20 }}>
                {[
                  { label: 'Agency Name', val: 'NebulaSEO Agency', type: 'text' },
                  { label: 'Agency Website', val: 'https://yourwebsite.com', type: 'url' },
                  { label: 'White-Label Brand Name', val: 'NebulaSEO', type: 'text' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ display: 'block', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 8 }}>{f.label}</label>
                    <input defaultValue={f.val} type={f.type} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.04)', color: 'var(--star-white)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(123,47,255,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 8 }}>Agency Logo (for white-label reports)</label>
                  <div style={{ border: '2px dashed rgba(232,238,255,0.12)', borderRadius: 12, padding: '32px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(123,47,255,0.4)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(232,238,255,0.12)'}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>
                    <div style={{ fontSize: 13, color: 'var(--dim)' }}>Drag & drop or <span style={{ color: 'var(--nebula-blue)' }}>browse files</span></div>
                    <div style={{ fontSize: 11, color: 'var(--dim2)', marginTop: 4 }}>PNG, JPG up to 2MB</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === 'notifications' && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 28 }}>Notification Preferences</h2>
              {[
                { label: 'New Review Received', desc: 'Get notified when a new review comes in', on: true },
                { label: 'Review Response Sent', desc: 'Confirm when AI responds to a review', on: true },
                { label: 'GBP Post Published', desc: 'Confirm when a post goes live', on: false },
                { label: 'Rank Changes', desc: 'Alert when ranking positions shift significantly', on: true },
                { label: 'Heatmap Audit Complete', desc: 'Notify when a new audit is generated', on: true },
                { label: 'Citation Status Updates', desc: 'Updates on citation building progress', on: false },
                { label: 'Weekly Summary Report', desc: 'Receive a weekly performance digest', on: true },
              ].map((item, i) => {
                const [on, setOn] = useState(item.on)
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', borderBottom: i < 6 ? '1px solid rgba(232,238,255,0.05)' : 'none' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--dim)' }}>{item.desc}</div>
                    </div>
                    <div onClick={() => setOn(!on)} style={{ width: 44, height: 24, borderRadius: 12, background: on ? 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-pink))' : 'rgba(232,238,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'all 0.3s', flexShrink: 0 }}>
                      <div style={{ position: 'absolute', top: 2, left: on ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
                    </div>
                  </div>
                )
              })}
            </>
          )}

          {tab === 'billing' && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 28 }}>Billing & Plan</h2>
              <div style={{ borderRadius: 16, padding: '24px', background: 'linear-gradient(135deg, rgba(123,47,255,0.12), rgba(255,45,154,0.07))', border: '1px solid rgba(123,47,255,0.3)', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Nebula Plan</div>
                    <div style={{ fontSize: 13, color: 'var(--dim)' }}>Up to 10 locations • White-label reports • Priority support</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900 }}>$297<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--dim)' }}>/mo</span></div>
                  </div>
                </div>
                <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
                  <button className="btn-primary" style={{ fontSize: 11, padding: '10px 22px' }}>Upgrade to Galaxy</button>
                  <button style={{ padding: '10px 22px', borderRadius: 30, border: '1px solid var(--border)', background: 'transparent', color: 'var(--dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Manage Billing</button>
                </div>
              </div>
              <div style={{ borderRadius: 14, padding: '20px 24px', background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Payment Method</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 32, borderRadius: 6, background: 'rgba(232,238,255,0.08)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💳</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>Visa ending in 4242</div>
                    <div style={{ fontSize: 12, color: 'var(--dim)' }}>Expires 12/26</div>
                  </div>
                  <button style={{ marginLeft: 'auto', padding: '6px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Update</button>
                </div>
              </div>
            </>
          )}

          {tab === 'integrations' && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 28 }}>Integrations</h2>
              {[
                { name: 'Google Business Profile', desc: 'Post updates, manage reviews, track rankings', icon: '🔍', connected: true },
                { name: 'Google Analytics', desc: 'Track website traffic and conversions', icon: '📈', connected: false },
                { name: 'Google Search Console', desc: 'Monitor search performance and indexing', icon: '🔎', connected: false },
                { name: 'Zapier', desc: 'Connect with 5,000+ apps and automate workflows', icon: '⚡', connected: false },
                { name: 'Slack', desc: 'Get notifications and alerts in your Slack workspace', icon: '💬', connected: false },
                { name: 'Stripe', desc: 'Manage billing and invoicing for your clients', icon: '💳', connected: true },
              ].map((intg, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px', borderRadius: 14, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)', marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(232,238,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{intg.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{intg.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--dim)' }}>{intg.desc}</div>
                  </div>
                  <button style={{
                    padding: '8px 20px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                    fontFamily: 'var(--font-body)', fontWeight: 600, transition: 'all 0.3s',
                    background: intg.connected ? 'rgba(20,200,100,0.1)' : 'rgba(123,47,255,0.1)',
                    border: intg.connected ? '1px solid rgba(20,200,100,0.3)' : '1px solid rgba(123,47,255,0.3)',
                    color: intg.connected ? 'rgba(20,200,100,0.9)' : 'var(--nebula-purple)',
                  }}>{intg.connected ? '✓ Connected' : 'Connect'}</button>
                </div>
              ))}
            </>
          )}

          {/* Save button */}
          {tab !== 'billing' && tab !== 'integrations' && (
            <div style={{ marginTop: 32, display: 'flex', gap: 12, alignItems: 'center' }}>
              <button onClick={save} className="btn-primary" style={{ fontSize: 12, padding: '12px 28px' }}>
                {saved ? '✓ Saved!' : 'Save Changes'}
              </button>
              <button style={{ padding: '12px 24px', borderRadius: 30, border: '1px solid var(--border)', background: 'transparent', color: 'var(--dim)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
