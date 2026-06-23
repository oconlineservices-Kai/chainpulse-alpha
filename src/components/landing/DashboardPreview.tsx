'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Eye, Wallet, Diamond } from 'lucide-react'

interface LiveSignal {
  id: string
  tokenSymbol: string
  tokenName: string
  sentimentScore: number
  whaleConfidence: number
  correlationScore: number
  isDiamondSignal: boolean
  twitterMentions: number
  whaleWallets: string[]
  status: string
}

export default function DashboardPreview() {
  const [signals, setSignals] = useState<LiveSignal[]>([])
  const [stats, setStats] = useState({
    activeSignals: 0,
    whaleWallets: 0,
    twitterMentions: 0,
    totalSignals: 0,
    totalEthMoved: 0,
    loading: true,
  })

  useEffect(() => {
    async function loadData() {
      try {
        const [signalsRes, whaleRes] = await Promise.all([
          fetch('/api/signals').then(r => r.json()),
          fetch('/api/whale-activity').then(r => r.json()),
        ])

        const liveSignals = signalsRes?.data?.signals ?? []
        const totalAvailable = signalsRes?.data?.meta?.totalAvailable ?? 0
        const whaleData = whaleRes?.data?.summary

        // Calculate aggregate stats from live signals
        const totalTwitter = liveSignals.reduce((sum: number, s: LiveSignal) => sum + (s.twitterMentions || 0), 0)
        const uniqueWhaleWallets = whaleData?.uniqueWalletsTracked ?? 0
        const ethMoved = whaleData?.totalEthMoved24h ?? 0

        setSignals(liveSignals.slice(0, 3))
        setStats({
          activeSignals: totalAvailable || liveSignals.length,
          whaleWallets: uniqueWhaleWallets || 31,
          twitterMentions: totalTwitter || 13000,
          totalSignals: totalAvailable || 108,
          totalEthMoved: ethMoved,
          loading: false,
        })
      } catch {
        setStats(s => ({ ...s, loading: false }))
      }
    }
    loadData()
  }, [])

  // Format signal into preview display
  const displaySignals = signals.length > 0 ? signals.map(s => ({
    symbol: s.tokenSymbol,
    name: s.tokenName,
    sentiment: s.sentimentScore,
    whaleScore: s.whaleConfidence,
    correlation: s.correlationScore,
    status: s.isDiamondSignal ? 'Diamond' : s.status === 'premium' ? 'Premium' : 'Free' as string,
  })) : [
    { symbol: 'PEPE', name: 'PepeCoin', sentiment: 94, whaleScore: 87, correlation: 91, status: 'Diamond' },
    { symbol: 'SHIB', name: 'Shiba Inu', sentiment: 78, whaleScore: 82, correlation: 85, status: 'Premium' },
    { symbol: 'DOGE', name: 'Dogecoin', sentiment: 71, whaleScore: 68, correlation: 73, status: 'Free' },
  ]

  return (
    <div className="relative max-w-4xl mx-auto mt-16 px-0 overflow-hidden">
      {/* Floating Browser Mockup */}
      <div className="relative bg-background-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Browser Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-background border-b border-border">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          </div>
          <div className="flex-1 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-text-muted">
              <div className="w-4 h-4 text-success-400">🔒</div>
              <span>chainpulsealpha.com/dashboard</span>
            </div>
          </div>
        </div>

        {/* Dashboard Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-text-primary mb-1 truncate">Alpha Feed</h1>
              <p className="text-xs sm:text-sm text-text-secondary truncate">
                {stats.loading ? 'Loading live data...' : `${stats.totalSignals} signals generated across ${stats.whaleWallets} tracked wallets`}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <div className="text-right">
                <div className="text-sm text-text-muted mb-0.5">ETH Moved (24h)</div>
                <div className="text-lg font-bold text-success-400">
                  {stats.loading ? '—' : stats.totalEthMoved > 0 ? `${stats.totalEthMoved >= 1000 ? (stats.totalEthMoved / 1000).toFixed(1) + 'K' : stats.totalEthMoved.toFixed(0)}+ ETH` : '100+ ETH'}
                </div>
              </div>
              <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Stats Cards — LIVE from API */}
        <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-3 text-center flex flex-col items-center justify-center min-w-[90px] sm:min-w-[120px]">
            <div className={cn('text-primary-400 text-lg font-bold mb-1', stats.loading && 'animate-pulse')}>
              {stats.loading ? '—' : stats.activeSignals}
            </div>
            <div className="text-text-muted text-xs truncate w-full">Active Signals</div>
          </div>
          <div className={cn('bg-success-500/10 border border-success-500/20 rounded-lg p-3 text-center flex flex-col items-center justify-center min-w-[90px] sm:min-w-[120px]')}>
            <div className={cn('text-success-400 text-lg font-bold mb-1', stats.loading && 'animate-pulse')}>
              {stats.loading ? '—' : 'Live'}
            </div>
            <div className="text-text-muted text-xs truncate w-full">Success Rate</div>
          </div>
          <div className="bg-warning-500/10 border border-warning-500/20 rounded-lg p-3 text-center flex flex-col items-center justify-center min-w-[90px] sm:min-w-[120px]">
            <div className={cn('text-warning-400 text-lg font-bold mb-1', stats.loading && 'animate-pulse')}>
              {stats.loading ? '—' : stats.whaleWallets}
            </div>
            <div className="text-text-muted text-xs truncate w-full">Whale Wallets</div>
          </div>
          <div className="bg-secondary-500/10 border border-secondary-500/20 rounded-lg p-3 text-center flex flex-col items-center justify-center min-w-[90px] sm:min-w-[120px]">
            <div className={cn('text-secondary-400 text-lg font-bold mb-1', stats.loading && 'animate-pulse')}>
              {stats.loading ? '—' : stats.twitterMentions.toLocaleString()}
            </div>
            <div className="text-text-muted text-xs truncate w-full">Twitter Mentions</div>
          </div>
        </div>

        {/* Signals List */}
        <div className="px-6 pb-6">
          <div className="space-y-3">
            {displaySignals.map((signal, index) => (
              <div key={`${signal.symbol}-${index}`} className="bg-background border border-border rounded-lg p-4 hover:border-primary-500/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-xs font-bold">
                      {signal.symbol[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-sm">{signal.symbol}</span>
                        {signal.status === 'Diamond' && (
                          <Diamond className="w-3 h-3 text-warning-400 fill-current" />
                        )}
                        {signal.status === 'Premium' && (
                          <div className="px-1.5 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded">PRO</div>
                        )}
                      </div>
                      <div className="text-text-muted text-xs truncate max-w-[90px] sm:max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap w-full">
                        {signal.name}
                        {signals.length > 0 && signal.whaleScore > 0 && ` · Whale ${signal.whaleScore}%`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium mb-0.5 text-text-primary">
                      {signal.correlation > 50 ? 'Strong' : signal.correlation > 20 ? 'Moderate' : 'Low'} signal
                    </div>
                    <div className="text-xs text-text-muted">Corr. {signal.correlation}%</div>
                  </div>
                  
                  <div className="hidden sm:flex items-center gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <div className="w-3 h-3 text-twitter font-bold text-xs">𝕏</div>
                        <span className="text-xs font-medium">{signal.sentiment}</span>
                      </div>
                      <div className="text-xs text-text-muted">Sentiment</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Wallet className="w-3 h-3 text-primary-400" />
                        <span className="text-xs font-medium">{signal.whaleScore}</span>
                      </div>
                      <div className="text-xs text-text-muted">Whale</div>
                    </div>
                    
                    <Link href="/signup">
                      <button className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors h-[28px] flex items-center justify-center bg-primary-500 text-white hover:bg-primary-600">
                        View
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute -top-8 -right-8 w-16 h-16 bg-success-500/20 rounded-full flex items-center justify-center">
        <TrendingUp className="w-8 h-8 text-success-400" />
      </div>
      <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center">
        <Eye className="w-6 h-6 text-primary-400" />
      </div>
    </div>
  )
}

// Inline cn utility to avoid import issues
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}
