/**
 * /api/webhooks/paypal — PayPal Webhook Stub
 *
 * PayPal is NOT integrated. This stub exists only for reference.
 * We use Razorpay as our payment gateway.
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[paypal-webhook] Received (ignored):', body)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[paypal-webhook] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
