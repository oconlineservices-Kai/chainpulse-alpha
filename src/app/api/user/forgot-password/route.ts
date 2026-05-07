import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'
import { checkRateLimit, getClientIP, getRateLimitKey } from '@/lib/security'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  // Rate limiting: 5 forgot-password requests per IP per 15 minutes
  const ip = getClientIP(req as unknown as Request)
  const key = getRateLimitKey(ip, 'forgot-password')
  if (!checkRateLimit(key, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { message: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '900' } }
    )
  }
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { message: 'If an account exists with this email, you will receive a password reset link.' },
        { status: 200 }
      )
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600000) // 1 hour from now

    // Delete any existing reset tokens for this email
    await prisma.passwordReset.deleteMany({
      where: { email: email.toLowerCase() }
    })

    // Create new reset token
    await prisma.passwordReset.create({
      data: {
        email: email.toLowerCase(),
        token,
        expires,
      }
    })

    // Send password reset email via configured provider
    const emailResult = await sendPasswordResetEmail(email.toLowerCase(), token)
    if (!emailResult.success) {
      console.error('Failed to send reset email:', emailResult.error)
    } else {
      console.log(`Password reset email sent via ${emailResult.provider} to ${email.toLowerCase()}`)
    }

    return NextResponse.json(
      { message: 'If an account exists with this email, you will receive a password reset link.' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
