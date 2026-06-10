'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  TrendingUp, 
  Zap, 
  Crown,
  Lock, 
  MessageCircle,
  ArrowLeft,
  Filter,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react'
import FadeIn, { FadeInStagger } from '@/components/animations/FadeIn'
import { HoverScale } from '@/components/animations/ScaleIn'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import BuySignalButton from '@/components/signals/BuySignalButton'
import { usePageMeta } from '@/lib/usePageMeta'

interface LiveSignal {
  id: string
  tokenSymbol: string
  tokenName: string | null
  sentimentScore: number | null
  whaleConfidence: number | null
  correlationScore: number | null
  isDiamondSignal: boolean
  twitterMentions: number | null
  createdAt: string
  expiresAt: string | null
  delayHours?: number
  delayedTimestamp?: string
  locked?: boolean
  isPreview?: boolean
}

interface SignalMeta {
  authenticated: boolean
  isPremium?: boolean
  isRealTime: boolean
  delayHours: number
  signalsVisible: number
  totalAvailable: number
  lockedCount: number
  lockoutThreshold: number | null
  source?: string
}

interface SignalPerformance {
  overall: {
    winRate: number
    totalSignals: number
    avgReturn?: number
    diamondSignals?: number
  }
  byType?: {
    diamond?: { winRate: number; avgReturn: number; count: number }
    whale?: { winRate: number; avgReturn: number; count: number }
    sentiment?: { winRate: number; avgReturn: number; count: number }
  }
  topSignals?: { symbol: string; return: string; date: string; type: string }[]
}

interface SignalsResponse {
  success: boolean
  data: {
    signals: LiveSignal[]
    meta: SignalMeta
    performance: SignalPerformance
    updatedAt: string
  }
}

function usePerformanceStats(metaResponse: SignalMeta | null, perfResponse: SignalPerformance | undefined): { label: string; value: string; sub: string }[] {
  // Default empty until API data loads
  if (!perfResponse) return []

  const o = perfResponse.overall

  // API may return only overall data (no byType, no avgReturn)
  // Show what's available, gracefully falling back
  return [
    {
      label: 'Total Signals',
      value: (o?.totalSignals ?? 0).toLocaleString(),
      sub: 'All-time performance',
    },
    {
      label: 'Win Rate',
      value: o?.winRate != null ? `${o.winRate}%` : '—',
      sub: o?.totalSignals ? `Based on ${(o.totalSignals).toLocaleString()} signals` : '—',
    },
    {
      label: 'Avg. Return per Signal',
      value: o?.avgReturn != null ? `${o.avgReturn >= 0 ? '+' : ''}${o.avgReturn.toFixed(1)}%` : 'Coming soon',
      sub: o?.avgReturn != null ? 'Buy signals only' : 'Gathering data',
    },
    {
      label: 'Access Level',
      value: metaResponse?.authenticated ? (metaResponse?.isPremium ? 'Premium' : 'Free') : 'Guest',
      sub: metaResponse?.isRealTime ? 'Real-time feed' : '15-min delay',
    },
  ]
}

function getSignalType(signal: LiveSignal): 'diamond' | 'whale' | 'sentiment' {
  if (signal.isDiamondSignal) return 'diamond'
  if ((signal.whaleConfidence ?? 0) > 70) return 'whale'
  return 'sentiment'
}

function getRecommendation(signal: LiveSignal): 'Buy' | 'Sell' | 'Skip' {
  const avg = ((signal.sentimentScore ?? 50) + (signal.whaleConfidence ?? 50) + (signal.correlationScore ?? 50)) / 3
  if (avg >= 75) return 'Buy'
  if (avg <= 45) return 'Sell'
  return 'Skip'
}

function getConfidence(signal: LiveSignal): number {
  return signal.correlationScore ?? signal.whaleConfidence ?? signal.sentimentScore ?? 50
}

const typeStyles = {
  diamond: { badge: '💎 Diamond', border: 'border-purple-500/30 hover:border-purple-400/50', tag: 'bg-purple-500/20 text-purple-300', gradient: 'from-purple-500 to-indigo-500' },
  whale: { badge: '🐋 Whale', border: 'border-blue-500/30 hover:border-blue-400/50', tag: 'bg-blue-500/20 text-blue-300', gradient: 'from-blue-500 to-cyan-500' },
  sentiment: { badge: '💬 Sentiment', border: 'border-emerald-500/30 hover:border-emerald-400/50', tag: 'bg-emerald-500/20 text-emerald-300', gradient: 'from-emerald-500 to-teal-500' },
}

export default function SignalsContent({ serverIsGated, serverLockedCount }: { serverIsGated?: boolean; serverLockedCount?: number }) {
  usePageMeta({
    title: 'Live Crypto Signals & Alpha Feed | ChainPulse Alpha',
    description: 'Real-time AI-powered crypto signals with whale wallet tracking and Twitter sentiment analysis. Browse live crypto trading signals, free tier available.',
    ogTitle: 'Live Crypto Signals | ChainPulse Alpha',
    ogDescription: 'Browse real-time AI-powered crypto trading signals. Whale wallet tracking, sentiment analysis, and high-confidence alpha signals updated daily.',
    ogUrl: 'https://chainpulsealpha.com/signals',
    canonical: 'https://chainpulsealpha.com/signals',
    keywords: 'live crypto signals, trading signals, crypto alerts, whale tracking signals, sentiment analysis, AI trading signals'
  })

  const { data: session, status: sessionStatus } = useSession()
  const isSessionLoading = sessionStatus === 'loading'
  const isLoggedIn = !!session
  const userCredits = (session?.user as any)?.credits ?? 0
  const isPremium = (session?.user as any)?.premiumStatus === 'premium'
  // 🛡️ RESTRICTED-BY-DEFAULT: Do NOT trust isPremium until session is resolved
  // isPremium is only trusted when sessionStatus === 'authenticated'
  const isDefinitelyPremium = sessionStatus === 'authenticated' && isPremium
  const [filter, setFilter] = useState<'all' | 'diamond' | 'whale' | 'sentiment'>('all')
  const [signals, setSignals] = useState<LiveSignal[]>([])
  const [meta, setMeta] = useState<SignalMeta | null>(null)
  const [performance, setPerformance] = useState<SignalPerformance | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchSignals = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/signals?type=${filter}&limit=20`)
      const json: SignalsResponse = await res.json()
      
      if (json.success && json.data) {
        // 🛡️ EXPLICIT ARRAY TRUNCATION: Free users NEVER get more than 3 signals,
        // regardless of what the API returns. Safety layer against any backend leak.
        const rawSignals = json.data.signals
        const isFreeTier = !json.data.meta?.isRealTime
        const maxSignals = 3
        const finalSignals = isFreeTier && rawSignals.length > maxSignals
          ? rawSignals.slice(0, maxSignals)
          : rawSignals
        setSignals(finalSignals)
        setMeta(json.data.meta)
        setPerformance(json.data.performance)
        setLastUpdated(new Date(json.data.updatedAt))
      } else {
        setError('Failed to load signals')
      }
    } catch (err) {
      setError('Unable to connect to signal feed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSignals()
  }, [filter])

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(fetchSignals, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [filter])

  const filtered = signals.filter(s => {
    if (filter === 'all') return true
    return getSignalType(s) === filter
  })

  // ============================================================================
  // 🛡️ RESTRICTED-BY-DEFAULT FRONTEND GATING (Per Commander Directive)
  // ============================================================================
  // Security posture: DEFAULT to restricted. Only unlock if EXPLICITLY verified.
  //
  // Layer 1: Backend API /api/signals caps free responses to 3.
  // Layer 2: Frontend — even if backend leaks extra signals, free user sees only 3.
  // Layer 3: LockedSignalCards render by default. Fallback is always 3.
  // ============================================================================
  
  // 🛡️ isGated defaults to TRUE (restricted). Only false when:
  //   (a) Session is fully resolved AND (b) user is definitely premium
  //   OR the meta explicitly says isRealTime
  //
  // CRITICAL: When meta is null (initial load) and session is loading,
  // isGated stays true. No flash-of-premium-data on hydration.
  const isGated = !isDefinitelyPremium && !meta?.isRealTime
  
  // 🛡️ CRITICAL: Force slice at 3 for gated users — even if backend leaks more
  // MAX_SIGNALS_VISIBLE caps display to 3 for gated users
  const MAX_FREE_SIGNALS = 3
  const visibleSignals = isGated ? filtered.slice(0, MAX_FREE_SIGNALS) : filtered
  
  // 🛡️ CRITICAL: lockedCount defaults to 3 if meta is missing or corrupted
  const lockedCount = meta?.lockedCount ?? MAX_FREE_SIGNALS
  
  // 🛡️ Effective gate state: combine SSR and client state
  // When meta is null (still loading) — defer to server props (restricted by default)
  // When meta is loaded — use client-side isGated
  const effectiveIsGated = meta !== null ? isGated : (serverIsGated !== false)
  const effectiveLockedCount = meta?.lockedCount ?? serverLockedCount ?? MAX_FREE_SIGNALS

  // ── Performance stats from API data ──────────────────────────────────────
  const perfStats = usePerformanceStats(meta, performance)

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Back Link */}
        <FadeIn>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-text-muted hover:text-primary-400 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </FadeIn>

        {/* Header */}
        <FadeIn>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success-500/20 text-success-400 text-sm mb-6">
              <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse" />
              <span>
                {meta?.isRealTime ? 'Live Alpha Feed' : 'Alpha Feed — Free Preview'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              ChainPulse{' '}
              <span className="gradient-text">Alpha Signals</span>
            </h1>
            <p className="text-text-secondary max-w-2xl mx-auto">
              {meta?.isRealTime
                ? 'Real-time AI-generated signals from on-chain data and market momentum analysis.'
                : meta?.authenticated
                  ? `You are on the Free plan. See ${visibleSignals.length} preview signals — unlock the rest for real-time access.`
                  : 'A preview of signals our system generates. Login and upgrade for real-time access.'}
            </p>
            {/* Credits Banner — show for logged-in free users with credits */}
            {isLoggedIn && !isPremium && userCredits > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning-500/20 text-warning-400 text-sm border border-warning-500/30">
                <Zap className="w-4 h-4" />
                <span>You have <strong>{userCredits} credit{userCredits !== 1 ? 's' : ''}</strong> — click <strong>Buy</strong> on any locked signal to unlock it</span>
              </div>
            )}
            {lastUpdated && (
              <p className="text-text-muted text-xs mt-3">
                Last updated: {lastUpdated.toLocaleTimeString()}
                {' '}
                <button
                  onClick={fetchSignals}
                  aria-label="Refresh signals"
                  className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-300 ml-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh
                </button>
              </p>
            )}
          </div>
        </FadeIn>

        {/* Performance Stats */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {perfStats.map((stat) => (
              <div className="glass-card p-5 rounded-xl" key={stat.label}>
                <div className="text-2xl font-bold text-primary-400 mb-1">{stat.value}</div>
                <div className="text-text-secondary text-sm font-medium">{stat.label}</div>
                <div className="text-text-muted text-xs mt-1">{stat.sub}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Filter Bar */}
        <FadeIn delay={0.15}>
          <div className="flex items-center gap-3 mb-6 flex-wrap" role="group" aria-label="Filter signals by type">
            <Filter className="w-4 h-4 text-text-muted" />
            <span className="text-sm text-text-muted">Filter:</span>
            {(['all', 'diamond', 'whale', 'sentiment'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                aria-label={`Show ${f === 'all' ? 'all signals' : f === 'diamond' ? 'diamond signals only' : f === 'whale' ? 'whale signals only' : 'sentiment signals only'}`}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                  filter === f
                    ? "bg-primary-500 text-white"
                    : "bg-background-card text-text-muted hover:text-text-secondary border border-border"
                )}
              >
                {f === 'all' ? '✨ All' : f === 'diamond' ? '💎 Diamond' : f === 'whale' ? '🐋 Whale' : '💬 Sentiment'}
              </button>
            ))}
            {meta && (
              <span className="ml-auto text-xs text-text-muted">
                {meta.signalsVisible} signal{meta.signalsVisible !== 1 ? 's' : ''} visible
                {!meta.isRealTime && ` · ${meta.totalAvailable} total (premium)`}
              </span>
            )}
          </div>
        </FadeIn>

        {/* Error State */}
        {error && (
          <div className="glass-card p-6 rounded-xl border border-warning-500/30 text-center mb-6">
            <AlertCircle className="w-8 h-8 text-warning-400 mx-auto mb-2" />
            <p className="text-text-secondary text-sm">{error}</p>
            <button onClick={fetchSignals} className="mt-3 text-primary-400 text-sm hover:text-primary-300">
              Try again →
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="space-y-4 mb-12">
            {[...Array(3)].map((_, i) => (
              <div key={`skeleton-${i}`} className="glass-card p-6 rounded-2xl border border-border animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-background-card" />
                    <div className="space-y-2">
                      <div className="w-20 h-4 bg-background-card rounded" />
                      <div className="w-32 h-3 bg-background-card rounded" />
                    </div>
                  </div>
                  <div className="w-24 h-8 bg-background-card rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Signal Cards */}
        {!loading && (
          <>
            {visibleSignals.length === 0 && !error && (
              <div className="glass-card p-12 rounded-2xl border border-dashed border-border text-center mb-12">
                <div className="text-4xl mb-4">📡</div>
                <h3 className="text-xl font-semibold text-text-secondary mb-2">No signals found</h3>
                <p className="text-text-muted text-sm">
                  {filter !== 'all' 
                    ? `No ${filter} signals at the moment. Try "All" filter.`
                    : 'Signal generation is running. Check back soon — signals generate hourly.'}
                </p>
              </div>
            )}

            <FadeInStagger stagger={0.08} className="space-y-4 mb-8">
              {/* 🔓 UNLOCKED PREVIEW SIGNALS — first 3 for free users, all for premium */}
              {visibleSignals.map((signal, idx) => {
                const type = getSignalType(signal)
                const style = typeStyles[type]
                const confidence = getConfidence(signal)
                const recommendation = getRecommendation(signal)
                const isDiamondOrHighConf = type === 'diamond' || confidence >= 80

                return (
                  <HoverScale key={signal.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label={`${signal.tokenSymbol} ${style.badge} signal with score ${confidence}`}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); /* card click handler */ } }}
                      className={cn(
                        "glass-card p-6 rounded-2xl border transition-all duration-300",
                        `border-border ${style.border}`
                      )}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        {/* Left: Token Info */}
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white font-bold text-lg`}>
                            {signal.tokenSymbol[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-lg">{signal.tokenSymbol}</span>
                              {signal.tokenName && (
                                <span className="text-text-muted text-sm">{signal.tokenName}</span>
                              )}
                              <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full font-semibold",
                                style.tag
                              )}>
                                {style.badge}
                              </span>
                            </div>
                            <div className="text-text-muted text-xs mt-0.5">
                              {new Date(signal.delayedTimestamp || signal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} today
                            </div>
                          </div>
                        </div>

                        {/* Center: Scores + Buy/Action buttons */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          {/* Scores always visible */}
                          <div className="flex items-center gap-3 sm:gap-6 text-sm flex-wrap">
                            {signal.sentimentScore != null && (
                              <div className="text-center">
                                <div className="text-text-muted text-xs mb-1">Sentiment</div>
                                <div className={cn(
                                  "font-bold text-lg",
                                  signal.sentimentScore >= 80 ? "text-success-400" : signal.sentimentScore >= 60 ? "text-warning-400" : "text-danger-400"
                                )}>{signal.sentimentScore}</div>
                              </div>
                            )}
                            {signal.whaleConfidence != null && (
                              <div className="text-center">
                                <div className="text-text-muted text-xs mb-1">Whale</div>
                                <div className={cn(
                                  "font-bold text-lg",
                                  signal.whaleConfidence >= 80 ? "text-success-400" : signal.whaleConfidence >= 60 ? "text-warning-400" : "text-danger-400"
                                )}>{signal.whaleConfidence}</div>
                              </div>
                            )}
                            <div className="text-center">
                              <div className="text-text-muted text-xs mb-1">Score</div>
                              <div className={cn(
                                "font-bold text-lg",
                                confidence >= 80 ? "text-success-400" : confidence >= 60 ? "text-warning-400" : "text-danger-400"
                              )}>{confidence}</div>
                            </div>
                          </div>

                          {/* Buy / Unlock button — for Diamond/High-Conf signals that user might want */}
                          {(isDiamondOrHighConf || userCredits > 0) && meta?.authenticated && !meta?.isRealTime && (
                            <div className="flex items-center gap-2">
                              <BuySignalButton
                                signalId={signal.id}
                                signalType={type === 'diamond' ? 'diamond' : type === 'whale' ? 'whale' : 'default'}
                                compact
                                onUnlocked={() => fetchSignals()}
                              />
                            </div>
                          )}
                        </div>

                        {/* Right: Recommendation */}
                        <div className={cn(
                          "px-4 py-2 rounded-lg text-sm font-bold",
                          recommendation === 'Buy' ? "bg-success-500/20 text-success-400" :
                          recommendation === 'Sell' ? "bg-danger-500/20 text-danger-400" :
                          "bg-text-muted/20 text-text-muted"
                        )}>
                          {recommendation}
                        </div>
                      </div>

                      {/* Footer row */}
                      <div className="mt-4 pt-4 border-t border-border flex items-center gap-6 text-xs text-text-muted flex-wrap">
                        {signal.twitterMentions != null && (
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            ~{signal.twitterMentions.toLocaleString()} social mentions
                          </span>
                        )}
                        {signal.isDiamondSignal && (
                          <span className="flex items-center gap-1 text-purple-400">
                            💎 Diamond Signal — High Confidence
                          </span>
                        )}
                        {signal.expiresAt && (
                          <span>
                            Expires: {new Date(signal.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </HoverScale>
                )
              })}
            </FadeInStagger>

            {/* 🔒 LOCKED/PAYWALL SIGNAL PLACEHOLDERS — only for free users */}
            {effectiveIsGated && effectiveLockedCount > 0 && (
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-2 px-1 py-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-warning-500/30 to-transparent" />
                  <span className="text-xs text-warning-400 font-semibold uppercase tracking-widest whitespace-nowrap">
                    <EyeOff className="w-3.5 h-3.5 inline mr-1" />
                    {effectiveLockedCount} Premium Signal{effectiveLockedCount !== 1 ? 's' : ''} Locked
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-warning-500/30 to-transparent" />
                </div>
                <div className="space-y-4">
                  {[...Array(Math.min(effectiveLockedCount, 3))].map((_, i) => {
                    // SSR-safe locked placeholder — renders server side
                    const ghostSymbols = ['BTC', 'LINK', 'AAVE', 'UNI', 'DOT', 'ADA', 'ATOM', 'FTM', 'NEAR', 'ALGO']
                    const gType = ghostSymbols[(i * 7 + 3) % ghostSymbols.length]
                    const gScore = 70 + (i * 13) % 30
                    const gTypeStyle = i % 3 === 0 ? typeStyles.diamond : i % 3 === 1 ? typeStyles.whale : typeStyles.sentiment
                    return (
                      <HoverScale key={`locked-${i}`}>
                        <div
                          role="button"
                          tabIndex={0}
                          aria-label={`Locked premium signal ${gType}`}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); } }}
                          className="glass-card p-6 rounded-2xl border border-border relative select-none"
                        >
                          {/* Ghost content beneath overlay — peek preview of what's locked */}
                          <div className="flex items-center justify-between flex-wrap gap-4 blur-sm">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gTypeStyle.gradient} flex items-center justify-center text-white font-bold text-lg`}>
                                {gType[0]}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-lg text-text-secondary">{gType}</span>
                                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", gTypeStyle.tag)}>
                                    {gTypeStyle.badge}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="text-text-muted text-xs mb-1">Score</div>
                                <div className="font-bold text-lg text-text-muted">{gScore}</div>
                              </div>
                            </div>
                          </div>

                          {/* 🔒 Lock overlay — opaque cover with actions */}
                          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 p-6"
                            style={{ background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.75))' }}
                          >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-500/50 to-gray-600/50 flex items-center justify-center">
                              <Lock className="w-6 h-6 text-text-muted" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-gray-200">
                                Premium Signal — Locked
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Unlock with Pay-Per-Alpha or upgrade for full access.
                              </p>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap justify-center mt-1">
                              <BuySignalButton
                                signalId={`locked-${i}`}
                                signalType={gTypeStyle === typeStyles.diamond ? 'diamond' : gTypeStyle === typeStyles.whale ? 'whale' : 'default'}
                                compact
                                onUnlocked={() => fetchSignals()}
                              />
                              <Link
                                href="/pricing"
                                className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white text-xs font-semibold px-5 py-2 rounded-xl transition-all flex items-center gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Zap className="w-3.5 h-3.5" />
                                Subscribe
                              </Link>
                            </div>
                          </div>
                        </div>
                      </HoverScale>
                    )
                  })}
                </div>

                {/* CTA bar below locked cards */}
                <FadeIn delay={0.35}>
                  <div className="glass-card p-6 rounded-2xl border border-warning-500/30 bg-gradient-to-r from-warning-500/5 via-warning-500/10 to-warning-500/5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning-500 to-orange-500 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-text-primary">
                            Unlock {effectiveLockedCount} Premium Signal{effectiveLockedCount !== 1 ? 's' : ''}
                          </h3>
                          <p className="text-xs text-text-muted">
                            {userCredits > 0
                              ? `You have ${userCredits} credit${userCredits !== 1 ? 's' : ''}. Use Pay-Per-Alpha or upgrade to Premium.`
                              : `Get credits to unlock individual signals, or upgrade for full Premium access.`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Link
                          href="/pricing"
                          className="bg-gradient-to-r from-warning-500 to-orange-500 hover:from-warning-600 hover:to-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                        >
                          <Zap className="w-4 h-4" />
                          {userCredits > 0 ? 'Buy More Credits' : 'Upgrade to Premium'}
                        </Link>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              </div>
            )}
          </>
        )}

        {/* Upgrade CTA */}
        <FadeIn delay={0.5}>
          <div className="glass-card p-10 rounded-2xl border border-primary-500/30 text-center">
            <Crown className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Unlock all Premium signals</h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              {meta?.authenticated
                ? 'Your current plan limits you to preview signals. Upgrade to Premium for real-time access to all signals, Diamond tier, and whale deep dives.'
                : 'Free users see 3 signals with a 15-minute delay. Premium members get all signals in real-time including Diamond tier.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {meta?.authenticated ? (
                <Link
                  href="/pricing"
                  className="button-primary px-8 py-3 rounded-xl font-semibold"
                >
                  Upgrade to Premium →
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="button-secondary px-8 py-3 rounded-xl font-semibold"
                  >
                    Start Free
                  </Link>
                  <Link
                    href="/pricing"
                    className="button-primary px-8 py-3 rounded-xl font-semibold"
                  >
                    Upgrade to Premium →
                  </Link>
                </>
              )}
            </div>
          </div>
        </FadeIn>
      </div>
    </main>
  )
}
