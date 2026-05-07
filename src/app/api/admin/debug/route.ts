import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const GET = auth(async (req) => {
  if (!req.auth?.user?.isAdmin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const results: Record<string, any> = {}

  try {
    results.userCount = await prisma.user.count()
  } catch (e: any) {
    results.userCountError = e.message
  }

  try {
    results.signalCount = await prisma.signal.count()
  } catch (e: any) {
    results.signalCountError = e.message
  }

  try {
    results.waitlistCount = await prisma.waitlist.count()
  } catch (e: any) {
    results.waitlistCountError = e.message
  }

  try {
    results.transactionCount = await prisma.transaction.count({ where: { status: 'completed' } })
  } catch (e: any) {
    results.transactionCountError = e.message
  }

  try {
    results.premiumUsersCount = await prisma.user.count({ where: { premiumStatus: { not: 'free' } } })
  } catch (e: any) {
    results.premiumUsersError = e.message
  }

  try {
    results.adminUsersCount = await prisma.user.count({ where: { premiumStatus: 'admin' } })
  } catch (e: any) {
    results.adminUsersError = e.message
  }

  try {
    results.recentSignals = await prisma.signal.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        tokenSymbol: true,
        sentimentScore: true,
        priceChangePct: true,
        performanceStatus: true,
        createdAt: true,
      },
    })
  } catch (e: any) {
    results.recentSignalsError = e.message
  }

  try {
    const totalRev = await prisma.transaction.aggregate({
      where: { status: 'completed' },
      _sum: { amount: true },
    })
    results.totalRevenue = totalRev._sum.amount?.toString() || '0'
  } catch (e: any) {
    results.totalRevenueError = e.message
  }

  try {
    results.activeUsers = await prisma.user.count({
      where: {
        OR: [
          { transactions: { some: {} } },
          { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        ],
      },
    })
  } catch (e: any) {
    results.activeUsersError = e.message
  }

  return NextResponse.json({
    success: true,
    data: results,
  })
})
