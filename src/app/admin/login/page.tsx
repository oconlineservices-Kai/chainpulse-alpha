'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Shield, LogIn, AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials or insufficient permissions.')
        return
      }

      // Verify admin access after login
      const res = await fetch('/api/admin/enhanced-stats')
      if (res.status === 403 || res.status === 401) {
        setError('You do not have admin access.')
        return
      }

      router.push('/admin/dashboard')
      router.refresh()
    } catch {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-danger-500 to-warning-500 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Admin Access</h1>
          <p className="text-text-muted text-sm mt-2">ChainPulse Alpha — Restricted Area</p>
        </div>

        {/* Login Form */}
        <div className="bg-background-card border border-border rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-danger-900/30 border border-danger-500/50 rounded-xl">
                <AlertCircle className="w-5 h-5 text-danger-400 shrink-0" />
                <p className="text-sm text-danger-300">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@chainpulsealpha.com"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-danger-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-danger-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-danger-500 to-warning-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In to Admin
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-text-muted text-xs mt-6">
          This area is restricted to authorized administrators only.
          <br />
          <a href="/" className="text-primary-400 hover:text-primary-300 mt-1 inline-block">
            ← Back to ChainPulse Alpha
          </a>
        </p>
      </div>
    </div>
  )
}
