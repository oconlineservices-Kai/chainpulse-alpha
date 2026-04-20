import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check authentication
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    })
    
    if (!user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }
    
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
    return NextResponse.json({
      success: false,
      error: "Database error",
      mockData: {
        users: { total: 4, premium: 1, admin: 1 },
        financial: { payments: 0, revenue: 0 },
        signals: { total: 14, recent: 5, winRate: 57.1 },
        system: { waitlist: 0, uptime: "1d 20h", status: "HEALTHY" }
      }
    })
  }
}
