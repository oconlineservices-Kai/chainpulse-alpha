import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Import the shared in-memory token store from forgot-password route
// Note: in a multi-process deployment this won't work across instances,
// but it's sufficient for a single-process PM2 setup.
const getResetTokens = () => {
  // We use a module-level global to share state within the process
  const g = globalThis as any
  if (!g._resetTokens) g._resetTokens = new Map<string, { token: string; expires: Date }>()
  return g._resetTokens as Map<string, { token: string; expires: Date }>
}

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
