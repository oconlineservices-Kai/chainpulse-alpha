'use client'

import { useEffect } from 'react'
import { XCircle, RefreshCw, Home, HelpCircle } from 'lucide-react'
import Link from 'next/link'

export default function PaymentFailed() {
  useEffect(() => {
    document.title = 'Payment Failed | ChainPulse Alpha'
    try {
      const events = JSON.parse(localStorage.getItem('payment_analytics') || '[]')
      events.push({ event: 'payment_failure', timestamp: Date.now(), page: window.location.search })
      localStorage.setItem('payment_analytics', JSON.stringify(events.slice(-20)))
    } catch {}
  }, [])

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-16 max-w-lg">
        <div className="glass-card p-12 rounded-2xl border border-danger-500/20 text-center">
          {/* Failure Icon */}
          <div className="w-24 h-24 rounded-full bg-danger-500/20 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-14 h-14 text-danger-400" />
          </div>

          <h1 className="text-3xl font-bold mb-3">Payment Failed</h1>
          <p className="text-text-secondary mb-2">
            Something went wrong while processing your payment.
          </p>
          <p className="text-text-muted text-sm mb-8">
            This could be due to a network issue, declined card, or a temporary error.
            Your account has <span className="font-semibold text-text-secondary">not been charged</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/pricing"
              className="button-primary px-6 py-3 rounded-xl font-semibold inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Link>
            <Link
              href="/"
              className="button-secondary px-6 py-3 rounded-xl font-semibold inline-flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <Link
              href="/contact"
              className="text-text-muted hover:text-text-primary text-sm inline-flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Need help? Contact support
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
