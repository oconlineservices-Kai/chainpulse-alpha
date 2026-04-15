'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown,
  Zap, 
  Crown,
  Lock, 
  CheckCircle2,
  Eye,
  MessageCircle,
  ArrowLeft,
  BarChart3,
  Filter
} from 'lucide-react'
import FadeIn, { FadeInStagger } from '@/components/animations/FadeIn'
import { HoverScale } from '@/components/animations/ScaleIn'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const sampleSignals = [
  {
    id: 1,
    symbol: 'PEPE',
    name: 'Pepe',
    price: '$0.00000123',
    change: '+12.4%',
    up: true,
    sentiment: 87,
    whale: 92,
    correlation: 91,
    status: 'free',
    recommendation: 'Buy',
    time: '2 min ago',
    twitterMentions: 1247,
    whaleWallets: 3,
    tier: 'Diamond',
  },
  {
    id: 2,
    symbol: 'DOGE',
    name: 'Dogecoin',
    price: '$0.087',
    change: '+5.7%',
    up: true,
    sentiment: 82,
    whale: 85,
    correlation: 84,
    status: 'premium',
    recommendation: 'Buy',
    time: '12 min ago',
    twitterMentions: 2156,
    whaleWallets: 2,
    tier: 'Gold',
  },
  {
    id: 3,
    symbol: 'SHIB',
    name: 'Shiba Inu',
    price: '$0.0000089',
    change: '-2.1%',
    up: false,
    sentiment: 45,
    whale: 38,
    correlation: 42,
    status: 'premium',
    recommendation: 'Skip',
    time: '18 min ago',
    twitterMentions: 892,
    whaleWallets: 1,
    tier: 'Silver',
  },
  {
    id: 4,
    symbol: 'FLOKI',
    name: 'Floki',
    price: '$0.0000234',
    change: '+8.3%',
    up: true,
    sentiment: 91,
    whale: 88,
    correlation: 90,
    status: 'locked',
    recommendation: 'Buy',
    time: '25 min ago',
    twitterMentions: 567,
    whaleWallets: 4,
    tier: 'Diamond',
  },
  {
    id: 5,
    symbol: 'ARB',
    name: 'Arbitrum',
    price: '$0.412',
    change: '+3.2%',
    up: true,
    sentiment: 79,
    whale: 83,
    correlation: 81,
    status: 'locked',
    recommendation: 'Buy',
    time: '31 min ago',
    twitterMentions: 445,
    whaleWallets: 2,
    tier: 'Gold',
  },
]

const performanceStats = [
  { label: 'Signals This Month', value: '142', sub: '+23 vs last month' },
  { label: 'Diamond Signal Win Rate', value: '78%', sub: 'Last 90 days' },
  { label: 'Avg. Return per Signal', value: '+8.3%', sub: 'Buy signals only' },
  { label: 'Max Drawdown', value: '-4.2%', sub: 'Worst losing streak' },
]

const tierColors: Record<string, string> = {
  Diamond: 'from-sky-400 to-indigo-400',
  Gold: 'from-yellow-400 to-orange-400',
  Silver: 'from-gray-300 to-gray-400',
}

export default function SignalsPage() {
  const [filter, setFilter] = useState<'all' | 'free' | 'premium'>('all')

  const filtered = sampleSignals.filter(s => {
    if (filter === 'all') return true
    if (filter === 'free') return s.status === 'free'
    if (filter === 'premium') return s.status === 'premium' || s.status === 'locked'
    return true
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
              <span>Live Alpha Feed — Sample View</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              ChainPulse{' '}
              <span className="gradient-text">Alpha Signals</span>
            </h1>
            <p className="text-text-secondary max-w-2xl mx-auto">
              A preview of the real-time signals our members receive. 
              Premium signals are blurred — unlock them with a free account or upgrade.
            </p>
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
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-4 h-4 text-text-muted" />
            <span className="text-sm text-text-muted">Filter:</span>
            {(['all', 'free', 'premium'] as const).map((f) => (
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
                {f === 'all' ? 'All Signals' : f === 'free' ? 'Free' : 'Premium'}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Signal Cards */}
        <FadeInStagger stagger={0.08} className="space-y-4 mb-12">
          {filtered.map((signal) => {
            const isLocked = signal.status === 'locked'
            return (
              <HoverScale key={signal.id}>
                <motion.div
                  className={cn(
                    "glass-card p-6 rounded-2xl border transition-all duration-300",
                    isLocked ? "opacity-70 hover:opacity-80 border-border" : "border-border hover:border-primary-500/30"
                  )}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* Left: Token Info */}
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tierColors[signal.tier] || 'from-gray-500 to-gray-600'} flex items-center justify-center text-white font-bold text-lg`}>
                        {signal.symbol[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{signal.symbol}</span>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-semibold",
                            `bg-gradient-to-r ${tierColors[signal.tier] || 'from-gray-500 to-gray-600'} text-white`
                          )}>
                            {signal.tier}
                          </span>
                        </div>
                        <div className="text-text-muted text-sm">{signal.name}</div>
                      </div>
                    </div>

                    {/* Center: Scores */}
                    {isLocked ? (
                      <div className="flex items-center gap-2 text-text-muted">
                        <Lock className="w-5 h-5" />
                        <span className="text-sm font-medium">Premium Signal — Upgrade to Unlock</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="text-text-muted text-xs mb-1">Sentiment</div>
                          <div className={cn(
                            "font-bold text-lg",
                            signal.sentiment >= 80 ? "text-success-400" : signal.sentiment >= 60 ? "text-warning-400" : "text-danger-400"
                          )}>{signal.sentiment}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-text-muted text-xs mb-1">Whale</div>
                          <div className={cn(
                            "font-bold text-lg",
                            signal.whale >= 80 ? "text-success-400" : signal.whale >= 60 ? "text-warning-400" : "text-danger-400"
                          )}>{signal.whale}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-text-muted text-xs mb-1">Score</div>
                          <div className={cn(
                            "font-bold text-lg",
                            signal.correlation >= 80 ? "text-success-400" : signal.correlation >= 60 ? "text-warning-400" : "text-danger-400"
                          )}>{signal.correlation}</div>
                        </div>
                      </div>
                    )}

                    {/* Right: Price + Recommendation */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold">{signal.price}</div>
                        <div className={cn(
                          "text-sm font-medium flex items-center gap-1",
                          signal.up ? "text-success-400" : "text-danger-400"
                        )}>
                          {signal.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {signal.change}
                        </div>
                      </div>
                      {!isLocked && (
                        <div className={cn(
                          "px-4 py-2 rounded-lg text-sm font-bold",
                          signal.recommendation === 'Buy' ? "bg-success-500/20 text-success-400" :
                          signal.recommendation === 'Sell' ? "bg-danger-500/20 text-danger-400" :
                          "bg-text-muted/20 text-text-muted"
                        )}>
                          {signal.recommendation}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer row */}
                  {!isLocked && (
                    <div className="mt-4 pt-4 border-t border-border flex items-center gap-6 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {signal.twitterMentions.toLocaleString()} mentions
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {signal.whaleWallets} whale wallet{signal.whaleWallets > 1 ? 's' : ''} active
                      </span>
                      <span>{signal.time}</span>
                    </div>
                  )}
                </motion.div>
              </HoverScale>
            )
          })}
        </FadeInStagger>

        {/* Upgrade CTA */}
        <FadeIn delay={0.5}>
          <div className="glass-card p-10 rounded-2xl border border-primary-500/30 text-center">
            <Crown className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Unlock all Premium signals</h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Free users get 5 signals/day with 15-min delay. Premium members get 
              all signals in real-time including Diamond tier.
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
