'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { icon: '▦', label: 'Dashboard', href: '/dashboard' },
  { icon: '🏢', label: 'Businesses', href: '/dashboard/businesses' },
  { icon: '⚡', label: 'Automation', href: '/dashboard/automation' },
  { icon: '⭐', label: 'Reviews', href: '/dashboard/reviews' },
  { icon: '📊', label: 'Reports', href: '/dashboard/reports' },
  { icon: '🔗', label: 'Citations', href: '/dashboard/citations' },
  { icon: '⚙️', label: 'Settings', href: '/dashboard/settings' },
]

const bottomItems = [
  { icon: '🛡️', label: 'Churn Prevention', href: '/dashboard/churn' },
  { icon: '🤝', label: 'Partner Hub', href: '/dashboard/partners' },
  { icon: '💸', label: 'Refer a Friend', href: '/dashboard/referral' },
]

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--void)', fontFamily: 'var(--font-body)' }}>
      {/* Subtle bg */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 10% 20%, rgba(123,47,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at 90% 80%, rgba(0,200,255,0.04) 0%, transparent 50%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* SIDEBAR */}
      <aside style={{
        width: collapsed ? 68 : 220, flexShrink: 0,
        background: 'rgba(6,6,18,0.95)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
        backdropFilter: 'blur(20px)',
        transition: 'width 0.3s ease',
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '22px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-pink))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🌌</div>
          {!collapsed && <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 14, letterSpacing: 1, background: 'linear-gradient(135deg, var(--nebula-blue), var(--nebula-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', whiteSpace: 'nowrap' }}>NEBULASEO</span>}
        </div>

        {/* Business selector */}
        {!collapsed && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(232,238,255,0.04)', border: '1px solid var(--border)', cursor: 'pointer' }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #1a3a6a, #0a1a3a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>🏢</div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>All Businesses</div>
                <div style={{ fontSize: 10, color: 'var(--dim)', letterSpacing: 1 }}>2 locations</div>
              </div>
              <span style={{ color: 'var(--dim)', fontSize: 10 }}>▼</span>
            </div>
          </div>
        )}

        {/* Nav */}
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
          {bottomItems.map(item => (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: collapsed ? '10px' : '10px 12px',
              borderRadius: 10, marginBottom: 2,
              color: 'var(--dim2)', fontSize: 12,
              transition: 'all 0.2s', justifyContent: collapsed ? 'center' : 'flex-start',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--star-white)'; e.currentTarget.style.background = 'rgba(232,238,255,0.04)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--dim2)'; e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              {!collapsed && item.label}
            </Link>
          ))}

          {/* Collapse toggle */}
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

          {/* User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '10px' : '12px', borderRadius: 10, marginTop: 6, background: 'rgba(232,238,255,0.03)', border: '1px solid var(--border)', cursor: 'pointer', justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-pink))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', flexShrink: 0 }}>DS</div>
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Dalton Stone</div>
                <div style={{ fontSize: 10, color: 'var(--dim)' }}>Nebula Plan</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflow: 'auto', position: 'relative', zIndex: 1 }}>
        {children}
      </main>
    </div>
  )
}
