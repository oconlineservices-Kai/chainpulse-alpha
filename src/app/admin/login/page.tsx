'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { ArrowRight, Lock, Mail, Shield } from 'lucide-react'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError('Invalid admin credentials')
      } else if (result?.ok) {
        router.push('/admin/dashboard')
        router.refresh()
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-danger-500 to-warning-500 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl">Admin Portal</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-background-card border border-border rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-2">Admin Access</h1>
          <p className="text-text-secondary mb-6">
            Restricted area. Authorized personnel only.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-danger-500/10 border border-danger-500/20 rounded-lg text-danger-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@chainpulsealpha.com"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-danger-500 to-warning-500 hover:from-danger-600 hover:to-warning-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <div className="loading-spinner" />
              ) : (
                <>
                  Access Admin
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-text-muted hover:text-text-primary">
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
