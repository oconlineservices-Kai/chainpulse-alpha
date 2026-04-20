import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { message: 'Token is required' },
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
      return NextResponse.json(
        { message: 'Reset token has expired' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Token is valid' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Validate token error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
