'use client'

'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Crown, ArrowRight, Zap, Loader2, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function PaymentSuccess() {
  const { data: session, update } = useSession()
  const [sessionRefreshed, setSessionRefreshed] = useState(false)
  const isLoggedIn = !!session

  useEffect(() => {
    document.title = 'Payment Successful | ChainPulse Alpha'
  }, [])

  useEffect(() => {
    if (!isLoggedIn) return // don't try to refresh session if not logged in

    const refreshAndRedirect = async () => {
      try {
        await update()
        setSessionRefreshed(true)
      } catch {
        setSessionRefreshed(true)
      }

      const timer = setTimeout(() => {
        window.location.href = '/dashboard'
      }, 5000)
      return () => clearTimeout(timer)
    }

    refreshAndRedirect()

    // Track successful payment for analytics
    try {
      const events = JSON.parse(localStorage.getItem('payment_analytics') || '[]')
      events.push({ event: 'payment_success', timestamp: Date.now(), page: window.location.search })
      localStorage.setItem('payment_analytics', JSON.stringify(events.slice(-20)))
    } catch {}
  }, [update, isLoggedIn])

  // Unauthenticated: show success info + login CTA instead of dead redirect
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="glass-card p-12 rounded-2xl border border-success-500/30 text-center">
            <div className="w-24 h-24 rounded-full bg-success-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-14 h-14 text-success-400" />
            </div>

            <h1 className="text-3xl font-bold mb-3">Payment Successful! 🎉</h1>
            <p className="text-text-secondary mb-6">
              Your payment went through. Log in to access your premium features.
            </p>

            <Link
              href="/login"
              className="button-primary px-8 py-3 rounded-xl font-semibold inline-flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Log In to Activate
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="glass-card p-12 rounded-2xl border border-success-500/30 text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 rounded-full bg-success-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-14 h-14 text-success-400" />
          </div>

          <h1 className="text-3xl font-bold mb-3">Payment Successful! 🎉</h1>
          <p className="text-text-secondary mb-2">
            Welcome to ChainPulse Alpha Premium.
          </p>
          <p className="text-text-muted text-sm mb-2">
            Your account has been upgraded. You now have access to all Diamond Signals, 
            real-time alerts, and full dashboard features.
          </p>
          {!sessionRefreshed && (
            <p className="text-text-muted text-xs mb-4 flex items-center justify-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Activating premium features…
            </p>
          )}
          {sessionRefreshed && (
            <p className="text-success-400 text-xs mb-4">
              ✓ Premium access activated
            </p>
          )}

          {/* What's unlocked */}
          <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-6 mb-8 text-left">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold text-sm">You now have access to:</span>
            </div>
            <ul className="space-y-2 text-sm text-text-secondary">
              {[
                'Real-time signals — 0 delay',
                'All Diamond & Gold tier signals',
                'Real-time push alerts',
                'Full historical data access',
                'Advanced whale wallet analysis',
                'Priority support',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/dashboard"
            className="button-primary px-8 py-3 rounded-xl font-semibold inline-flex items-center justify-center gap-2"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="text-text-muted text-xs mt-6">
            Redirecting to dashboard in 5 seconds…
          </p>
        </div>
      </div>
    </main>
  )
}
