import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { checkRateLimit, getClientIP, getRateLimitKey } from '@/lib/security'
import { sendVerificationEmail } from '@/lib/email'
import { logApiResponse } from '@/lib/api/response-logger'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  // Rate limiting: 5 registration attempts per IP per 15 minutes
  const ip = getClientIP(req as unknown as Request)
  const key = getRateLimitKey(ip, 'register')
  if (!checkRateLimit(key, 5, 15 * 60 * 1000)) {
    logApiResponse('POST', '/api/auth/register', 429, { error: 'Rate limited' })
    return NextResponse.json(
      { error: 'Too many registration attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '900' } }
    )
  }

  try {
    const { email, password } = await req.json()

    // Validation
    if (!email || !password) {
      logApiResponse('POST', '/api/auth/register', 400, { error: 'Missing email or password' })
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    if (!emailRegex.test(email) || email.length > 254) {
      logApiResponse('POST', '/api/auth/register', 400, { error: 'Invalid email format' })
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      logApiResponse('POST', '/api/auth/register', 400, { error: 'Password too short' })
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      logApiResponse('POST', '/api/auth/register', 409, { email, error: 'Email already registered' })
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate verification token
    const verificationToken = crypto.randomUUID()
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user with verification fields + 1 free credit
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        premiumStatus: 'free',
        credits: 1, // 1 free Pay-Per-Alpha credit on signup
        emailVerified: false,
        verificationToken,
        verificationExpires
      }
    })

    // Log the free credit grant
    console.log(`[signup] Granted 1 free credit to user ${user.id.slice(0, 8)} (${email})`)

    // Send verification email (non-blocking — don't fail registration if email fails)
    sendVerificationEmail(email, verificationToken).catch((err: Error) => {
      console.error('Failed to send verification email:', err)
    })

    logApiResponse('POST', '/api/auth/register', 201, { email, extras: { userId: user.id.slice(0, 8) } })
    return NextResponse.json(
      { success: true, userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to create account'
    logApiResponse('POST', '/api/auth/register', 500, { error: msg })
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
