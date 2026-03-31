'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useBusinessContext } from './layout'

// Estimated monthly search volumes by business category
// Based on published local SEO industry data
const CATEGORY_SEARCH_VOLUME = {
  'plumber': 8500, 'plumbing': 8500,
  'electrician': 6200, 'electrical': 6200,
  'hvac': 5400, 'air conditioning': 5400, 'heating': 4200,
  'roofing': 4800, 'roofer': 4800,
  'lawyer': 9200, 'attorney': 9200, 'legal': 7000,
  'dentist': 7800, 'dental': 7800,
  'doctor': 6500, 'physician': 6500, 'medical': 5000,
  'restaurant': 12000, 'food': 8000,
  'landscaping': 3800, 'lawn': 3200,
  'pest control': 3600,
  'cleaning': 4200, 'maid': 3000,
  'contractor': 5600, 'construction': 4800,
  'mechanic': 5200, 'auto repair': 5200,
  'real estate': 8800, 'realtor': 7200,
  'insurance': 6400,
  'web design': 2800, 'web designer': 2800, 'marketing': 3200,
  'photographer': 2600, 'photography': 2600,
  'hair salon': 4400, 'salon': 4400, 'barber': 3600,
  'gym': 5200, 'fitness': 4800,
  'animal control': 1800, 'wildlife': 1800,
  'veterinarian': 4200, 'vet': 4200,
  'default': 3500,
}

function getSearchVolume(category = '', keywords = []) {
  const text = [...keywords, category].join(' ').toLowerCase()
  for (const [key, vol] of Object.entries(CATEGORY_SEARCH_VOLUME)) {
    if (text.includes(key)) return vol
  }
  return CATEGORY_SEARCH_VOLUME.default
}

// Average revenue per lead by category
const CATEGORY_LEAD_VALUE = {
  'plumber': 350, 'plumbing': 350,
  'electrician': 400, 'electrical': 400,
  'hvac': 500, 'air conditioning': 500,
  'roofing': 8000,
  'lawyer': 2500, 'attorney': 2500,
  'dentist': 800, 'dental': 800,
  'doctor': 300, 'physician': 300,
  'restaurant': 45,
  'landscaping': 600, 'lawn': 250,
  'pest control': 300,
  'cleaning': 200,
  'contractor': 5000, 'construction': 5000,
  'mechanic': 300, 'auto repair': 300,
  'real estate': 8000, 'realtor': 8000,
  'web design': 3000, 'marketing': 2000,
  'animal control': 250, 'wildlife': 250,
  'default': 400,
}

function getLeadValue(category = '', keywords = []) {
  const text = [...keywords, category].join(' ').toLowerCase()
  for (const [key, val] of Object.entries(CATEGORY_LEAD_VALUE)) {
    if (text.includes(key)) return val
  }
  return CATEGORY_LEAD_VALUE.default
}

const typeIcon = { post: '📝', report: '📊', content: '✍️', review: '⭐', GBP_POST: '📝', REVIEW_RESPONSE: '⭐', REPORT_SENT: '📊' }
const typeColor = { post: 'rgba(0,200,255,0.15)', GBP_POST: 'rgba(0,200,255,0.15)', report: 'rgba(123,47,255,0.15)', REPORT_SENT: 'rgba(123,47,255,0.15)', content: 'rgba(255,184,48,0.15)', review: 'rgba(255,45,154,0.15)', REVIEW_RESPONSE: 'rgba(255,45,154,0.15)' }

export default function Dashboard() {
  const { selectedBiz, businesses } = useBusinessContext()
  const [pendingPosts, setPendingPosts] = useState([])
  const [competitor, setCompetitor] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(s => setSession(s))
  }, [])

  useEffect(() => {
    if (!selectedBiz?.id) { setLoading(false); return }
    setLoading(true)

    // Load pending posts for tasks
    fetch(`/api/automation/posts?businessId=${selectedBiz.id}&status=PENDING`)
      .then(r => r.json())
      .then(data => setPendingPosts(Array.isArray(data) ? data : []))
      .catch(() => setPendingPosts([]))

    // Find top competitor via Places API
    if (selectedBiz.lat && selectedBiz.lng && selectedBiz.targetKeywords?.length) {
      const query = `${selectedBiz.targetKeywords[0]} near ${selectedBiz.city || selectedBiz.address}`
      fetch(`/api/places/search?q=${encodeURIComponent(query)}`)
        .then(r => r.json())
        .then(results => {
          if (Array.isArray(results)) {
            // Find the top rated competitor that isn't this business
            const comp = results.find(r => r.placeId !== selectedBiz.placeId && r.totalRatings > 0)
            setCompetitor(comp || null)
          }
        })
        .catch(() => {})
    }

    setLoading(false)
  }, [selectedBiz?.id])

  const userName = session?.user?.name?.split(' ')[0] || 'there'
  const biz = selectedBiz

  // Compute real stats from selectedBiz
  const allAudits = biz?.rankAudits || []
  const latestAudit = [...allAudits].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
  const avgRank = latestAudit?.avgRank || null
  const top3Pct = latestAudit?.top3Percent || null
  const nextAuditDate = latestAudit
    ? new Date(new Date(latestAudit.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000)
    : null
  const daysToAudit = nextAuditDate
    ? Math.max(0, Math.ceil((nextAuditDate - new Date()) / (1000 * 60 * 60 * 24)))
    : null

  // Search volume & market value estimate
  const searchVol = biz ? getSearchVolume(biz.category, biz.targetKeywords) : 0
  const leadVal = biz ? getLeadValue(biz.category, biz.targetKeywords) : 0
  const convRate = 0.03 // 3% of searchers convert to a lead
  const estimatedMonthlyLeads = Math.round(searchVol * convRate)
  const estimatedMonthlyValue = (estimatedMonthlyLeads * leadVal).toLocaleString()

  // Tasks — pending posts to approve
  const tasks = []
  if (pendingPosts.length > 0) {
    tasks.push({ text: `${pendingPosts.length} post${pendingPosts.length > 1 ? 's' : ''} pending approval`, link: '/dashboard/automation', icon: '📝', urgent: true })
  }
  if (!biz?.targetKeywords?.length) {
    tasks.push({ text: 'Add target keywords to your business', link: '/dashboard/businesses', icon: '🎯', urgent: true })
  }
  if (!biz?.targetCities?.length) {
    tasks.push({ text: 'Add target cities to your business', link: '/dashboard/businesses', icon: '📍', urgent: false })
  }
  if (allAudits.length === 0) {
    tasks.push({ text: 'Run your first rank audit', link: '/dashboard/reports', icon: '📊', urgent: false })
  }

  // Automation feed from real automation logs
  const automationLog = allAudits.slice(-6).map(a => ({
    action: 'Rank audit completed',
    type: 'report',
    time: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    keyword: a.keyword,
  }))

  // Add pending posts to feed
  const feedItems = [
    ...pendingPosts.slice(0, 4).map(p => ({
      action: `${p.postType === 'WHATS_NEW' ? "What's New" : p.postType} post generated — pending approval`,
      type: 'GBP_POST',
      time: p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today',
      keyword: p.keyword,
      pending: true,
    })),
    ...automationLog,
  ].slice(0, 8)

  const half = Math.ceil(feedItems.length / 2)
  const col1 = feedItems.slice(0, half)
  const col2 = feedItems.slice(half)

  return (
    <div>
      {/* Top bar */}
      <div style={{ minHeight: 72, padding: '0 36px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(6,6,18,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--dim)' }}>Overview for:</span>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--star-white)' }}>
            {biz ? biz.name : 'No business selected'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {tasks.length > 0 && (
            <div style={{ position: 'relative' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--nebula-pink)', position: 'absolute', top: -2, right: -2, boxShadow: '0 0 6px var(--nebula-pink)' }} />
              <button style={{ background: 'rgba(232,238,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', color: 'var(--dim)', cursor: 'pointer', fontSize: 16 }}>🔔</button>
            </div>
          )}
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-pink))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', cursor: 'pointer' }}>
            {session?.user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'DS'}
          </div>
        </div>
      </div>

      <div style={{ padding: '32px 36px' }}>
        {!biz ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏢</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 10 }}>No Business Selected</div>
            <p style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 24 }}>Add a business to get started.</p>
            <Link href="/dashboard/businesses/add" className="btn-primary" style={{ fontSize: 13, padding: '12px 28px' }}>+ Add Business</Link>
          </div>
        ) : (
          <>
            {/* Hero Banner */}
            <div style={{ borderRadius: 20, padding: '28px 36px', background: 'linear-gradient(135deg, rgba(123,47,255,0.2), rgba(255,45,154,0.15), rgba(0,200,255,0.1))', border: '1px solid rgba(123,47,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, overflow: 'hidden', position: 'relative', boxShadow: '0 0 60px rgba(123,47,255,0.1)' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(123,47,255,0.05), transparent)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: 13, color: 'rgba(232,238,255,0.6)', marginBottom: 4 }}>Relax, {userName} —</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>We've got it covered! 🚀</div>
                <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 6 }}>{biz.name} · {biz.address}</div>
              </div>
              <div style={{ display: 'flex', gap: 32, position: 'relative' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: 'var(--nebula-blue)' }}>{tasks.length}</div>
                  <div style={{ fontSize: 11, color: 'var(--dim)', letterSpacing: 1 }}>TASKS</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: 'var(--nebula-pink)' }}>{businesses.length}</div>
                  <div style={{ fontSize: 11, color: 'var(--dim)', letterSpacing: 1 }}>BUSINESSES</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: 'var(--nebula-purple)' }}>
                    {avgRank ? `#${avgRank}` : '—'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--dim)', letterSpacing: 1 }}>AVG RANK</div>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Avg Rank', val: avgRank ? `#${avgRank}` : '—', sub: latestAudit ? `Last audit ${new Date(latestAudit.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}` : 'No audits yet', icon: '📍', color: 'var(--nebula-blue)' },
                { label: 'Top 3 Visibility', val: top3Pct ? `${top3Pct}%` : '—', sub: 'Of service area in top 3', icon: '🏆', color: 'var(--nebula-purple)' },
                { label: 'Phone Calls', val: '—', sub: 'Requires GBP API', icon: '📞', color: 'var(--nebula-pink)', locked: true },
                { label: 'Direction Requests', val: '—', sub: 'Requires GBP API', icon: '🗺️', color: 'rgba(255,184,48,0.9)', locked: true },
              ].map((s, i) => (
                <div key={i} style={{ padding: '24px', borderRadius: 16, background: 'rgba(232,238,255,0.03)', border: `1px solid ${s.locked ? 'rgba(232,238,255,0.05)' : 'var(--border)'}`, opacity: s.locked ? 0.5 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--dim)' }}>{s.label}</span>
                    <span style={{ fontSize: 20 }}>{s.icon}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
              {/* Recent Automations */}
              <div style={{ borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700 }}>Recent Activity</h2>
                  <Link href="/dashboard/automation" style={{ fontSize: 12, color: 'var(--nebula-blue)' }}>View all →</Link>
                </div>

                {feedItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--dim)', fontSize: 13 }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
                    No activity yet. Generate your first posts in the Automation tab.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                    {[col1, col2].map((col, ci) => (
                      <div key={ci} style={{ borderRight: ci === 0 ? '1px solid var(--border)' : 'none' }}>
                        {col.map((a, i) => (
                          <div key={i} style={{ padding: '16px 24px', borderBottom: '1px solid rgba(232,238,255,0.04)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: typeColor[a.type] || 'rgba(232,238,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{typeIcon[a.type] || '📝'}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4, lineHeight: 1.4, color: a.pending ? 'var(--star-white)' : 'var(--dim)' }}>{a.action}</div>
                              {a.keyword && <div style={{ fontSize: 11, color: 'var(--nebula-blue)', marginBottom: 3 }}>{a.keyword}</div>}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {a.pending
                                  ? <Link href="/dashboard/automation" style={{ fontSize: 10, color: 'rgba(255,184,48,0.9)', border: '1px solid rgba(255,184,48,0.3)', borderRadius: 4, padding: '2px 6px' }}>Approve →</Link>
                                  : <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'rgba(20,200,100,0.2)', border: '1px solid rgba(20,200,100,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>✓</div>
                                }
                                <span style={{ fontSize: 11, color: 'var(--dim2)' }}>{a.time}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Top Competitor */}
                <div style={{ borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)', padding: '20px' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, marginBottom: 14 }}>🎯 Market Opportunity</h3>
                  {competitor ? (
                    <>
                      <div style={{ fontSize: 10, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Top Competitor</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(232,238,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🏢</div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{competitor.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--dim)' }}>{competitor.address?.split(',').slice(0, 2).join(',')}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= Math.round(competitor.rating) ? 'var(--nebula-gold)' : 'var(--dim2)', fontSize: 12 }}>★</span>)}
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--dim)' }}>{competitor.rating} · {competitor.totalRatings?.toLocaleString()} reviews</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 12 }}>Run a rank audit to see your top competitor.</div>
                  )}
                  <div style={{ padding: '14px', borderRadius: 10, background: 'rgba(123,47,255,0.1)', border: '1px solid rgba(123,47,255,0.25)' }}>
                    <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 6 }}>Est. monthly search volume in your area</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--nebula-blue)', marginBottom: 4 }}>{searchVol.toLocaleString()}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--dim)', marginLeft: 4 }}>searches/mo</span></div>
                    <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 10 }}>At a 3% conversion rate, that's ~{estimatedMonthlyLeads} leads/month</div>
                    <div style={{ borderTop: '1px solid rgba(232,238,255,0.08)', paddingTop: 10 }}>
                      <div style={{ fontSize: 10, color: 'var(--dim)', marginBottom: 4 }}>Estimated market value</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, color: 'var(--nebula-blue)' }}>${estimatedMonthlyValue}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--dim)', marginLeft: 4 }}>/month</span></div>
                      <div style={{ fontSize: 10, color: 'var(--dim2)', marginTop: 4 }}>Based on avg {biz.category || 'service'} lead value of ${leadVal}</div>
                    </div>
                  </div>
                </div>

                {/* My Tasks */}
                <div style={{ borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)', padding: '20px' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, marginBottom: 14 }}>📋 My Tasks</h3>
                  {tasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                      <div style={{ fontSize: 13, color: 'var(--dim)' }}>All caught up!</div>
                      <div style={{ fontSize: 11, color: 'var(--dim2)', marginTop: 4 }}>NebulaSEO has everything covered.</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {tasks.map((task, i) => (
                        <Link key={i} href={task.link} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: task.urgent ? 'rgba(255,184,48,0.06)' : 'rgba(232,238,255,0.03)', border: `1px solid ${task.urgent ? 'rgba(255,184,48,0.25)' : 'var(--border)'}`, transition: 'all 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(123,47,255,0.4)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = task.urgent ? 'rgba(255,184,48,0.25)' : 'var(--border)'}
                        >
                          <span style={{ fontSize: 16 }}>{task.icon}</span>
                          <span style={{ fontSize: 12, color: task.urgent ? 'rgba(255,200,80,0.9)' : 'var(--dim)', flex: 1, lineHeight: 1.4 }}>{task.text}</span>
                          <span style={{ fontSize: 14, color: 'var(--dim)' }}>→</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Next Audit */}
                <div style={{ borderRadius: 16, padding: '20px', background: 'linear-gradient(135deg, rgba(0,200,255,0.1), rgba(123,47,255,0.08))', border: '1px solid rgba(0,200,255,0.2)' }}>
                  <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--nebula-blue)', marginBottom: 8 }}>Next Ranking Audit</div>
                  {daysToAudit !== null ? (
                    <>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: 'var(--nebula-blue)' }}>
                        {daysToAudit} <span style={{ fontSize: 14, fontWeight: 400 }}>days</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 4 }}>
                        {nextAuditDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--nebula-blue)', marginBottom: 4 }}>Not scheduled</div>
                      <Link href="/dashboard/reports" style={{ fontSize: 12, color: 'var(--nebula-blue)' }}>Run your first audit →</Link>
                    </>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 6 }}>Heatmap comparison generated automatically</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
