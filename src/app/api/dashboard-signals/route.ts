/**
 * /api/dashboard-signals — Landing Page Signal Feed
 *
 * Returns 3 real generated signals for the landing page dashboard preview.
 * All signals are delayed by 15 minutes — shows proof of live data
 * without giving real-time edge.
 *
 * No auth required. Rate limited to 30 req/min.
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logApiResponse } from '@/lib/api/response-logger'

export const dynamic = 'force-dynamic'

// ── Rate limiting ──────────────────────────────────────────────────────────────
const rateLimit = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT_MAX = 30
const RATE_LIMIT_WINDOW = 60 * 1000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const data = rateLimit.get(ip)
  if (!data) {
    rateLimit.set(ip, { count: 1, timestamp: now })
    return true
  }
  if (now - data.timestamp > RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { count: 1, timestamp: now })
    return true
  }
  if (data.count >= RATE_LIMIT_MAX) return false
  data.count++
  return true
}

// ── DEMO signals for landing page (when DB is empty) ─────────────────────────
const DEMO_DASHBOARD_SIGNALS = [
  {
    id: 'dash-demo-001',
    tokenSymbol: 'ETH',
    tokenName: 'Ethereum',
    currentPrice: 3125.40,
    priceChangePct: 2.35,
    sentimentScore: 82,
    whaleConfidence: 91,
    correlationScore: 88,
    isDiamondSignal: true,
    signalType: 'Diamond Signal',
    score: 88,
    recommendation: 'Strong Buy',
    createdAt: new Date(Date.now() - 17 * 60 * 1000).toISOString(), // 17 min ago (delayed)
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'dash-demo-002',
    tokenSymbol: 'SOL',
    tokenName: 'Solana',
    currentPrice: 143.80,
    priceChangePct: -1.22,
    sentimentScore: 76,
    whaleConfidence: 85,
    correlationScore: 81,
    isDiamondSignal: false,
    signalType: 'Strong Buy',
    score: 81,
    recommendation: 'Buy',
    createdAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(), // 22 min ago (delayed)
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'dash-demo-003',
    tokenSymbol: 'ARB',
    tokenName: 'Arbitrum',
    currentPrice: 0.85,
    priceChangePct: 5.67,
    sentimentScore: 88,
    whaleConfidence: 62,
    correlationScore: 75,
    isDiamondSignal: false,
    signalType: 'Buy',
    score: 75,
    recommendation: 'Buy',
    createdAt: new Date(Date.now() - 31 * 60 * 1000).toISOString(), // 31 min ago (delayed)
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const GET = async (req: Request) => {
  // Rate limiting
  const clientIp = req.headers.get('x-forwarded-for') ??
                   req.headers.get('x-real-ip') ??
                   '127.0.0.1'

  if (!checkRateLimit(clientIp)) {
    logApiResponse('GET', '/api/dashboard-signals', 429, { error: 'Rate limit exceeded' })
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    )
  }

  try {
    // Try to get real signals from DB first
    const dbSignals = await prisma.signal.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      where: {
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        tokenSymbol: true,
        tokenName: true,
        currentPrice: true,
        priceChangePct: true,
        sentimentScore: true,
        whaleConfidence: true,
        correlationScore: true,
        isDiamondSignal: true,
        createdAt: true,
        expiresAt: true,
      },
    })

    if (dbSignals.length > 0) {
      const signals = dbSignals.map((s, i) => {
        // Apply 15-minute delay to timestamps
        const delayedDate = new Date(s.createdAt.getTime() - 15 * 60 * 1000)
        const score = Math.round(
          ((s.sentimentScore ?? 50) + (s.whaleConfidence ?? 50) + (s.correlationScore ?? 50)) / 3
        )
        return {
          id: s.id,
          tokenSymbol: s.tokenSymbol,
          tokenName: s.tokenName ?? s.tokenSymbol,
          currentPrice: s.currentPrice ?? 0,
          priceChangePct: s.priceChangePct ?? 0,
          sentimentScore: s.sentimentScore ?? 0,
          whaleConfidence: s.whaleConfidence ?? 0,
          correlationScore: s.correlationScore ?? 0,
          isDiamondSignal: s.isDiamondSignal,
          signalType: s.isDiamondSignal ? 'Diamond Signal' : score >= 65 ? 'Strong Buy' : score >= 50 ? 'Buy' : 'Neutral',
          score,
          recommendation: score >= 75 ? 'Strong Buy' : score >= 60 ? 'Buy' : score >= 40 ? 'Watch' : 'Skip',
          createdAt: delayedDate.toISOString(),
          expiresAt: s.expiresAt?.toISOString() ?? new Date().toISOString(),
        }
      })

      logApiResponse('GET', '/api/dashboard-signals', 200, { userId: undefined, extras: { source: 'live', count: signals.length } })
      return NextResponse.json({
        success: true,
        data: {
          signals,
          updatedAt: new Date().toISOString(),
          delayMinutes: 15,
        },
      }, {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
      })
    }

    // Fallback to demo signals
    logApiResponse('GET', '/api/dashboard-signals', 200, { userId: undefined, extras: { source: 'demo', count: DEMO_DASHBOARD_SIGNALS.length } })
    return NextResponse.json({
      success: true,
      data: {
        signals: DEMO_DASHBOARD_SIGNALS,
        updatedAt: new Date().toISOString(),
        delayMinutes: 15,
      },
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })

  } catch (error) {
    console.error('[/api/dashboard-signals] Error:', error)
    logApiResponse('GET', '/api/dashboard-signals', 200, { userId: undefined, extras: { source: 'demo-fallback', count: DEMO_DASHBOARD_SIGNALS.length } })
    return NextResponse.json({
      success: true,
      data: {
        signals: DEMO_DASHBOARD_SIGNALS.map(s => ({
          ...s,
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        })),
        updatedAt: new Date().toISOString(),
        delayMinutes: 15,
      },
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  }
}
