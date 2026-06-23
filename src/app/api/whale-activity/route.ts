/**
 * /api/whale-activity — Live on-chain whale tracking stats
 *
 * Returns aggregated whale activity from the whale_activities DB table
 * (populated by engine/whale-tracker.js every 15 minutes).
 *
 * Free tier: summary stats only (movement count, total ETH, severity breakdown)
 * Premium: full wallet-level breakdown with addresses, labels, movement history
 * Admin: all data
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export interface WhaleActivityResponse {
  success: boolean
  data: {
    summary: {
      totalMovements24h: number
      totalMovements6h: number
      totalMovements1h: number
      totalEthMoved24h: number
      totalEthMoved6h: number
      totalEthMoved1h: number
      netFlow6h: number          // positive = accumulation, negative = distribution
      mostActiveWallets24h: number
      highSeverityCount6h: number
      uniqueWalletsTracked: number
      chainsTracked: number
      lastCheckTimestamp: string | null
    }
    recentMovements: Array<{
      id: number
      walletLabel: string
      walletAddress: string
      direction: string
      amountEth: number
      tokenSymbol: string
      chain: string
      severity: string
      flowType: string | null
      createdAt: string
    }>
    walletBreakdown?: Array<{
      label: string
      address: string
      chain: string
      netFlow24h: number
      movementCount: number
      lastActivity: string | null
      currentBalance: number | null
    }>
  }
}

export const GET = auth(async (req) => {
  const sessionUser = req.auth?.user ?? null
  const isAdmin = sessionUser?.isAdmin === true
  const isAuthenticated = !!sessionUser
  const isPremium = isAuthenticated && (sessionUser as any)?.premiumStatus === 'premium'
  const premiumExpiresAt = (sessionUser as any)?.premiumExpiresAt as string | undefined
  const isPremiumActive = isPremium && !!premiumExpiresAt && new Date(premiumExpiresAt) > new Date()
  const showFullData = isPremiumActive || isAdmin

  try {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // ── Summary queries ──────────────────────────────────────────────
    const [
      total24h,
      total6h,
      total1h,
      eth24h,
      eth6h,
      eth1h,
      flow6h,
      highSev6h,
      uniqueWallets,
      lastCheck,
    ] = await Promise.all([
      prisma.whaleActivity.count({ where: { createdAt: { gt: twentyFourHoursAgo } } }),
      prisma.whaleActivity.count({ where: { createdAt: { gt: sixHoursAgo } } }),
      prisma.whaleActivity.count({ where: { createdAt: { gt: oneHourAgo } } }),

      prisma.whaleActivity.aggregate({
        where: { createdAt: { gt: twentyFourHoursAgo } },
        _sum: { amountEth: true },
      }),
      prisma.whaleActivity.aggregate({
        where: { createdAt: { gt: sixHoursAgo } },
        _sum: { amountEth: true },
      }),
      prisma.whaleActivity.aggregate({
        where: { createdAt: { gt: oneHourAgo } },
        _sum: { amountEth: true },
      }),

      // Net flow (accumulating vs distributing) in last 6h
      prisma.whaleActivity.groupBy({
        by: ['direction'],
        where: { createdAt: { gt: sixHoursAgo } },
        _sum: { amountEth: true },
      }),

      // High severity count
      prisma.whaleActivity.count({
        where: { createdAt: { gt: sixHoursAgo }, severity: 'HIGH' },
      }),

      // Unique wallet labels active
      prisma.whaleActivity.groupBy({
        by: ['walletLabel'],
        where: { createdAt: { gt: twentyFourHoursAgo } },
        _count: true,
      }),

      // Last wallet state check timestamp (raw table, no Prisma model)
      prisma.$queryRaw<{ updated_at: Date }[]>`
        SELECT updated_at FROM whale_wallet_states
        ORDER BY updated_at DESC LIMIT 1
      `.then(r => r[0] || null),
    ])

    // Compute net flow
    const accFlow = flow6h.find(f => f.direction === 'accumulating')
    const distFlow = flow6h.find(f => f.direction === 'distributing')
    const netFlow = (accFlow?._sum?.amountEth ?? 0) - (distFlow?._sum?.amountEth ?? 0)

    // ── Recent movements (last 20) ───────────────────────────────────
    const recentMovements = await prisma.whaleActivity.findMany({
      where: { createdAt: { gt: sixHoursAgo } },
      orderBy: { createdAt: 'desc' },
      take: showFullData ? 20 : 6,
    })

    const mappedMovements = recentMovements.map(m => ({
      id: m.id,
      walletLabel: m.walletLabel,
      walletAddress: showFullData ? m.walletAddress : m.walletAddress.slice(0, 6) + '...' + m.walletAddress.slice(-4),
      direction: m.direction,
      amountEth: Number(m.amountEth),
      tokenSymbol: m.tokenSymbol || 'ETH',
      chain: m.chain,
      severity: m.severity,
      flowType: m.flowType,
      createdAt: m.createdAt.toISOString(),
    }))

    // ── Wallet breakdown (premium only) ──────────────────────────────
    let walletBreakdown = undefined
    if (showFullData) {
      const walletActivity24h = await prisma.whaleActivity.groupBy({
        by: ['walletLabel', 'walletAddress', 'chain'],
        where: { createdAt: { gt: twentyFourHoursAgo } },
        _sum: { amountEth: true },
        _count: true,
        _max: { createdAt: true },
      })

      const walletStates = await prisma.$queryRaw<{ address: string; label: string; chain: string; last_balance: number }[]>`
        SELECT address, label, chain, last_balance FROM whale_wallet_states
      `
      const stateMap = new Map(walletStates.map(s => [`${s.chain}:${s.address}`, s.last_balance]))

      walletBreakdown = walletActivity24h.map(w => ({
        label: w.walletLabel,
        address: w.walletAddress,
        chain: w.chain,
        netFlow24h: Number(w._sum.amountEth ?? 0),
        movementCount: w._count,
        lastActivity: w._max.createdAt?.toISOString() ?? null,
        currentBalance: stateMap.get(`${w.chain}:${w.walletAddress}`) ?? null,
      }))
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalMovements24h: total24h,
          totalMovements6h: total6h,
          totalMovements1h: total1h,
          totalEthMoved24h: Number(eth24h._sum?.amountEth ?? 0),
          totalEthMoved6h: Number(eth6h._sum?.amountEth ?? 0),
          totalEthMoved1h: Number(eth1h._sum?.amountEth ?? 0),
          netFlow6h: Number(netFlow.toFixed(2)),
          mostActiveWallets24h: uniqueWallets.length,
          highSeverityCount6h: highSev6h,
          uniqueWalletsTracked: 31,
          chainsTracked: 7,
          lastCheckTimestamp: lastCheck?.updated_at?.toISOString() ?? null,
        },
        recentMovements: mappedMovements,
        ...(walletBreakdown ? { walletBreakdown } : {}),
      },
    })
  } catch (error) {
    console.error('[/api/whale-activity] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch whale activity data',
        data: {
          summary: {
            totalMovements24h: 0,
            totalMovements6h: 0,
            totalMovements1h: 0,
            totalEthMoved24h: 0,
            totalEthMoved6h: 0,
            totalEthMoved1h: 0,
            netFlow6h: 0,
            mostActiveWallets24h: 0,
            highSeverityCount6h: 0,
            uniqueWalletsTracked: 31,
            chainsTracked: 7,
            lastCheckTimestamp: null,
          },
          recentMovements: [],
        },
      },
      { status: 200 }
    )
  }
})
