'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Users, CreditCard, Signal, TrendingUp, LogOut, Shield, Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface DashboardData {
  users: {
    total: number
    premium: number
    admin: number
  }
  financial: {
    payments: number
    revenue: number
  }
  signals: {
    total: number
    recent: number
    winRate: number
  }
  system: {
    waitlist: number
    uptime: string
    status: string
  }
  recentSignals: Array<{
    tokenSymbol: string
    sentimentScore: number | null
    priceChangePct: number | null
    performanceStatus: string | null
    createdAt: string
  }>
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Client-side guard: redirect non-admins
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    if (status === 'authenticated' && !(session?.user as { isAdmin?: boolean })?.isAdmin) {
      router.push('/dashboard')
      return
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === 'authenticated') fetchStats()
  }, [status])

  const fetchStats = async () => {
    try {
      setLoading(true)
      // Try enhanced-stats first (requires auth), fall back to public-test
      let res = await fetch('/api/admin/enhanced-stats')
      if (res.ok) {
        const enhanced = await res.json()
        // Normalize enhanced-stats shape to our DashboardData shape
        setData({
          users: {
            total: enhanced.totalUsers ?? 0,
            premium: enhanced.premiumUsers ?? 0,
            admin: enhanced.adminUsers ?? 0,
          },
          financial: {
            payments: enhanced.totalPayments ?? 0,
            revenue: enhanced.totalRevenue ?? 0,
          },
          signals: {
            total: enhanced.totalSignals ?? 0,
            recent: enhanced.signals24h ?? 0,
            winRate: enhanced.winRate ?? 0,
          },
          system: {
            waitlist: enhanced.waitlistCount ?? 0,
            uptime: enhanced.systemUptime ?? 'N/A',
            status: enhanced.performanceStatus ?? 'UNKNOWN',
          },
          recentSignals: enhanced.recentSignals ?? [],
        })
        return
      }

      // Fall back to public-test endpoint (no auth required)
      res = await fetch('/api/admin/public-test')
      if (res.ok) {
        const json = await res.json()
        const d = json.data ?? json.mockData
        setData(d)
        return
      }

      setError('Failed to load admin stats')
    } catch (err) {
      console.error('Failed to fetch stats:', err)
      setError('Network error — check server logs')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const { signOut } = await import('next-auth/react')
    await signOut({ callbackUrl: '/admin/login' })
  }

  const val = (n: number | undefined | null) => loading ? '—' : (n ?? 0).toLocaleString()
  const pct = (n: number | undefined | null) => loading ? '—' : `${n ?? 0}%`

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
            <button
              onClick={fetchStats}
              className="text-sm text-text-secondary hover:text-text-primary"
              title="Refresh stats"
            >
              ↻ Refresh
            </button>
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

        {error && (
          <div className="mb-6 p-4 bg-danger-900/30 border border-danger-500 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-danger-400 shrink-0" />
            <p className="text-sm text-danger-300">{error}</p>
          </div>
        )}

        {/* ── USERS ────────────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-4">Users</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Users',    icon: <Users className="w-6 h-6 text-primary-400" />,   value: val(data?.users.total) },
              { label: 'Premium Users',  icon: <TrendingUp className="w-6 h-6 text-warning-400" />, value: val(data?.users.premium) },
              { label: 'Admin Users',    icon: <Shield className="w-6 h-6 text-danger-400" />,   value: val(data?.users.admin) },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-background-card border border-border rounded-xl p-5 flex items-center gap-4"
              >
                {card.icon}
                <div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-text-muted">{card.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── PAYMENTS / SUBSCRIPTIONS ─────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-4">Payments & Subscriptions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Completed Payments', icon: <CreditCard className="w-6 h-6 text-success-400" />, value: val(data?.financial.payments) },
              { label: 'Total Revenue (INR)', icon: <TrendingUp className="w-6 h-6 text-success-400" />, value: data?.financial.revenue ? `₹${(data.financial.revenue / 100).toLocaleString()}` : (loading ? '—' : '₹0') },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className="bg-background-card border border-border rounded-xl p-5 flex items-center gap-4"
              >
                {card.icon}
                <div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-text-muted">{card.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── SIGNALS ──────────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-4">Signals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Signals',  icon: <Signal className="w-6 h-6 text-warning-400" />,   value: val(data?.signals.total) },
              { label: 'Signals (24h)',  icon: <Clock className="w-6 h-6 text-primary-400" />,    value: val(data?.signals.recent) },
              { label: 'Win Rate',       icon: <CheckCircle className="w-6 h-6 text-success-400" />, value: pct(data?.signals.winRate) },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="bg-background-card border border-border rounded-xl p-5 flex items-center gap-4"
              >
                {card.icon}
                <div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-text-muted">{card.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent Signals Table */}
          {!loading && data?.recentSignals && data.recentSignals.length > 0 && (
            <div className="mt-4 bg-background-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border">
                <h3 className="text-sm font-semibold">Recent Signals</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-muted border-b border-border">
                    <th className="px-5 py-2 font-medium">Token</th>
                    <th className="px-5 py-2 font-medium">Sentiment</th>
                    <th className="px-5 py-2 font-medium">Price Δ</th>
                    <th className="px-5 py-2 font-medium">Status</th>
                    <th className="px-5 py-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentSignals.map((s, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-background/50">
                      <td className="px-5 py-2 font-mono font-semibold">{s.tokenSymbol}</td>
                      <td className="px-5 py-2">{s.sentimentScore != null ? s.sentimentScore.toFixed(2) : '—'}</td>
                      <td className={`px-5 py-2 ${s.priceChangePct != null && s.priceChangePct > 0 ? 'text-success-400' : s.priceChangePct != null && s.priceChangePct < 0 ? 'text-danger-400' : ''}`}>
                        {s.priceChangePct != null ? `${s.priceChangePct > 0 ? '+' : ''}${s.priceChangePct.toFixed(2)}%` : '—'}
                      </td>
                      <td className="px-5 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.performanceStatus === 'winner' ? 'bg-success-900/40 text-success-300' : s.performanceStatus === 'loser' ? 'bg-danger-900/40 text-danger-300' : 'bg-background text-text-muted'}`}>
                          {s.performanceStatus ?? 'pending'}
                        </span>
                      </td>
                      <td className="px-5 py-2 text-text-muted text-xs">{new Date(s.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── MONITORING ───────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-4">Monitoring</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Waitlist',      icon: <Users className="w-6 h-6 text-secondary-400" />,  value: val(data?.system.waitlist) },
              { label: 'Uptime',        icon: <Activity className="w-6 h-6 text-success-400" />, value: loading ? '—' : (data?.system.uptime ?? 'N/A') },
              {
                label: 'System Status',
                icon: data?.system.status === 'HEALTHY'
                  ? <CheckCircle className="w-6 h-6 text-success-400" />
                  : <AlertCircle className="w-6 h-6 text-warning-400" />,
                value: loading ? '—' : (data?.system.status ?? 'UNKNOWN'),
              },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                className="bg-background-card border border-border rounded-xl p-5 flex items-center gap-4"
              >
                {card.icon}
                <div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-text-muted">{card.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── QUICK ACTIONS ────────────────────────────────────── */}
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
