/**
 * POST /api/signals/refresh-performance
 *
 * Updates price performance for all active signals by fetching
 * current market data from CoinGecko.
 *
 * Runs inside the Next.js process — uses the app's DB connection
 * (Fly-injected secrets). No local credentials needed.
 *
 * Requires X-AUTH-SECRET header to match AUTH_SECRET env var.
 * Called by cron every 15 minutes via curl to localhost.
 */

import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logApiResponse } from '@/lib/api/response-logger'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // up to 60s for API timeout

// ── Tokens to track performance for ──────────────────────────────────────────
const TRACKED_TOKENS = [
  'bitcoin', 'ethereum', 'binancecoin', 'solana', 'arbitrum',
  'avalanche-2', 'chainlink', 'optimism', 'polygon', 'uniswap',
  'aave', 'the-graph', 'render-token', 'injective-protocol',
  'sui', 'aptos', 'near', 'cosmos', 'polkadot', 'cardano',
]

// ── Generate summary ──────────────────────────────────────────────────────────
interface SummaryEntry {
  timestamp: string
  totalSignals: number
  profitableSignals: number
  losingSignals: number
  winRate: number
  avgReturn: number
  maxGain: number
  maxLoss: number
}

// ── POST handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const runId = Date.now()
  console.log(`[perf-update:${runId}] Starting performance update`)

  // Auth check
  const authSecret = req.headers.get('x-auth-secret')
  const expectedSecret = process.env.AUTH_SECRET
  if (!authSecret || !expectedSecret || authSecret !== expectedSecret) {
    logApiResponse('POST', '/api/signals/refresh-performance', 401, { error: 'Unauthorized' })
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // 1. Fetch current market data from CoinGecko
    const ids = TRACKED_TOKENS.join(',')
    const coingeckoURL = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=false`

    const response = await fetch(coingeckoURL, {
      headers: {
        'User-Agent': 'ChainPulse/3.0 (performance-updater)',
        'Accept': 'application/json',
      },
      next: { revalidate: 120 }, // cache 2 min
    })

    if (!response.ok) {
      throw new Error(`CoinGecko HTTP ${response.status}`)
    }

    const marketData: any[] = await response.json()

    // Build price map { SYMBOL: price }
    const priceMap: Record<string, number> = {}
    marketData.forEach((coin: any) => {
      priceMap[coin.symbol.toUpperCase()] = coin.current_price
    })

    console.log(`[perf-update:${runId}] Fetched ${marketData.length} coin prices from CoinGecko`)

    // 2. Get active signals (created in last 48h, not expired)
    const activeCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000)
    const activeSignals = await prisma.signal.findMany({
      where: {
        createdAt: { gt: activeCutoff },
        expiresAt: { gt: new Date() },
        // Include diamond signals in performance tracking
      },
    })

    console.log(`[perf-update:${runId}] Found ${activeSignals.length} active signals`)

    // 3. Update each signal's performance
    let updated = 0
    let skipped = 0

    for (const signal of activeSignals) {
      const currentPrice = priceMap[signal.tokenSymbol.toUpperCase()]
      if (!currentPrice) {
        skipped++
        continue
      }

      const hoursSinceSignal = (Date.now() - new Date(signal.createdAt).getTime()) / (1000 * 60 * 60)
      let priceChangePct = 0
      let performanceStatus = 'NEUTRAL'

      if (signal.entryPrice && signal.entryPrice > 0) {
        priceChangePct = ((currentPrice - signal.entryPrice) / signal.entryPrice) * 100

        if (priceChangePct >= 10) performanceStatus = 'STRONG_GAIN'
        else if (priceChangePct >= 3) performanceStatus = 'GAIN'
        else if (priceChangePct <= -10) performanceStatus = 'STRONG_LOSS'
        else if (priceChangePct <= -3) performanceStatus = 'LOSS'
        else performanceStatus = 'NEUTRAL'
      }

      await prisma.signal.update({
        where: { id: signal.id },
        data: {
          currentPrice: Math.round(currentPrice * 100) / 100,
          priceChangePct: Math.round(priceChangePct * 100) / 100,
          performanceStatus,
          hoursTracked: Math.round(hoursSinceSignal * 10) / 10,
          lastPerformanceUpdate: new Date(),
        },
      })

      updated++
    }

    console.log(`[perf-update:${runId}] ${updated} signals updated, ${skipped} skipped`)

    // 4. Generate and persist performance summary
    const weekCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentSignals = await prisma.signal.findMany({
      where: {
        createdAt: { gt: weekCutoff },
        priceChangePct: { not: null },
      },
    })

    let summary: SummaryEntry | null = null
    if (recentSignals.length > 0) {
      const totalSignals = recentSignals.length
      const profitableSignals = recentSignals.filter(s => (s.priceChangePct ?? 0) > 0).length
      const losingSignals = recentSignals.filter(s => (s.priceChangePct ?? 0) < 0).length
      const avgReturn = recentSignals.reduce((sum, s) => sum + (s.priceChangePct ?? 0), 0) / totalSignals
      const maxGain = Math.max(...recentSignals.map(s => s.priceChangePct ?? 0))
      const maxLoss = Math.min(...recentSignals.map(s => s.priceChangePct ?? 0))
      const winRate = (profitableSignals / totalSignals) * 100

      summary = {
        timestamp: new Date().toISOString(),
        totalSignals,
        profitableSignals,
        losingSignals,
        winRate: Math.round(winRate * 100) / 100,
        avgReturn: Math.round(avgReturn * 100) / 100,
        maxGain: Math.round(maxGain * 100) / 100,
        maxLoss: Math.round(maxLoss * 100) / 100,
      }

      console.log(`[perf-update:${runId}] Summary: ${totalSignals} signals, ${winRate.toFixed(1)}% win rate, avg ${avgReturn.toFixed(2)}% return`)
    }

    logApiResponse('POST', '/api/signals/refresh-performance', 200, {
      extras: { updated, skipped, summaryGenerated: !!summary, runId },
    })

    return NextResponse.json({
      success: true,
      data: {
        updated,
        skipped,
        summary,
        runId,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Performance update failed'
    console.error(`[perf-update:${runId}] Error:`, msg)
    logApiResponse('POST', '/api/signals/refresh-performance', 500, { error: msg })

    return NextResponse.json(
      { success: false, error: msg, runId },
      { status: 500 }
    )
  }
}
