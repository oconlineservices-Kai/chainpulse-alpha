'use client'

import { useState, useEffect } from 'react'
import { LogOut, Crown, Zap, Lock, RefreshCw, ShoppingCart, X, ArrowRight } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import AlphaFeed from '@/components/dashboard/AlphaFeed'
import SignalDetail from '@/components/dashboard/SignalDetail'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { fetchTopCoins, mockSignals, Signal } from '@/lib/api/crypto'
import Link from 'next/link'

const BUILD_VERSION = '2026-05-30-v2'

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
  const [showAbandonedBanner, setShowAbandonedBanner] = useState(false)
  const [lockedCount, setLockedCount] = useState(0)

  // Check for abandoned checkout on mount
  useEffect(() => {
    if (status !== 'authenticated') return
    try {
      const raw = localStorage.getItem('abandoned_checkout')
      const dismissed = localStorage.getItem('abandoned_checkout_dismissed')
      if (raw && dismissed !== 'true') {
        const data = JSON.parse(raw)
        const age = Date.now() - (data.timestamp || 0)
        if (age < 24 * 60 * 60 * 1000) {
          setShowAbandonedBanner(true)
        }
      }
    } catch {}
  }, [status])

  const dismissAbandonedBanner = () => {
    setShowAbandonedBanner(false)
    try { localStorage.setItem('abandoned_checkout_dismissed', 'true') } catch {}
  }

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
        const res = await fetch(`/api/signals?limit=10&_v=${BUILD_VERSION}`)
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const json = await res.json()
        const apiSignals = json?.data?.signals ?? []

        // Map API signals — API now only returns unlocked signals for free users
        const mapped = apiSignals.map((s: any) => ({
          id: s.id,
          tokenSymbol: s.tokenSymbol,
          tokenName: s.tokenName ?? s.tokenSymbol,
          price: s.price ?? 0,
          priceChange: s.priceChange ?? 0,
          sentimentScore: s.sentimentScore ?? 0,
          whaleConfidence: s.whaleConfidence ?? 0,
          correlationScore: s.correlationScore ?? 0,
          timestamp: s.createdAt ?? new Date().toISOString(),
          status: 'Free' as 'Free' | 'Premium' | 'Locked',
          twitterMentions: s.twitterMentions ?? 0,
          whaleWallets: s.whaleWallets ?? [],
          recommendation: (s.recommendation ?? 'Skip') as 'Buy' | 'Sell' | 'Skip',
          volume24h: s.volume24h ?? 0,
          marketCap: s.marketCap ?? 0,
          locked: false,
        }))

        // Extract locked count from API meta for upgrade CTA
        setLockedCount(json?.data?.meta?.lockedCount ?? 0)
        // 🛡️ EXPLICIT ARRAY TRUNCATION: Free users NEVER get more than 3 signals,
        // regardless of what the API returns. Safety layer against any backend leak.
        const maxFreeSignals = 3
        setSignals(mapped.length > maxFreeSignals ? mapped.slice(0, maxFreeSignals) : mapped)
      }
    } catch (err) {
      console.error('Failed to fetch crypto data:', err)
      setError('Live market data temporarily unavailable. Showing fallback signals.')

      // Fallback: show only the mock signals (free preview)
      setLockedCount(isPremiumActive ? 0 : 5)
      // 🛡️ EXPLICIT ARRAY TRUNCATION: Free fallback NEVER shows more than 3 signals
      const maxFreeSignals = 3
      const fallback = mockSignals.slice(0, isPremiumActive ? undefined : maxFreeSignals).map(s => ({
        ...s,
        locked: false,
        status: 'Free' as const,
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

          {/* Abandoned checkout recovery banner */}
          {showAbandonedBanner && !isPremiumActive && (
            <div className="mb-4 p-4 rounded-xl border border-warning-500/40 bg-gradient-to-r from-warning-500/10 to-orange-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">You left something behind 🛒</p>
                  <p className="text-xs text-text-muted">
                    Your checkout was interrupted. Continue where you left off and unlock premium signals.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={dismissAbandonedBanner}
                  className="text-xs text-text-muted hover:text-text-secondary px-3 py-1.5"
                >
                  <X className="w-4 h-4" />
                </button>
                <Link
                  href="/pricing"
                  className="bg-gradient-to-r from-warning-500 to-orange-500 hover:from-warning-600 hover:to-orange-600 text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  Complete Purchase
                </Link>
              </div>
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
                      : 'Top 3 signals shown. Unlock individual signals with a credit or upgrade to Premium for real-time access to all 20+ signals.'}
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

          {/* Premium upgrade CTA — no locked tokens shown */}
          {!isPremiumActive && signals.length > 0 && lockedCount > 0 && (
            <div className="mb-6 p-6 rounded-2xl border border-primary-500/30 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 text-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-4">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                {lockedCount} Premium Signals Hidden
              </h3>
              <p className="text-text-muted text-sm mb-4 max-w-md mx-auto">
                Upgrade to unlock real-time access to all signals including Diamond tier, whale wallet analysis, and priority alerts. Pay-per-signal also available from $1.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/pricing"
                  className="button-primary px-6 py-2.5 rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade to Premium
                </Link>
                <Link
                  href="/signals"
                  className="button-secondary px-6 py-2.5 rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2"
                >
                  View Preview Signals
                </Link>
              </div>
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
          
            {selectedSignal && (
              <SignalDetail
                signal={selectedSignal}
                onClose={() => setSelectedSignal(null)}
                onRefetch={fetchData}
              />
            )}
          
        </div>
      </ErrorBoundary>
    </div>
  )
}
