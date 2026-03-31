'use client'
import { useState } from 'react'
import { useBusinessContext } from '../layout'
import Link from 'next/link'

export default function Reviews() {
  const { selectedBiz } = useBusinessContext()
  const [filter, setFilter] = useState('new')

  if (!selectedBiz) return (
    <div>
      <div style={{ padding: '22px 36px', borderBottom: '1px solid var(--border)', background: 'rgba(6,6,18,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50, minHeight: 76 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Reviews</h1>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', textAlign: 'center', padding: '0 40px' }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>⭐</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 10 }}>No Business Selected</div>
        <p style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 28, maxWidth: 360, lineHeight: 1.7 }}>Add a business to start monitoring reviews. Once your Google Business Profile is connected, reviews will appear here automatically.</p>
        <Link href="/dashboard/businesses/add" className="btn-primary" style={{ fontSize: 13, padding: '12px 28px' }}>+ Add Your First Business</Link>
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ padding: '22px 36px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(6,6,18,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50, minHeight: 76 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Reviews</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, background: 'rgba(232,238,255,0.04)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 13, color: 'var(--dim)' }}>
            🏢 Authority Plumbing & Drain <span style={{ fontSize: 10 }}>▼</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '32px 36px' }}>
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div style={{ borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)', padding: '24px' }}>
            <div style={{ fontSize: 11, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Total Reviews</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 900, marginBottom: 6 }}>0</div>
            <div style={{ fontSize: 12, color: 'rgba(232,238,255,0.4)' }}>Change in reviews this year</div>
          </div>
          <div style={{ borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)', padding: '24px' }}>
            <div style={{ fontSize: 11, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Average Rating</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 900, marginBottom: 6 }}>0.0</div>
            <div style={{ color: 'rgba(232,238,255,0.15)', fontSize: 20 }}>★★★★★</div>
          </div>
          <div style={{ borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)', padding: '24px' }}>
            <div style={{ fontSize: 11, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Rating Breakdown</div>
            {[5,4,3,2,1].map(star => (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ color: 'var(--nebula-gold)', fontSize: 12, width: 14 }}>★</span>
                <span style={{ fontSize: 11, color: 'var(--dim)', width: 10 }}>{star}</span>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(232,238,255,0.08)' }}>
                  <div style={{ height: '100%', borderRadius: 3, width: '0%', background: star === 5 ? 'rgba(20,200,100,0.7)' : star === 4 ? 'rgba(100,200,50,0.7)' : star === 3 ? 'rgba(200,200,20,0.7)' : star === 2 ? 'rgba(220,130,20,0.7)' : 'rgba(200,40,40,0.7)' }} />
                </div>
                <span style={{ fontSize: 11, color: 'var(--dim2)', width: 16 }}>0</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          {/* Main area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Average monthly reviews', val: 0 },
                { label: 'Days since last review', val: '—' },
              ].map((m, i) => (
                <div key={i} style={{ borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: 13, color: 'var(--dim)' }}>{m.label}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>{m.val}</div>
                  </div>
                  <div style={{ height: 60, display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                    {Array.from({ length: 20 }, (_, j) => (
                      <div key={j} style={{ flex: 1, height: '10%', background: 'rgba(123,47,255,0.3)', borderRadius: '2px 2px 0 0' }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Reviews Feed */}
            <div style={{ borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>Reviews Feed</h2>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['new', 'all', 'unanswered'].map(f => (
                      <button key={f} onClick={() => setFilter(f)} style={{
                        padding: '6px 14px', borderRadius: 20, border: filter === f ? '1px solid rgba(123,47,255,0.5)' : '1px solid var(--border)',
                        background: filter === f ? 'rgba(123,47,255,0.15)' : 'transparent',
                        color: filter === f ? 'var(--star-white)' : 'var(--dim)',
                        fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', textTransform: 'capitalize',
                      }}>{f === 'new' ? 'New first' : f}</button>
                    ))}
                  </div>
                  <button style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid var(--border)', background: 'transparent', color: 'var(--dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Filters ↓</button>
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--dim2)', fontSize: 13 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>⭐</div>
                No reviews yet. Once reviews come in, they'll appear here and be auto-responded to by NebulaSEO.
              </div>
            </div>
          </div>

          {/* Review request link */}
          <div style={{ borderRadius: 16, background: 'linear-gradient(135deg, rgba(123,47,255,0.15), rgba(0,200,255,0.08))', border: '1px solid rgba(123,47,255,0.3)', padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Review Request Link</h3>
            <p style={{ fontSize: 12, color: 'var(--dim)', lineHeight: 1.6, marginBottom: 18 }}>Email or text this link to your customers to get more reviews.</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              <div style={{ flex: 1, padding: '10px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', fontSize: 11, color: 'var(--dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                https://www.giveratings.com/authority-plumbing...
              </div>
              <button style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.05)', color: 'var(--star-white)', cursor: 'pointer', fontSize: 14 }}>📋</button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--nebula-blue)', cursor: 'pointer', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🌐</span> Embed reviews on your website
            </div>
            <div style={{ borderRadius: 14, background: 'rgba(0,0,0,0.3)', padding: '20px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>⭐</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Get more reviews!</div>
              <div style={{ display: 'inline-block', width: 110, height: 110, background: 'rgba(232,238,255,0.1)', borderRadius: 12, marginBottom: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 2, padding: 8, height: '100%' }}>
                  {Array.from({ length: 48 }, (_, i) => (
                    <div key={i} style={{ background: i % 3 === 0 ? 'rgba(232,238,255,0.8)' : 'transparent', borderRadius: 1 }} />
                  ))}
                </div>
              </div>
              <br />
              <button style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-pink))', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Download QR</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
