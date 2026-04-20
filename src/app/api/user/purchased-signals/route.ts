/**
 * GET /api/user/purchased-signals
 * Returns a list of signal IDs the current user has purchased via pay-per-alpha.
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
          select: { signalId: true, purchasedAt: true },
          orderBy: { purchasedAt: 'desc' },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      purchasedSignalIds: user.alphaPurchases.map((p) => p.signalId),
      credits: user.credits,
      purchaseCount: user.alphaPurchases.length,
    })
  } catch (error) {
    console.error('[purchased-signals] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch purchased signals' }, { status: 500 })
  }
})
