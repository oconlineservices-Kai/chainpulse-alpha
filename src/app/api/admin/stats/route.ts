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
    const [totalUsers, totalPayments, totalSignals, waitlistCount] = await Promise.all([
      prisma.user.count(),
      prisma.transaction.count(),
      prisma.signal.count(),
      prisma.waitlist.count()
    ])

    return NextResponse.json({
      totalUsers,
      totalPayments,
      totalSignals,
      waitlistCount
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
})
