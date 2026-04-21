import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

const getResetTokens = () => {
  const g = globalThis as any
  if (!g._resetTokens) g._resetTokens = new Map<string, { token: string; expires: Date }>()
  return g._resetTokens as Map<string, { token: string; expires: Date }>
}

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token and password are required' },
        { status: 400 }
      )
    }

    const resetTokens = getResetTokens()

    // Find entry by token value
    let foundEmail: string | null = null
    for (const [email, entry] of Array.from(resetTokens.entries())) {
      if (entry.token === token) {
        foundEmail = email
        break
      }
    }

    if (!foundEmail) {
      return NextResponse.json(
        { message: 'Invalid reset token' },
        { status: 400 }
      )
    }

    const entry = resetTokens.get(foundEmail)!
    if (entry.expires < new Date()) {
      resetTokens.delete(foundEmail)
      return NextResponse.json(
        { message: 'Reset token has expired' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters.' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user password
    await prisma.user.update({
      where: { email: foundEmail },
      data: { password: hashedPassword }
    })

    // Remove used token
    resetTokens.delete(foundEmail)

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
