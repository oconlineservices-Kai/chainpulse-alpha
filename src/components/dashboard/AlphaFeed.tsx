'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown,
  Clock,
  Filter,
  RefreshCw,
  Eye,
  Lock,
  Unlock,
  Zap,
  MessageCircle,
  DollarSign,
  BarChart3,
  Search,
  AlertTriangle
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { cn, formatNumber, formatPercentage, getTimeAgo, getScoreColor } from '@/lib/utils'
import { HoverScale } from '@/components/animations/ScaleIn'
import { Signal } from '@/lib/api/crypto'
import BuySignalButton from '@/components/signals/BuySignalButton'

type SignalStatus = 'Free' | 'Premium' | 'Locked'
type Recommendation = 'Buy' | 'Sell' | 'Skip'
type FilterType = 'All' | 'Free' | 'Premium' | 'High Confidence'

// ── Helper: how many free (unlocked) preview cards exist ──────────────────────
function countFreeSignals(list: Signal[]): number {
  return list.filter(s => !isGenuinelyLocked(s)).length
}

// ── Determine whether this card represents a genuinely locked signal ──────────
function isGenuinelyLocked(signal: Signal): boolean {
  // If the API explicitly tells us it's locked, believe it
  if (signal.locked === true) return true
  // Also lock signals whose status is 'Locked' as a fallback
  if (signal.status === 'Locked') return true
  return false
}

interface AlphaFeedProps {
  signals: Signal[]
  onSelectSignal: (signal: Signal) => void
  onRefetch?: () => void
}

export default function AlphaFeed({ signals, onSelectSignal, onRefetch }: AlphaFeedProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filters: FilterType[] = ['All', 'Free', 'Premium', 'High Confidence']

  // Filter by category and search query
  const filteredSignals = useMemo(() => {
    let result = signals

    // Apply category filter
    if (activeFilter === 'Free') result = result.filter(s => !isGenuinelyLocked(s))
    else if (activeFilter === 'Premium') result = result.filter(s => isGenuinelyLocked(s))
    else if (activeFilter === 'High Confidence') result = result.filter(s => s.correlationScore >= 85)

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(s => 
        s.tokenSymbol.toLowerCase().includes(query) || 
        s.tokenName.toLowerCase().includes(query)
      )
    }

    return result
  }, [signals, activeFilter, searchQuery])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    if (onRefetch) {
      await onRefetch()
    } else {
      // Simulate API call fallback
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
    setIsRefreshing(false)
  }

  const getStatusIcon = (status: SignalStatus) => {
    switch (status) {
      case 'Free': return Unlock
      case 'Premium': return Eye
      case 'Locked': return Lock
    }
  }

  const getRecommendationColor = (recommendation: Recommendation) => {
    switch (recommendation) {
      case 'Buy': return 'success'
      case 'Sell': return 'danger'
      case 'Skip': return 'warning'
    }
  }

  const freePreviewCount = countFreeSignals(signals)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Alpha Feed</h1>
          <p className="text-text-muted">Real-time crypto signals with AI confidence scoring</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            loading={isRefreshing}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <div className="relative">
              <div className="w-2 h-2 bg-success-400 rounded-full" />
              <motion.div
                className="absolute inset-0 bg-success-400 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span>Live updates</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-text-muted mr-2" />
            {filters.map((filter, index) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') {
                  e.preventDefault()
                  const next = filters[(index + 1) % filters.length]
                  setActiveFilter(next)
                } else if (e.key === 'ArrowLeft') {
                  e.preventDefault()
                  const prev = filters[(index - 1 + filters.length) % filters.length]
                  setActiveFilter(prev)
                }
              }}
              aria-pressed={activeFilter === filter}
              aria-label={`Filter by ${filter}`}
              tabIndex={0}
            >
              {filter}
            </Button>
          ))}
          </div>
          
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search tokens (e.g. BTC, Ethereum)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Signals List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredSignals.map((signal, index) => {
            const locked = isGenuinelyLocked(signal)
            const StatusIcon = getStatusIcon(signal.status)
            const isPriceUp = signal.priceChange > 0

            if (locked) {
              // ── Locked card: show token + badge + blur placeholder + BuySignalButton ──
              return (
                <motion.div
                  key={signal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    hoverable
                    className="p-6 border border-slate-700/50 bg-slate-800/30 cursor-pointer"
                    onClick={() => onSelectSignal(signal)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View premium details for ${signal.tokenName} signal`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSelectSignal(signal)
                      }
                    }}
                  >
                    {/* Minimal header — only token name + symbol visible */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center text-white font-bold text-lg">
                          {signal.tokenSymbol[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-text-primary">{signal.tokenSymbol}</h3>
                            <Badge variant="muted" size="sm">
                              <Lock className="w-3 h-3 mr-1" />
                              Premium Signal
                            </Badge>
                          </div>
                          <p className="text-text-muted text-xs">{signal.tokenName}</p>
                        </div>
                      </div>
                    </div>

                    {/* Blurred placeholder — all actual data hidden */}
                    <div className="mb-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/30">
                      <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                        <span className="text-sm font-medium text-text-muted">
                          🔒 Full signal data hidden
                        </span>
                      </div>
                      <div className="space-y-2">
                        {/* Blurred score badges */}
                        <div className="grid grid-cols-3 gap-4">
                          {['Sentiment', 'Whale Conf', 'Correlation'].map((label) => (
                            <div key={label} className="text-center">
                              <div className="mx-auto w-16 h-7 rounded-md bg-slate-700/60 blur-sm" />
                              <p className="text-text-muted text-xs mt-1">{label}</p>
                            </div>
                          ))}
                        </div>
                        {/* Blurred detail row */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-4">
                            <div className="h-4 w-24 rounded bg-slate-700/60 blur-sm" />
                            <div className="h-4 w-20 rounded bg-slate-700/60 blur-sm" />
                          </div>
                          <div className="h-5 w-14 rounded bg-slate-700/60 blur-sm" />
                        </div>
                      </div>
                    </div>

                    {/* Buy Signal Button — makes sense here because data is genuinely hidden */}
                    <div className="flex items-center justify-end">
                      <BuySignalButton
                        signalId={signal.id}
                        signalType={
                          (signal.correlationScore ?? 0) >= 85
                            ? 'diamond'
                            : (signal.whaleConfidence ?? 0) >= 80
                            ? 'whale'
                            : 'default'
                        }
                        compact
                        onUnlocked={() => onRefetch?.()}
                      />
                    </div>
                  </Card>
                </motion.div>
              )
            }

            // ── Free / Unlocked card: full data, NO buy button ──
            return (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <HoverScale>
                  <Card 
                    hoverable 
                    className="p-6 cursor-pointer"
                    onClick={() => onSelectSignal(signal)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View details for ${signal.tokenName} signal`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSelectSignal(signal)
                      }
                    }}
                  >
                    {/* Signal Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        {/* Token Icon */}
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg">
                          {signal.tokenSymbol[0]}
                        </div>
                        
                        {/* Token Info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-text-primary">{signal.tokenSymbol}</h3>
                            <Badge 
                              variant="success"
                              size="sm"
                            >
                              <Unlock className="w-3 h-3 mr-1" />
                              Free
                            </Badge>
                          </div>
                          <p className="text-text-muted text-xs truncate max-w-[70px] xs:max-w-[90px] sm:max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap w-full">{signal.tokenName}</p>
                        </div>
                      </div>
                      
                      {/* Price & Change */}
                      <div className="text-right">
                        <div className="font-bold text-lg text-text-primary">
                          ${signal.price.toFixed(signal.price < 0.001 ? 8 : 4)}
                        </div>
                        <div className={cn(
                          "flex items-center gap-1 text-sm font-medium",
                          isPriceUp ? "text-success-400" : "text-danger-400"
                        )}>
                          {isPriceUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {formatPercentage(signal.priceChange)}
                        </div>
                      </div>
                    </div>

                    {/* Confidence Scores */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className={cn("score-badge", getScoreColor(signal.sentimentScore))}>
                          <span className="font-bold">{signal.sentimentScore}</span>
                          <span className="text-xs ml-0.5">/100</span>
                        </div>
                        <p className="text-text-muted text-xs mt-1">Sentiment</p>
                      </div>
                      
                      <div className="text-center">
                        <div className={cn("score-badge", getScoreColor(signal.whaleConfidence))}>
                          <span className="font-bold">{signal.whaleConfidence}</span>
                          <span className="text-xs ml-0.5">/100</span>
                        </div>
                        <p className="text-text-muted text-xs mt-1">Whale Conf</p>
                      </div>
                      
                      <div className="text-center">
                        <div className={cn("score-badge", getScoreColor(signal.correlationScore))}>
                          <span className="font-bold">{signal.correlationScore}</span>
                          <span className="text-xs ml-0.5">/100</span>
                        </div>
                        <p className="text-text-muted text-xs mt-1">Correlation</p>
                      </div>
                    </div>

                    {/* Signal Details */}
                    <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-text-muted">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{formatNumber(signal.twitterMentions)} mentions</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>${formatNumber(signal.volume24h)} vol</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4" />
                          <span>${formatNumber(signal.marketCap)} mcap</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge 
                          variant={getRecommendationColor(signal.recommendation) as any}
                          size="sm"
                        >
                          {signal.recommendation === 'Buy' && <Zap className="w-3 h-3 mr-1" />}
                          {signal.recommendation}
                        </Badge>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{getTimeAgo(signal.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </HoverScale>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredSignals.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
            {searchQuery ? (
              <Search className="w-8 h-8 text-slate-500" />
            ) : (
              <Filter className="w-8 h-8 text-slate-500" />
            )}
          </div>
          <h3 className="font-semibold text-lg mb-2">
            {searchQuery ? `No results for "${searchQuery}"` : 'No signals found'}
          </h3>
          <p className="text-slate-400 mb-4">
            {searchQuery 
              ? 'Try a different search term or browse all signals.'
              : 'Try adjusting your filters or check back later for new signals.'}
          </p>
          <div className="flex gap-2 justify-center">
            {searchQuery && (
              <Button variant="ghost" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            )}
            <Button variant="ghost" onClick={() => { setActiveFilter('All'); setSearchQuery('') }}>
              Clear All
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
