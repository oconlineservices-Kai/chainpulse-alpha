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
  const premiumExpiresAt = (session?.user as any)?.premiumExpiresAt
  const isPremiumActive = isPremium && premiumExpiresAt && new Date(premiumExpiresAt) > new Date()
  const userCredits = (session?.user as any)?.credits ?? 0

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (isPremiumActive) {
        // Premium: show all signals with full data from CoinGecko proxy
        const data = await fetchTopCoins(20)
        setSignals(data)
      } else {
        // Free tier: fetch from the real /api/signals endpoint which handles gating
        const res = await fetch('/api/signals?limit=10')
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const json = await res.json()
        const apiSignals = json?.data?.signals ?? []

        // Map API signals to the Signal type expected by AlphaFeed
        // The backend already stamps 'locked: true' for indices 3+
        // and strips premium metadata (wallets, etc.)
        const mapped = apiSignals.map((s: any, idx: number) => ({
          id: s.id,
          tokenSymbol: s.tokenSymbol,
          tokenName: s.tokenName ?? s.tokenSymbol,
          price: 0,
          priceChange: 0,
          sentimentScore: s.sentimentScore ?? 0,
          whaleConfidence: s.whaleConfidence ?? 0,
          correlationScore: s.correlationScore ?? 0,
          timestamp: s.createdAt ?? new Date().toISOString(),
          status: (s.locked === true ? 'Locked' : 'Free') as 'Free' | 'Premium' | 'Locked',
          twitterMentions: s.twitterMentions ?? 0,
          whaleWallets: s.whaleWallets ?? [],
          recommendation: 'Skip' as 'Buy' | 'Sell' | 'Skip',
          volume24h: 0,
          marketCap: 0,
          locked: s.locked === true,
        }))

        setSignals(mapped)
      }
    } catch (err) {
      console.error('Failed to fetch crypto data:', err)
      setError('Live market data temporarily unavailable. Showing fallback signals.')
      const fallback = (isPremiumActive ? mockSignals : mockSignals.slice(0, 5)).map(s => ({
        ...s,
        signalSource: 'cached' as const,
      }))
      setSignals(fallback)
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
  }, [status, isPremiumActive])

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
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse shrink-0" />
            <span className="text-sm font-medium text-text-secondary truncate">
              {isPremiumActive ? '⚡ Premium — Live Alpha Feed' : 'Alpha Feed'}
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
          {isPremiumActive && (
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

          {/* Free User Upgrade Banner (single, focused CTA — no redundant Free-tier marketing) */}
          {!isPremiumActive && (
            <div className="mb-6 p-4 rounded-xl border border-primary-500/30 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-text-primary">Unlock Full Potential</p>
                  <p className="text-xs text-text-muted">
                    {userCredits > 0
                      ? `You have ${userCredits} credit${userCredits > 1 ? 's' : ''}. Use them to unlock premium signals individually.`
                      : 'Top 5 signals shown. Upgrade to Premium for real-time access to all 20+ signals.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/pricing"
                  className="button-primary px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                >
                  <Zap className="w-4 h-4" />
                  {userCredits > 0 ? 'Get Credits' : 'Upgrade'}
                </Link>
              </div>
            </div>
          )}

          {/* Premium-locked signals count — clean, minimal */}
          {!isPremiumActive && signals.length > 0 && (
            <div className="mb-6 text-center">
              <p className="text-xs text-text-muted">
                <span className="text-text-secondary font-medium">{signals.length}</span> free signals shown.
                Premium unlocks <span className="text-text-secondary font-medium">real-time</span> access to all signals plus{' '}
                <span className="text-text-secondary font-medium">Diamond tier</span> and{' '}
                <span className="text-text-secondary font-medium">whale analytics</span>.
                {' '}<Link href="/pricing" className="text-primary-400 hover:text-primary-300 underline underline-offset-2">Upgrade →</Link>
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
          <AlphaFeed signals={signals} onSelectSignal={setSelectedSignal} onRefetch={fetchData} />

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
