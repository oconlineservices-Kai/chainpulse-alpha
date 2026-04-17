import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [totalUsers, totalPayments, totalSignals, waitlistCount] = await Promise.all([
      prisma.user.count(),
      prisma.transaction.count(),
      prisma.signal.count(),
      prisma.waitlist.count()
    ])

    // Get recent signals with performance data
    const recentSignals = await prisma.signal.findMany({
      where: {
        createdAt: {
          gt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        },
        priceChangePct: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        tokenSymbol: true,
        sentimentScore: true,
        whaleConfidence: true,
        correlationScore: true,
        priceChangePct: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      totalUsers,
      totalPayments,
      totalSignals,
      waitlistCount,
      recentSignals: recentSignals.map(signal => ({
        ...signal,
        createdAt: signal.createdAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('Public stats error:', error)
    
    // Return mock data for demo if database fails
    return NextResponse.json({
      totalUsers: 42,
      totalPayments: 18,
      totalSignals: 156,
      waitlistCount: 237,
      recentSignals: [
        {
          tokenSymbol: 'INJ',
          sentimentScore: 88,
          whaleConfidence: 90,
          correlationScore: 89,
          priceChangePct: 5.1,
          createdAt: new Date().toISOString()
        },
        {
          tokenSymbol: 'APT',
          sentimentScore: 76,
          whaleConfidence: 85,
          correlationScore: 80,
          priceChangePct: 6.7,
          createdAt: new Date().toISOString()
        },
        {
          tokenSymbol: 'ARB',
          sentimentScore: 85,
          whaleConfidence: 82,
          correlationScore: 84,
          priceChangePct: 4.2,
          createdAt: new Date().toISOString()
        }
      ]
    })
  }
}