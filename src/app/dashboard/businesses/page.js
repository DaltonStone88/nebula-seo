'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Businesses() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/businesses')
      .then(r => r.json())
      .then(data => { setBusinesses(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const filtered = businesses.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div style={{ padding: '20px 36px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(6,6,18,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Businesses</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--dim)' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search businesses..."
              style={{ paddingLeft: 36, paddingRight: 16, paddingTop: 9, paddingBottom: 9, borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.04)', color: 'var(--star-white)', fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', width: 220 }} />
          </div>
          <Link href="/dashboard/businesses/add" className="btn-primary" style={{ fontSize: 11, padding: '10px 20px' }}>+ Add Business</Link>
        </div>
      </div>

      <div style={{ padding: '32px 36px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ width: 36, height: 36, border: '3px solid rgba(123,47,255,0.3)', borderTopColor: 'var(--nebula-purple)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {filtered.map((biz, i) => {
              const latestAudit = biz.rankAudits?.[biz.rankAudits.length - 1]
              return (
                <div key={i} style={{ borderRadius: 16, background: 'rgba(232,238,255,0.03)', border: '1px solid var(--border)', padding: '24px', transition: 'all 0.3s', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(123,47,255,0.3)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg, rgba(123,47,255,0.3), rgba(0,200,255,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
                      {biz.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{biz.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--dim)', display: 'flex', alignItems: 'center', gap: 4 }}>📍 {biz.address || 'No address'}</div>
                    </div>
                    <div style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(20,200,100,0.1)', border: '1px solid rgba(20,200,100,0.3)', fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(20,200,100,0.9)' }}>
                      {biz.status?.toLowerCase() || 'active'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    {latestAudit && (
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 4 }}>Avg Rank</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--nebula-blue)' }}>{latestAudit.avgRank}</div>
                      </div>
                    )}
                    {biz.targetKeywords?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 4 }}>Keywords</div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {biz.targetKeywords.slice(0, 2).map((kw, j) => (
                            <span key={j} style={{ padding: '2px 8px', borderRadius: 10, background: 'rgba(123,47,255,0.1)', border: '1px solid rgba(123,47,255,0.2)', fontSize: 10, color: 'var(--nebula-purple)' }}>{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Link href="/dashboard/reports" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13, color: 'var(--nebula-blue)', background: 'rgba(0,200,255,0.05)', fontWeight: 500, transition: 'all 0.2s' }}>
                    View Reports →
                  </Link>
                </div>
              )
            })}

            {/* Add new */}
            <Link href="/dashboard/businesses/add" style={{ borderRadius: 16, background: 'transparent', border: '2px dashed rgba(232,238,255,0.1)', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, cursor: 'pointer', transition: 'all 0.3s', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(123,47,255,0.4)'; e.currentTarget.style.background = 'rgba(123,47,255,0.03)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(232,238,255,0.1)'; e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2px dashed rgba(123,47,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'var(--nebula-purple)', marginBottom: 12 }}>+</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dim)', marginBottom: 4 }}>Add a Business</div>
              <div style={{ fontSize: 12, color: 'var(--dim2)', textAlign: 'center' }}>Connect a Google Business Profile</div>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
