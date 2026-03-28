'use client'

export default function Automation() {
  const items = [
    { biz: 'Advanced Wildlife Control LLC', action: 'Published a post to Google Business Profile', time: '21 hours ago', type: 'post', status: 'success' },
    { biz: 'Authority Plumbing & Drain', action: 'Sent report', time: '23 hours ago', type: 'report', status: 'success' },
    { biz: 'Authority Plumbing & Drain', action: 'Published a post to Google Business Profile', time: '23 hours ago', type: 'post', status: 'success' },
    { biz: 'Advanced Wildlife Control LLC', action: 'Published a post to Google Business Profile', time: '2 days ago', type: 'post', status: 'success' },
    { biz: 'Advanced Wildlife Control LLC', action: 'FAQs generated', time: '6 days ago', type: 'content', status: 'success' },
    { biz: 'Authority Plumbing & Drain', action: 'Review response sent', time: '7 days ago', type: 'review', status: 'success' },
    { biz: 'Advanced Wildlife Control LLC', action: 'Citation synced — Yelp', time: '8 days ago', type: 'citation', status: 'success' },
    { biz: 'Authority Plumbing & Drain', action: 'Local content page published', time: '9 days ago', type: 'content', status: 'success' },
  ]

  const icons = { post: '📝', report: '📊', content: '✍️', review: '⭐', citation: '🔗' }
  const colors = { post: 'rgba(0,200,255,0.12)', report: 'rgba(123,47,255,0.12)', content: 'rgba(255,184,48,0.12)', review: 'rgba(255,45,154,0.12)', citation: 'rgba(20,200,100,0.12)' }

  return (
    <div>
      <div style={{ padding: '20px 36px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(6,6,18,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Automation</h1>
        <div style={{ display: 'flex', gap: 16 }}>
          {['All', 'Posts', 'Reviews', 'Content', 'Citations'].map(f => (
            <button key={f} style={{ padding: '7px 16px', borderRadius: 20, border: '1px solid var(--border)', background: f === 'All' ? 'rgba(123,47,255,0.15)' : 'transparent', color: f === 'All' ? 'var(--star-white)' : 'var(--dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: '32px 36px' }}>
        <div style={{ borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 24px', borderBottom: i < items.length - 1 ? '1px solid rgba(232,238,255,0.04)' : 'none', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,238,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: colors[item.type], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{icons[item.type]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>
                  {item.action} — <span style={{ color: 'var(--nebula-blue)' }}>{item.biz}</span>
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--dim2)', whiteSpace: 'nowrap' }}>{item.time}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: 'rgba(20,200,100,0.1)', border: '1px solid rgba(20,200,100,0.25)', fontSize: 11, color: 'rgba(20,200,100,0.9)', whiteSpace: 'nowrap' }}>
                <span>✓</span> Success
              </div>
              <button style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--dim)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>See details</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
