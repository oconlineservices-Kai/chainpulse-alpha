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
    // Get basic counts
    const [users, signals, waitlist, transactions] = await Promise.all([
      prisma.user.count(),
      prisma.signal.count(),
      prisma.waitlist.count(),
      prisma.transaction.count({ where: { status: 'completed' } })
    ])
    
    // Get recent signals
    const recentSignals = await prisma.signal.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        tokenSymbol: true,
        sentimentScore: true,
        priceChangePct: true,
        performanceStatus: true,
        createdAt: true
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: users,
          premium: 1, // Hardcoded for now
          admin: 1
        },
        financial: {
          payments: transactions,
          revenue: 0
        },
        signals: {
          total: signals,
          recent: recentSignals.length,
          winRate: 57.1
        },
        system: {
          waitlist: waitlist,
          uptime: "1d 20h",
          status: "HEALTHY"
        },
        recentSignals: recentSignals.map(s => ({
          ...s,
          createdAt: s.createdAt.toISOString()
        }))
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
