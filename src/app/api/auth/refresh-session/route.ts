import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/refresh-session
 * Refresh the user session data (premium status, credits, etc.)
 * Used when a user's account state changes (e.g., after upgrade)
 */
export const GET = auth(async function GET(req) {
  if (!req.auth?.user?.email) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: req.auth.user.email },
      select: {
        id: true,
        email: true,
        premiumStatus: true,
        premiumExpiresAt: true,
        credits: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        premiumStatus: user.premiumStatus,
        premiumExpiresAt: user.premiumExpiresAt,
        credits: user.credits
      }
    })
  } catch (error) {
    console.error('Session refresh error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh session' },
      { status: 500 }
    )
  }
})
