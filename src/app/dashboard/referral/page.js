'use client'
export default function Referral() {
  return (
    <div>
      <div style={{ padding: '20px 36px', borderBottom: '1px solid var(--border)', background: 'rgba(6,6,18,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Refer a Friend</h1>
      </div>
      <div style={{ padding: '60px 36px', maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>💸</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Earn $50 per referral</h2>
        <p style={{ fontSize: 16, color: 'var(--dim)', lineHeight: 1.7, marginBottom: 40 }}>Share your referral link and earn $50 for every agency that signs up for a paid plan.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', padding: '16px 24px', borderRadius: 14, background: 'rgba(232,238,255,0.03)', border: '1px solid var(--border)' }}>
          <div style={{ flex: 1, fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--nebula-blue)', letterSpacing: 1 }}>https://nebulaseo.com/ref/dalton123</div>
          <button className="btn-primary" style={{ fontSize: 11, padding: '10px 20px', flexShrink: 0 }}>Copy Link</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 40 }}>
          {[{ val: '0', label: 'Referrals' }, { val: '$0', label: 'Earned' }, { val: '$0', label: 'Pending' }].map(s => (
            <div key={s.label} style={{ padding: '24px', borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, color: 'var(--nebula-purple)' }}>{s.val}</div>
              <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
