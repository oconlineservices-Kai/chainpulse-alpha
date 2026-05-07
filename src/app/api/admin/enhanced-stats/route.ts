import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Simple in-memory cache with 30-second TTL to reduce DB queries (Issue 20)
let cache: { data: any; timestamp: number } | null = null
const CACHE_TTL = 30_000 // 30 seconds

export const GET = auth(async (req) => {
  // Check if user is admin
  if (!req.auth?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Return cached data if fresh
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data)
  }

  try {
    // Fetch all metrics in parallel
    const [
      totalUsers,
      premiumUsers,
      adminUsers,
      totalPayments,
      totalRevenueResult,
      monthlyRevenueResult,
      avgTransactionResult,
      totalSignals,
      signals24h,
      diamondSignals,
      waitlistCount,
      freeUsers,
      monthlyOnboarded,
      payPerAlphaTransactions,
      premiumTransactions,
      payPerAlphaRevenueResult,
      premiumRevenueResult,
      recentUsersResult,
      recentSignals
    ] = await Promise.all([
      // User metrics
      prisma.user.count(),
      prisma.user.count({ where: { premiumStatus: { not: 'free' } } }),
      prisma.user.count({ where: { premiumStatus: 'admin' } }),

      // Financial metrics
      prisma.transaction.count({ where: { status: 'completed' } }),
      prisma.transaction.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: {
          status: 'completed',
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { status: 'completed' },
        _avg: { amount: true }
      }),

      // Signal metrics
      prisma.signal.count(),
      prisma.signal.count({
        where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
      }),
      prisma.signal.count({ where: { isDiamondSignal: true } }),

      // Waitlist
      prisma.waitlist.count(),

      // New metrics
      prisma.user.count({ where: { premiumStatus: 'free' } }),
      prisma.user.count({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
      }),
      // Pay-per-alpha transactions
      prisma.transaction.count({
        where: {
          status: 'completed',
          transactionType: { in: ['pay_per_alpha', 'alpha_purchase'] }
        }
      }),
      // Premium transactions
      prisma.transaction.count({
        where: {
          status: 'completed',
          transactionType: 'premium'
        }
      }),
      // Pay-per-alpha revenue
      prisma.transaction.aggregate({
        where: {
          status: 'completed',
          transactionType: { in: ['pay_per_alpha', 'alpha_purchase'] }
        },
        _sum: { amount: true }
      }),
      // Premium revenue
      prisma.transaction.aggregate({
        where: {
          status: 'completed',
          transactionType: 'premium'
        },
        _sum: { amount: true }
      }),

      // Recent users (last 5)
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          email: true,
          premiumStatus: true,
          createdAt: true,
        }
      }),

      // Recent signals with performance
      prisma.signal.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          priceChangePct: { not: null }
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          tokenSymbol: true,
          sentimentScore: true,
          whaleConfidence: true,
          priceChangePct: true,
          performanceStatus: true,
          createdAt: true
        }
      })
    ])

    // Calculate performance metrics
    const performanceData = await prisma.signal.aggregate({
      where: { priceChangePct: { not: null } },
      _count: { id: true },
      _avg: { priceChangePct: true },
      _max: { priceChangePct: true },
      _min: { priceChangePct: true }
    })

    const profitableSignals = await prisma.signal.count({
      where: { priceChangePct: { gt: 0 } }
    })

    const losingSignals = await prisma.signal.count({
      where: { priceChangePct: { lt: 0 } }
    })

    const winRate = performanceData._count.id > 0
      ? (profitableSignals / performanceData._count.id) * 100
      : 0

    // Estimate active users (users with transactions or recent activity)
    const activeUsers = await prisma.user.count({
      where: {
        OR: [
          { transactions: { some: {} } },
          { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
        ]
      }
    })

    // Use .toString() for Decimal to avoid overflow (Issue 21), format as number on client
    const toFixedStr = (val: any): string => val?.toString() ?? '0'
    const toNum = (val: any): number => parseFloat(val?.toString() ?? '0')

    const responseData = {
      // User Metrics
      totalUsers,
      activeUsers,
      freeUsers,
      premiumUsers,
      adminUsers,
      monthlyOnboarded,
      visitorsCount: totalUsers,

      // Financial Metrics
      totalPayments,
      totalRevenue: toNum(totalRevenueResult._sum.amount),
      monthlyRevenue: toNum(monthlyRevenueResult._sum.amount),
      avgTransaction: toNum(avgTransactionResult._avg.amount),

      // Revenue breakdown
      payPerAlphaCount: payPerAlphaTransactions,
      premiumPaymentCount: premiumTransactions,
      payPerAlphaRevenue: toNum(payPerAlphaRevenueResult._sum.amount),
      premiumRevenue: toNum(premiumRevenueResult._sum.amount),

      // Signal Metrics
      totalSignals,
      diamondSignalCount: diamondSignals,
      signals24h,
      winRate: parseFloat(winRate.toFixed(1)),
      avgReturn: performanceData._avg.priceChangePct ? parseFloat(performanceData._avg.priceChangePct.toFixed(2)) : 0,

      // Waitlist
      waitlistCount,
      signalCount: totalSignals,

      // Monitoring Data
      recentSignals: recentSignals.map(signal => ({
        ...signal,
        createdAt: signal.createdAt.toISOString()
      })),
      recentUsers: recentUsersResult.map(u => ({
        ...u,
        createdAt: u.createdAt.toISOString()
      })),

      // Performance Tracking
      performanceStats: {
        totalTracked: performanceData._count.id,
        profitable: profitableSignals,
        losing: losingSignals,
        bestGain: performanceData._max.priceChangePct ? parseFloat(performanceData._max.priceChangePct.toFixed(2)) : 0,
        worstLoss: performanceData._min.priceChangePct ? parseFloat(performanceData._min.priceChangePct.toFixed(2)) : 0
      },
    }

    // Update cache
    cache = { data: responseData, timestamp: Date.now() }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Enhanced admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enhanced stats' },
      { status: 500 }
    )
  }
})
