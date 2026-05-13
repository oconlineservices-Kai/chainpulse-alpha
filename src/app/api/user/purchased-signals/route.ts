/**
 * GET /api/user/purchased-signals
 * Returns a list of signal IDs the current user has purchased via pay-per-alpha.
 * Purchases expire after 30 days by default.
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const GET = auth(async (req) => {
  if (!req.auth?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: req.auth.user.email },
      select: {
        id: true,
        credits: true,
        alphaPurchases: {
          select: { signalId: true, purchasedAt: true, expiresAt: true },
          orderBy: { purchasedAt: 'desc' },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Filter out expired purchases (30-day validity)
    const now = new Date()
    const validPurchases = user.alphaPurchases.filter((p) => {
      // If no explicit expiresAt, check 30 days from purchase
      if (p.expiresAt) return p.expiresAt > now
      const thirtyDays = new Date(p.purchasedAt)
      thirtyDays.setDate(thirtyDays.getDate() + 30)
      return thirtyDays > now
    })

    return NextResponse.json({
      purchasedSignalIds: validPurchases.map((p) => p.signalId),
      credits: user.credits,
      purchaseCount: user.alphaPurchases.length,
      expiredCount: user.alphaPurchases.length - validPurchases.length,
    })
  } catch (error) {
    console.error('[purchased-signals] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch purchased signals' }, { status: 500 })
  }
})
