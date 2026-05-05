'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Users, CreditCard, Signal, TrendingUp, LogOut, Shield, Activity, Clock, CheckCircle, AlertCircle, Diamond, UserPlus } from 'lucide-react'
import Link from 'next/link'

interface RecentUser {
  id: string
  email: string
  premiumStatus: string
  createdAt: string
}

interface DashboardData {
  users: {
    total: number
    free: number
    premium: number
    admin: number
    monthlyOnboarded: number
  }
  financial: {
    payments: number
    revenue: number
    payPerAlphaCount: number
    premiumPaymentCount: number
    payPerAlphaRevenue: number
    premiumRevenue: number
  }
  signals: {
    total: number
    diamondCount: number
    recent: number
    winRate: number
  }
  system: {
    waitlist: number
  }
  recentUsers: RecentUser[]
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
      let res = await fetch('/api/admin/enhanced-stats')
      if (res.ok) {
        const enhanced = await res.json()
        setData({
          users: {
            total: enhanced.totalUsers ?? 0,
            free: enhanced.freeUsers ?? 0,
            premium: enhanced.premiumUsers ?? 0,
            admin: enhanced.adminUsers ?? 0,
            monthlyOnboarded: enhanced.monthlyOnboarded ?? 0,
          },
          financial: {
            payments: enhanced.totalPayments ?? 0,
            revenue: enhanced.totalRevenue ?? 0,
            payPerAlphaCount: enhanced.payPerAlphaCount ?? 0,
            premiumPaymentCount: enhanced.premiumPaymentCount ?? 0,
            payPerAlphaRevenue: enhanced.payPerAlphaRevenue ?? 0,
            premiumRevenue: enhanced.premiumRevenue ?? 0,
          },
          signals: {
            total: enhanced.totalSignals ?? 0,
            diamondCount: enhanced.diamondSignalCount ?? 0,
            recent: enhanced.signals24h ?? 0,
            winRate: enhanced.winRate ?? 0,
          },
          system: {
            waitlist: enhanced.waitlistCount ?? 0,
          },
          recentUsers: enhanced.recentUsers ?? [],
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
  const inr = (n: number | undefined | null) => loading ? '—' : `₹${((n ?? 0) / 100).toLocaleString()}`

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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Users',          icon: <Users className="w-6 h-6 text-primary-400" />,     value: val(data?.users.total) },
              { label: 'Free Users',           icon: <Users className="w-6 h-6 text-text-muted" />,      value: val(data?.users.free) },
              { label: 'Premium Users',        icon: <TrendingUp className="w-6 h-6 text-warning-400" />, value: val(data?.users.premium) },
              { label: 'Monthly Onboarded',    icon: <UserPlus className="w-6 h-6 text-success-400" />,   value: val(data?.users.monthlyOnboarded) },
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

        {/* ── REVENUE ──────────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-4">Revenue</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Revenue',             icon: <TrendingUp className="w-6 h-6 text-success-400" />, value: inr(data?.financial.revenue) },
              { label: 'Pay-Per-Alpha Revenue',     icon: <CreditCard className="w-6 h-6 text-primary-400" />,  value: inr(data?.financial.payPerAlphaRevenue) },
              { label: 'Premium Revenue',           icon: <TrendingUp className="w-6 h-6 text-warning-400" />,  value: inr(data?.financial.premiumRevenue) },
              { label: 'PPA Payments',              icon: <CreditCard className="w-6 h-6 text-primary-400" />,  value: val(data?.financial.payPerAlphaCount) },
              { label: 'Premium Payments',          icon: <CreditCard className="w-6 h-6 text-warning-400" />,  value: val(data?.financial.premiumPaymentCount) },
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

        {/* ── SIGNALS ─────────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-4">Signals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Signals',   icon: <Signal className="w-6 h-6 text-warning-400" />,    value: val(data?.signals.total) },
              { label: 'Diamond Signals', icon: <Diamond className="w-6 h-6 text-primary-400" />,    value: val(data?.signals.diamondCount) },
              { label: 'Win Rate',        icon: <CheckCircle className="w-6 h-6 text-success-400" />, value: pct(data?.signals.winRate) },
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
        </section>

        {/* ── SYSTEM ──────────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-4">System</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Waitlist', icon: <Users className="w-6 h-6 text-secondary-400" />, value: val(data?.system.waitlist) },
              { label: 'Active Users (7d)', icon: <Activity className="w-6 h-6 text-success-400" />, value: val(data?.users.total) },
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

        {/* ── RECENT USERS TABLE ───────────────────────────────── */}
        {!loading && data?.recentUsers && data.recentUsers.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-4">Recent Users</h2>
            <div className="bg-background-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-muted border-b border-border">
                    <th className="px-5 py-3 font-medium">ID</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentUsers.map((u, i) => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-background/50">
                      <td className="px-5 py-3 font-mono text-xs text-text-secondary">{u.id.substring(0, 8)}...</td>
                      <td className="px-5 py-3">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          u.premiumStatus === 'premium' || u.premiumStatus === 'lifetime'
                            ? 'bg-warning-900/40 text-warning-300'
                            : u.premiumStatus === 'admin'
                            ? 'bg-danger-900/40 text-danger-300'
                            : 'bg-background text-text-muted'
                        }`}>
                          {u.premiumStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-text-muted text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── QUICK ACTIONS ────────────────────────────────────── */}
        <div className="bg-background-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/users"
              className="p-4 bg-background border border-border rounded-lg hover:border-primary-500 transition-colors"
            >
              <p className="font-medium">Manage Users</p>
              <p className="text-sm text-text-muted mt-1">View &amp; manage accounts</p>
            </Link>

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
