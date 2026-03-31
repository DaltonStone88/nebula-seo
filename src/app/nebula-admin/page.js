'use client'
import { useState, useEffect } from 'react'

const TABS = ['Overview', 'Users', 'Withdrawals', 'Businesses', 'Referrals', 'Automation']

function Badge({ status }) {
  const map = {
    ACTIVE:   { bg: 'rgba(20,200,100,0.1)',  border: 'rgba(20,200,100,0.3)',  color: 'rgba(20,200,100,0.9)' },
    PAUSED:   { bg: 'rgba(255,184,48,0.1)',  border: 'rgba(255,184,48,0.3)',  color: 'rgba(255,184,48,0.9)' },
    PENDING:  { bg: 'rgba(255,184,48,0.1)',  border: 'rgba(255,184,48,0.3)',  color: 'rgba(255,184,48,0.9)' },
    APPROVED: { bg: 'rgba(0,200,255,0.1)',   border: 'rgba(0,200,255,0.3)',   color: 'rgba(0,200,255,0.9)' },
    PAID:     { bg: 'rgba(20,200,100,0.1)',  border: 'rgba(20,200,100,0.3)',  color: 'rgba(20,200,100,0.9)' },
    REJECTED: { bg: 'rgba(255,50,50,0.1)',   border: 'rgba(255,50,50,0.3)',   color: 'rgba(255,100,100,0.9)' },
    FAILED:   { bg: 'rgba(255,50,50,0.1)',   border: 'rgba(255,50,50,0.3)',   color: 'rgba(255,100,100,0.9)' },
  }
  const s = map[status] || map.PENDING
  return <span style={{ padding: '3px 10px', borderRadius: 20, background: s.bg, border: `1px solid ${s.border}`, fontSize: 11, color: s.color }}>{status}</span>
}

function StatBox({ label, value, color = 'var(--nebula-purple)', prefix = '' }) {
  return (
    <div style={{ padding: '24px', borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid rgba(232,238,255,0.07)' }}>
      <div style={{ fontSize: 11, color: 'rgba(232,238,255,0.5)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 28, fontWeight: 900, color }}>{prefix}{typeof value === 'number' ? value.toLocaleString() : value}</div>
    </div>
  )
}

function WithdrawalRow({ w, onAction }) {
  const [loading, setLoading] = useState(false)
  const [bankInfo, setBankInfo] = useState(null)
  const [note, setNote] = useState('')
  const [showNote, setShowNote] = useState(false)

  const fetchBankInfo = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin?action=plaid_numbers&withdrawalId=${w.id}`)
    const data = await res.json()
    setBankInfo(data)
    setLoading(false)
  }

  const handleAction = async (action) => {
    setLoading(true)
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, withdrawalId: w.id, adminNote: note }),
    })
    setLoading(false)
    onAction()
  }

  return (
    <div style={{ borderRadius: 14, border: '1px solid rgba(232,238,255,0.07)', background: 'rgba(232,238,255,0.02)', padding: '20px 24px', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>${w.amount.toFixed(2)} withdrawal</div>
          <div style={{ fontSize: 12, color: 'rgba(232,238,255,0.5)' }}>{w.user.name || w.user.email} · {w.user.email}</div>
          <div style={{ fontSize: 11, color: 'rgba(232,238,255,0.25)', marginTop: 2 }}>
            Requested {new Date(w.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {w.plaidBankName && ` · ${w.plaidBankName} ···${w.plaidAccountMask}`}
          </div>
        </div>
        <Badge status={w.status} />
      </div>

      {bankInfo && !bankInfo.error && (
        <div style={{ marginBottom: 14, padding: '16px', borderRadius: 12, background: 'rgba(0,200,255,0.06)', border: '1px solid rgba(0,200,255,0.2)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: '#00c8ff' }}>Bank Account Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[['Bank', bankInfo.bankName], ['Account Type', bankInfo.accountType], ['Account Number', bankInfo.accountNumber], ['Routing Number', bankInfo.routingNumber], ['Wire Routing', bankInfo.wireRouting]].map(([label, val]) => val && (
              <div key={label} style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(232,238,255,0.07)' }}>
                <div style={{ fontSize: 10, color: 'rgba(232,238,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "'Orbitron', monospace", letterSpacing: 1 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {bankInfo?.error && (
        <div style={{ marginBottom: 14, padding: '12px', borderRadius: 10, background: 'rgba(255,50,50,0.08)', border: '1px solid rgba(255,50,50,0.2)', fontSize: 12, color: 'rgba(255,100,100,0.9)' }}>Error: {bankInfo.error}</div>
      )}

      {showNote && (
        <div style={{ marginBottom: 12 }}>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Admin note (shown to user)..."
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(232,238,255,0.07)', background: 'rgba(232,238,255,0.04)', color: '#e8eeff', fontSize: 13, fontFamily: "'Syne', sans-serif", outline: 'none', boxSizing: 'border-box' }} />
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {!bankInfo && w.status === 'PENDING' && (
          <button onClick={fetchBankInfo} disabled={loading} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(0,200,255,0.4)', background: 'rgba(0,200,255,0.08)', color: 'rgba(0,200,255,0.9)', cursor: 'pointer', fontSize: 12, fontFamily: "'Syne', sans-serif" }}>
            {loading ? 'Fetching...' : '🏦 Get Account & Routing'}
          </button>
        )}
        {w.status === 'PENDING' && (
          <>
            <button onClick={() => handleAction('approve_withdrawal')} disabled={loading} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(20,200,100,0.4)', background: 'rgba(20,200,100,0.08)', color: 'rgba(20,200,100,0.9)', cursor: 'pointer', fontSize: 12, fontFamily: "'Syne', sans-serif" }}>✓ Approve</button>
            <button onClick={() => setShowNote(true)} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(255,50,50,0.3)', background: 'rgba(255,50,50,0.06)', color: 'rgba(255,100,100,0.9)', cursor: 'pointer', fontSize: 12, fontFamily: "'Syne', sans-serif" }}>✕ Reject</button>
            {showNote && <button onClick={() => handleAction('reject_withdrawal')} disabled={loading} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(255,50,50,0.5)', background: 'rgba(255,50,50,0.15)', color: 'rgba(255,100,100,0.9)', cursor: 'pointer', fontSize: 12, fontFamily: "'Syne', sans-serif" }}>Confirm Reject</button>}
          </>
        )}
        {w.status === 'APPROVED' && (
          <button onClick={() => handleAction('mark_paid')} disabled={loading} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(123,47,255,0.4)', background: 'rgba(123,47,255,0.1)', color: '#7b2fff', cursor: 'pointer', fontSize: 12, fontFamily: "'Syne', sans-serif" }}>💸 Mark as Paid</button>
        )}
      </div>
    </div>
  )
}

export default function AdminDash() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState(false)
  const [tab, setTab] = useState('Overview')
  const [data, setData] = useState(null)
  const [bizData, setBizData] = useState(null)
  const [refData, setRefData] = useState(null)
  const [autoData, setAutoData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const handleAuth = () => {
    const correct = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'nebula-admin-2026'
    if (password === correct) {
      setAuthed(true)
      loadOverview()
    } else {
      setAuthError(true)
    }
  }

  const loadOverview = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin?action=overview')
      const json = await res.json()
      if (!json.error) setData(json)
      else console.error('Admin API error:', json.error)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const loadTab = async (t) => {
    setTab(t)
    if (['Overview', 'Users', 'Withdrawals'].includes(t)) {
      if (!data) await loadOverview()
    }
    if (t === 'Businesses' && !bizData) {
      const res = await fetch('/api/admin?action=businesses')
      setBizData(await res.json())
    }
    if (t === 'Referrals' && !refData) {
      const res = await fetch('/api/admin?action=referrals')
      setRefData(await res.json())
    }
    if (t === 'Automation' && !autoData) {
      const res = await fetch('/api/admin?action=automation')
      setAutoData(await res.json())
    }
  }

  const handleDeleteUser = async (userId) => {
    await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete_user', userId }) })
    setDeleteConfirm(null)
    await loadOverview()
  }

  const tabStyle = (t) => ({
    padding: '8px 18px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontFamily: "'Syne', sans-serif",
    border: tab === t ? '1px solid rgba(123,47,255,0.5)' : '1px solid rgba(232,238,255,0.07)',
    background: tab === t ? 'rgba(123,47,255,0.15)' : 'transparent',
    color: tab === t ? '#e8eeff' : 'rgba(232,238,255,0.5)',
  })

  const rowStyle = { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(232,238,255,0.07)', marginBottom: 10 }

  if (!authed) return (
    <div style={{ minHeight: '100vh', background: '#02020a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Syne:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ width: 380, padding: '40px', borderRadius: 20, background: 'rgba(10,10,28,0.99)', border: '1px solid rgba(232,238,255,0.07)' }}>
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 16, fontWeight: 700, marginBottom: 6, color: '#e8eeff' }}>Admin Access</div>
        <div style={{ fontSize: 12, color: 'rgba(232,238,255,0.5)', marginBottom: 24 }}>NebulaSEO internal dashboard</div>
        <input
          type="password" value={password}
          onChange={e => { setPassword(e.target.value); setAuthError(false) }}
          onKeyDown={e => e.key === 'Enter' && handleAuth()}
          placeholder="Password"
          style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: `1px solid ${authError ? 'rgba(255,50,50,0.5)' : 'rgba(232,238,255,0.07)'}`, background: 'rgba(232,238,255,0.04)', color: '#e8eeff', fontSize: 14, fontFamily: "'Syne', sans-serif", outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
        />
        {authError && <div style={{ fontSize: 12, color: 'rgba(255,100,100,0.9)', marginBottom: 12 }}>Incorrect password</div>}
        <button onClick={handleAuth} style={{ width: '100%', padding: '13px', borderRadius: 50, border: 'none', background: 'linear-gradient(135deg, #7b2fff, #ff2d9a)', color: '#fff', fontFamily: "'Orbitron', monospace", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer' }}>Enter</button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const stats = data?.stats || {}
  const users = data?.users || []
  const withdrawals = data?.withdrawals || []

  return (
    <div style={{ minHeight: '100vh', background: '#02020a', color: '#e8eeff', fontFamily: "'Syne', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Syne:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ padding: '18px 36px', borderBottom: '1px solid rgba(232,238,255,0.07)', background: 'rgba(6,6,18,0.95)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: 18, background: 'linear-gradient(135deg, #00c8ff, #7b2fff, #ff2d9a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NEBULASEO</span>
          <span style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)', fontSize: 11, color: 'rgba(255,100,100,0.9)' }}>Admin</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t} style={tabStyle(t)} onClick={() => loadTab(t)}>
              {t}{t === 'Withdrawals' && withdrawals.length > 0 ? ` (${withdrawals.length})` : ''}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '32px 36px' }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ width: 36, height: 36, border: '3px solid rgba(123,47,255,0.3)', borderTopColor: '#7b2fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        )}

        {/* OVERVIEW */}
        {tab === 'Overview' && !loading && data && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
              <StatBox label="Total Users" value={stats.totalUsers || 0} color="#00c8ff" />
              <StatBox label="Active Locations" value={stats.activeBusinesses?.length || 0} color="rgba(20,200,100,0.9)" />
              <StatBox label="MRR" value={stats.mrr || 0} prefix="$" color="#7b2fff" />
              <StatBox label="New This Month" value={stats.newUsersThisMonth || 0} color="#ffb830" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
              <StatBox label="Outstanding Referral Balance" value={(stats.totalOutstandingBalance || 0).toFixed(2)} prefix="$" color="#ff2d9a" />
              <StatBox label="Pending Withdrawals" value={stats.pendingWithdrawals || 0} color="rgba(255,184,48,0.9)" />
              <StatBox label="Churning This Month" value={stats.churnedThisMonth || 0} color="rgba(255,100,100,0.9)" />
            </div>
            {withdrawals.length > 0 && (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>⚡ Pending Withdrawals</div>
                {withdrawals.map(w => <WithdrawalRow key={w.id} w={w} onAction={loadOverview} />)}
              </>
            )}
            {withdrawals.length === 0 && <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(232,238,255,0.5)', fontSize: 14 }}>No pending withdrawals</div>}
          </>
        )}

        {/* USERS */}
        {tab === 'Users' && !loading && (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 20 }}>{users.length} Users</div>
            {users.map(u => (
              <div key={u.id} style={rowStyle}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #7b2fff, #ff2d9a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0, color: '#fff' }}>
                  {(u.name || u.email || '?')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name || 'No name'} <span style={{ color: 'rgba(232,238,255,0.5)', fontWeight: 400 }}>{u.email}</span></div>
                  <div style={{ fontSize: 11, color: 'rgba(232,238,255,0.5)', marginTop: 2 }}>
                    Joined {new Date(u.createdAt).toLocaleDateString()} · {u.activeLocations} location{u.activeLocations !== 1 ? 's' : ''} · ${u.mrr}/mo · {u._count.referrals} referrals
                  </div>
                </div>
                {u.outstandingBalance > 0 && <div style={{ fontSize: 12, fontWeight: 700, color: '#ffb830' }}>Owes: ${u.outstandingBalance.toFixed(2)}</div>}
                {u.hasPendingWithdrawal && <Badge status="PENDING" />}
                <button onClick={() => setDeleteConfirm(u.id)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,50,50,0.3)', background: 'rgba(255,50,50,0.06)', color: 'rgba(255,100,100,0.8)', cursor: 'pointer', fontSize: 11, fontFamily: "'Syne', sans-serif" }}>Delete</button>
                {deleteConfirm === u.id && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleDeleteUser(u.id)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,50,50,0.6)', background: 'rgba(255,50,50,0.2)', color: 'rgba(255,100,100,0.9)', cursor: 'pointer', fontSize: 11, fontFamily: "'Syne', sans-serif" }}>Confirm</button>
                    <button onClick={() => setDeleteConfirm(null)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(232,238,255,0.07)', background: 'transparent', color: 'rgba(232,238,255,0.5)', cursor: 'pointer', fontSize: 11, fontFamily: "'Syne', sans-serif" }}>Cancel</button>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* WITHDRAWALS */}
        {tab === 'Withdrawals' && !loading && (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 20 }}>Withdrawal Requests</div>
            {withdrawals.length === 0
              ? <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(232,238,255,0.5)', fontSize: 14 }}>No pending withdrawals</div>
              : withdrawals.map(w => <WithdrawalRow key={w.id} w={w} onAction={loadOverview} />)
            }
          </>
        )}

        {/* BUSINESSES */}
        {tab === 'Businesses' && (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 20 }}>{Array.isArray(bizData) ? bizData.length : 0} Businesses</div>
            {Array.isArray(bizData) && bizData.map(b => (
              <div key={b.id} style={rowStyle}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(232,238,255,0.5)', marginTop: 2 }}>
                    {b.user?.email} · {b.city}, {b.state} · {b._count.rankAudits} audits · {b._count.automationPosts} posts
                    {b.lastPostGeneratedAt && ` · Last posts: ${new Date(b.lastPostGeneratedAt).toLocaleDateString()}`}
                  </div>
                </div>
                {b.avgRank && <div style={{ fontSize: 12, color: '#00c8ff' }}>Avg rank: {b.avgRank.toFixed(1)}</div>}
                {b.cancelAtPeriodEnd && <div style={{ fontSize: 11, color: 'rgba(255,184,48,0.9)' }}>Cancelling</div>}
                <Badge status={b.status} />
              </div>
            ))}
          </>
        )}

        {/* REFERRALS */}
        {tab === 'Referrals' && (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 20 }}>Referral Overview</div>
            {Array.isArray(refData) && refData.length === 0 && <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(232,238,255,0.5)', fontSize: 14 }}>No referral commissions yet</div>}
            {Array.isArray(refData) && refData.map((r, i) => (
              <div key={i} style={{ borderRadius: 14, border: '1px solid rgba(232,238,255,0.07)', background: 'rgba(232,238,255,0.02)', padding: '18px 22px', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.referrer?.name || r.referrer?.email}</div>
                    <div style={{ fontSize: 11, color: 'rgba(232,238,255,0.5)' }}>{r.referrer?.email}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#ffb830' }}>Total: ${r.totalEarned.toFixed(2)}</div>
                    <div style={{ fontSize: 11, color: r.availableBalance > 0 ? 'rgba(255,100,100,0.9)' : 'rgba(232,238,255,0.5)' }}>Outstanding: ${r.availableBalance.toFixed(2)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {r.commissions.slice(0, 6).map(c => (
                    <div key={c.id} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(232,238,255,0.07)', fontSize: 11, color: 'rgba(232,238,255,0.5)' }}>
                      ${c.amount.toFixed(2)} · {c.month} · <span style={{ color: c.paidOut ? 'rgba(0,200,255,0.8)' : 'rgba(20,200,100,0.8)' }}>{c.paidOut ? 'Paid' : 'Available'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {/* AUTOMATION */}
        {tab === 'Automation' && (
          <>
            {autoData?.flagged?.length > 0 && (
              <>
                <div style={{ marginBottom: 20, padding: '16px 20px', borderRadius: 14, background: 'rgba(255,100,50,0.07)', border: '1px solid rgba(255,100,50,0.3)', display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ fontSize: 24 }}>⚠️</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{autoData.flagged.length} businesses need attention</div>
                    <div style={{ fontSize: 12, color: 'rgba(232,238,255,0.5)' }}>Missing keywords, cities, or no recent posts.</div>
                  </div>
                </div>
                {autoData.flagged.map(b => (
                  <div key={b.id} style={{ ...rowStyle, borderColor: 'rgba(255,100,50,0.3)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{b.name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(232,238,255,0.5)', marginTop: 2 }}>
                        {b.user?.email}
                        {!b.targetKeywords?.length && ' · ⚠️ No keywords'}
                        {!b.targetCities?.length && ' · ⚠️ No cities'}
                        {(!b.lastPostGeneratedAt || new Date(b.lastPostGeneratedAt) < new Date(Date.now() - 30*24*60*60*1000)) && ' · ⚠️ No recent posts'}
                      </div>
                    </div>
                    {b.lastPostGeneratedAt && <div style={{ fontSize: 11, color: 'rgba(232,238,255,0.5)' }}>Last: {new Date(b.lastPostGeneratedAt).toLocaleDateString()}</div>}
                  </div>
                ))}
                <div style={{ marginTop: 28, marginBottom: 16, fontSize: 13, fontWeight: 700 }}>All Active Businesses</div>
              </>
            )}
            {!autoData?.flagged?.length && <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>All Active Businesses</div>}
            {autoData?.businesses?.map(b => (
              <div key={b.id} style={rowStyle}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(232,238,255,0.5)', marginTop: 2 }}>
                    {b._count.automationPosts} posts · Keywords: {b.targetKeywords?.join(', ') || 'none'} · Cities: {b.targetCities?.join(', ') || 'none'}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(232,238,255,0.5)' }}>
                  {b.lastPostGeneratedAt ? `Posts: ${new Date(b.lastPostGeneratedAt).toLocaleDateString()}` : 'Never generated'}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
