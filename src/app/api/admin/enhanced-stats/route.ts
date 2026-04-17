import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const GET = auth(async (req) => {
  // Check if user is admin
  if (!req.auth?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // System metrics (would come from monitoring system)
    const systemUptime = '1d 14h' // This would come from monitoring system
    const lastSignal = recentSignals.length > 0 
      ? formatTimeAgo(recentSignals[0].createdAt)
      : 'Never'
    
    const performanceStatus = 'HEALTHY' // This would come from monitoring system

    return NextResponse.json({
      // User Metrics
      totalUsers,
      activeUsers,
      premiumUsers,
      adminUsers,
      
      // Financial Metrics
      totalPayments,
      totalRevenue: totalRevenueResult._sum.amount?.toNumber() || 0,
      monthlyRevenue: monthlyRevenueResult._sum.amount?.toNumber() || 0,
      avgTransaction: avgTransactionResult._avg.amount?.toNumber() || 0,
      
      // Signal Metrics
      totalSignals,
      signals24h,
      diamondSignals,
      winRate: parseFloat(winRate.toFixed(1)),
      avgReturn: performanceData._avg.priceChangePct ? parseFloat(performanceData._avg.priceChangePct.toFixed(2)) : 0,
      
      // System Metrics
      waitlistCount,
      systemUptime,
      lastSignal,
      performanceStatus,
      
      // Monitoring Data
      recentSignals: recentSignals.map(signal => ({
        ...signal,
        createdAt: signal.createdAt.toISOString()
      })),
      
      // Performance Tracking
      performanceStats: {
        totalTracked: performanceData._count.id,
        profitable: profitableSignals,
        losing: losingSignals,
        bestGain: performanceData._max.priceChangePct ? parseFloat(performanceData._max.priceChangePct.toFixed(2)) : 0,
        worstLoss: performanceData._min.priceChangePct ? parseFloat(performanceData._min.priceChangePct.toFixed(2)) : 0
      }
    })
    
  } catch (error) {
    console.error('Enhanced admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enhanced stats' },
      { status: 500 }
    )
  }
})

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  return 'Just now'
}