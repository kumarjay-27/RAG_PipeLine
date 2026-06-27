'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    setError(null)
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError('Invalid email or password.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      setError('An error occurred during sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      padding: '1rem'
    }}>
      <div className="card w-full" style={{ maxWidth: '400px' }}>
        <h2 className="text-center mb-1" style={{ fontSize: '1.75rem', fontWeight: 700 }}>Welcome Back</h2>
        <p className="text-center text-secondary mb-4" style={{ fontSize: '0.9rem' }}>Sign in to continue learning RAG</p>

        {error && (
          <div className="badge badge-error w-full mb-3 text-center" style={{ borderRadius: 'var(--radius-sm)', padding: '0.5rem', display: 'block' }}>
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Email Address</label>
            <input
              type="email"
              className="input"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="btn-primary w-full mt-2"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Sign In'}
          </button>
        </div>

        <p className="text-center text-secondary mt-4" style={{ fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <Link href="/register" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}
