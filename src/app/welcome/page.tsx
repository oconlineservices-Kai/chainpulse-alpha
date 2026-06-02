'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { ArrowRight, Eye, EyeOff, Lock, Mail, Zap, Crown, Sparkles, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function WelcomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isFreshSignup = searchParams.get('registered') === 'true'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'create' | 'tour'>('create')

  // Auto-navigate non-registered users to login
  useEffect(() => {
    if (!isFreshSignup) {
      router.replace('/login')
    }
  }, [isFreshSignup, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // Password wasn't set yet during signup — user needs to set it here
        // This is the first login after registration
        setError('Invalid email or password. Try signing in.')
      } else if (result?.ok) {
        setStep('tour')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Tour step
  if (step === 'tour') {
    return <WelcomeTour />
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <span className="font-bold text-xl">C</span>
            </div>
            <span className="font-bold text-2xl">ChainPulse Alpha</span>
          </Link>
        </div>

        {/* Set Password Card */}
        <div className="bg-background-card border border-success-500/30 rounded-2xl p-8">
          {/* Success Badge */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-success-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Account Created! 🎉</h1>
            <p className="text-text-secondary text-sm">
              Set your password and start catching crypto moves.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-danger-500/10 border border-danger-500/20 rounded-lg text-danger-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Create Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-text-muted">Must be at least 8 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full button-primary py-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="loading-spinner" />
              ) : (
                <>
                  Start Your Free Access
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
      </div>
    </div>
  )
}

/** Post-login welcome tour — shows features, first free signal preview, and CTA */
function WelcomeTour() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        {/* Step 1: Congratulations */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-success-500 to-primary-500 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            You&apos;re In! 🚀
          </h1>
          <p className="text-text-secondary text-lg max-w-xl mx-auto">
            Welcome to ChainPulse Alpha. Here&apos;s your dashboard and what you can do right now.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-4 mb-10">
          {[
            {
              icon: Zap,
              color: 'from-primary-500 to-secondary-500',
              title: 'Real-Time Signal Feed',
              desc: 'See the top 5 daily crypto signals with AI-powered sentiment and whale confidence scores.',
            },
            {
              icon: Sparkles,
              color: 'from-warning-500 to-orange-500',
              title: 'Unlock Individual Signals',
              desc: 'Pay only for what you use — unlock any signal for $1 with Pay-Per-Alpha. No subscription needed.',
            },
            {
              icon: Crown,
              color: 'from-purple-500 to-pink-500',
              title: 'Premium Access',
              desc: 'Unlock all signals in real-time, Diamond tier alerts, whale wallet analysis, and priority support.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="glass-card p-6 rounded-2xl border border-border flex items-start gap-4"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-text-muted text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="button-primary px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/pricing"
            className="button-secondary px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            View Pricing
          </Link>
        </div>

        <p className="text-center text-text-muted text-xs mt-6">
          Start free. No credit card required. Upgrade anytime.
        </p>
      </div>
    </div>
  )
}
