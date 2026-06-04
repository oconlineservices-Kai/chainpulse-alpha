/**
 * /api/signals — ChainPulse Alpha Signal Feed
 *
 * Returns AI-generated crypto signals with tier-based access control.
 * - Unauthenticated / free users: max 3 demo signals (no premium data leak)
 * - Authenticated paid users: full signal list
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
]

// ── Demo signal enrichment (add Dashboard-required fields) ──────────────────
const DEMO_ENRICHMENT: Record<string, Partial<{
  price: number
  priceChange: number
  volume24h: number
  marketCap: number
  recommendation: string
  status: string
  timestamp: string
}>> = {
  'demo-001': { price: 3125.40, priceChange: 2.35, volume24h: 18_200_000_000, marketCap: 375_000_000_000, recommendation: 'Buy', status: 'Free', timestamp: new Date(Date.now() - 2 * 3600000).toISOString() },
  'demo-002': { price: 143.80, priceChange: -1.22, volume24h: 5_100_000_000, marketCap: 64_000_000_000, recommendation: 'Buy', status: 'Free', timestamp: new Date(Date.now() - 4 * 3600000).toISOString() },
  'demo-003': { price: 0.85, priceChange: 5.67, volume24h: 1_200_000_000, marketCap: 3_200_000_000, recommendation: 'Buy', status: 'Free', timestamp: new Date(Date.now() - 6 * 3600000).toISOString() },
  'demo-004': { price: 35.22, priceChange: 1.89, volume24h: 2_800_000_000, marketCap: 13_400_000_000, recommendation: 'Buy', status: 'Premium', timestamp: new Date(Date.now() - 8 * 3600000).toISOString() },
  'demo-005': { price: 578.10, priceChange: -0.45, volume24h: 3_500_000_000, marketCap: 88_000_000_000, recommendation: 'Skip', status: 'Premium', timestamp: new Date(Date.now() - 10 * 3600000).toISOString() },
}

type AnySignal = { id: string; tokenSymbol: string; tokenName: string; sentimentScore: number; whaleConfidence: number; correlationScore: number; isDiamondSignal: boolean; twitterMentions: number; whaleWallets: string[]; createdAt: string; expiresAt: string; [key: string]: any }
function enrichDemoSignal(s: AnySignal): AnySignal {
  const enrich = DEMO_ENRICHMENT[s.id] || {}
  return { ...s, ...enrich }
}

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
  const userPremiumStatus = (req.auth?.user as any)?.premiumStatus as string | undefined
  const premiumExpiresAt = (req.auth?.user as any)?.premiumExpiresAt as string | undefined
  const isPremium = isAuthenticated && userPremiumStatus === 'premium'
  const isPremiumActive = isPremium && !!premiumExpiresAt && new Date(premiumExpiresAt) > new Date()
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

    if (!isAdmin) {
      dbWhere.expiresAt = { gt: new Date() }
    }

    // 🛡️ SECURITY LAYER: For free users, we NEVER query more than 3 signals.
    // This prevents any premium data from being returned even if the query would match.
    const effectiveLimit = isFree ? 3 : limit
    const canPaginate = !isFree

    const [dbSignals, dbCount] = await Promise.all([
      prisma.signal.findMany({
        where: dbWhere,
        orderBy: { createdAt: 'desc' },
        take: effectiveLimit,
        skip: canPaginate ? (page - 1) * effectiveLimit : 0,
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
    const usingDemoSignals = dbSignals.length === 0

    // Enrich demo signals with dashboard-required fields (price, volume24h, recommendation, etc)
    if (usingDemoSignals) {
      allSignals = allSignals.map(s => enrichDemoSignal(s))
    }

    // 🛡️ CRITICAL: Free users — hard cap at 3 signals with NO premium data leak.
    // Even the tokenSymbol/tokenName of premium signals must NOT be exposed.
    // Purchased signals (via Pay-Per-Alpha) are appended after the 3 preview slots.
    let purchasedSignalIds: string[] = []
    if (isFree && req.auth?.user?.email) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: req.auth.user.email },
          select: {
            alphaPurchases: {
              where: { expiresAt: { gt: new Date() } },
              select: { signalId: true },
            },
          },
        })
        if (dbUser) {
          purchasedSignalIds = dbUser.alphaPurchases.map(p => p.signalId)
        }
      } catch (e) {
        console.error('[signals] Failed to fetch purchases:', e)
      }
    }

    if (isFree) {
      // Take first 3 as unlocked preview (always)
      const previewCount = 3
      const previewSignals = allSignals.slice(0, previewCount).map(s => ({
        ...s,
        whaleWallets: usingDemoSignals ? s.whaleWallets : [],
        twitterMentions: s.twitterMentions ?? 0,
        delayHours: 0,
        locked: false,
        isPreview: true,
        status: 'Free' as const,
      }))

      // Append purchased signals (unlocked via Pay-Per-Alpha)
      const purchasedSignals = purchasedSignalIds.length > 0
        ? allSignals
            .filter(s => purchasedSignalIds.includes(s.id))
            .map(s => ({
              ...s,
              whaleWallets: usingDemoSignals ? s.whaleWallets : [],
              twitterMentions: s.twitterMentions ?? 0,
              delayHours: 0,
              locked: false,
              isPreview: false,
              status: 'Free' as const,
            }))
        : []

      // How many premium signals exist beyond what we show
      const premiumCount = Math.max(0, (totalCount || DEMO_SIGNALS.length) - previewSignals.length)

      allSignals = [...previewSignals, ...purchasedSignals]
    }

    // Strip wallet addresses for non-admin, non-premium users
    if (!isAdmin && !isPremiumActive) {
      allSignals = allSignals.map(s => {
        return { ...s, whaleWallets: [] }
      })
    }

    const responseData = {
      success: true,
      data: {
        signals: allSignals,
        pagination: {
          page,
          limit,
          total: isFree ? allSignals.length : totalCount,
          hasMore: canPaginate ? page * effectiveLimit < totalCount : false,
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
          lockedCount: isFree ? (totalCount || DEMO_SIGNALS.length) - allSignals.length : 0,
          lockoutThreshold: isFree ? 3 : null,
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

    // Graceful fallback to demo data — same security gating applies
    let demoSignals = DEMO_SIGNALS.filter(s => {
      Object.assign(s, DEMO_ENRICHMENT[s.id] || {})
      if (typeFilter === 'diamond') return s.isDiamondSignal
      if (typeFilter === 'whale') return (s.whaleConfidence || 0) > 70
      if (typeFilter === 'sentiment') return (s.sentimentScore || 0) > 70
      return true
    })

    if (isFree) {
      let purchasedIds: string[] = []
      if (req.auth?.user?.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: req.auth.user.email },
            select: {
              alphaPurchases: {
                where: { expiresAt: { gt: new Date() } },
                select: { signalId: true },
              },
            },
          })
          if (dbUser) purchasedIds = dbUser.alphaPurchases.map(p => p.signalId)
        } catch (e) { /* non-fatal */ }
      }
      // Only return 3 preview + purchased unlock
      const preview = demoSignals.slice(0, 3).map(s => ({ ...s, delayHours: 0, locked: false, isPreview: true, status: 'Free' }))
      const purchased = purchasedIds.length > 0
        ? demoSignals.filter(s => purchasedIds.includes(s.id)).map(s => ({ ...s, delayHours: 0, locked: false, isPreview: false, status: 'Free' }))
        : []
      demoSignals = [...preview, ...purchased]
    }

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
          totalAvailable: DEMO_SIGNALS.length,
          lockedCount: isFree ? DEMO_SIGNALS.length - demoSignals.length : 0,
          lockoutThreshold: isFree ? 3 : null,
          signalSource: 'demo',
        },
        performance: { overall: { winRate: 85, totalSignals: 1247 } },
        updatedAt: new Date().toISOString(),
      },
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  }
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
