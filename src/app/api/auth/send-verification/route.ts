import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendVerificationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/send-verification
 * Resend verification email for a user
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // If already verified, return success
    if (user.emailVerified) {
      return NextResponse.json({ success: true, alreadyVerified: true })
    }

    // Generate new verification token
    const verificationToken = crypto.randomUUID()
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationExpires
      }
    })

    // Send verification email (non-blocking)
    sendVerificationEmail(email, verificationToken).catch((err: Error) => {
      console.error('Failed to send verification email:', err)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Send verification error:', error)
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    )
  }
}
