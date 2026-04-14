'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import AlphaFeed from '@/components/dashboard/AlphaFeed'
import SignalDetail from '@/components/dashboard/SignalDetail'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { fetchTopCoins, mockSignals, Signal } from '@/lib/api/crypto'
import Link from 'next/link'

export default function DashboardPage() {
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null)
  const [signals, setSignals] = useState<Signal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real crypto data from CoinGecko
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchTopCoins(20)
        setSignals(data)
      } catch (err) {
        console.error('Failed to fetch crypto data:', err)
        setError('Live market data temporarily unavailable. Showing fallback signals.')
        // Fallback to mock data if API fails
        setSignals(mockSignals)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  if (isLoading) {
    return (
      // pt-20 on mobile, pt-24 on lg — clears the fixed global nav (h-16 / h-20)
      <div className="min-h-screen bg-background pt-20 lg:pt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  return (
    // pt-20 / pt-24 clears the fixed global nav bar so content doesn't hide behind it
    <div className="min-h-screen bg-background pt-20 lg:pt-24">
      {/* Dashboard sub-header — sits below the global fixed nav */}
      <header className="border-b border-border bg-background-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-text-secondary">Live Alpha Feed</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Admin
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-danger-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <ErrorBoundary>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
          
          {/* Main Alpha Feed */}
          <AlphaFeed signals={signals} onSelectSignal={setSelectedSignal} />
          
          {/* Signal Detail Modal */}
          <AnimatePresence>
            {selectedSignal && (
              <SignalDetail 
                signal={selectedSignal} 
                onClose={() => setSelectedSignal(null)} 
              />
            )}
          </AnimatePresence>
        </div>
      </ErrorBoundary>
    </div>
  )
}
