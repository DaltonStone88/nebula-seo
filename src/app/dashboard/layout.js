'use client'
import { useState, useEffect, useRef, createContext, useContext } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'


// ── Onboarding Modal ──────────────────────────────────────────────────────
function OnboardingModal({ onClose, userName }) {
  const [step, setStep] = useState(0)

  const steps = [
    {
      icon: '🚀',
      title: `Welcome to NebulaSEO, ${userName}!`,
      subtitle: 'The local SEO platform that works while you sleep.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { icon: '📍', title: 'Rank Tracking', desc: 'See exactly where your business ranks across your entire service area with visual heatmaps updated monthly.' },
            { icon: '🤖', title: 'AI Content', desc: '10 Google Business Profile posts generated every month — tailored to your keywords, cities, and services.' },
            { icon: '⭐', title: 'Review Management', desc: 'Monitor and respond to reviews automatically once your GBP is connected. Coming soon.' },
            { icon: '📊', title: 'PDF Reports', desc: 'Professional ranking reports you can download or send to clients after every audit.' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 12, background: 'rgba(123,47,255,0.06)', border: '1px solid rgba(123,47,255,0.15)' }}>
              <div style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: 'var(--dim)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: '🗺️',
      title: 'How Rank Audits Work',
      subtitle: 'See your real visibility across your service area.',
      content: (
        <div>
          <p style={{ fontSize: 13, color: 'var(--dim)', lineHeight: 1.7, marginBottom: 20 }}>
            When you add a business, NebulaSEO creates a grid of GPS points across your service area and checks your Google ranking at each point — just like a real customer searching nearby. The result is a heatmap showing exactly where you rank well and where you don't.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
            {['#1–3', '#4–10', '#11+'].map((r, i) => (
              <div key={i} style={{ padding: '14px', borderRadius: 12, background: ['rgba(20,200,100,0.12)', 'rgba(255,184,48,0.12)', 'rgba(255,50,50,0.12)'][i], border: `1px solid ${['rgba(20,200,100,0.3)', 'rgba(255,184,48,0.3)', 'rgba(255,50,50,0.3)'][i]}`, textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, color: ['rgba(20,200,100,0.9)', 'rgba(255,184,48,0.9)', 'rgba(255,80,80,0.9)'][i] }}>{r}</div>
                <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4 }}>{['Top 3', 'Page 1', 'Not visible'][i]}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'var(--dim)', lineHeight: 1.7 }}>
            Your first audit runs automatically after adding a business. Audits repeat every 30 days so you can track progress over time.
          </p>
        </div>
      ),
    },
    {
      icon: '✍️',
      title: 'AI Post Generation',
      subtitle: 'Real content that sounds like your business.',
      content: (
        <div>
          <p style={{ fontSize: 13, color: 'var(--dim)', lineHeight: 1.7, marginBottom: 20 }}>
            Every month, NebulaSEO generates 10 Google Business Profile posts for each location. Each post is written around your specific keywords and cities, and uses a different angle to keep content fresh.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {[
              { step: '1', text: 'Posts are generated on the 1st of each month for new signups, or immediately when you add a business' },
              { step: '2', text: 'Review each post in the Automation tab — edit the text or swap images before approving' },
              { step: '3', text: 'Approved posts are queued for publishing once your Google Business Profile is connected' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 10, background: 'rgba(0,200,255,0.05)', border: '1px solid rgba(0,200,255,0.15)' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,200,255,0.2)', border: '1px solid rgba(0,200,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--nebula-blue)', flexShrink: 0 }}>{s.step}</div>
                <div style={{ fontSize: 12, color: 'var(--dim)', lineHeight: 1.6 }}>{s.text}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,184,48,0.06)', border: '1px solid rgba(255,184,48,0.2)', fontSize: 12, color: 'rgba(255,184,48,0.8)', lineHeight: 1.6 }}>
            💡 Tip: Go to Business Settings → Automation and add your offers, events, and images before generating posts. Better context = better posts.
          </div>
        </div>
      ),
    },
    {
      icon: '💳',
      title: 'Pricing & Billing',
      subtitle: 'Simple, transparent, per-location pricing.',
      content: (
        <div>
          <div style={{ padding: '24px', borderRadius: 14, background: 'linear-gradient(135deg, rgba(123,47,255,0.15), rgba(0,200,255,0.08))', border: '1px solid rgba(123,47,255,0.3)', textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 900, marginBottom: 4 }}>$79<span style={{ fontSize: 18, fontWeight: 400, color: 'var(--dim)' }}>/mo</span></div>
            <div style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 16 }}>per location · cancel anytime</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Monthly rank audits with heatmaps', '10 AI-generated GBP posts/month', 'Post approval & editing queue', 'PDF reports', 'Review management (when GBP API is approved)'].map((f, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ color: 'rgba(20,200,100,0.8)' }}>✓</span> {f}
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--dim)', lineHeight: 1.7 }}>
            Each business location is billed separately. Add as many locations as you manage. You can cancel any location at any time from the Billing tab in Settings — you keep access until the end of your billing period.
          </p>
        </div>
      ),
    },
    {
      icon: '🏁',
      title: "You're ready to go!",
      subtitle: 'Add your first business to get started.',
      content: (
        <div>
          <p style={{ fontSize: 13, color: 'var(--dim)', lineHeight: 1.7, marginBottom: 24 }}>
            Here's what happens when you add a business:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {[
              { icon: '🔍', text: 'Search for your business by name — we pull address and details from Google automatically' },
              { icon: '🎯', text: 'Set your target keywords (what you want to rank for) and target cities' },
              { icon: '💳', text: 'Complete checkout — $79/month, secured by Stripe' },
              { icon: '📊', text: 'Your first rank audit runs immediately — takes about 1-2 minutes' },
              { icon: '✍️', text: '10 AI posts are generated right after — head to Automation to review and approve them' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 10, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{s.icon}</span>
                <span style={{ fontSize: 12, color: 'var(--dim)', lineHeight: 1.6 }}>{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ]

  const current = steps[step]
  const isLast = step === steps.length - 1

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'rgba(8,8,22,0.99)', border: '1px solid rgba(123,47,255,0.3)', borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 0 80px rgba(123,47,255,0.2)' }}>
        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(232,238,255,0.05)' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--nebula-purple), var(--nebula-blue))', width: `${((step + 1) / steps.length) * 100}%`, transition: 'width 0.4s ease' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '28px 32px 20px', flexShrink: 0 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{current.icon}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{current.title}</div>
          <div style={{ fontSize: 13, color: 'var(--dim)' }}>{current.subtitle}</div>
        </div>

        {/* Content */}
        <div style={{ padding: '0 32px', flex: 1, overflowY: 'auto' }}>
          {current.content}
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 32px 28px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', marginTop: 20 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {steps.map((_, i) => (
              <div key={i} onClick={() => setStep(i)} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 3, background: i === step ? 'var(--nebula-purple)' : 'rgba(232,238,255,0.15)', cursor: 'pointer', transition: 'all 0.3s' }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--dim)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)' }}>
              Skip intro
            </button>
            {isLast ? (
              <button onClick={onClose} className="btn-primary" style={{ fontSize: 12, padding: '9px 22px' }}>
                Add My First Business →
              </button>
            ) : (
              <button onClick={() => setStep(s => s + 1)} className="btn-primary" style={{ fontSize: 12, padding: '9px 22px' }}>
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Business context ──────────────────────────────────────────────────────────
export const BusinessContext = createContext({ businesses: [], selectedBiz: null, setSelectedBiz: () => {} })
export function useBusinessContext() { return useContext(BusinessContext) }

const navItems = [
  { icon: '▦', label: 'Dashboard',          href: '/dashboard' },
  { icon: '⚡', label: 'Automation',        href: '/dashboard/automation' },
  { icon: '⭐', label: 'Reviews',           href: '/dashboard/reviews' },
  { icon: '📊', label: 'Reports',           href: '/dashboard/reports' },
  { icon: '🏢', label: 'Business Settings', href: '/dashboard/business-settings' },
]

const bottomItems = [
  { icon: '🏢', label: 'Businesses',   href: '/dashboard/businesses' },
  { icon: '⚙️', label: 'Settings',     href: '/dashboard/settings' },
  { icon: '💸', label: 'Refer a Friend', href: '/dashboard/referral' },
]

export default function DashboardLayout({ children }) {
  const { data: session } = useSession()
  const pathname  = usePathname()
  const router    = useRouter()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [collapsed, setCollapsed]       = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [businesses, setBusinesses]     = useState([])
  const [selectedBiz, setSelectedBiz]   = useState(null)
  const dropRef = useRef(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    fetch('/api/user')
      .then(r => r.json())
      .then(data => {
        if (data && !data.hasSeenOnboarding) setShowOnboarding(true)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/businesses')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setBusinesses(data)
          setSelectedBiz(data[0])
        }
      })
      .catch(e => console.error('Layout: failed to load businesses', e))
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e) { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const initials = selectedBiz ? selectedBiz.name.slice(0, 2).toUpperCase() : '??'

  return (
    <BusinessContext.Provider value={{ businesses, selectedBiz, setSelectedBiz }}>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--void)', fontFamily: 'var(--font-body)' }}>
        <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 10% 20%, rgba(123,47,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at 90% 80%, rgba(0,200,255,0.04) 0%, transparent 50%)', pointerEvents: 'none', zIndex: 0 }} />

        {/* SIDEBAR */}
        {/* Mobile overlay */}
        {isMobile && mobileOpen && (
          <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99, backdropFilter: 'blur(4px)' }} />
        )}

        <aside style={{
          width: isMobile ? (mobileOpen ? 220 : 0) : (collapsed ? 68 : 220),
          flexShrink: 0, overflow: isMobile && !mobileOpen ? 'hidden' : 'visible',
          background: 'rgba(6,6,18,0.97)', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          position: isMobile ? 'fixed' : 'sticky', top: 0, height: '100vh',
          backdropFilter: 'blur(20px)', transition: 'width 0.3s ease', zIndex: 100,
          left: 0,
        }}>
          {/* Logo */}
          <div style={{ padding: '22px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-pink))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🌌</div>
            {!collapsed && <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 14, letterSpacing: 1, background: 'linear-gradient(135deg, var(--nebula-blue), var(--nebula-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', whiteSpace: 'nowrap' }}>NEBULASEO</span>}
          </div>

          {/* Business selector dropdown */}
          {!collapsed && (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', position: 'relative' }} ref={dropRef}>
              <div
                onClick={() => setDropdownOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(232,238,255,0.04)', border: `1px solid ${dropdownOpen ? 'rgba(123,47,255,0.4)' : 'var(--border)'}`, cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, rgba(123,47,255,0.4), rgba(0,200,255,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedBiz ? selectedBiz.name : 'All Businesses'}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--dim)', letterSpacing: 1 }}>{businesses.length} location{businesses.length !== 1 ? 's' : ''}</div>
                </div>
                <span style={{ color: 'var(--dim)', fontSize: 10, transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
              </div>

              {dropdownOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% - 4px)', left: 16, right: 16, background: 'rgba(10,10,28,0.98)', border: '1px solid rgba(123,47,255,0.3)', borderRadius: 10, overflow: 'hidden', zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                  {businesses.map(biz => (
                    <div
                      key={biz.id}
                      onClick={() => { setSelectedBiz(biz); setDropdownOpen(false) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', background: selectedBiz?.id === biz.id ? 'rgba(123,47,255,0.15)' : 'transparent', borderBottom: '1px solid rgba(232,238,255,0.05)' }}
                      onMouseEnter={e => { if (selectedBiz?.id !== biz.id) e.currentTarget.style.background = 'rgba(232,238,255,0.04)' }}
                      onMouseLeave={e => { if (selectedBiz?.id !== biz.id) e.currentTarget.style.background = 'transparent' }}
                    >
                      <div style={{ width: 26, height: 26, borderRadius: 6, background: 'linear-gradient(135deg, rgba(123,47,255,0.4), rgba(0,200,255,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{biz.name.slice(0,2).toUpperCase()}</div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: 12, fontWeight: selectedBiz?.id === biz.id ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: selectedBiz?.id === biz.id ? 'var(--star-white)' : 'var(--dim)' }}>{biz.name}</div>
                        {biz.rankAudits?.length > 0 && <div style={{ fontSize: 10, color: 'var(--dim2)' }}>Avg #{biz.rankAudits[biz.rankAudits.length-1]?.avgRank}</div>}
                      </div>
                      {selectedBiz?.id === biz.id && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--nebula-purple)', boxShadow: '0 0 8px var(--nebula-purple)' }} />}
                    </div>
                  ))}
                  <Link href="/dashboard/businesses/add" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', color: 'var(--nebula-purple)', fontSize: 12, fontWeight: 500, borderTop: '1px solid rgba(232,238,255,0.05)' }}>
                    <span style={{ fontSize: 16 }}>+</span> Add Business
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Main nav */}
          <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
            {navItems.map(item => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link key={item.href} href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: collapsed ? '12px' : '11px 12px',
                  borderRadius: 10, marginBottom: 2,
                  background: active ? 'rgba(123,47,255,0.15)' : 'transparent',
                  border: active ? '1px solid rgba(123,47,255,0.3)' : '1px solid transparent',
                  color: active ? 'var(--star-white)' : 'var(--dim)',
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  transition: 'all 0.2s', justifyContent: collapsed ? 'center' : 'flex-start',
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(232,238,255,0.04)'; e.currentTarget.style.color = 'var(--star-white)' } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--dim)' } }}
                >
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                  {!collapsed && item.label}
                  {active && !collapsed && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--nebula-purple)', boxShadow: '0 0 8px var(--nebula-purple)' }} />}
                </Link>
              )
            })}
          </nav>

          {/* Bottom nav */}
          <div style={{ padding: '10px 10px', borderTop: '1px solid var(--border)' }}>
            {bottomItems.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: collapsed ? '10px' : '10px 12px',
                  borderRadius: 10, marginBottom: 2,
                  background: active ? 'rgba(123,47,255,0.1)' : 'transparent',
                  color: active ? 'var(--star-white)' : 'var(--dim2)', fontSize: 12,
                  transition: 'all 0.2s', justifyContent: collapsed ? 'center' : 'flex-start',
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--star-white)'; e.currentTarget.style.background = 'rgba(232,238,255,0.04)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = active ? 'var(--star-white)' : 'var(--dim2)'; e.currentTarget.style.background = active ? 'rgba(123,47,255,0.1)' : 'transparent' }}
                >
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  {!collapsed && item.label}
                </Link>
              )
            })}

            <button onClick={() => setCollapsed(!collapsed)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: collapsed ? '10px' : '10px 12px',
              borderRadius: 10, width: '100%', background: 'none', border: 'none',
              color: 'var(--dim2)', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s',
              justifyContent: collapsed ? 'center' : 'flex-start', marginTop: 4,
            }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--star-white)'; e.currentTarget.style.background = 'rgba(232,238,255,0.04)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--dim2)'; e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: 14, transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>◀</span>
              {!collapsed && 'Collapse'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '10px' : '12px', borderRadius: 10, marginTop: 6, background: 'rgba(232,238,255,0.03)', border: '1px solid var(--border)', cursor: 'pointer', justifyContent: collapsed ? 'center' : 'flex-start' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-pink))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', flexShrink: 0 }}>
                {session?.user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'DS'}
              </div>
              {!collapsed && (
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session?.user?.name || 'Account'}</div>
                  <div style={{ fontSize: 10, color: 'var(--dim)' }}>{businesses.length} active location{businesses.length !== 1 ? 's' : ''}</div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, overflow: 'auto', position: 'relative', zIndex: 1, minWidth: 0 }}>
          {isMobile && (
            <button onClick={() => setMobileOpen(!mobileOpen)} style={{ position: 'fixed', top: 16, left: 16, zIndex: 101, width: 40, height: 40, borderRadius: 10, background: 'rgba(6,6,18,0.95)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
              <div style={{ width: 16, height: 2, background: 'var(--star-white)', borderRadius: 1 }} />
              <div style={{ width: 16, height: 2, background: 'var(--star-white)', borderRadius: 1 }} />
              <div style={{ width: 16, height: 2, background: 'var(--star-white)', borderRadius: 1 }} />
            </button>
          )}
          {children}
        </main>
      </div>
      {showOnboarding && (
        <OnboardingModal onClose={async () => {
          setShowOnboarding(false)
          await fetch('/api/user', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hasSeenOnboarding: true }) })
        }} userName={session?.user?.name?.split(' ')[0] || 'there'} />
      )}
    </BusinessContext.Provider>
  )
}
