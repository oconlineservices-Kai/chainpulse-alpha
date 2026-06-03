/**
 * POST /api/telegram/broadcast — Manually broadcast signals to Telegram channel
 *
 * Requires X-AUTH-SECRET header to match AUTH_SECRET env var.
 * Fetches latest signals from DB and posts to @chainpulse_alpha.
 *
 * Query params:
 *   count = 1-10 (default 3) — number of top signals to post
 *   roundup = true — also post daily roundup
 */

import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { postTopSignalsToChannel, postDailyRoundup } from '@/lib/telegram'
import { logApiResponse } from '@/lib/api/response-logger'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const authSecret = req.headers.get('x-auth-secret')
    const expectedSecret = process.env.AUTH_SECRET
    if (!authSecret || !expectedSecret || authSecret !== expectedSecret) {
      logApiResponse('POST', '/api/telegram/broadcast', 401, { error: 'Unauthorized' })
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ success: false, error: 'TELEGRAM_BOT_TOKEN not configured' }, { status: 503 })
    }

    const { searchParams } = new URL(req.url)
    const count = Math.min(parseInt(searchParams.get('count') || '3'), 10)
    const includeRoundup = searchParams.get('roundup') === 'true'

    // Fetch latest active signals
    const signals = await prisma.signal.findMany({
      where: { expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      take: count,
    })

    if (signals.length === 0) {
      return NextResponse.json({ success: false, error: 'No active signals to broadcast' }, { status: 404 })
    }

    const signalsForTelegram = signals.map(s => ({
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

    const result = await postTopSignalsToChannel(signalsForTelegram, count)

    if (includeRoundup && result.posted > 0) {
      const best = signalsForTelegram[0]
      await postDailyRoundup(
        await prisma.signal.count({ where: { expiresAt: { gt: new Date() } } }),
        signals.filter(s => s.isDiamondSignal).length,
        best.tokenSymbol,
        `${best.priceChangePct >= 0 ? '+' : ''}${best.priceChangePct.toFixed(1)}%`
      )
    }

    logApiResponse('POST', '/api/telegram/broadcast', 200, {
      extras: { posted: result.posted, failed: result.failed },
    })

    return NextResponse.json({
      success: true,
      data: {
        posted: result.posted,
        failed: result.failed,
        errors: result.errors.length > 0 ? result.errors : undefined,
        totalActiveSignals: signals.length,
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Broadcast failed'
    logApiResponse('POST', '/api/telegram/broadcast', 500, { error: msg })
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
