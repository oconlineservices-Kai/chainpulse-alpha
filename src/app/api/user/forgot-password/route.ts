import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

// Shared in-memory token store (process-scoped via globalThis).
// Tokens survive hot-reloads; a DB-backed PasswordReset model would be
// required for multi-instance deployments.
const getResetTokens = () => {
  const g = globalThis as any
  if (!g._resetTokens) g._resetTokens = new Map<string, { token: string; expires: Date }>()
  return g._resetTokens as Map<string, { token: string; expires: Date }>
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { message: 'If an account exists with this email, you will receive a password reset link.' },
        { status: 200 }
      )
    }

    // Generate reset token (valid for 1 hour)
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600000)

    // Store token in the shared global map
    getResetTokens().set(normalizedEmail, { token, expires })

    const resetUrl = `${process.env.NEXTAUTH_URL || 'https://chainpulsealpha.com'}/reset-password?token=${token}`
    console.log('Password reset URL:', resetUrl)

    // TODO: send email when an email provider is configured

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
