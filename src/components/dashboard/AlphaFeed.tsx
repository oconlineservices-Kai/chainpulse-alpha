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
  Search
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

const mockSignals: Signal[] = [
  {
    id: '1',
    tokenSymbol: 'PEPE',
    tokenName: 'Pepe',
    price: 0.00000123,
    priceChange: 12.4,
    sentimentScore: 87,
    whaleConfidence: 92,
    correlationScore: 91,
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    status: 'Free',
    twitterMentions: 1247,
    whaleWallets: ['0x742...3a9f', '0x991...8b2e', '0x224...1c5d'],
    recommendation: 'Buy',
    volume24h: 12500000,
    marketCap: 425000000
  },
  {
    id: '2',
    tokenSymbol: 'SHIB',
    tokenName: 'Shiba Inu',
    price: 0.0000089,
    priceChange: -2.1,
    sentimentScore: 76,
    whaleConfidence: 68,
    correlationScore: 72,
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: 'Premium',
    twitterMentions: 892,
    whaleWallets: ['0x556...9e1a'],
    recommendation: 'Skip',
    volume24h: 8900000,
    marketCap: 5200000000
  },
  {
    id: '3',
    tokenSymbol: 'DOGE',
    tokenName: 'Dogecoin',
    price: 0.087,
    priceChange: 5.7,
    sentimentScore: 82,
    whaleConfidence: 85,
    correlationScore: 84,
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    status: 'Premium',
    twitterMentions: 2156,
    whaleWallets: ['0x887...4f2b', '0x334...7d8e'],
    recommendation: 'Buy',
    volume24h: 45000000,
    marketCap: 12500000000
  },
  {
    id: '4',
    tokenSymbol: 'FLOKI',
    tokenName: 'Floki',
    price: 0.0000234,
    priceChange: 8.3,
    sentimentScore: 91,
    whaleConfidence: 88,
    correlationScore: 90,
    timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    status: 'Locked',
    twitterMentions: 567,
    whaleWallets: ['0x112...9c4f'],
    recommendation: 'Buy',
    volume24h: 3200000,
    marketCap: 225000000
  },
]

interface AlphaFeedProps {
  signals: Signal[]
  onSelectSignal: (signal: Signal) => void
  onSkipSignal?: (signalId: string) => void
  isAuthenticated?: boolean
}

export default function AlphaFeed({ signals, onSelectSignal, onSkipSignal, isAuthenticated = false }: AlphaFeedProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set())

  const handleSkip = (e: React.MouseEvent, signalId: string) => {
    e.stopPropagation()
    setSkippedIds(prev => new Set(prev).add(signalId))
    if (onSkipSignal) onSkipSignal(signalId)
  }

  const filters: FilterType[] = ['All', 'Free', 'Premium', 'High Confidence']

  // Filter by category and search query (also hide skipped)
  const filteredSignals = useMemo(() => {
    let result = signals.filter(s => !skippedIds.has(s.id))

    // Apply category filter
    if (activeFilter === 'Free') result = result.filter(s => s.status === 'Free')
    else if (activeFilter === 'Premium') result = result.filter(s => s.status === 'Premium')
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
  }, [signals, activeFilter, searchQuery, skippedIds])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
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
            const StatusIcon = getStatusIcon(signal.status)
            const isPriceUp = signal.priceChange > 0
            
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
                              variant={signal.status === 'Free' ? 'success' : signal.status === 'Premium' ? 'primary' : 'muted'}
                              size="sm"
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {signal.status}
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
                        {/* Buy button for Buy signals, or badge for others */}
                        {signal.recommendation === 'Buy' && signal.status !== 'Locked' ? (
                          <BuySignalButton
                            signalId={signal.id}
                            signalType={signal.correlationScore >= 85 ? 'diamond' : signal.whaleConfidence >= 70 ? 'whale' : 'default'}
                            compact
                            onUnlocked={() => {}}
                          />
                        ) : (
                          <Badge 
                            variant={getRecommendationColor(signal.recommendation) as any}
                            size="sm"
                          >
                            {signal.recommendation === 'Buy' && <Zap className="w-3 h-3 mr-1" />}
                            {signal.recommendation}
                          </Badge>
                        )}

                        {/* Skip button — hides this signal from the feed */}
                        {signal.recommendation === 'Skip' && (
                          <button
                            onClick={(e) => handleSkip(e, signal.id)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-border text-text-muted hover:text-text-primary hover:border-text-muted transition-colors"
                            aria-label={`Skip ${signal.tokenSymbol} signal`}
                          >
                            Skip
                          </button>
                        )}
                        
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