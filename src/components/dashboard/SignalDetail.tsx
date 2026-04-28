'use client'

import { useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  TrendingUp, 
  TrendingDown,
  MessageCircle, 
  Wallet,
  Clock,
  DollarSign,
  BarChart3,
  AlertTriangle,
  Zap,
  ExternalLink,
  Copy,
  Shield
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { cn, formatNumber, formatPercentage, getTimeAgo, getScoreColor, truncateAddress } from '@/lib/utils'
import { HoverScale } from '@/components/animations/ScaleIn'

interface Signal {
  id: string
  tokenSymbol: string
  tokenName: string
  price: number
  priceChange: number
  sentimentScore: number
  whaleConfidence: number
  correlationScore: number
  timestamp: string
  status: 'Free' | 'Premium' | 'Locked'
  twitterMentions: number
  whaleWallets: string[]
  recommendation: 'Buy' | 'Sell' | 'Skip'
  volume24h: number
  marketCap: number
}

interface SignalDetailProps {
  signal: Signal
  onClose: () => void
}

const mockTweets = [
  {
    id: 1,
    author: "@CryptoWhaleTrader",
    content: "🐸 $PEPE is showing massive accumulation patterns. Smart money is loading up before the next leg up. Don't sleep on this one! 📈",
    timestamp: "2 hours ago",
    likes: 247,
    retweets: 89
  },
  {
    id: 2,
    author: "@DeFiAlpha",
    content: "The PEPE narrative is heating up again. Whale wallets adding significant positions. This could be the catalyst we've been waiting for 🚀",
    timestamp: "3 hours ago", 
    likes: 156,
    retweets: 67
  },
  {
    id: 3,
    author: "@MemeKingCrypto",
    content: "$PEPE technical setup looking bullish AF. RSI reset, volume picking up, and social sentiment turning positive. Time to pay attention 👀",
    timestamp: "4 hours ago",
    likes: 89,
    retweets: 34
  }
]

export default function SignalDetail({ signal, onClose }: SignalDetailProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const isPriceUp = signal.priceChange > 0
  const isHighConfidence = signal.correlationScore >= 85

  // Handle ESC key to close modal
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Focus trap implementation
  useEffect(() => {
    // Focus close button on mount
    closeButtonRef.current?.focus()
    
    // Add ESC key listener
    document.addEventListener('keydown', handleKeyDown)
    
    // Lock body scroll
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [handleKeyDown])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Could add toast notification here
  }

  const getRecommendationIcon = () => {
    switch (signal.recommendation) {
      case 'Buy': return <Zap className="w-5 h-5" />
      case 'Sell': return <TrendingDown className="w-5 h-5" />
      case 'Skip': return <AlertTriangle className="w-5 h-5" />
    }
  }

  const getRecommendationColor = () => {
    switch (signal.recommendation) {
      case 'Buy': return 'success'
      case 'Sell': return 'danger' 
      case 'Skip': return 'warning'
    }
  }

  const getRecommendationText = () => {
    switch (signal.recommendation) {
      case 'Buy': return 'Strong correlation between whale accumulation and positive sentiment. Favorable risk/reward setup.'
      case 'Sell': return 'Negative whale sentiment combined with bearish social indicators. Consider taking profits.'
      case 'Skip': return 'Mixed signals or insufficient correlation. Wait for better entry opportunity.'
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="signal-detail-title"
    >
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-background-card border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background-card border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Token Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-2xl">
                {signal.tokenSymbol[0]}
              </div>
              
              {/* Token Info */}
              <div>
                <div className="flex items-center gap-3">
                  <h1 id="signal-detail-title" className="font-bold text-2xl text-text-primary">{signal.tokenSymbol}</h1>
                  <Badge 
                    variant={signal.status === 'Free' ? 'success' : signal.status === 'Premium' ? 'primary' : 'muted'}
                  >
                    {signal.status}
                  </Badge>
                  {isHighConfidence && (
                    <Badge variant="warning">
                      <Zap className="w-3 h-3 mr-1" />
                      Diamond Signal
                    </Badge>
                  )}
                </div>
                <p className="text-text-muted text-lg">{signal.tokenName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-xl">
                    ${signal.price.toFixed(signal.price < 0.001 ? 8 : 4)}
                  </span>
                  <div className={cn(
                    "flex items-center gap-1 font-medium",
                    isPriceUp ? "text-success-400" : "text-danger-400"
                  )}>
                    {isPriceUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {formatPercentage(signal.priceChange)}
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              ref={closeButtonRef}
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              aria-label="Close signal details"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Confidence Scores */}
          <div className="grid md:grid-cols-3 gap-4">
            <HoverScale>
              <Card className="p-6 text-center hover:border-primary-500/30">
                <div className={cn("score-badge text-lg mb-2", getScoreColor(signal.sentimentScore))}>
                  <span className="font-bold text-2xl">{signal.sentimentScore}</span>
                  <span className="text-sm ml-1">/100</span>
                </div>
                <p className="font-semibold mb-1">Sentiment Score</p>
                <p className="text-text-muted text-sm">Social media buzz level</p>
              </Card>
            </HoverScale>

            <HoverScale>
              <Card className="p-6 text-center hover:border-primary-500/30">
                <div className={cn("score-badge text-lg mb-2", getScoreColor(signal.whaleConfidence))}>
                  <span className="font-bold text-2xl">{signal.whaleConfidence}</span>
                  <span className="text-sm ml-1">/100</span>
                </div>
                <p className="font-semibold mb-1">Whale Confidence</p>
                <p className="text-text-muted text-sm">Smart money activity</p>
              </Card>
            </HoverScale>

            <HoverScale>
              <Card className="p-6 text-center hover:border-primary-500/30">
                <div className={cn("score-badge text-lg mb-2", getScoreColor(signal.correlationScore))}>
                  <span className="font-bold text-2xl">{signal.correlationScore}</span>
                  <span className="text-sm ml-1">/100</span>
                </div>
                <p className="font-semibold mb-1">Correlation</p>
                <p className="text-text-muted text-sm">Signal alignment</p>
              </Card>
            </HoverScale>
          </div>

          {/* AI Recommendation */}
          <Card className={cn(
            "p-6",
            signal.recommendation === 'Buy' && "bg-success-500/5 border-success-500/20",
            signal.recommendation === 'Sell' && "bg-danger-500/5 border-danger-500/20",
            signal.recommendation === 'Skip' && "bg-warning-500/5 border-warning-500/20"
          )}>
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                signal.recommendation === 'Buy' && "bg-success-500/20 text-success-400",
                signal.recommendation === 'Sell' && "bg-danger-500/20 text-danger-400", 
                signal.recommendation === 'Skip' && "bg-warning-500/20 text-warning-400"
              )}>
                {getRecommendationIcon()}
              </div>
              <div className="flex-1">
                <h3 className={cn(
                  "text-xl font-bold mb-2",
                  signal.recommendation === 'Buy' && "text-success-400",
                  signal.recommendation === 'Sell' && "text-danger-400",
                  signal.recommendation === 'Skip' && "text-warning-400"
                )}>
                  {signal.recommendation === 'Buy' && '✅ Buy Signal'}
                  {signal.recommendation === 'Sell' && '🔻 Sell Signal'}
                  {signal.recommendation === 'Skip' && '⏸️ Skip Signal'}
                </h3>
                <p className="text-text-secondary mb-4">{getRecommendationText()}</p>
                
                {signal.recommendation === 'Buy' && (
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-success-400" />
                      <span className="text-text-muted">Risk Level: <span className="text-success-400">Moderate</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary-400" />
                      <span className="text-text-muted">Time Horizon: <span className="text-primary-400">2-7 days</span></span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Market Data */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Twitter Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  Twitter Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background-hover">
                  <span className="text-text-muted">24h Mentions</span>
                  <span className="font-bold text-blue-400">{formatNumber(signal.twitterMentions)}</span>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm text-text-muted">Recent trending tweets:</p>
                  {mockTweets.slice(0, 2).map((tweet) => (
                    <div key={tweet.id} className="p-3 rounded-lg bg-background-hover text-sm">
                      <p className="text-text-secondary mb-2">"{tweet.content}"</p>
                      <div className="flex items-center justify-between text-xs text-text-muted">
                        <span className="text-blue-400">{tweet.author}</span>
                        <span>{tweet.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Whale Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-purple-400" />
                  Whale Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background-hover">
                  <span className="text-text-muted">Active Wallets</span>
                  <span className="font-bold text-purple-400">{signal.whaleWallets.length}</span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-text-muted">Top whale wallets:</p>
                  {signal.whaleWallets.map((wallet, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-background-hover">
                      <code className="text-sm text-text-secondary font-mono">
                        {truncateAddress(wallet, 6)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(wallet)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {/* Link to Etherscan — use first wallet address, or fall back to a search */}
                <a
                  href={
                    signal.whaleWallets.length > 0 && signal.whaleWallets[0].startsWith('0x') && signal.whaleWallets[0].length > 10
                      ? `https://etherscan.io/address/${signal.whaleWallets[0]}`
                      : `https://etherscan.io/search?q=${encodeURIComponent(signal.tokenSymbol)}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:border-primary-500/50 hover:text-primary-400 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Etherscan
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Market Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-400" />
                Market Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-background-hover">
                  <div className="text-2xl font-bold text-primary-400">
                    ${formatNumber(signal.volume24h)}
                  </div>
                  <p className="text-text-muted text-sm">24h Volume</p>
                </div>
                
                <div className="text-center p-3 rounded-lg bg-background-hover">
                  <div className="text-2xl font-bold text-secondary-400">
                    ${formatNumber(signal.marketCap)}
                  </div>
                  <p className="text-text-muted text-sm">Market Cap</p>
                </div>
                
                <div className="text-center p-3 rounded-lg bg-background-hover">
                  <div className="text-2xl font-bold text-success-400">
                    {signal.correlationScore}%
                  </div>
                  <p className="text-text-muted text-sm">Confidence</p>
                </div>
                
                <div className="text-center p-3 rounded-lg bg-background-hover">
                  <div className="text-2xl font-bold text-warning-400">
                    {getTimeAgo(signal.timestamp)}
                  </div>
                  <p className="text-text-muted text-sm">Signal Age</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Warning */}
          <Card className="bg-warning-500/5 border-warning-500/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-warning-400 mb-1">Risk Disclosure</p>
                  <p className="text-sm text-text-secondary">
                    This signal is generated by AI analysis and should not be considered financial advice. 
                    Cryptocurrency trading involves substantial risk and may result in significant losses. 
                    Always do your own research and never invest more than you can afford to lose.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}