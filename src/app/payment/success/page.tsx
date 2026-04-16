'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Crown, ArrowRight, Zap, Loader2 } from 'lucide-react'
import Link from 'next/link'
import FadeIn from '@/components/animations/FadeIn'
import { useSession } from 'next-auth/react'

export default function PaymentSuccess() {
  const { update } = useSession()
  const [sessionRefreshed, setSessionRefreshed] = useState(false)

  useEffect(() => {
    // Force session refresh so JWT picks up new premiumStatus from DB
    const refreshAndRedirect = async () => {
      try {
        // Trigger JWT update callback which re-queries DB for premiumStatus
        await update()
        setSessionRefreshed(true)
      } catch {
        setSessionRefreshed(true) // proceed regardless
      }

      // Redirect to dashboard after 5 seconds
      const timer = setTimeout(() => {
        window.location.href = '/dashboard'
      }, 5000)
      return () => clearTimeout(timer)
    }

    refreshAndRedirect()
  }, [update])

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <FadeIn>
          <div className="glass-card p-12 rounded-2xl border border-success-500/30 text-center">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-24 h-24 rounded-full bg-success-500/20 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-14 h-14 text-success-400" />
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
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
            </motion.div>

            {/* What's unlocked */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-6 mb-8 text-left"
            >
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold text-sm">You now have access to:</span>
              </div>
              <ul className="space-y-2 text-sm text-text-secondary">
                {[
                  'Real-time signals — 0 delay',
                  'All Diamond & Gold tier signals',
                  'Telegram bot integration',
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
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/dashboard"
                className="button-primary px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <p className="text-text-muted text-xs mt-6">
              Redirecting to dashboard in 5 seconds…
            </p>
          </div>
        </FadeIn>
      </div>
    </main>
  )
}
