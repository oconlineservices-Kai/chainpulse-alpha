'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
} from 'lucide-react'
import FadeIn, { FadeInStagger } from '@/components/animations/FadeIn'
import { HoverScale } from '@/components/animations/ScaleIn'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import BuySignalButton from '@/components/signals/BuySignalButton'

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
}

interface SignalMeta {
  authenticated: boolean
  isRealTime: boolean
  delayHours: number
  signalsVisible: number
  totalAvailable: number
  source?: string
}

interface SignalPerformance {
  overall: {
    winRate: number
    totalSignals: number
    avgReturn?: number
    diamondSignals?: number
  }
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

const performanceStats = [
  { label: 'Signals This Month', value: '142', sub: '+23 vs last month' },
  { label: 'Diamond Signal Win Rate', value: '78%', sub: 'Last 90 days' },
  { label: 'Avg. Return per Signal', value: '+8.3%', sub: 'Buy signals only' },
  { label: 'Max Drawdown', value: '-4.2%', sub: 'Worst losing streak' },
]

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

export default function SignalsPage() {
  const [filter, setFilter] = useState<'all' | 'diamond' | 'whale' | 'sentiment'>('all')
  const [signals, setSignals] = useState<LiveSignal[]>([])
  const [meta, setMeta] = useState<SignalMeta | null>(null)
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
        setSignals(json.data.signals)
        setMeta(json.data.meta)
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
                {meta?.isRealTime ? 'Live Alpha Feed' : 'Alpha Feed — 24hr Delay (Free)'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              ChainPulse{' '}
              <span className="gradient-text">Alpha Signals</span>
            </h1>
            <p className="text-text-secondary max-w-2xl mx-auto">
              {meta?.isRealTime
                ? 'Real-time AI-generated signals from on-chain data and market momentum analysis.'
                : 'A preview of signals our system generates. Signals shown with 24hr delay. Login and upgrade for real-time access.'}
            </p>
            {lastUpdated && (
              <p className="text-text-muted text-xs mt-3">
                Last updated: {lastUpdated.toLocaleTimeString()}
                {' '}
                <button
                  onClick={fetchSignals}
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
            {performanceStats.map((stat) => (
              <div key={stat.label} className="glass-card p-5 rounded-xl">
                <div className="text-2xl font-bold text-primary-400 mb-1">{stat.value}</div>
                <div className="text-text-secondary text-sm font-medium">{stat.label}</div>
                <div className="text-text-muted text-xs mt-1">{stat.sub}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Filter Bar */}
        <FadeIn delay={0.15}>
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <Filter className="w-4 h-4 text-text-muted" />
            <span className="text-sm text-text-muted">Filter:</span>
            {(['all', 'diamond', 'whale', 'sentiment'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
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
              <div key={i} className="glass-card p-6 rounded-2xl border border-border animate-pulse">
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
            {filtered.length === 0 && !error && (
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

            <FadeInStagger stagger={0.08} className="space-y-4 mb-12">
              {filtered.map((signal, idx) => {
                const type = getSignalType(signal)
                const style = typeStyles[type]
                const confidence = getConfidence(signal)
                const recommendation = getRecommendation(signal)
                const isLocked = idx >= 3 && !meta?.isRealTime // Lock signals beyond first 3 for free users

                return (
                  <HoverScale key={signal.id}>
                    <motion.div
                      className={cn(
                        "glass-card p-6 rounded-2xl border transition-all duration-300",
                        isLocked ? "opacity-70 hover:opacity-80 border-border" : `border-border ${style.border}`
                      )}
                      whileHover={{ y: -2 }}
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
                              {new Date(signal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} today
                            </div>
                          </div>
                        </div>

                        {/* Center: Scores */}
                        {isLocked ? (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <div className="flex items-center gap-2 text-text-muted">
                              <Lock className="w-4 h-4" />
                              <span className="text-sm font-medium">Premium Signal</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <BuySignalButton
                                signalId={signal.id}
                                signalType={type === 'diamond' ? 'diamond' : type === 'whale' ? 'whale' : 'default'}
                                compact
                                onUnlocked={() => fetchSignals()}
                              />
                              <span className="text-xs text-text-muted">or</span>
                              <Link href="/pricing" className="text-xs text-primary-400 hover:text-primary-300 font-medium">
                                Upgrade for All →
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-6 text-sm">
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
                        )}

                        {/* Right: Recommendation */}
                        {!isLocked && (
                          <div className={cn(
                            "px-4 py-2 rounded-lg text-sm font-bold",
                            recommendation === 'Buy' ? "bg-success-500/20 text-success-400" :
                            recommendation === 'Sell' ? "bg-danger-500/20 text-danger-400" :
                            "bg-text-muted/20 text-text-muted"
                          )}>
                            {recommendation}
                          </div>
                        )}
                      </div>

                      {/* Footer row */}
                      {!isLocked && (
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
                      )}
                    </motion.div>
                  </HoverScale>
                )
              })}
            </FadeInStagger>

            {/* Upgrade prompt if there are locked signals */}
            {!meta?.isRealTime && filtered.length >= 3 && (
              <FadeIn delay={0.4}>
                <div className="glass-card p-8 rounded-2xl border border-primary-500/30 text-center mb-12">
                  <Lock className="w-8 h-8 text-primary-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold mb-2">{meta?.totalAvailable ? meta.totalAvailable - 3 : 'More'} signals locked</h3>
                  <p className="text-text-secondary text-sm mb-4">
                    Login for free access, or upgrade to Premium for real-time signals and full access.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/login" className="button-secondary px-6 py-2.5 rounded-xl text-sm font-semibold">
                      Login Free
                    </Link>
                    <Link href="/pricing" className="button-primary px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Upgrade to Premium
                    </Link>
                  </div>
                </div>
              </FadeIn>
            )}
          </>
        )}

        {/* Upgrade CTA */}
        <FadeIn delay={0.5}>
          <div className="glass-card p-10 rounded-2xl border border-primary-500/30 text-center">
            <Crown className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Unlock all Premium signals</h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Free users see 3 signals with 24hr delay. Premium members get 
              all signals in real-time including Diamond tier — generated hourly from live market data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
            </div>
          </div>
        </FadeIn>
      </div>
    </main>
  )
}
