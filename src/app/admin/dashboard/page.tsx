'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Users, CreditCard, Signal, TrendingUp, LogOut, Shield } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalUsers: number
  totalPayments: number
  totalSignals: number
  waitlistCount: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPayments: 0,
    totalSignals: 0,
    waitlistCount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background pt-16 lg:pt-20">
      {/* Header */}
      <header className="border-b border-border bg-background-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-danger-500 to-warning-500 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Admin Dashboard</h1>
              <p className="text-xs text-text-muted">ChainPulse Alpha</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-text-secondary hover:text-text-primary">
              View Site
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-danger-400 hover:text-danger-300"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
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
            className="bg-background-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-primary-400" />
              <span className="text-2xl font-bold">{loading ? '-' : stats.totalUsers}</span>
            </div>
            <p className="text-text-secondary text-sm">Total Users</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-background-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <CreditCard className="w-8 h-8 text-success-400" />
              <span className="text-2xl font-bold">{loading ? '-' : stats.totalPayments}</span>
            </div>
            <p className="text-text-secondary text-sm">Total Payments</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-background-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Signal className="w-8 h-8 text-warning-400" />
              <span className="text-2xl font-bold">{loading ? '-' : stats.totalSignals}</span>
            </div>
            <p className="text-text-secondary text-sm">Signals Generated</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-background-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-secondary-400" />
              <span className="text-2xl font-bold">{loading ? '-' : stats.waitlistCount}</span>
            </div>
            <p className="text-text-secondary text-sm">Waitlist</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="bg-background-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard"
              className="p-4 bg-background border border-border rounded-lg hover:border-primary-500 transition-colors"
            >
              <p className="font-medium">View User Dashboard</p>
              <p className="text-sm text-text-muted mt-1">Preview user experience</p>
            </Link>
            
            <a
              href="https://dashboard.razorpay.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-background border border-border rounded-lg hover:border-success-500 transition-colors"
            >
              <p className="font-medium">Razorpay Dashboard</p>
              <p className="text-sm text-text-muted mt-1">Manage payments</p>
            </a>
            
            <a
              href="https://console.neon.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-background border border-border rounded-lg hover:border-secondary-500 transition-colors"
            >
              <p className="font-medium">Database Console</p>
              <p className="text-sm text-text-muted mt-1">View Neon DB</p>
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
