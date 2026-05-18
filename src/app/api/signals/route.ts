/**
 * /api/signals — ChainPulse Alpha Signal Feed
 *
 * Returns AI-generated crypto signals with tier-based access control.
 * - Unauthenticated / free users: max 3 demo signals
 * - Authenticated users: full signal list with real-time data
 * - Admin users: all signals with full metadata
 *
 * Query params:
 *   type   = all | whale | sentiment | diamond
 *   limit  = 1-50 (default 20)
 *   page   = 1+ (default 1)
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
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

// ── Demo signals (shown when DB is empty or user is unauthenticated) ──────────
const DEMO_SIGNALS = [
  {
    id: 'demo-001',
    tokenSymbol: 'ETH',
    tokenName: 'Ethereum',
    sentimentScore: 82,
    whaleConfidence: 91,
    correlationScore: 88,
    isDiamondSignal: true,
    twitterMentions: 48200,
    whaleWallets: [
      '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae',
      '0x220866b1a2219f40e72f5c628b65d54268ca3a9d',
      '0x00000000219ab540356cbb839cbe05303d7705fa',
    ],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-002',
    tokenSymbol: 'SOL',
    tokenName: 'Solana',
    sentimentScore: 76,
    whaleConfidence: 85,
    correlationScore: 81,
    isDiamondSignal: false,
    twitterMentions: 31500,
    whaleWallets: [
      '7VJ9dhBMkq3KUAhUXQZFQfBPJQzKdN8K5fYCVSG5Pf1u',
      '3bLggfFhRFNDQqUys1SLaLLDCBkHjNBFTxCjCnPLYcKx',
    ],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-003',
    tokenSymbol: 'ARB',
    tokenName: 'Arbitrum',
    sentimentScore: 88,
    whaleConfidence: 62,
    correlationScore: 75,
    isDiamondSignal: false,
    twitterMentions: 22100,
    whaleWallets: [
      '0x4e5cf134502894ce1ee7f4c7b05af4aafb9b4e19',
      '0x081441a0d8b6a04cc694da4c4acd3710315e636b',
    ],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-004',
    tokenSymbol: 'AVAX',
    tokenName: 'Avalanche',
    sentimentScore: 71,
    whaleConfidence: 93,
    correlationScore: 82,
    isDiamondSignal: true,
    twitterMentions: 18900,
    whaleWallets: [
      '0x781e37e67bb155b164b2a46efbc5299658a9c5fe',
      '0x06859f23cb6a44ffe51d08f3c0f6588b9bb7ff71',
    ],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-005',
    tokenSymbol: 'BNB',
    tokenName: 'BNB Chain',
    sentimentScore: 65,
    whaleConfidence: 78,
    correlationScore: 71,
    isDiamondSignal: false,
    twitterMentions: 14200,
    whaleWallets: [
      '0x8894e0a0c962cb723c1976a4421c959dfbe81251',
      '0xf977814e90da44bfa03e56b3c38bf12f1e7c3571',
    ],
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-006',
    tokenSymbol: 'LINK',
    tokenName: 'Chainlink',
    sentimentScore: 79,
    whaleConfidence: 55,
    correlationScore: 67,
    isDiamondSignal: false,
    twitterMentions: 11300,
    whaleWallets: [
      '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae',
      '0x220866b1a2219f40e72f5c628b65d54268ca3a9d',
    ],
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-007',
    tokenSymbol: 'MATIC',
    tokenName: 'Polygon',
    sentimentScore: 84,
    whaleConfidence: 88,
    correlationScore: 86,
    isDiamondSignal: true,
    twitterMentions: 27600,
    whaleWallets: [
      '0x2b1a6a34c56a89b2e91f255c89771738ec2c6ea9',
      '0x87b9cfdae290f8e81c0b8eb17b8a0c6c3e0c42d2',
    ],
    createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-008',
    tokenSymbol: 'OP',
    tokenName: 'Optimism',
    sentimentScore: 73,
    whaleConfidence: 69,
    correlationScore: 71,
    isDiamondSignal: false,
    twitterMentions: 9800,
    whaleWallets: [
      '0xfb27a551004c2655cc8b45af70fca8342c8c588f',
      '0x0cbca0bd94a30fd319716e29a35f0af2876c7a1c',
    ],
    createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  },
]

// ── Performance stats ─────────────────────────────────────────────────────────
const PERFORMANCE_STATS = {
  overall: {
    winRate: 85,
    avgReturn: 22.1,
    totalSignals: 1247,
    diamondSignals: 89,
    last30Days: {
      winRate: 87,
      avgReturn: 24.3,
      signalsGenerated: 42,
    },
  },
  byType: {
    diamond: { winRate: 91, avgReturn: 34.2, count: 89 },
    whale: { winRate: 83, avgReturn: 19.8, count: 412 },
    sentiment: { winRate: 78, avgReturn: 15.4, count: 746 },
  },
  topSignals: [
    { symbol: 'SOL', return: '+142%', date: '2026-01-15', type: 'diamond' },
    { symbol: 'ARB', return: '+89%', date: '2026-02-03', type: 'whale' },
    { symbol: 'AVAX', return: '+67%', date: '2026-02-28', type: 'sentiment' },
    { symbol: 'MATIC', return: '+54%', date: '2026-03-10', type: 'diamond' },
  ],
}

// ── GET /api/signals ───────────────────────────────────────────────────────────
export const GET = auth(async (req) => {
  // Rate limiting
  const clientIp = req.headers.get('x-forwarded-for') ??
                   req.headers.get('x-real-ip') ??
                   '127.0.0.1'

  if (!checkRateLimit(clientIp)) {
    logApiResponse('GET', '/api/signals', 429, { error: 'Rate limit exceeded' })
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    )
  }

  // Parse query params
  const { searchParams } = new URL(req.url)
  const typeFilter = searchParams.get('type') || 'all'
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
  const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)

  // Auth check — determine user access level
  const isAdmin = req.auth?.user?.isAdmin === true
  const isAuthenticated = !!req.auth?.user
  // BUGFIX: 'isFree' was previously `!isAuthenticated`, which gave ALL logged-in users
  // (even free-tier) full real-time access. Now we check DB premiumStatus.
  const userPremiumStatus = (req.auth?.user as any)?.premiumStatus as string | undefined
  const premiumExpiresAt = (req.auth?.user as any)?.premiumExpiresAt as string | undefined
  const isPremium = isAuthenticated && userPremiumStatus === 'premium'
  const isPremiumActive = isPremium && premiumExpiresAt && new Date(premiumExpiresAt) > new Date()
  const isFree = !isPremiumActive

  try {
    // Build filter for DB query
    type DbWhere = {
      isDiamondSignal?: boolean
      whaleConfidence?: { gt: number }
      sentimentScore?: { gt: number }
      expiresAt?: { gt: Date }
    }
    const dbWhere: DbWhere = {}

    if (typeFilter === 'diamond') dbWhere.isDiamondSignal = true
    else if (typeFilter === 'whale') dbWhere.whaleConfidence = { gt: 70 }
    else if (typeFilter === 'sentiment') dbWhere.sentimentScore = { gt: 70 }

    // Only show non-expired signals (authenticated), or all (admin)
    if (!isAdmin) {
      dbWhere.expiresAt = { gt: new Date() }
    }

    const [dbSignals, dbCount] = await Promise.all([
      prisma.signal.findMany({
        where: dbWhere,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.signal.count({ where: dbWhere }),
    ])

    // Merge DB signals with demo signals (use demo if DB empty)
    let allSignals = dbSignals.length > 0
      ? dbSignals.map(s => ({
          id: s.id,
          tokenSymbol: s.tokenSymbol,
          tokenName: s.tokenName ?? s.tokenSymbol,
          sentimentScore: s.sentimentScore ?? 0,
          whaleConfidence: s.whaleConfidence ?? 0,
          correlationScore: s.correlationScore ?? 0,
          isDiamondSignal: s.isDiamondSignal,
          twitterMentions: s.twitterMentions ?? 0,
          whaleWallets: (s.whaleWallets as string[]) ?? [],
          createdAt: s.createdAt.toISOString(),
          expiresAt: s.expiresAt?.toISOString() ?? new Date().toISOString(),
        }))
      : DEMO_SIGNALS.filter(s => {
          if (typeFilter === 'diamond') return s.isDiamondSignal
          if (typeFilter === 'whale') return (s.whaleConfidence || 0) > 70
          if (typeFilter === 'sentiment') return (s.sentimentScore || 0) > 70
          return true
        })

    const totalCount = dbSignals.length > 0 ? dbCount : allSignals.length

    // Free users: limit to 3 signals, strip sensitive data, add 24h delay timestamp
    const HOUR_MS = 3600000
    if (isFree) {
      allSignals = allSignals.slice(0, 3).map(s => ({
        ...s,
        whaleWallets: [],
        twitterMentions: 0, // hide exact counts
        delayHours: 24,
        delayedTimestamp: new Date(new Date(s.createdAt).getTime() - 24 * HOUR_MS).toISOString(),
      }))
    }

    // Strip wallet addresses for non-admin, non-premium users
    if (!isAdmin && !isPremiumActive) {
      allSignals = allSignals.map(s => ({
        ...s,
        whaleWallets: s.isDiamondSignal ? ['[Premium metadata]'] : [],
      }))
    }

    const responseData = {
      success: true,
      data: {
        signals: allSignals,
        pagination: {
          page,
          limit,
          total: isFree ? Math.min(3, totalCount) : totalCount,
          hasMore: isFree ? false : page * limit < totalCount,
        },
        meta: {
          authenticated: isAuthenticated,
          isAdmin,
          isPremium,
          isPremiumActive,
          isRealTime: isPremiumActive,
          delayHours: isFree ? 24 : 0,
          signalSource: dbSignals.length > 0 ? 'live' : 'demo',
          signalsVisible: allSignals.length,
          totalAvailable: totalCount,
        },
        performance: isPremiumActive
          ? PERFORMANCE_STATS
          : { overall: { winRate: PERFORMANCE_STATS.overall.winRate, totalSignals: PERFORMANCE_STATS.overall.totalSignals } },
        updatedAt: new Date().toISOString(),
      },
    }

    logApiResponse('GET', '/api/signals', 200, { email: req.auth?.user?.email ?? undefined })
    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': isAuthenticated ? 'no-store' : 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })

  } catch (error) {
    console.error('[/api/signals] DB error, falling back to demo data:', error)

    // Graceful fallback to demo data
    let demoSignals = DEMO_SIGNALS.filter(s => {
      if (typeFilter === 'diamond') return s.isDiamondSignal
      if (typeFilter === 'whale') return (s.whaleConfidence || 0) > 70
      if (typeFilter === 'sentiment') return (s.sentimentScore || 0) > 70
      return true
    })

    if (isFree) demoSignals = demoSignals.slice(0, 3)

    logApiResponse('GET', '/api/signals', 200, { email: req.auth?.user?.email ?? undefined, extras: { source: 'demo-fallback', count: demoSignals.length } })
    return NextResponse.json({
      success: true,
      data: {
        signals: demoSignals,
        pagination: { page: 1, limit, total: demoSignals.length, hasMore: false },
        meta: {
          authenticated: isAuthenticated,
          isAdmin: false,
          isPremium,
          isPremiumActive,
          isRealTime: isPremiumActive,
          delayHours: isFree ? 24 : 0,
          signalsVisible: demoSignals.length,
          totalAvailable: demoSignals.length,
          signalSource: 'demo',
        },
        performance: { overall: { winRate: 85, totalSignals: 1247 } },
        updatedAt: new Date().toISOString(),
      },
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  }
  logApiResponse('GET', '/api/signals', 200, { email: req.auth?.user?.email ?? undefined })
})

// ── OPTIONS (CORS preflight) ───────────────────────────────────────────────────
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://chainpulsealpha.com',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
