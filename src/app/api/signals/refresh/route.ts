/**
 * POST /api/signals/refresh — Trigger signal generation
 *
 * Requires X-AUTH-SECRET header to match AUTH_SECRET env var.
 * Regenerates signals from live CoinGecko data and stores in DB.
 */

import { NextResponse, NextRequest } from 'next/server'
import { generateSignals, updateGeneratorState } from '@/lib/signal-generator'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Auth check — require secret header
    const authSecret = req.headers.get('x-auth-secret')
    const expectedSecret = process.env.AUTH_SECRET

    if (!authSecret || !expectedSecret || authSecret !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Provide valid X-AUTH-SECRET header.' },
        { status: 401 }
      )
    }

    // Start generation (non-blocking for the caller's response time)
    const result = await generateSignals(50)

    updateGeneratorState({
      running: false,
      lastRun: new Date(),
      totalSignalsGenerated: result.generated,
      totalDiamondSignals: result.diamonds,
      lastErrors: result.errors,
    })

    return NextResponse.json({
      success: true,
      data: {
        generated: result.generated,
        diamonds: result.diamonds,
        errors: result.errors.length > 0 ? result.errors : undefined,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Signal generation failed',
      },
      { status: 500 }
    )
  }
}
