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
import { postTopSignalsToChannel, postDailyRoundup } from '@/lib/telegram'

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

    // ── Broadcast top signals to Telegram channel ───────────────────
    // Fetch the generated signals and post top ones
    if (process.env.TELEGRAM_BOT_TOKEN && result.generated > 0) {
      try {
        // We need to fetch the signals we just generated
        const { prisma } = await import('@/lib/prisma')
        const recentSignals = await prisma.signal.findMany({
          where: { expiresAt: { gt: new Date() } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        })

        if (recentSignals.length > 0) {
          const signalsForTelegram = recentSignals.map(s => ({
            tokenSymbol: s.tokenSymbol,
            tokenName: s.tokenName ?? s.tokenSymbol,
            sentimentScore: s.sentimentScore ?? 0,
            whaleConfidence: s.whaleConfidence ?? 0,
            correlationScore: s.correlationScore ?? 0,
            isDiamondSignal: s.isDiamondSignal,
            entryPrice: s.entryPrice ?? 0,
            currentPrice: s.currentPrice ?? 0,
            priceChangePct: s.priceChangePct ?? 0,
            twitterMentions: s.twitterMentions ?? 0,
          }))

          const tgResult = await postTopSignalsToChannel(signalsForTelegram, 3)
          console.log(`[Telegram] Posted ${tgResult.posted}/${tgResult.failed + tgResult.posted} signals`)

          // Also post daily roundup if diamonds were generated
          if (result.diamonds > 0 && tgResult.posted > 0) {
            const bestSignal = signalsForTelegram[0]
            await postDailyRoundup(result.generated, result.diamonds, bestSignal.tokenSymbol, `${bestSignal.priceChangePct >= 0 ? '+' : ''}${bestSignal.priceChangePct.toFixed(1)}%`)
          }
        }
      } catch (tgError) {
        console.error('[Telegram] Broadcast failed:', tgError)
      }
    }

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
