'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { WhaleActivityResponse } from '@/app/api/whale-activity/route'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ── Icons (inline Lucide to avoid dep issues) ─────────────────────────────────
const WhaleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2c-4 0-7 3-7 7v6c0 4 3 7 7 7s7-3 7-7V9c0-4-3-7-7-7z" />
    <path d="M8 12c0-2 3-4 4-4s4 2 4 4" />
  </svg>
)

const ArrowUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>
)

const ArrowDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
)

const AlertTriangleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
)

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
)

const LockIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
)

const CrownIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" /><path d="M3 20h18" /></svg>
)

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatEth(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(0)}K`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toFixed(1)
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function severityColor(severity: string): string {
  switch (severity) {
    case 'HIGH': return 'text-red-400'
    case 'MEDIUM': return 'text-yellow-400'
    case 'LOW': return 'text-green-400'
    default: return 'text-text-muted'
  }
}

function directionColor(dir: string): string {
  if (dir === 'accumulating') return 'text-green-400'
  if (dir === 'distributing') return 'text-red-400'
  return 'text-text-muted'
}

// ── Props ──────────────────────────────────────────────────────────────────────
interface WhaleActivityWidgetProps {
  /** Show compact version (for homepage) vs full version (for dashboard) */
  compact?: boolean
  /** Render without card container (for inline use) */
  standalone?: boolean
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function WhaleActivityWidget({ compact = false, standalone = false }: WhaleActivityWidgetProps) {
  const { data: session, status: sessionStatus } = useSession()
  const isPremium = sessionStatus === 'authenticated' && (session?.user as any)?.premiumStatus === 'premium'
  const isDefinitelyPremium = sessionStatus === 'authenticated' && isPremium

  const [data, setData] = useState<WhaleActivityResponse['data'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/whale-activity')
      const json: WhaleActivityResponse = await res.json()
      if (json.success && json.data) {
        setData(json.data)
      } else {
        setError('Failed to load whale data')
      }
    } catch {
      setError('Unable to connect')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(fetchData, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchData])

  // ── Loading skeleton ──────────────────────────────────────────────
  if (loading) {
    const skeleton = (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-white/5 rounded w-2/3" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
        <div className="flex gap-4">
          <div className="h-16 bg-white/5 rounded-xl flex-1" />
          <div className="h-16 bg-white/5 rounded-xl flex-1" />
          <div className="h-16 bg-white/5 rounded-xl flex-1" />
        </div>
      </div>
    )

    if (standalone) return skeleton
    return (
      <div className={cn(
        'rounded-2xl border border-border bg-background-card p-5',
        compact ? 'space-y-4' : 'space-y-5'
      )}>
        {skeleton}
      </div>
    )
  }

  // ── Error state ───────────────────────────────────────────────────
  if (error || !data) {
    const errorContent = (
      <div className="flex items-center gap-2 text-text-muted text-sm">
        <AlertTriangleIcon className="w-4 h-4 shrink-0" />
        <span>Whale data unavailable</span>
        <button onClick={fetchData} className="ml-auto text-primary-400 hover:text-primary-300 text-xs flex items-center gap-1">
          <RefreshIcon className="w-3 h-3" /> Retry
        </button>
      </div>
    )

    if (standalone) return errorContent
    return (
      <div className="rounded-2xl border border-border bg-background-card p-5">
        {errorContent}
      </div>
    )
  }

  const s = data.summary
  const recent = data.recentMovements
  const hasMovements = s.totalMovements24h > 0

  // Net flow display
  const netFlowLabel = s.netFlow6h > 0 ? 'Accumulating' : s.netFlow6h < 0 ? 'Distributing' : 'Neutral'
  const netFlowColor = s.netFlow6h > 0 ? 'text-green-400' : s.netFlow6h < 0 ? 'text-red-400' : 'text-text-muted'

  // ── Compact variant (for homepage) ────────────────────────────────
  if (compact) {
    return (
      <div className={cn(
        'rounded-2xl border border-border bg-background-card',
        standalone ? 'p-4' : 'p-5'
      )}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <WhaleIcon className="w-4 h-4 text-primary-400" />
            <h3 className="text-sm font-semibold text-text-primary">
              {hasMovements ? '🐋 Live On-Chain' : '🐋 Whale Tracker'}
            </h3>
          </div>
          {hasMovements && <span className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />Live</span>}
        </div>

        {hasMovements ? (
          <>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-bold text-text-primary">{s.totalMovements24h}</span>
              <span className="text-text-muted text-xs">movements in 24h</span>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-lg font-semibold text-text-primary">{formatEth(s.totalEthMoved24h)}</span>
              <span className="text-text-muted text-xs">ETH moved</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className={cn('font-medium', netFlowColor)}>
                {netFlowLabel} ({formatEth(Math.abs(s.netFlow6h))} ETH/6h)
              </span>
              <span className="text-text-muted">· {s.chainsTracked} chains</span>
            </div>
            {s.highSeverityCount6h > 0 && (
              <div className="mt-2 flex items-center gap-1 text-xs text-red-400">
                <AlertTriangleIcon className="w-3 h-3" />
                {s.highSeverityCount6h} high-severity movement{s.highSeverityCount6h !== 1 ? 's' : ''}
              </div>
            )}
          </>
        ) : (
          <p className="text-text-muted text-sm">
            {s.uniqueWalletsTracked} wallets tracked across {s.chainsTracked} chains. Checking every 15 minutes.
          </p>
        )}

        {/* Premium upsell for non-premium */}
        {!isDefinitelyPremium && hasMovements && (
          <Link
            href="/pricing"
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors"
          >
            <LockIcon className="w-3 h-3" />
            Upgrade to see wallet addresses
          </Link>
        )}
      </div>
    )
  }

  // ── Full variant (for dashboard) ──────────────────────────────────
  return (
    <div className="rounded-2xl border border-border bg-background-card overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WhaleIcon className="w-5 h-5 text-primary-400" />
          <h2 className="text-lg font-bold text-text-primary">🐋 Whale Activity</h2>
          {hasMovements && (
            <span className="text-xs text-green-400 flex items-center gap-1 ml-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Live
            </span>
          )}
        </div>
        <button
          onClick={fetchData}
          className="text-text-muted hover:text-text-primary transition-colors"
          title="Refresh"
        >
          <RefreshIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border/50">
        <StatCard label="Movements (24h)" value={String(s.totalMovements24h)} sub={s.totalMovements6h > 0 ? `${s.totalMovements6h} in last 6h` : ''} />
        <StatCard label="ETH Moved (24h)" value={formatEth(s.totalEthMoved24h)} sub={s.totalEthMoved6h > 0 ? `${formatEth(s.totalEthMoved6h)} last 6h` : ''} />
        <StatCard
          label="Net Flow (6h)"
          value={netFlowLabel}
          valueClassName={netFlowColor}
          sub={s.netFlow6h !== 0 ? `${formatEth(Math.abs(s.netFlow6h))} ETH ${s.netFlow6h > 0 ? 'accumulated' : 'distributed'}` : 'Neutral'}
        />
        <StatCard
          label="Wallets Active (24h)"
          value={String(s.mostActiveWallets24h)}
          sub={`of ${s.uniqueWalletsTracked} tracked`}
        />
      </div>

      {/* Recent movements */}
      {recent.length > 0 && (
        <div className="p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            Recent Movements
            {s.highSeverityCount6h > 0 && (
              <span className="text-xs text-red-400 flex items-center gap-1">
                <AlertTriangleIcon className="w-3 h-3" />
                {s.highSeverityCount6h} high severity
              </span>
            )}
          </h3>
          <div className="space-y-2">
            {recent.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-background/50 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    m.direction === 'accumulating' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  )}>
                    {m.direction === 'accumulating' ? '+' : '−'}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary truncate">
                      {m.walletLabel || 'Unlabeled'}
                    </p>
                    <p className="text-xs text-text-muted truncate font-mono">
                      {m.walletAddress}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={cn('font-semibold text-sm', directionColor(m.direction))}>
                    {m.direction === 'accumulating' ? '+' : '−'}{formatEth(m.amountEth)} ETH
                  </span>
                  <span className={cn('text-xs', severityColor(m.severity))}>{m.severity}</span>
                  <span className="text-xs text-text-muted">{timeAgo(m.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No activity yet */}
      {recent.length === 0 && !loading && (
        <div className="p-5 text-center text-text-muted text-sm">
          No whale movements detected in the last 6 hours.
          <br />
          Wallets are checked every 15 minutes.
        </div>
      )}

      {/* Wallet breakdown (premium only) */}
      {isDefinitelyPremium && data.walletBreakdown && data.walletBreakdown.length > 0 && (
        <div className="border-t border-border p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <CrownIcon className="w-4 h-4 text-yellow-400" />
            Wallet Breakdown
          </h3>
          <div className="space-y-2">
            {data.walletBreakdown.slice(0, 8).map((w) => (
              <div key={`${w.chain}:${w.address}`} className="flex items-center justify-between py-2 px-3 rounded-lg bg-background/50 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-text-primary">{w.label}</p>
                  <p className="text-xs text-text-muted font-mono truncate">
                    {w.address.slice(0, 8)}...{w.address.slice(-6)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={cn(
                    'text-xs font-medium',
                    w.netFlow24h > 0 ? 'text-green-400' : w.netFlow24h < 0 ? 'text-red-400' : 'text-text-muted'
                  )}>
                    {w.netFlow24h > 0 ? '+' : ''}{formatEth(w.netFlow24h)} ETH
                  </span>
                  <span className="text-xs text-text-muted">{w.movementCount} tx</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer: last check timestamp */}
      {s.lastCheckTimestamp && (
        <div className="px-5 py-3 border-t border-border bg-background/30 flex items-center justify-between">
          <span className="text-xs text-text-muted flex items-center gap-1">
            <ClockIcon className="w-3 h-3" />
            Last checked: {timeAgo(s.lastCheckTimestamp)}
          </span>
          {!isDefinitelyPremium && hasMovements && (
            <Link href="/pricing" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
              <CrownIcon className="w-3 h-3" /> Premium for wallet addresses
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

// ── StatCard sub-component ─────────────────────────────────────────────────────
function StatCard({ label, value, sub, valueClassName }: {
  label: string
  value: string
  sub?: string
  valueClassName?: string
}) {
  return (
    <div className="p-4 bg-background-card">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className={cn('text-xl font-bold text-text-primary', valueClassName)}>{value}</p>
      {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
    </div>
  )
}
