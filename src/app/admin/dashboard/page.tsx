'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  Users, CreditCard, TrendingUp, LogOut, Shield, Activity,
  Clock, CheckCircle, AlertCircle, Zap, BarChart3, RefreshCw,
  Crown, Database, Signal, Eye, ArrowUpRight, ArrowDownRight,
  Search, Filter, Download, ChevronDown, ChevronUp,
} from 'lucide-react'
import Link from 'next/link'

interface DashboardData {
  users: {
    total: number
    premium: number
    admin: number
    active?: number
  }
  financial: {
    payments: number
    revenue: number
    monthlyRevenue?: number
    avgTransaction?: number
  }
  signals: {
    total: number
    recent: number
    winRate: number
    diamondSignals?: number
    avgReturn?: number
  }
  system: {
    waitlist: number
    uptime: string
    status: string
    lastSignal?: string
  }
  recentSignals: Array<{
    tokenSymbol: string
    sentimentScore: number | null
    priceChangePct: number | null
    performanceStatus: string | null
    createdAt: string
    whaleConfidence?: number | null
  }>
  performanceStats?: {
    totalTracked: number
    profitable: number
    losing: number
    bestGain: number
    worstLoss: number
  }
}

function StatCard({
  label,
  value,
  icon,
  sub,
  trend,
  color = 'primary',
  delay = 0,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  sub?: string
  trend?: 'up' | 'down' | 'neutral'
  color?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-background-card border border-border rounded-xl p-5 flex items-start gap-4 hover:border-primary-500/40 transition-colors"
    >
      <div className="mt-1 shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        {sub && (
          <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
            {trend === 'up' && <ArrowUpRight className="w-3 h-3 text-success-400" />}
            {trend === 'down' && <ArrowDownRight className="w-3 h-3 text-danger-400" />}
            {sub}
          </p>
        )}
      </div>
    </motion.div>
  )
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-text-muted uppercase tracking-widest">{title}</h2>
      {action}
    </div>
  )
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [signalFilter, setSignalFilter] = useState('')
  const [showAllSignals, setShowAllSignals] = useState(false)

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
            premium: enhanced.premiumUsers ?? 0,
            admin: enhanced.adminUsers ?? 0,
            active: enhanced.activeUsers ?? 0,
          },
          financial: {
            payments: enhanced.totalPayments ?? 0,
            revenue: enhanced.totalRevenue ?? 0,
            monthlyRevenue: enhanced.monthlyRevenue ?? 0,
            avgTransaction: enhanced.avgTransaction ?? 0,
          },
          signals: {
            total: enhanced.totalSignals ?? 0,
            recent: enhanced.signals24h ?? 0,
            winRate: enhanced.winRate ?? 0,
            diamondSignals: enhanced.diamondSignals ?? 0,
            avgReturn: enhanced.avgReturn ?? 0,
          },
          system: {
            waitlist: enhanced.waitlistCount ?? 0,
            uptime: enhanced.systemUptime ?? 'N/A',
            status: enhanced.performanceStatus ?? 'UNKNOWN',
            lastSignal: enhanced.lastSignal ?? 'N/A',
          },
          recentSignals: enhanced.recentSignals ?? [],
          performanceStats: enhanced.performanceStats,
        })
        setLastRefresh(new Date())
        return
      }

      res = await fetch('/api/admin/public-test')
      if (res.ok) {
        const json = await res.json()
        const d = json.data ?? json.mockData
        setData(d)
        setLastRefresh(new Date())
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
  const pct = (n: number | undefined | null) => loading ? '—' : `${(n ?? 0).toFixed(1)}%`
  const currency = (n: number | undefined | null) =>
    loading ? '—' : `₹${((n ?? 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`

  const filteredSignals = (data?.recentSignals ?? []).filter(s =>
    !signalFilter || s.tokenSymbol.toLowerCase().includes(signalFilter.toLowerCase())
  )
  const displayedSignals = showAllSignals ? filteredSignals : filteredSignals.slice(0, 5)

  const systemStatusOk = data?.system.status === 'HEALTHY' || data?.system.status === 'OPERATIONAL'

  return (
    <div className="min-h-screen bg-background pt-16 lg:pt-20">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-background-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-danger-500 to-warning-500 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-base leading-tight">Admin Dashboard</h1>
              <p className="text-xs text-text-muted hidden sm:block">
                ChainPulse Alpha
                {lastRefresh && (
                  <span className="ml-2">· Updated {lastRefresh.toLocaleTimeString()}</span>
                )}
              </p>
            </div>
            {/* Live indicator */}
            {!loading && systemStatusOk && (
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-success-500/10 border border-success-500/20">
                <div className="w-1.5 h-1.5 bg-success-400 rounded-full animate-pulse" />
                <span className="text-success-400 text-xs font-medium">Live</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50 transition-colors"
              title="Refresh stats"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link href="/" className="text-sm text-text-secondary hover:text-text-primary hidden sm:block">
              View Site
            </Link>
            <Link href="/dashboard" className="text-sm text-text-secondary hover:text-text-primary hidden sm:block">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-danger-400 hover:text-danger-300 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* ── Error Banner ────────────────────────────────────────────── */}
        {error && (
          <div className="p-4 bg-danger-900/30 border border-danger-500 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-danger-400 shrink-0" />
            <p className="text-sm text-danger-300">{error}</p>
            <button onClick={fetchStats} className="ml-auto text-xs text-danger-400 hover:text-danger-300 underline">
              Retry
            </button>
          </div>
        )}

        {/* ── Overview KPI Row ─────────────────────────────────────────── */}
        <section>
          <SectionHeader title="Overview" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Total Users"
              value={val(data?.users.total)}
              icon={<Users className="w-6 h-6 text-primary-400" />}
              sub={data ? `${data.users.active ?? 0} active` : undefined}
              delay={0}
            />
            <StatCard
              label="Premium Users"
              value={val(data?.users.premium)}
              icon={<Crown className="w-6 h-6 text-warning-400" />}
              sub={data?.users.total ? `${((data.users.premium / data.users.total) * 100).toFixed(1)}% conversion` : undefined}
              trend="up"
              delay={0.05}
            />
            <StatCard
              label="Revenue (Total)"
              value={currency(data?.financial.revenue)}
              icon={<TrendingUp className="w-6 h-6 text-success-400" />}
              sub={data ? `${currency(data.financial.monthlyRevenue)} this month` : undefined}
              trend="up"
              delay={0.1}
            />
            <StatCard
              label="System Status"
              value={loading ? '—' : (data?.system.status ?? 'UNKNOWN')}
              icon={
                systemStatusOk
                  ? <CheckCircle className="w-6 h-6 text-success-400" />
                  : <AlertCircle className="w-6 h-6 text-warning-400" />
              }
              sub={data ? `Uptime: ${data.system.uptime}` : undefined}
              delay={0.15}
            />
          </div>
        </section>

        {/* ── Users ────────────────────────────────────────────────────── */}
        <section>
          <SectionHeader
            title="Users"
            action={
              <Link href="/admin/users" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                Manage <ArrowUpRight className="w-3 h-3" />
              </Link>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total Users" value={val(data?.users.total)} icon={<Users className="w-5 h-5 text-primary-400" />} delay={0.05} />
            <StatCard label="Premium Users" value={val(data?.users.premium)} icon={<Crown className="w-5 h-5 text-warning-400" />} delay={0.1} />
            <StatCard label="Admin Users" value={val(data?.users.admin)} icon={<Shield className="w-5 h-5 text-danger-400" />} delay={0.15} />
          </div>
        </section>

        {/* ── Financial ────────────────────────────────────────────────── */}
        <section>
          <SectionHeader
            title="Payments & Revenue"
            action={
              <a
                href="https://dashboard.razorpay.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-success-400 hover:text-success-300 flex items-center gap-1"
              >
                Razorpay <ArrowUpRight className="w-3 h-3" />
              </a>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Completed Payments"
              value={val(data?.financial.payments)}
              icon={<CreditCard className="w-5 h-5 text-success-400" />}
              delay={0.05}
            />
            <StatCard
              label="Total Revenue"
              value={currency(data?.financial.revenue)}
              icon={<TrendingUp className="w-5 h-5 text-success-400" />}
              delay={0.1}
            />
            <StatCard
              label="Revenue (30 days)"
              value={currency(data?.financial.monthlyRevenue)}
              icon={<BarChart3 className="w-5 h-5 text-primary-400" />}
              delay={0.15}
            />
            <StatCard
              label="Avg. Transaction"
              value={currency(data?.financial.avgTransaction)}
              icon={<Activity className="w-5 h-5 text-secondary-400" />}
              delay={0.2}
            />
          </div>
        </section>

        {/* ── Signals ──────────────────────────────────────────────────── */}
        <section>
          <SectionHeader title="Signal Performance" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <StatCard
              label="Total Signals"
              value={val(data?.signals.total)}
              icon={<Signal className="w-5 h-5 text-warning-400" />}
              delay={0.05}
            />
            <StatCard
              label="Signals (24h)"
              value={val(data?.signals.recent)}
              icon={<Clock className="w-5 h-5 text-primary-400" />}
              sub={data ? `Last signal: ${data.system.lastSignal}` : undefined}
              delay={0.1}
            />
            <StatCard
              label="Win Rate"
              value={pct(data?.signals.winRate)}
              icon={<CheckCircle className="w-5 h-5 text-success-400" />}
              sub={
                data?.performanceStats
                  ? `${data.performanceStats.profitable}W / ${data.performanceStats.losing}L`
                  : undefined
              }
              trend="up"
              delay={0.15}
            />
            <StatCard
              label="Diamond Signals"
              value={val(data?.signals.diamondSignals)}
              icon={<Zap className="w-5 h-5 text-purple-400" />}
              sub={data?.signals.avgReturn !== undefined ? `Avg return: ${data.signals.avgReturn}%` : undefined}
              delay={0.2}
            />
          </div>

          {/* Performance bar */}
          {data?.performanceStats && data.performanceStats.totalTracked > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-background-card border border-border rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-text-secondary">Performance Breakdown</p>
                <p className="text-xs text-text-muted">{data.performanceStats.totalTracked} signals tracked</p>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-background">
                <div
                  className="bg-success-500 transition-all"
                  style={{ width: `${(data.performanceStats.profitable / data.performanceStats.totalTracked) * 100}%` }}
                />
                <div
                  className="bg-danger-500 transition-all"
                  style={{ width: `${(data.performanceStats.losing / data.performanceStats.totalTracked) * 100}%` }}
                />
              </div>
              <div className="flex items-center gap-6 mt-2 text-xs text-text-muted">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success-500 inline-block" /> Profitable ({data.performanceStats.profitable})</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-danger-500 inline-block" /> Losing ({data.performanceStats.losing})</span>
                <span className="ml-auto">Best: +{data.performanceStats.bestGain}% · Worst: {data.performanceStats.worstLoss}%</span>
              </div>
            </motion.div>
          )}
        </section>

        {/* ── Recent Signals Table ─────────────────────────────────────── */}
        {!loading && data?.recentSignals && data.recentSignals.length > 0 && (
          <section>
            <SectionHeader
              title="Recent Signals"
              action={
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                    <input
                      type="text"
                      placeholder="Filter token..."
                      value={signalFilter}
                      onChange={(e) => setSignalFilter(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-primary-500 text-text-primary placeholder:text-text-muted"
                    />
                  </div>
                </div>
              }
            />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background-card border border-border rounded-xl overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-text-muted border-b border-border bg-background/50">
                      <th className="px-5 py-3 font-medium">Token</th>
                      <th className="px-5 py-3 font-medium">Sentiment</th>
                      <th className="px-5 py-3 font-medium hidden sm:table-cell">Whale Conf.</th>
                      <th className="px-5 py-3 font-medium">Price Δ</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium hidden md:table-cell">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedSignals.map((s, i) => (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-background/50 transition-colors">
                        <td className="px-5 py-3 font-mono font-semibold text-text-primary">{s.tokenSymbol}</td>
                        <td className="px-5 py-3">
                          {s.sentimentScore != null ? (
                            <span className={
                              s.sentimentScore >= 80 ? 'text-success-400' :
                              s.sentimentScore >= 60 ? 'text-warning-400' : 'text-danger-400'
                            }>{s.sentimentScore.toFixed(0)}</span>
                          ) : '—'}
                        </td>
                        <td className="px-5 py-3 hidden sm:table-cell text-text-secondary">
                          {s.whaleConfidence != null ? s.whaleConfidence.toFixed(0) : '—'}
                        </td>
                        <td className={`px-5 py-3 font-medium ${
                          s.priceChangePct != null && s.priceChangePct > 0
                            ? 'text-success-400'
                            : s.priceChangePct != null && s.priceChangePct < 0
                            ? 'text-danger-400'
                            : 'text-text-muted'
                        }`}>
                          {s.priceChangePct != null
                            ? `${s.priceChangePct > 0 ? '+' : ''}${s.priceChangePct.toFixed(2)}%`
                            : '—'}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            s.performanceStatus === 'winner'
                              ? 'bg-success-900/40 text-success-300 border border-success-500/20'
                              : s.performanceStatus === 'loser'
                              ? 'bg-danger-900/40 text-danger-300 border border-danger-500/20'
                              : 'bg-background text-text-muted border border-border'
                          }`}>
                            {s.performanceStatus ?? 'pending'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-text-muted text-xs hidden md:table-cell">
                          {new Date(s.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredSignals.length > 5 && (
                <div className="px-5 py-3 border-t border-border">
                  <button
                    onClick={() => setShowAllSignals(!showAllSignals)}
                    className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    {showAllSignals ? (
                      <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
                    ) : (
                      <><ChevronDown className="w-3.5 h-3.5" /> Show all {filteredSignals.length} signals</>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </section>
        )}

        {/* ── Monitoring ───────────────────────────────────────────────── */}
        <section>
          <SectionHeader title="Monitoring" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Waitlist"
              value={val(data?.system.waitlist)}
              icon={<Users className="w-5 h-5 text-secondary-400" />}
              sub="Email signups"
              delay={0.05}
            />
            <StatCard
              label="Uptime"
              value={loading ? '—' : (data?.system.uptime ?? 'N/A')}
              icon={<Activity className="w-5 h-5 text-success-400" />}
              delay={0.1}
            />
            <StatCard
              label="System Status"
              value={loading ? '—' : (data?.system.status ?? 'UNKNOWN')}
              icon={
                systemStatusOk
                  ? <CheckCircle className="w-5 h-5 text-success-400" />
                  : <AlertCircle className="w-5 h-5 text-warning-400" />
              }
              delay={0.15}
            />
          </div>
        </section>

        {/* ── Quick Actions ─────────────────────────────────────────────── */}
        <section>
          <SectionHeader title="Quick Actions" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/dashboard"
              className="group p-4 bg-background-card border border-border rounded-xl hover:border-primary-500/50 transition-all"
            >
              <Eye className="w-5 h-5 text-primary-400 mb-2" />
              <p className="font-medium text-sm">User Dashboard</p>
              <p className="text-xs text-text-muted mt-1">Preview user experience</p>
            </Link>
            <Link
              href="/signals"
              className="group p-4 bg-background-card border border-border rounded-xl hover:border-warning-500/50 transition-all"
            >
              <Signal className="w-5 h-5 text-warning-400 mb-2" />
              <p className="font-medium text-sm">Signals Page</p>
              <p className="text-xs text-text-muted mt-1">View live signal feed</p>
            </Link>
            <a
              href="https://dashboard.razorpay.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-4 bg-background-card border border-border rounded-xl hover:border-success-500/50 transition-all"
            >
              <CreditCard className="w-5 h-5 text-success-400 mb-2" />
              <p className="font-medium text-sm">Razorpay Dashboard</p>
              <p className="text-xs text-text-muted mt-1">Manage payments</p>
            </a>
            <a
              href="https://console.neon.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-4 bg-background-card border border-border rounded-xl hover:border-secondary-500/50 transition-all"
            >
              <Database className="w-5 h-5 text-secondary-400 mb-2" />
              <p className="font-medium text-sm">Database Console</p>
              <p className="text-xs text-text-muted mt-1">View Neon DB</p>
            </a>
          </div>
        </section>

      </main>
    </div>
  )
}
