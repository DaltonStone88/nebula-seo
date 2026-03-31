'use client'
import { useState, useEffect } from 'react'



function StatCard({ value, label, color = 'var(--nebula-purple)', prefix = '' }) {
  return (
    <div style={{ padding: '28px 24px', borderRadius: 16, background: 'rgba(232,238,255,0.02)', border: '1px solid var(--border)', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color, marginBottom: 6 }}>
        {prefix}{typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: value % 1 !== 0 ? 2 : 0, maximumFractionDigits: 2 }) : value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: 2 }}>{label}</div>
    </div>
  )
}

function PlaidConnectButton({ onConnected, loading, setLoading }) {
  const handleConnect = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/referral/plaid-link-token', { method: 'POST' })
      const data = await res.json()
      if (data.error) { alert('Could not initialize bank connection: ' + data.error); setLoading(false); return }
      if (!window.Plaid) {
        const script = document.createElement('script')
        script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js'
        script.onload = () => openPlaidLink(data.link_token)
        document.head.appendChild(script)
      } else {
        openPlaidLink(data.link_token)
      }
    } catch (e) { alert('Failed to connect bank: ' + e.message); setLoading(false) }
  }

  const openPlaidLink = (linkToken) => {
    const handler = window.Plaid.create({
      token: linkToken,
      onSuccess: async (public_token, metadata) => {
        const account = metadata.accounts?.[0]
        try {
          const res = await fetch('/api/referral', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'connect_bank',
              plaidPublicToken: public_token,
              plaidAccountId: account?.id,
              plaidBankName: metadata.institution?.name || 'Bank',
              plaidAccountMask: account?.mask,
            }),
          })
          const data = await res.json()
          if (data.success) { onConnected() } else { alert('Bank connection failed: ' + data.error) }
        } catch (e) { alert('Bank connection error: ' + e.message) }
        setLoading(false)
      },
      onExit: () => setLoading(false),
      onLoad: () => {},
      onEvent: () => {},
    })
    handler.open()
  }

  return (
    <button onClick={handleConnect} disabled={loading} className="btn-primary" style={{ fontSize: 13, padding: '12px 28px', display: 'flex', alignItems: 'center', gap: 10 }}>
      {loading
        ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />Connecting...</>
        : <>🏦 Connect Bank Account</>}
    </button>
  )
}

export default function Referral() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)
  const [bankLoading, setBankLoading] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/referral')
      const json = await res.json()
      if (!json.error) setData(json)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const referralLink = data?.referralCode ? `https://www.nebulaseo.com/login?ref=${data.referralCode}` : ''

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWithdraw = async () => {
    const amt = parseFloat(withdrawAmount)
    if (!amt || amt < 10) return
    setWithdrawing(true)
    try {
      const res = await fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'withdraw', amount: amt }),
      })
      const result = await res.json()
      if (result.success) {
        setWithdrawSuccess(true); setShowWithdrawModal(false); setWithdrawAmount('')
        await loadData()
      } else { alert(result.error || 'Withdrawal failed') }
    } catch (e) { alert(e.message) }
    setWithdrawing(false)
  }

  const handleDisconnectBank = async () => {
    if (!confirm('Disconnect your bank account?')) return
    setDisconnecting(true)
    await fetch('/api/referral', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'disconnect_bank' }) })
    await loadData(); setDisconnecting(false)
  }

  const statusBadge = (status) => {
    const map = {
      PENDING:  { bg: 'rgba(255,184,48,0.1)',  border: 'rgba(255,184,48,0.3)',  color: 'rgba(255,184,48,0.9)',  label: 'Pending' },
      APPROVED: { bg: 'rgba(20,200,100,0.1)',  border: 'rgba(20,200,100,0.3)',  color: 'rgba(20,200,100,0.9)',  label: 'Approved' },
      PAID:     { bg: 'rgba(0,200,255,0.1)',   border: 'rgba(0,200,255,0.3)',   color: 'rgba(0,200,255,0.9)',   label: 'Paid' },
      REJECTED: { bg: 'rgba(255,50,50,0.1)',   border: 'rgba(255,50,50,0.3)',   color: 'rgba(255,100,100,0.9)', label: 'Rejected' },
    }
    const s = map[status] || map.PENDING
    return <span style={{ padding: '3px 10px', borderRadius: 20, background: s.bg, border: `1px solid ${s.border}`, fontSize: 11, color: s.color }}>{s.label}</span>
  }

  if (loading) return (
    <div>
      <div style={{ padding: '20px 36px', borderBottom: '1px solid var(--border)', background: 'rgba(6,6,18,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50,  }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Referrals</h1>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: 36, height: 36, border: '3px solid rgba(123,47,255,0.3)', borderTopColor: 'var(--nebula-purple)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const stats = data?.stats || {}
  const hasPendingWithdrawal = data?.withdrawals?.some(w => w.status === 'PENDING')

  return (
    <div>
      <div style={{ padding: '20px 36px', borderBottom: '1px solid var(--border)', background: 'rgba(6,6,18,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50,  }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Referrals</h1>
      </div>

      <div style={{ padding: '32px 36px', maxWidth: 900, margin: '0 auto' }}>

        {/* Hero */}
        <div style={{ borderRadius: 20, background: 'linear-gradient(135deg, rgba(123,47,255,0.15), rgba(0,200,255,0.08))', border: '1px solid rgba(123,47,255,0.3)', padding: '36px 40px', marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,47,255,0.2), transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--nebula-purple)', marginBottom: 10 }}>Referral Program</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, marginBottom: 10, lineHeight: 1.2 }}>
                Earn <span style={{ background: 'linear-gradient(135deg, var(--nebula-blue), var(--nebula-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>20% commission</span><br />on every referral
              </h2>
              <p style={{ fontSize: 14, color: 'var(--dim)', lineHeight: 1.7, maxWidth: 420 }}>
                For every business location your referrals subscribe to, you earn <strong style={{ color: 'var(--star-white)' }}>$15.80/month</strong> — for as long as they stay active. No cap, no expiry.
              </p>
            </div>
            <div style={{ fontSize: 64, flexShrink: 0 }}>💸</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          <StatCard value={stats.totalReferrals || 0} label="Total Referrals" color="var(--nebula-blue)" />
          <StatCard value={stats.activeReferrals || 0} label="Active Referrals" color="rgba(20,200,100,0.9)" />
          <StatCard value={stats.totalEarned || 0} label="Total Earned" color="var(--nebula-purple)" prefix="$" />
          <StatCard value={stats.availableBalance || 0} label="Available" color="var(--nebula-gold)" prefix="$" />
        </div>

        {/* Referral link */}
        <div style={{ borderRadius: 16, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.02)', padding: '24px 28px', marginBottom: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Your Referral Link</div>
          <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 16 }}>Share this link — anyone who signs up through it is credited to you permanently.</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ flex: 1, padding: '12px 16px', borderRadius: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--nebula-blue)', letterSpacing: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {referralLink || 'Loading...'}
            </div>
            <button onClick={copyLink} className="btn-primary" style={{ fontSize: 12, padding: '11px 24px', flexShrink: 0 }}>
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
          {data?.referralCode && (
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--dim)' }}>
              Your code: <span style={{ color: 'var(--nebula-purple)', fontFamily: 'var(--font-display)', letterSpacing: 2 }}>{data.referralCode}</span>
            </div>
          )}
        </div>

        {/* Bank + Withdraw */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
          <div style={{ borderRadius: 16, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.02)', padding: '24px 28px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>🏦 Bank Account</div>
            <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 20, lineHeight: 1.6 }}>Connect your bank securely via Plaid to receive withdrawals directly.</div>
            {data?.bankConnected ? (
              <div>
                <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(20,200,100,0.07)', border: '1px solid rgba(20,200,100,0.2)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(20,200,100,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>✓</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(20,200,100,0.9)', marginBottom: 2 }}>Connected</div>
                    <div style={{ fontSize: 12, color: 'var(--dim)' }}>{data.bankName} ···{data.accountMask}</div>
                  </div>
                </div>
                <button onClick={handleDisconnectBank} disabled={disconnecting} style={{ fontSize: 12, color: 'var(--dim)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontFamily: 'var(--font-body)' }}>
                  {disconnecting ? 'Disconnecting...' : 'Disconnect bank'}
                </button>
              </div>
            ) : (
              <PlaidConnectButton loading={bankLoading} setLoading={setBankLoading} onConnected={loadData} />
            )}
          </div>

          <div style={{ borderRadius: 16, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.02)', padding: '24px 28px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>💳 Withdraw Earnings</div>
            <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 20, lineHeight: 1.6 }}>
              Available: <strong style={{ color: 'var(--nebula-gold)' }}>${(stats.availableBalance || 0).toFixed(2)}</strong>
              <br />Minimum withdrawal: $10.00
            </div>
            {!data?.bankConnected ? (
              <div style={{ padding: '14px', borderRadius: 12, background: 'rgba(255,184,48,0.06)', border: '1px solid rgba(255,184,48,0.2)', fontSize: 12, color: 'rgba(255,184,48,0.8)' }}>
                Connect your bank account first to withdraw.
              </div>
            ) : hasPendingWithdrawal ? (
              <div style={{ padding: '14px', borderRadius: 12, background: 'rgba(123,47,255,0.06)', border: '1px solid rgba(123,47,255,0.2)', fontSize: 12, color: 'var(--dim)', lineHeight: 1.6 }}>
                ⏳ You have a withdrawal pending review. We'll process it shortly.
              </div>
            ) : (stats.availableBalance || 0) < 10 ? (
              <div style={{ padding: '14px', borderRadius: 12, background: 'rgba(232,238,255,0.03)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--dim)', lineHeight: 1.6 }}>
                Keep referring to reach the $10 minimum withdrawal.
              </div>
            ) : (
              <button onClick={() => setShowWithdrawModal(true)} className="btn-primary" style={{ fontSize: 13, padding: '12px 28px' }}>
                Request Withdrawal
              </button>
            )}
            {withdrawSuccess && (
              <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 10, background: 'rgba(20,200,100,0.08)', border: '1px solid rgba(20,200,100,0.25)', fontSize: 12, color: 'rgba(20,200,100,0.9)', lineHeight: 1.6 }}>
                ✓ Withdrawal requested! Withdrawals are reviewed manually and typically processed within 3–5 business days. Allow additional time for funds to reflect in your account.
              </div>
            )}
          </div>
        </div>

        {/* Referrals list */}
        {(data?.referrals?.length || 0) > 0 && (
          <div style={{ borderRadius: 16, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.02)', padding: '24px 28px', marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 20 }}>👥 Your Referrals</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.referrals.map(ref => {
                const activeLocations = ref.businesses?.filter(b => b.status === 'ACTIVE').length || 0
                const monthlyEarning = activeLocations * 15.80
                return (
                  <div key={ref.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', borderRadius: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-pink))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0, color: '#fff' }}>
                      {(ref.name || ref.email || '?')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{ref.name || ref.email}</div>
                      <div style={{ fontSize: 11, color: 'var(--dim)' }}>
                        Joined {new Date(ref.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        {activeLocations > 0 && ` · ${activeLocations} active location${activeLocations !== 1 ? 's' : ''}`}
                      </div>
                    </div>
                    {monthlyEarning > 0 && <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--nebula-gold)' }}>+${monthlyEarning.toFixed(2)}/mo</div>}
                    <div style={{ padding: '4px 10px', borderRadius: 20, background: activeLocations > 0 ? 'rgba(20,200,100,0.1)' : 'rgba(232,238,255,0.05)', border: `1px solid ${activeLocations > 0 ? 'rgba(20,200,100,0.3)' : 'var(--border)'}`, fontSize: 11, color: activeLocations > 0 ? 'rgba(20,200,100,0.9)' : 'var(--dim)' }}>
                      {activeLocations > 0 ? 'Active' : 'No active locations'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Withdrawal history */}
        {(data?.withdrawals?.length || 0) > 0 && (
          <div style={{ borderRadius: 16, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.02)', padding: '24px 28px', marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 20 }}>📋 Withdrawal History</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.withdrawals.map(w => (
                <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', borderRadius: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>${w.amount.toFixed(2)}</div>
                    <div style={{ fontSize: 11, color: 'var(--dim)' }}>
                      {new Date(w.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {w.plaidBankName && ` · ${w.plaidBankName} ···${w.plaidAccountMask}`}
                    </div>
                    {w.adminNote && <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4 }}>Note: {w.adminNote}</div>}
                  </div>
                  {statusBadge(w.status)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Commission history */}
        {(data?.commissions?.length || 0) > 0 && (
          <div style={{ borderRadius: 16, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.02)', padding: '24px 28px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 20 }}>💰 Commission History</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.commissions.slice(0, 20).map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>${c.amount.toFixed(2)}</div>
                    <div style={{ fontSize: 11, color: 'var(--dim)' }}>{c.month} · {new Date(c.createdAt).toLocaleDateString()}</div>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11,
                    background: c.paidOut ? 'rgba(0,200,255,0.08)' : c.status === 'AVAILABLE' ? 'rgba(20,200,100,0.08)' : 'rgba(232,238,255,0.05)',
                    border: `1px solid ${c.paidOut ? 'rgba(0,200,255,0.25)' : c.status === 'AVAILABLE' ? 'rgba(20,200,100,0.25)' : 'var(--border)'}`,
                    color: c.paidOut ? 'rgba(0,200,255,0.9)' : c.status === 'AVAILABLE' ? 'rgba(20,200,100,0.9)' : 'var(--dim)',
                  }}>
                    {c.paidOut ? 'Withdrawn' : c.status === 'AVAILABLE' ? 'Available' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => { if (e.target === e.currentTarget) setShowWithdrawModal(false) }}>
          <div style={{ background: 'rgba(10,10,28,0.99)', border: '1px solid var(--border)', borderRadius: 20, padding: '36px', width: '100%', maxWidth: 440 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Request Withdrawal</div>
            <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 24, lineHeight: 1.6 }}>
              Withdrawals are reviewed manually and typically processed within <strong style={{ color: 'var(--star-white)' }}>3–5 business days</strong>. Please allow additional time for funds to reflect in your bank account.
            </p>
            <div style={{ marginBottom: 8, fontSize: 11, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase' }}>Amount</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--dim)' }}>$</span>
                <input
                  type="number" min="10" max={stats.availableBalance} step="0.01"
                  value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="0.00"
                  style={{ width: '100%', padding: '12px 14px 12px 28px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.04)', color: 'var(--star-white)', fontSize: 16, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <button onClick={() => setWithdrawAmount((stats.availableBalance || 0).toFixed(2))} style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(232,238,255,0.04)', color: 'var(--dim)', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap', fontFamily: 'var(--font-body)' }}>Max</button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 24 }}>Available: <span style={{ color: 'var(--nebula-gold)' }}>${(stats.availableBalance || 0).toFixed(2)}</span></div>
            {data?.bankConnected && (
              <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(20,200,100,0.06)', border: '1px solid rgba(20,200,100,0.2)', fontSize: 12, color: 'var(--dim)', marginBottom: 24 }}>
                Sending to: <strong style={{ color: 'var(--star-white)' }}>{data.bankName} ···{data.accountMask}</strong>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowWithdrawModal(false)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--dim)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)' }}>Cancel</button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawing || !withdrawAmount || parseFloat(withdrawAmount) < 10 || parseFloat(withdrawAmount) > (stats.availableBalance || 0)}
                className="btn-primary"
                style={{ flex: 1, fontSize: 13, padding: '12px', justifyContent: 'center', opacity: (!withdrawAmount || parseFloat(withdrawAmount) < 10) ? 0.5 : 1 }}
              >
                {withdrawing ? 'Requesting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @media(max-width:768px){.ref-stats{grid-template-columns:1fr 1fr!important} .ref-bank{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}
