import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
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

    // In production, send email here
    // For now, just log the reset link
    const resetUrl = `${process.env.APP_URL || 'https://chainpulsealpha.com'}/reset-password?token=${token}`
    console.log('Password reset URL:', resetUrl)

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
