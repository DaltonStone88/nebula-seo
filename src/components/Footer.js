'use client'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{
      padding: '60px 60px 40px',
      borderTop: '1px solid var(--border)',
      position: 'relative', zIndex: 1,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 56 }}>
          {/* Brand */}
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, letterSpacing: 2, background: 'linear-gradient(135deg, var(--nebula-blue), var(--nebula-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 16 }}>NEBULASEO</div>
            <p style={{ fontSize: 13, color: 'var(--dim2)', lineHeight: 1.7, maxWidth: 280, marginBottom: 20 }}>
              AI-powered local SEO. Rank higher on Google Maps with automated rank tracking and AI-generated content.
            </p>
            <Link href="/login?signup=true" style={{ display: 'inline-flex', padding: '10px 24px', borderRadius: 30, background: 'rgba(123,47,255,0.15)', border: '1px solid rgba(123,47,255,0.3)', fontSize: 12, color: 'var(--star-white)', letterSpacing: 1, fontWeight: 600, fontFamily: 'var(--font-display)', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(123,47,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(123,47,255,0.15)'}>
              START $1 TRIAL
            </Link>
          </div>

          {/* Product */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim2)', marginBottom: 16, fontWeight: 600 }}>Product</div>
            {[
              { label: 'Features', href: '/#features' },
              { label: 'How It Works', href: '/#how-it-works' },
              { label: 'Pricing', href: '/pricing' },
              { label: 'Login', href: '/login' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ display: 'block', fontSize: 13, color: 'var(--dim2)', marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--star-white)'}
                onMouseLeave={e => e.target.style.color = 'var(--dim2)'}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Compare */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim2)', marginBottom: 16, fontWeight: 600 }}>Compare</div>
            {[
              { label: 'vs Paige', href: '/compare/nebulaseo-vs-paige' },
              { label: 'vs LocalViking', href: '/compare/nebulaseo-vs-localviking' },
              { label: 'vs BrightLocal', href: '/compare/nebulaseo-vs-brightlocal' },
              { label: 'vs Yext', href: '/compare/nebulaseo-vs-yext' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ display: 'block', fontSize: 13, color: 'var(--dim2)', marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--star-white)'}
                onMouseLeave={e => e.target.style.color = 'var(--dim2)'}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Legal */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim2)', marginBottom: 16, fontWeight: 600 }}>Legal</div>
            {[
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Contact', href: 'mailto:support@nebulaseo.com' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ display: 'block', fontSize: 13, color: 'var(--dim2)', marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--star-white)'}
                onMouseLeave={e => e.target.style.color = 'var(--dim2)'}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--dim2)' }}>© 2026 NebulaSEO. All rights reserved.</span>
          <span style={{ fontSize: 12, color: 'var(--dim2)' }}>Built for local businesses and agencies who want to dominate Google Maps.</span>
        </div>
      </div>
    </footer>
  )
}
