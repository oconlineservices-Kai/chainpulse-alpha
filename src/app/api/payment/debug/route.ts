import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export const GET = auth(async (req) => {
  return NextResponse.json({
    authenticated: !!req.auth,
    email: req.auth?.user?.email ?? null,
    name: req.auth?.user?.name ?? null,
    sessionExists: req.auth !== null && req.auth !== undefined,
    message: 'If you see this, auth works'
  })
})
