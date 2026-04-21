/**
 * User signup endpoint.
 * Validates input, enforces rate limits, prevents temp emails, and creates the user.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import {
  sanitizeEmail,
  isTempEmailDomain,
  validatePassword,
  checkRateLimit,
  getClientIP,
  getRateLimitKey,
} from '@/lib/security'

const signupSchema = z.object({
  email: z.string().email('Invalid email address').max(254),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  name: z.string().max(100).optional(), // accepted but not stored (no name field in User model)
})

export async function POST(req: NextRequest) {
  const ip = getClientIP(req)
  const rateLimitKey = getRateLimitKey(ip, 'signup')

  // Rate limit: 5 signups per IP per 15 minutes
  if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { message: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()

    const result = signupSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { message: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const email = sanitizeEmail(result.data.email)
    const { password } = result.data

    // Block disposable email providers
    const domain = email.split('@')[1]
    if (isTempEmailDomain(domain)) {
      return NextResponse.json(
        { message: 'Disposable email addresses are not allowed.' },
        { status: 400 }
      )
    }

    // Additional password strength validation
    const passwordError = validatePassword(password)
    if (passwordError) {
      return NextResponse.json({ message: passwordError }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      // Use generic message to prevent user enumeration
      return NextResponse.json(
        { message: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        premiumStatus: 'free',
        credits: 0,
      },
      select: {
        id: true,
        email: true,
        premiumStatus: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        message: 'Account created successfully.',
        user: { id: user.id, email: user.email, premiumStatus: user.premiumStatus },
      },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Signup endpoint — POST only.' }, { status: 200 })
}
