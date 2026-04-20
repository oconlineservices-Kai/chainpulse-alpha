import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token and password are required' },
        { status: 400 }
      )
    }

    // Find valid reset token
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token }
    })

    if (!resetRecord) {
      return NextResponse.json(
        { message: 'Invalid reset token' },
        { status: 400 }
      )
    }

    if (resetRecord.expires < new Date()) {
      // Delete expired token
      await prisma.passwordReset.delete({
        where: { token }
      })
      return NextResponse.json(
        { message: 'Reset token has expired' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user password
    await prisma.user.update({
      where: { email: resetRecord.email },
      data: { password: hashedPassword }
    })

    // Delete used token
    await prisma.passwordReset.delete({
      where: { token }
    })

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
