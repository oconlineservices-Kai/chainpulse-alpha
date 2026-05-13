/**
 * GET /api/exchange-rate — Returns live USD → INR rate
 *
 * Used by the pricing page to display INR equivalent at checkout.
 * Cached server-side for 10 minutes.
 */

import { NextResponse } from 'next/server'
import { getUSDToINR, convertToINR } from '@/lib/exchange-rate'
import { logApiResponse } from '@/lib/api/response-logger'

export const dynamic = 'force-dynamic'
export const revalidate = 600 // 10 minutes

export async function GET() {
  try {
    const rate = await getUSDToINR()
    const premium = await convertToINR(49)
    const premiumYearly = await convertToINR(39)
    const payPer = await convertToINR(1)

    logApiResponse('GET', '/api/exchange-rate', 200, { extras: { rate } })
    return NextResponse.json({
      rate,
      pricing: {
        premium: { usd: 49, inr: premium.totalINR },
        premiumYearly: { usd: 39, inr: premiumYearly.totalINR },
        payPerAlpha: { usd: 1, inr: payPer.totalINR },
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch exchange rate'
    logApiResponse('GET', '/api/exchange-rate', 500, { error: msg })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
