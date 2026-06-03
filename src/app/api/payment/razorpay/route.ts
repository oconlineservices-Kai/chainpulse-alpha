/**
 * /api/payment/razorpay — Create Razorpay order for Premium subscription or Pay-Per-Alpha credits
 *
 * Server-side pricing authority: accepts plan name, looks up USD price, converts to INR.
 * NEVER trusts client-provided amount.
 *
 * Flow:
 *   1. POST { plan } → server looks up price → converts to INR → creates Razorpay order
 *   2. Returns orderId, amount (paise), currency, keyId for Razorpay checkout
 */

import Razorpay from 'razorpay'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { convertToINR } from '@/lib/exchange-rate'
import { checkRateLimit, getClientIP, getRateLimitKey } from '@/lib/security'
import { logApiResponse } from '@/lib/api/response-logger'

export const dynamic = 'force-dynamic'

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) throw new Error('Razorpay credentials not configured')
  return new Razorpay({ key_id: keyId, key_secret: keySecret })
}

// Server-side canonical pricing in USD — NEVER trust client-provided amounts
const PLAN_PRICES_USD: Record<string, { usd: number; label: string; transactionType: string }> = {
  'Premium Monthly': { usd: 49, label: 'Premium Monthly Subscription', transactionType: 'subscription' },
  'Premium Yearly':  { usd: 39, label: 'Premium Yearly Subscription', transactionType: 'subscription' },
  'Pay Per Alpha':   { usd: 1,  label: 'Pay-Per-Alpha Credits',      transactionType: 'alpha_purchase' },
}

export const POST = auth(async (req) => {
  const email = req.auth?.user?.email

  // Rate limiting: 10 requests per IP per minute
  const clientIp = getClientIP(req)
  const rateKey = getRateLimitKey(clientIp, 'payment:razorpay')
  if (!checkRateLimit(rateKey, 10, 60 * 1000)) {
    logApiResponse('POST', '/api/payment/razorpay', 429, { email: email ?? undefined, error: 'Rate limit exceeded' })
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  if (!email) {
    logApiResponse('POST', '/api/payment/razorpay', 401, { error: 'Unauthorized' })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { plan } = body

    if (!plan) {
      logApiResponse('POST', '/api/payment/razorpay', 400, { email, error: 'Plan is required' })
      return NextResponse.json({ error: 'Plan is required' }, { status: 400 })
    }

    // Server-side price lookup — ignore any client-provided amount
    const planConfig = PLAN_PRICES_USD[plan]
    if (!planConfig) {
      logApiResponse('POST', '/api/payment/razorpay', 400, { email, error: 'Invalid plan' })
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })
    if (!user) {
      logApiResponse('POST', '/api/payment/razorpay', 404, { email, error: 'User not found' })
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Convert USD to INR (no GST)
    const { totalINR, totalPaise, rate } = await convertToINR(planConfig.usd)

    // Create Razorpay order using INR paise amount
    const razorpay = getRazorpay()
    const order = await razorpay.orders.create({
      amount:   totalPaise,
      currency: 'INR',
      receipt:  `receipt_${plan.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`,
      notes: {
        userId: user.id,
        plan,
        baseUSD:       String(planConfig.usd),
        exchangeRate:  String(rate),
      },
    })

    // Create transaction record with INR amount
    await prisma.transaction.create({
      data: {
        userId:           user.id,
        provider:         'razorpay',
        transactionType:  planConfig.transactionType,
        providerPaymentId: order.id,
        amount:           totalINR, // Store in INR rupees
        currency:         'INR',
        status:           'pending',
        metadata: {
          plan,
          baseUSD: planConfig.usd,
          exchangeRate: rate,
          totalPaise,
        },
      },
    })

    logApiResponse('POST', '/api/payment/razorpay', 200, {
      email,
      extras: { plan, amount: order.amount, currency: order.currency, orderId: order.id.slice(0, 12) },
    })
    return NextResponse.json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.RAZORPAY_KEY_ID,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create order'
    // Log full error object for Razorpay SDK failures
    if (error && typeof error === 'object') {
      // Razorpay SDK errors often have statusCode, error, description fields
      console.error('RAZORPAY_ORDER_CREATION_ERROR:', JSON.stringify({
        message,
        statusCode: (error as any).statusCode,
        error: (error as any).error,
        description: (error as any).description,
        field: (error as any).field,
        stack: error instanceof Error ? error.stack?.split('\n').slice(0, 3).join('\n') : undefined,
      }, null, 2))
    }
    logApiResponse('POST', '/api/payment/razorpay', 500, { email, error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
})
