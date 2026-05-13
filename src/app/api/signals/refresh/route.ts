/**
 * POST /api/signals/refresh — Trigger signal generation
 *
 * Requires X-AUTH-SECRET header to match AUTH_SECRET env var.
 * Regenerates signals from live CoinGecko data and stores in DB.
 *
 * Called by PM2 cron every 6 hours.
 * Also callable manually for on-demand refresh.
 */

import { NextResponse, NextRequest } from 'next/server'
import { generateSignals, updateGeneratorState } from '@/lib/signal-generator'
import { logApiResponse } from '@/lib/api/response-logger'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Auth check — require secret header
    const authSecret = req.headers.get('x-auth-secret')
    const expectedSecret = process.env.AUTH_SECRET

    if (!authSecret || !expectedSecret || authSecret !== expectedSecret) {
      logApiResponse('POST', '/api/signals/refresh', 401, { error: 'Unauthorized' })
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Provide valid X-AUTH-SECRET header.' },
        { status: 401 }
      )
    }

    // Generate signals using the authoritative lib/signal-generator
    const result = await generateSignals(50)

    updateGeneratorState({
      running: false,
      lastRun: new Date(),
      totalSignalsGenerated: result.generated,
      totalDiamondSignals: result.diamonds,
      lastErrors: result.errors,
    })

    logApiResponse('POST', '/api/signals/refresh', 200, {
      extras: { generated: result.generated, diamonds: result.diamonds, errors: result.errors.length },
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
    const msg = error instanceof Error ? error.message : 'Signal generation failed'
    logApiResponse('POST', '/api/signals/refresh', 500, { error: msg })
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    )
  }
}
