import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logApiResponse } from '@/lib/api/response-logger'

export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/verify-email?token=xxx
 * Verify a user's email address using their verification token
 */
const BASE_URL = process.env.AUTH_URL || process.env.NEXTAUTH_URL || 'https://chainpulsealpha.com'

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token')

    if (!token) {
      logApiResponse('GET', '/api/auth/verify-email', 400, { error: 'Missing token' })
      return NextResponse.redirect(new URL('/login?verified=error', BASE_URL))
    }

    // Find user with valid verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationExpires: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      logApiResponse('GET', '/api/auth/verify-email', 404, { error: 'Invalid or expired token' })
      return NextResponse.redirect(new URL('/login?verified=expired', BASE_URL))
    }

    // Mark email as verified and clear verification fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpires: null
      }
    })

    logApiResponse('GET', '/api/auth/verify-email', 302, { email: user.email, extras: { userId: user.id.slice(0, 8) } })
    return NextResponse.redirect(new URL('/login?verified=true', BASE_URL))
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Verification error'
    logApiResponse('GET', '/api/auth/verify-email', 500, { error: msg })
    return NextResponse.redirect(new URL('/login?verified=error', BASE_URL))
  }
}
