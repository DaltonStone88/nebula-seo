'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const isDash = pathname?.startsWith('/dashboard')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (isDash) return null

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        padding: '20px 60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(2,2,10,0.95)' : 'linear-gradient(to bottom, rgba(2,2,10,0.9), transparent)',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(123,47,255,0.15)' : 'none',
        transition: 'all 0.4s',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 20,
            letterSpacing: 2,
            background: 'linear-gradient(135deg, var(--nebula-blue), var(--nebula-purple), var(--nebula-pink))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            filter: 'drop-shadow(0 0 15px rgba(123,47,255,0.6))',
          }}>NEBULA<span style={{ WebkitTextFillColor: 'rgba(232,238,255,0.4)', filter: 'none' }}>SEO</span></span>
        </Link>

        <ul style={{ display: 'flex', gap: 36, listStyle: 'none', alignItems: 'center' }}>
          {[
            { label: 'Features', href: '/#features' },
            { label: 'How It Works', href: '/#how-it-works' },
            { label: 'Pricing', href: '/pricing' },
          ].map(link => (
            <li key={link.href}>
              <Link href={link.href} style={{
                color: 'var(--dim)', fontSize: 13, fontWeight: 500,
                letterSpacing: '1.5px', textTransform: 'uppercase',
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.target.style.color = 'var(--star-white)'}
                onMouseLeave={e => e.target.style.color = 'var(--dim)'}
              >{link.label}</Link>
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/login" style={{
            padding: '10px 24px', borderRadius: 30, border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--dim)', fontSize: 13, fontWeight: 500,
            letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.3s',
          }}
            onMouseEnter={e => { e.target.style.borderColor = 'rgba(232,238,255,0.3)'; e.target.style.color = 'var(--star-white)' }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--dim)' }}
          >Log In</Link>
          <Link href="/login?signup=true" className="btn-primary" style={{ padding: '10px 24px', fontSize: 12 }}>
            Start $1 Trial
          </Link>
        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          nav { padding: 16px 24px !important; }
          nav ul { display: none !important; }
        }
      `}</style>
    </>
  )
}
