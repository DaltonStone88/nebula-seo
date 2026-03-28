'use client'
import { useState, Suspense } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Starfield from '../../components/Starfield'

function LoginForm() {
  const searchParams = useSearchParams()
  const defaultSignup = searchParams.get('signup') === 'true'
  const [isSignup, setIsSignup] = useState(defaultSignup)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()
  const { data: session } = useSession()

  if (session) {
    router.push('/dashboard')
    return null
  }

  const handleGoogle = async () => {
    setLoading(true)
    setError(null)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch (e) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', zIndex: 1 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <Link href="/" style={{ display: 'flex', justifyContent: 'center', marginBottom: 44 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, letterSpacing: 2, background: 'linear-gradient(135deg, var(--nebula-blue), var(--nebula-purple), var(--nebula-pink))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 15px rgba(123,47,255,0.6))' }}>
            NEBULASEO
          </span>
        </Link>

        <div style={{ background: 'rgba(232,238,255,0.03)', border: '1px solid var(--border)', borderRadius: 24, padding: '44px 40px', backdropFilter: 'blur(20px)', boxShadow: '0 0 80px rgba(123,47,255,0.08)' }}>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 4, marginBottom: 36 }}>
            {['Log In', 'Sign Up'].map((tab, i) => (
              <button key={tab} onClick={() => setIsSignup(i === 1)} style={{
                flex: 1, padding: '10px', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: 1,
                textTransform: 'uppercase', transition: 'all 0.3s',
                background: (i === 1) === isSignup ? 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-pink))' : 'transparent',
                color: (i === 1) === isSignup ? '#fff' : 'var(--dim)',
                boxShadow: (i === 1) === isSignup ? '0 0 20px rgba(123,47,255,0.3)' : 'none',
              }}>{tab}</button>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--dim)', marginBottom: 28, lineHeight: 1.6 }}>
            {isSignup ? 'Create your account to get started.' : 'Welcome back. Sign in to your dashboard.'}
          </p>

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(255,45,154,0.1)', border: '1px solid rgba(255,45,154,0.3)', fontSize: 13, color: 'rgba(255,45,154,0.9)', marginBottom: 20, textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button onClick={handleGoogle} disabled={loading} style={{
            width: '100%', padding: '14px', borderRadius: 12,
            border: '1px solid var(--border)',
            background: loading ? 'rgba(232,238,255,0.02)' : 'rgba(232,238,255,0.05)',
            color: 'var(--star-white)', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            fontSize: 14, fontFamily: 'var(--font-body)', fontWeight: 500,
            transition: 'all 0.3s', marginBottom: 20,
          }}>
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                Connecting...
              </span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 11, color: 'var(--dim2)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <button onClick={handleGoogle} disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '15px', fontSize: 13 }}>
            {isSignup ? '🚀 Create Free Account' : 'Sign In →'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--dim2)' }}>
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <button onClick={() => setIsSignup(!isSignup)} style={{ background: 'none', border: 'none', color: 'var(--nebula-blue)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)' }}>
            {isSignup ? 'Log in' : 'Sign up free'}
          </button>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function Login() {
  return (
    <>
      <Starfield opacity={0.7} />
      <Suspense fallback={<div />}>
        <LoginForm />
      </Suspense>
    </>
  )
}
