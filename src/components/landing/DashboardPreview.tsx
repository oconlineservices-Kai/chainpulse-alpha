'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Eye, Wallet, Diamond } from 'lucide-react'

const mockSignals = [
  {
    symbol: 'PEPE',
    name: 'PepeCoin',
    change: '+3,247%',
    price: '$0.000023',
    sentiment: 94,
    whaleScore: 87,
    correlation: 91,
    status: 'Diamond',
    recommendation: 'Strong Buy'
  },
  {
    symbol: 'SHIB',
    name: 'Shiba Inu',
    change: '+156%',
    price: '$0.000011',
    sentiment: 78,
    whaleScore: 82,
    correlation: 85,
    status: 'Premium',
    recommendation: 'Buy'
  },
  {
    symbol: 'DOGE',
    name: 'Dogecoin',
    change: '+45%',
    price: '$0.08234',
    sentiment: 71,
    whaleScore: 68,
    correlation: 73,
    status: 'Free',
    recommendation: 'Watch'
  }
]

export default function DashboardPreview() {
  return (
    <motion.div
      className="relative max-w-4xl mx-auto mt-16"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
    >
      {/* Floating Browser Mockup */}
      <motion.div
        className="relative bg-background-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        whileHover={{ y: -8, rotateX: 2 }}
        style={{ 
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-text-primary mb-1">Alpha Feed</h1>
              <p className="text-sm text-text-secondary">Live crypto signals powered by AI</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-text-muted mb-0.5">Portfolio Value</div>
                <div className="text-lg font-bold text-success-400">$47,329</div>
              </div>
              <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <motion.div 
            className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-3 text-center flex flex-col items-center justify-center min-w-[90px] sm:min-w-[120px]"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-primary-400 text-lg font-bold mb-1">47</div>
            <div className="text-text-muted text-xs truncate px-1 overflow-hidden text-ellipsis whitespace-nowrap w-full">Active Signals</div>
          </motion.div>
          <motion.div 
            className="bg-success-500/10 border border-success-500/20 rounded-lg p-3 text-center flex flex-col items-center justify-center min-w-[90px] sm:min-w-[120px]"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-success-400 text-lg font-bold mb-1">82.4%</div>
            <div className="text-text-muted text-xs truncate px-1 overflow-hidden text-ellipsis whitespace-nowrap w-full">Success Rate</div>
          </motion.div>
          <motion.div 
            className="bg-warning-500/10 border border-warning-500/20 rounded-lg p-3 text-center flex flex-col items-center justify-center min-w-[90px] sm:min-w-[120px]"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-warning-400 text-lg font-bold mb-1">1,247</div>
            <div className="text-text-muted text-xs truncate px-1 overflow-hidden text-ellipsis whitespace-nowrap w-full">Whale Wallets</div>
          </motion.div>
          <motion.div 
            className="bg-secondary-500/10 border border-secondary-500/20 rounded-lg p-3 text-center flex flex-col items-center justify-center min-w-[90px] sm:min-w-[120px]"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-secondary-400 text-lg font-bold mb-1">12.3K</div>
            <div className="text-text-muted text-xs truncate px-1 overflow-hidden text-ellipsis whitespace-nowrap w-full">Twitter Mentions</div>
          </motion.div>
        </div>

        {/* Signals List */}
        <div className="px-6 pb-6">
          <div className="space-y-3">
            {mockSignals.map((signal, index) => (
              <motion.div
                key={signal.symbol}
                className="bg-background border border-border rounded-lg p-4 hover:border-primary-500/30 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ x: 4 }}
              >
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
                          <div className="px-1.5 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded">
                            PRO
                          </div>
                        )}
                      </div>
                      <div className="text-text-muted text-xs truncate max-w-[90px] sm:max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap w-full">{signal.name}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium mb-0.5">{signal.price}</div>
                    <div className={`text-xs font-semibold ${
                      signal.change.startsWith('+') ? 'text-success-400' : 'text-danger-400'
                    }`}>
                      {signal.change}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
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
                    
                    <motion.button
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors h-[28px] flex items-center justify-center ${
                        signal.recommendation === 'Strong Buy' 
                          ? 'bg-success-500 text-white hover:bg-success-600'
                          : signal.recommendation === 'Buy'
                          ? 'bg-primary-500 text-white hover:bg-primary-600'
                          : 'bg-background-hover text-text-secondary hover:bg-background-card'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {signal.recommendation}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        className="absolute -top-8 -right-8 w-16 h-16 bg-success-500/20 rounded-full flex items-center justify-center"
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <TrendingUp className="w-8 h-8 text-success-400" />
      </motion.div>

      <motion.div
        className="absolute -bottom-4 -left-4 w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center"
        animate={{ 
          y: [0, 8, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ 
          duration: 2.5, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      >
        <Eye className="w-6 h-6 text-primary-400" />
      </motion.div>
    </motion.div>
  )
}