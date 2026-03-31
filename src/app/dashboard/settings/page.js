'use client'
import { useState, useEffect } from 'react'

function BillingTab() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)
  const [cancelStep, setCancelStep] = useState('reason')
  const [cancelReason, setCancelReason] = useState('')
  const [cancelStats, setCancelStats] = useState(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelActionTaken, setCancelActionTaken] = useState(null)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    fetch('/api/businesses')
      .then(r => r.json())
      .then(data => { setBusinesses(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const openCancel = async (biz) => {
    setCancelling(biz)
    setCancelStep('reason')
    setCancelReason('')
    setCancelActionTaken(null)
    const res = await fetch(`/api/stripe/cancel?businessId=${biz.id}`)
    const data = await res.json()
    setCancelStats(data)
  }

  const handleCancelAction = async (action) => {
    setCancelLoading(true)
    const res = await fetch('/api/stripe/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: cancelling.id, action }),
    })
    const data = await res.json()
    setCancelLoading(false)
    if (data.success) {
      setCancelActionTaken(action)
      if (action === 'discount') setCancelStep('offer_accepted')
      if (action === 'pause') setCancelStep('paused')
      if (action === 'cancel') {
        setCancelStep('cancelled')
        setBusinesses(prev => prev.map(b => b.id === cancelling.id ? { ...b, cancelAtPeriodEnd: true } : b))
      }
    }
  }

  const handleReactivate = async (biz) => {
    const res = await fetch('/api/stripe/reactivate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: biz.id }),
    })
    if ((await res.json()).success) {
      setBusinesses(prev => prev.map(b => b.id === biz.id ? { ...b, cancelAtPeriodEnd: false } : b))
    }
  }

  const openPortal = async () => {
    setPortalLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    setPortalLoading(false)
    if (data.url) window.location.href = data.url
  }

  const accessDate = cancelStats?.currentPeriodEnd
    ? new Date(cancelStats.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'end of billing period'

  const cancelReasons = ['Too expensive', 'Not seeing results', 'Switching to another tool', 'Business closed or paused', 'Missing a feature I need', 'Other']

  const totalMonthly = businesses.filter(b => !b.cancelAtPeriodEnd).length * 79

  return (
    <>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 28 }}>Billing</h2>

      {/* Cancel Modal */}
      {cancelling && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'rgba(10,10,28,0.99)', border: '1px solid var(--border)', borderRadius: 20, padding: '36px', width: '100%', maxWidth: 500 }}>
            {cancelStep === 'reason' && (
              <>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Cancel {cancelling.name}?</div>
                <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 20, lineHeight: 1.6 }}>Help us understand why before you go.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {cancelReasons.map(r => (
                    <button key={r} onClick={() => setCancelReason(r)} style={{ padding: '11px 16px', borderRadius: 10, border: `1px solid ${cancelReason === r ? 'rgba(123,47,255,0.5)' : 'var(--border)'}`, background: cancelReason === r ? 'rgba(123,47,255,0.1)' : 'transparent', color: cancelReason === r ? 'var(--star-white)' : 'var(--dim)', cursor: 'pointer', textAlign: 'left', fontSize: 13, fontFamily: 'var(--font-body)' }}>{r}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setCancelling(null)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--dim)', cursor: 'pointer', fontSize: 13 }}>Keep Subscription</button>
                  <button onClick={() => cancelReason && setCancelStep('retention')} disabled={!cancelReason} className="btn-primary" style={{ flex: 1, fontSize: 13, padding: '11px', justifyContent: 'center', opacity: cancelReason ? 1 : 0.4 }}>Continue →</button>
                </div>
              </>
            )}
            {cancelStep === 'retention' && cancelStats && (
              <>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Here's what you'd be losing</div>
                <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 20 }}>NebulaSEO has been working hard for {cancelling.name}.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                  {[
                    { label: 'Posts Generated', val: cancelStats.postsGenerated, icon: '📝' },
                    { label: 'Rank Audits Run', val: cancelStats.auditsRun, icon: '📊' },
                    { label: 'Current Avg Rank', val: cancelStats.avgRank ? `#${cancelStats.avgRank}` : '—', icon: '📍' },
                    { label: 'Days Active', val: cancelStats.daysActive, icon: '📅' },
                  ].map((s, i) => (
                    <div key={i} style={{ padding: '14px', borderRadius: 12, background: 'rgba(123,47,255,0.08)', border: '1px solid rgba(123,47,255,0.2)', textAlign: 'center' }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, color: 'var(--nebula-blue)' }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 16, lineHeight: 1.6 }}>Cancelling permanently deletes all ranking history, posts, and data for this location.</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setCancelling(null)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid rgba(20,200,100,0.4)', background: 'rgba(20,200,100,0.06)', color: 'rgba(20,200,100,0.9)', cursor: 'pointer', fontSize: 13 }}>Keep Subscription</button>
                  <button onClick={() => setCancelStep('offer')} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--dim)', cursor: 'pointer', fontSize: 13 }}>Still cancel →</button>
                </div>
              </>
            )}
            {cancelStep === 'offer' && (
              <>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Wait — we have an offer</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  {!cancelStats?.discountUsed && (
                    <div style={{ padding: '18px', borderRadius: 14, background: 'rgba(0,200,255,0.07)', border: '1px solid rgba(0,200,255,0.3)' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 5 }}>💰 10% Off Next Month</div>
                      <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 12, lineHeight: 1.6 }}>One-time offer — 10% off your next billing cycle, no strings attached.</div>
                      <button onClick={() => handleCancelAction('discount')} disabled={cancelLoading} className="btn-primary" style={{ fontSize: 12, padding: '8px 18px' }}>{cancelLoading ? '...' : 'Claim 10% Off'}</button>
                    </div>
                  )}
                  {!cancelStats?.pauseUsed && (
                    <div style={{ padding: '18px', borderRadius: 14, background: 'rgba(123,47,255,0.07)', border: '1px solid rgba(123,47,255,0.3)' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 5 }}>⏸️ Pause for 30 Days</div>
                      <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 12, lineHeight: 1.6 }}>Keep your data intact. One-time offer per location.</div>
                      <button onClick={() => handleCancelAction('pause')} disabled={cancelLoading} style={{ padding: '8px 18px', borderRadius: 10, border: '1px solid rgba(123,47,255,0.4)', background: 'rgba(123,47,255,0.1)', color: 'var(--star-white)', cursor: 'pointer', fontSize: 12 }}>{cancelLoading ? '...' : 'Pause Subscription'}</button>
                    </div>
                  )}
                </div>
                <button onClick={() => setCancelStep('confirm')} style={{ width: '100%', padding: '11px', borderRadius: 10, border: '1px solid rgba(255,50,50,0.3)', background: 'rgba(255,50,50,0.05)', color: 'rgba(255,100,100,0.8)', cursor: 'pointer', fontSize: 13 }}>No thanks, cancel anyway</button>
              </>
            )}
            {cancelStep === 'confirm' && (
              <>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Final confirmation</div>
                <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 14, lineHeight: 1.6 }}>Your subscription stays active until <strong style={{ color: 'var(--star-white)' }}>{accessDate}</strong>, then <strong style={{ color: 'var(--star-white)' }}>{cancelling.name}</strong> and all its data will be permanently deleted.</p>
                <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(255,50,50,0.07)', border: '1px solid rgba(255,50,50,0.25)', fontSize: 12, color: 'rgba(255,120,120,0.9)', marginBottom: 20, lineHeight: 1.6 }}>⚠️ This cannot be undone. All ranking history, posts, and data will be deleted permanently.</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setCancelling(null)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--dim)', cursor: 'pointer', fontSize: 13 }}>Keep Subscription</button>
                  <button onClick={() => handleCancelAction('cancel')} disabled={cancelLoading} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid rgba(255,50,50,0.4)', background: 'rgba(255,50,50,0.1)', color: 'rgba(255,100,100,0.9)', cursor: 'pointer', fontSize: 13 }}>{cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}</button>
                </div>
              </>
            )}
            {cancelStep === 'offer_accepted' && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: 44, marginBottom: 14 }}>🎉</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>10% off applied!</div>
                <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 20 }}>Discount applied to your next invoice. Thanks for staying!</p>
                <button onClick={() => setCancelling(null)} className="btn-primary" style={{ fontSize: 13, padding: '11px 24px' }}>Done</button>
              </div>
            )}
            {cancelStep === 'paused' && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: 44, marginBottom: 14 }}>⏸️</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Subscription paused</div>
                <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 20 }}>Full access until {accessDate}.</p>
                <button onClick={() => setCancelling(null)} className="btn-primary" style={{ fontSize: 13, padding: '11px 24px' }}>Got it</button>
              </div>
            )}
            {cancelStep === 'cancelled' && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: 44, marginBottom: 14 }}>👋</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Cancellation confirmed</div>
                <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 20 }}>You have access until {accessDate}. Your data will be deleted at that time.</p>
                <button onClick={() => setCancelling(null)} style={{ padding: '11px 24px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--dim)', cursor: 'pointer', fontSize: 13 }}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      <div style={{ padding: '20px 24px', borderRadius: 16, background: 'linear-gradient(135deg, rgba(123,47,255,0.12), rgba(0,200,255,0.06))', border: '1px solid rgba(123,47,255,0.3)', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Active Locations</div>
          <div style={{ fontSize: 13, color: 'var(--dim)' }}>{businesses.filter(b => !b.cancelAtPeriodEnd).length} location{businesses.filter(b => !b.cancelAtPeriodEnd).length !== 1 ? 's' : ''} · $79/mo each</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900 }}>${totalMonthly}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--dim)' }}>/mo</span></div>
          <button onClick={openPortal} disabled={portalLoading} style={{ marginTop: 8, padding: '7px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--dim)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)' }}>{portalLoading ? 'Loading...' : 'Manage Payment Method'}</button>
        </div>
      </div>

      {/* Location list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--dim)' }}>Loading...</div>
      ) : businesses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--dim)', fontSize: 13 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏢</div>
          No active locations. <a href="/dashboard/businesses/add" style={{ color: 'var(--nebula-blue)' }}>Add your first location →</a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {businesses.map(biz => (
            <div key={biz.id} style={{ padding: '20px 24px', borderRadius: 14, background: 'rgba(232,238,255,0.02)', border: `1px solid ${biz.cancelAtPeriodEnd ? 'rgba(255,184,48,0.3)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, rgba(123,47,255,0.3), rgba(0,200,255,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{biz.name.slice(0,2).toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{biz.name}</div>
                <div style={{ fontSize: 12, color: 'var(--dim)' }}>{biz.address}</div>
                {biz.cancelAtPeriodEnd && biz.stripeCurrentPeriodEnd && (
                  <div style={{ fontSize: 11, color: 'rgba(255,184,48,0.9)', marginTop: 3 }}>
                    ⚠️ Cancels {new Date(biz.stripeCurrentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--nebula-blue)', marginBottom: 2 }}>$79<span style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 400 }}>/mo</span></div>
                {biz.stripeCurrentPeriodEnd && (
                  <div style={{ fontSize: 11, color: 'var(--dim)' }}>
                    {biz.cancelAtPeriodEnd ? 'Access until' : 'Renews'} {new Date(biz.stripeCurrentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {biz.cancelAtPeriodEnd ? (
                  <button onClick={() => handleReactivate(biz)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(20,200,100,0.4)', background: 'rgba(20,200,100,0.08)', color: 'rgba(20,200,100,0.9)', cursor: 'pointer', fontSize: 12 }}>Reactivate</button>
                ) : (
                  <button onClick={() => openCancel(biz)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,50,50,0.25)', background: 'transparent', color: 'rgba(255,100,100,0.7)', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 20, fontSize: 12, color: 'var(--dim2)', lineHeight: 1.6 }}>
        Locations are billed at $79/month each. To add a new location, go to <a href="/dashboard/businesses/add" style={{ color: 'var(--nebula-blue)' }}>Add Business</a>. Cancellations take effect at the end of the current billing period.
      </div>
    </>
  )
}

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
      <div style={{ minHeight: 72, padding: '0 36px', borderBottom: '1px solid var(--border)', background: 'rgba(6,6,18,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center' }}>
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

          {tab === 'billing' && <BillingTab />}

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
