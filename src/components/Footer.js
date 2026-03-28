'use client'
import Link from 'next/link'

const links = {
  'Privacy': '/privacy',
  'Terms': '/terms',
  'Contact': 'mailto:info@nebulaseo.com',
  'Blog': '#',
}

export default function Footer() {
  return (
    <footer style={{
      padding: '50px 60px',
      borderTop: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'relative', zIndex: 1,
      flexWrap: 'wrap', gap: 24,
    }}>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, color: 'rgba(232,238,255,0.3)', letterSpacing: 2 }}>
        NEBULASEO
      </span>
      <div style={{ display: 'flex', gap: 36 }}>
        {Object.entries(links).map(([label, href]) => (
          <Link key={label} href={href} style={{ color: 'rgba(232,238,255,0.3)', fontSize: 12, letterSpacing: 1, transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--star-white)'}
            onMouseLeave={e => e.target.style.color = 'rgba(232,238,255,0.3)'}
          >{label}</Link>
        ))}
      </div>
      <span style={{ fontSize: 12, color: 'rgba(232,238,255,0.2)' }}>© 2026 NebulaSEO. All rights reserved.</span>
    </footer>
  )
}
