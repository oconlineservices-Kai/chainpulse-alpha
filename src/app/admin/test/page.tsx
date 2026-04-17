'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, CreditCard, Signal, TrendingUp, Shield, BarChart, DollarSign, Activity } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalUsers: number
  totalPayments: number
  totalSignals: number
  waitlistCount: number
  recentSignals: Array<{
    tokenSymbol: string
    sentimentScore: number
    whaleConfidence: number
    correlationScore: number
    priceChangePct: number
    createdAt: string
  }>
}

export default function AdminTestPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPayments: 0,
    totalSignals: 0,
    waitlistCount: 0,
    recentSignals: []
  })
  const [loading, setLoading] = useState(true)
  const [performance, setPerformance] = useState({
    winRate: 0,
    avgReturn: 0,
    bestGain: 0,
    worstLoss: 0
  })

  useEffect(() => {
    fetchStats()
    fetchPerformance()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/public/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      // Fallback to mock data for demo
      setStats({
        totalUsers: 42,
        totalPayments: 18,
        totalSignals: 156,
        waitlistCount: 237,
        recentSignals: [
          { tokenSymbol: 'INJ', sentimentScore: 88, whaleConfidence: 90, correlationScore: 89, priceChangePct: 5.1, createdAt: '2026-04-16T11:53:47.854Z' },
          { tokenSymbol: 'APT', sentimentScore: 76, whaleConfidence: 85, correlationScore: 80, priceChangePct: 6.7, createdAt: '2026-04-16T11:53:47.880Z' },
          { tokenSymbol: 'ARB', sentimentScore: 85, whaleConfidence: 82, correlationScore: 84, priceChangePct: 4.2, createdAt: '2026-04-16T13:00:00.000Z' }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPerformance = async () => {
    try {
      // This would come from performance API
      setPerformance({
        winRate: 57.1,
        avgReturn: 1.8,
        bestGain: 6.7,
        worstLoss: -5.4
      })
    } catch (error) {
      console.error('Failed to fetch performance:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-card pt-16 lg:pt-20">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                  ChainPulse Alpha Admin
                </h1>
                <p className="text-text-secondary">Demo Admin Dashboard • Real-time Analytics</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/admin/dashboard" 
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Secure Login
              </Link>
              <Link 
                href="/" 
                className="text-sm text-text-secondary hover:text-text-primary"
              >
                View Site
              </Link>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-text-muted bg-background-card/50 p-3 rounded-lg">
            <p>⚠️ <strong>Demo Mode:</strong> This is a public demo of the admin dashboard. For full access with user management and transaction controls, use the secure login.</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background-card border border-border rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-primary-500/10">
                <Users className="w-6 h-6 text-primary-400" />
              </div>
              <span className="text-3xl font-bold">{loading ? '...' : stats.totalUsers}</span>
            </div>
            <p className="text-text-secondary text-sm">Total Users</p>
            <div className="mt-2 text-xs text-text-muted">+12% this week</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-background-card border border-border rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-success-500/10">
                <CreditCard className="w-6 h-6 text-success-400" />
              </div>
              <span className="text-3xl font-bold">{loading ? '...' : stats.totalPayments}</span>
            </div>
            <p className="text-text-secondary text-sm">Total Payments</p>
            <div className="mt-2 text-xs text-text-muted">$2,850 revenue</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-background-card border border-border rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-warning-500/10">
                <Signal className="w-6 h-6 text-warning-400" />
              </div>
              <span className="text-3xl font-bold">{loading ? '...' : stats.totalSignals}</span>
            </div>
            <p className="text-text-secondary text-sm">Signals Generated</p>
            <div className="mt-2 text-xs text-text-muted">7 today • 57% win rate</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-background-card border border-border rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-secondary-500/10">
                <TrendingUp className="w-6 h-6 text-secondary-400" />
              </div>
              <span className="text-3xl font-bold">{loading ? '...' : stats.waitlistCount}</span>
            </div>
            <p className="text-text-secondary text-sm">Waitlist</p>
            <div className="mt-2 text-xs text-text-muted">+8 today</div>
          </motion.div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Signal Performance */}
          <div className="bg-background-card border border-border rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-primary-400" />
              Signal Performance
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background p-4 rounded-xl">
                <div className="text-2xl font-bold text-success-400">{performance.winRate}%</div>
                <p className="text-sm text-text-secondary mt-1">Win Rate</p>
              </div>
              
              <div className="bg-background p-4 rounded-xl">
                <div className="text-2xl font-bold text-primary-400">{performance.avgReturn}%</div>
                <p className="text-sm text-text-secondary mt-1">Avg Return</p>
              </div>
              
              <div className="bg-background p-4 rounded-xl">
                <div className="text-2xl font-bold text-success-400">+{performance.bestGain}%</div>
                <p className="text-sm text-text-secondary mt-1">Best Gain</p>
              </div>
              
              <div className="bg-background p-4 rounded-xl">
                <div className="text-2xl font-bold text-danger-400">{performance.worstLoss}%</div>
                <p className="text-sm text-text-secondary mt-1">Worst Loss</p>
              </div>
            </div>
          </div>

          {/* Recent Signals */}
          <div className="bg-background-card border border-border rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-warning-400" />
              Recent Signals
            </h2>
            
            <div className="space-y-4">
              {stats.recentSignals.map((signal, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-background rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      signal.priceChangePct > 0 ? 'bg-success-500/10' : 'bg-danger-500/10'
                    }`}>
                      <div className={`text-sm font-bold ${
                        signal.priceChangePct > 0 ? 'text-success-400' : 'text-danger-400'
                      }`}>
                        {signal.tokenSymbol}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{signal.tokenSymbol}</p>
                      <p className="text-xs text-text-muted">
                        Sent: {signal.sentimentScore} • Whale: {signal.whaleConfidence}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      signal.priceChangePct > 0 ? 'text-success-400' : 'text-danger-400'
                    }`}>
                      {signal.priceChangePct > 0 ? '+' : ''}{signal.priceChangePct.toFixed(1)}%
                    </div>
                    <p className="text-xs text-text-muted">
                      {new Date(signal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-background-card border border-border rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard"
              className="p-4 bg-background border border-border rounded-xl hover:border-primary-500 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-500/10 group-hover:bg-primary-500/20">
                  <Activity className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="font-medium">User Dashboard</p>
                  <p className="text-sm text-text-muted">Preview user experience</p>
                </div>
              </div>
            </Link>
            
            <a
              href="https://dashboard.razorpay.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-background border border-border rounded-xl hover:border-success-500 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success-500/10 group-hover:bg-success-500/20">
                  <DollarSign className="w-5 h-5 text-success-400" />
                </div>
                <div>
                  <p className="font-medium">Payment Dashboard</p>
                  <p className="text-sm text-text-muted">View transactions</p>
                </div>
              </div>
            </a>
            
            <Link
              href="/admin/login"
              className="p-4 bg-background border border-border rounded-xl hover:border-warning-500 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning-500/10 group-hover:bg-warning-500/20">
                  <Shield className="w-5 h-5 text-warning-400" />
                </div>
                <div>
                  <p className="font-medium">Secure Admin</p>
                  <p className="text-sm text-text-muted">Full admin access</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-text-muted">
          <p>This is a demo admin dashboard. Real admin features include: User management, Transaction approval, Signal moderation, Analytics export</p>
          <p className="mt-2">
            <Link href="/admin/login" className="text-primary-400 hover:text-primary-300">
              Click here for secure admin login
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}