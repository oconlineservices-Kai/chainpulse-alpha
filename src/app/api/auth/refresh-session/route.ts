/**
 * POST /api/auth/refresh-session
 * Forces a JWT session token refresh so premiumStatus is re-read from DB.
 * Called after successful payment to ensure premium access is immediate.
 */
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const POST = auth(async (req) => {
  if (!req.auth?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: req.auth.user.email },
      select: {
        id: true,
        email: true,
        premiumStatus: true,
        premiumExpiresAt: true,
        credits: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return fresh user data so the client can update its session state
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        premiumStatus: user.premiumStatus,
        premiumExpiresAt: user.premiumExpiresAt,
        credits: user.credits,
      }
    })
  } catch (error) {
    console.error('Session refresh error:', error)
    return NextResponse.json({ error: 'Failed to refresh session' }, { status: 500 })
  }
})
