'use client'

function PlaceholderPage({ title, icon, description }) {
  return (
    <div>
      <div style={{ padding: '20px 36px', borderBottom: '1px solid var(--border)', background: 'rgba(6,6,18,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>{title}</h1>
      </div>
      <div style={{ padding: '100px 36px', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>{icon}</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 16 }}>{title}</h2>
        <p style={{ fontSize: 16, color: 'var(--dim)', maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>{description}</p>
        <div style={{ marginTop: 32, display: 'inline-block', padding: '10px 24px', borderRadius: 20, background: 'rgba(123,47,255,0.1)', border: '1px solid rgba(123,47,255,0.3)', fontSize: 12, color: 'var(--nebula-purple)', fontFamily: 'var(--font-display)', letterSpacing: 2 }}>COMING SOON</div>
      </div>
    </div>
  )
}

export { PlaceholderPage }
