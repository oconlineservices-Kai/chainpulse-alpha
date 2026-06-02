/**
 * POST /api/deploy-migrate
 * One-shot migration runner for the webhook_events table.
 * Requires X-AUTH-SECRET header for auth.
 * Can be called once to apply the migration.
 * This route will be removed after successful deployment.
 */
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('x-auth-secret')
  if (authHeader !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if table already exists
    const result = await prisma.$queryRawUnsafe<Array<{exists: boolean}>>(
      "SELECT EXISTS(SELECT FROM information_schema.tables WHERE table_name='webhook_events') AS exists"
    )

    if (result[0]?.exists) {
      return NextResponse.json({ message: 'Table already exists', applied: false })
    }

    await prisma.$executeRawUnsafe(`
      CREATE TABLE webhook_events (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL UNIQUE,
        processed_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    return NextResponse.json({ message: 'Migration applied', applied: true })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Migration failed' },
      { status: 500 }
    )
  }
}
