'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Signal, Shield, CheckCircle, XCircle, Trash2, ChevronLeft, ChevronRight, Diamond, TrendingUp, TrendingDown, Clock, Search } from 'lucide-react'
import AdminNav from '@/components/admin/AdminNav'

interface SignalItem {
  id: string
  tokenSymbol: string
  tokenName: string | null
  sentimentScore: number | null
  whaleConfidence: number | null
  correlationScore: number | null
  isDiamondSignal: boolean
  priceChangePct: number | null
  performanceStatus: string | null
  createdAt: string
  expiresAt: string | null
}

interface SignalsResponse {
  signals: SignalItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export default function AdminSignalsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [signals, setSignals] = useState<SignalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Auth guard
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

  const fetchSignals = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/signals?page=${page}&pageSize=20`)
      if (res.ok) {
        const data: SignalsResponse = await res.json()
        setSignals(data.signals)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      } else {
        setError('Failed to load signals')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    if (status === 'authenticated') fetchSignals()
  }, [status, fetchSignals])

  const performAction = async (signalId: string, action: string) => {
    setActionLoading(`${signalId}-${action}`)
    try {
      const res = await fetch('/api/admin/signals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signalId, action }),
      })
      if (res.ok) {
        await fetchSignals()
      } else {
        const data = await res.json()
        setError(data.error || 'Action failed')
      }
    } catch {
      setError('Network error')
    } finally {
      setActionLoading(null)
    }
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-text-muted'
    if (score >= 85) return 'text-success-400'
    if (score >= 70) return 'text-primary-400'
    if (score >= 50) return 'text-warning-400'
    return 'text-danger-400'
  }

  return (
    <div className="min-h-screen bg-background pt-16 lg:pt-20">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Signal Review</h1>
            <p className="text-sm text-text-muted">Moderate signals — approve, reject, or delete</p>
          </div>
          <div className="text-sm text-text-muted">
            {loading ? 'Loading...' : `${total} signal${total !== 1 ? 's' : ''}`}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger-900/30 border border-danger-500 rounded-xl">
            <p className="text-sm text-danger-300">{error}</p>
          </div>
        )}

        {/* Signals Table */}
        <div className="bg-background-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-muted border-b border-border bg-background/50">
                  <th className="px-5 py-3 font-medium">Token</th>
                  <th className="px-5 py-3 font-medium">Sentiment</th>
                  <th className="px-5 py-3 font-medium">Whale</th>
                  <th className="px-5 py-3 font-medium">Correlation</th>
                  <th className="px-5 py-3 font-medium">Price Change</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-text-muted">
                      Loading signals...
                    </td>
                  </tr>
                ) : signals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-text-muted">
                      No signals found. Generate demo data or wait for signal generation.
                    </td>
                  </tr>
                ) : (
                  signals.map((signal) => (
                    <tr key={signal.id} className="border-b border-border last:border-0 hover:bg-background/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                            signal.priceChangePct && signal.priceChangePct > 0
                              ? 'bg-success-500/10 text-success-400'
                              : 'bg-danger-500/10 text-danger-400'
                          }`}>
                            {signal.tokenSymbol?.substring(0, 3)}
                          </div>
                          <div>
                            <span className="font-medium">{signal.tokenSymbol}</span>
                            {signal.isDiamondSignal && (
                              <Diamond className="w-3 h-3 text-primary-400 inline ml-1" />
                            )}
                            {signal.tokenName && (
                              <p className="text-xs text-text-muted">{signal.tokenName}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`font-semibold ${getScoreColor(signal.sentimentScore)}`}>
                          {signal.sentimentScore ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`font-semibold ${getScoreColor(signal.whaleConfidence)}`}>
                          {signal.whaleConfidence ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`font-semibold ${getScoreColor(signal.correlationScore)}`}>
                          {signal.correlationScore ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {signal.priceChangePct != null ? (
                          <span className={`flex items-center gap-1 font-medium ${
                            signal.priceChangePct > 0 ? 'text-success-400' : 'text-danger-400'
                          }`}>
                            {signal.priceChangePct > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {signal.priceChangePct > 0 ? '+' : ''}{signal.priceChangePct.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          signal.performanceStatus === 'profitable'
                            ? 'bg-success-900/40 text-success-300'
                            : signal.performanceStatus === 'losing'
                            ? 'bg-danger-900/40 text-danger-300'
                            : 'bg-background text-text-muted'
                        }`}>
                          {signal.performanceStatus ?? 'pending'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-text-muted text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 shrink-0" />
                          {new Date(signal.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => performAction(signal.id, 'toggleDiamond')}
                            disabled={actionLoading === `${signal.id}-toggleDiamond`}
                            className={`p-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50 ${
                              signal.isDiamondSignal
                                ? 'bg-primary-500/10 text-primary-400 hover:bg-primary-500/20'
                                : 'bg-background text-text-muted hover:text-primary-400 hover:bg-primary-500/10'
                            }`}
                            title={signal.isDiamondSignal ? 'Remove diamond status' : 'Mark as diamond signal'}
                          >
                            <Diamond className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => performAction(signal.id, 'delete')}
                            disabled={actionLoading === `${signal.id}-delete`}
                            className="p-1.5 rounded bg-danger-500/10 text-danger-400 hover:bg-danger-500/20 transition-colors disabled:opacity-50"
                            title="Delete signal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-text-muted">
              Page {page} of {totalPages} ({total} total)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg bg-background-card border border-border text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg bg-background-card border border-border text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
