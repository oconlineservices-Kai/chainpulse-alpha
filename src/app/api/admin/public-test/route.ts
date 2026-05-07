import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const GET = auth(async (req) => {
  if (!req.auth?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [users, premiumUsers, adminUsers, signals, waitlist, transactions] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { premiumStatus: { not: 'free' } } }),
      prisma.user.count({ where: { premiumStatus: 'admin' } }),
      prisma.signal.count(),
      prisma.waitlist.count(),
      prisma.transaction.count({ where: { status: 'completed' } }),
    ])

    const profitableSignals = await prisma.signal.count({
      where: { priceChangePct: { gt: 0 } }
    })
    const totalTracked = await prisma.signal.count({
      where: { priceChangePct: { not: null } }
    })
    const winRate = totalTracked > 0
      ? parseFloat(((profitableSignals / totalTracked) * 100).toFixed(1))
      : 0

    const recentSignals = await prisma.signal.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        tokenSymbol: true,
        sentimentScore: true,
        priceChangePct: true,
        performanceStatus: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: users,
          premium: premiumUsers,
          admin: adminUsers,
        },
        financial: {
          payments: transactions,
          revenue: 0,
        },
        signals: {
          total: signals,
          recent: recentSignals.length,
          winRate,
        },
        system: {
          waitlist,
          uptime: '1d 20h',
          status: 'HEALTHY',
        },
        recentSignals: recentSignals.map((s) => ({
          ...s,
          createdAt: s.createdAt.toISOString(),
        })),
      },
    })
  } catch (error) {
    console.error('public-test error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
