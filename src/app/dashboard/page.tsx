'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { LogOut, Crown, Zap, Lock, RefreshCw } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import AlphaFeed from '@/components/dashboard/AlphaFeed'
import SignalDetail from '@/components/dashboard/SignalDetail'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { fetchTopCoins, mockSignals, Signal } from '@/lib/api/crypto'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, status, update } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = '/login?callbackUrl=/dashboard'
    },
  })

  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null)
  const [signals, setSignals] = useState<Signal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pull premiumStatus from session — refreshed after payment via JWT callback
  const isPremium = (session?.user as any)?.premiumStatus === 'premium'

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchTopCoins(20)

      // Apply free-tier restriction: free users see only 5 signals with 15min delay indicator
      if (!isPremium) {
        setSignals(data.slice(0, 5).map(s => ({
          ...s,
          status: (s.correlationScore >= 85 ? 'Locked' : 'Free') as 'Free' | 'Premium' | 'Locked',
        })))
      } else {
        setSignals(data)
      }
    } catch (err) {
      console.error('Failed to fetch crypto data:', err)
      setError('Live market data temporarily unavailable. Showing fallback signals.')
      setSignals(isPremium ? mockSignals : mockSignals.slice(0, 5))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
      const interval = setInterval(fetchData, 60000)
      return () => clearInterval(interval)
    }
  }, [status, isPremium])

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 lg:pt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-20 lg:pt-24">
      {/* Dashboard sub-header */}
      <header className="border-b border-border bg-background-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-text-secondary">
              {isPremium ? '⚡ Premium — Live Alpha Feed' : 'Alpha Feed (Free Tier)'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/signals"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              All Signals
            </Link>
            {/* Admin link only for admins */}
            {(session?.user as any)?.isAdmin && (
              <Link
                href="/admin/dashboard"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-danger-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <ErrorBoundary>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Premium User Banner */}
          {isPremium && (
            <div className="mb-6 p-4 rounded-xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-text-primary">Premium Access Active</p>
                  <p className="text-xs text-text-muted">Real-time signals, Diamond tier, full whale analysis. No restrictions.</p>
                </div>
              </div>
              <button
                onClick={fetchData}
                className="flex items-center gap-2 text-xs text-yellow-400 hover:text-yellow-300"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>
          )}

          {/* Free User Upgrade Banner */}
          {!isPremium && (
            <div className="mb-6 p-4 rounded-xl border border-primary-500/30 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-text-primary">You're on the Free plan</p>
                  <p className="text-xs text-text-muted">
                    Seeing 5 of {signals.length > 5 ? '20+' : 'many'} signals. Diamond signals locked. Upgrade for real-time access.
                  </p>
                </div>
              </div>
              <Link
                href="/pricing"
                className="button-primary px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap flex-shrink-0"
              >
                <Zap className="w-4 h-4" />
                Upgrade to Premium
              </Link>
            </div>
          )}

          {/* Free tier: show locked signals teaser */}
          {!isPremium && (
            <div className="mb-6 p-4 rounded-xl border border-dashed border-border text-center">
              <Lock className="w-6 h-6 text-text-muted mx-auto mb-2" />
              <p className="text-sm text-text-muted">
                <strong className="text-text-secondary">15+ more signals</strong> including Diamond tier are locked.{' '}
                <Link href="/pricing" className="text-primary-400 hover:text-primary-300">Upgrade →</Link>
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Main Alpha Feed */}
          <AlphaFeed signals={signals} onSelectSignal={setSelectedSignal} />

          {/* Signal Detail Modal */}
          <AnimatePresence>
            {selectedSignal && (
              <SignalDetail
                signal={selectedSignal}
                onClose={() => setSelectedSignal(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </ErrorBoundary>
    </div>
  )
}
