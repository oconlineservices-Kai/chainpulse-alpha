/**
 * POST /api/payment/verify — Verify Razorpay payment
 *
 * Called after Razorpay checkout completes successfully.
 * Verifies the signature, marks transaction as success, and updates user entitlements.
 *
 * For subscriptions: sets premiumStatus + 30-day expiry.
 * For alpha purchases: adds credits to user balance.
 *
 * ⚠ This is redundant with the webhook in production — both paths may fire.
 * The webhook is the authoritative handler; this route provides a synchronous
 * post-checkout callback so the user sees immediate confirmation.
 * Idempotency guards prevent double-crediting.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { checkRateLimit, getClientIP, getRateLimitKey } from '@/lib/security'
import { logApiResponse } from '@/lib/api/response-logger'

export const dynamic = 'force-dynamic'

export const POST = auth(async (req) => {
  const email = req.auth?.user?.email

  // Rate limiting: 10 requests per IP per minute
  const clientIp = getClientIP(req)
  const rateKey = getRateLimitKey(clientIp, 'payment:verify')
  if (!checkRateLimit(rateKey, 10, 60 * 1000)) {
    logApiResponse('POST', '/api/payment/verify', 429, { email: email ?? undefined, error: 'Rate limit exceeded' })
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  if (!email) {
    logApiResponse('POST', '/api/payment/verify', 401, { error: 'Unauthorized' })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = await req.json()

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      logApiResponse('POST', '/api/payment/verify', 400, { email, error: 'Missing required fields' })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // ── Verify Razorpay signature ──────────────────────────────────────
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) {
      logApiResponse('POST', '/api/payment/verify', 500, { email, error: 'RAZORPAY_KEY_SECRET not configured' })
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      logApiResponse('POST', '/api/payment/verify', 400, { email, error: 'Invalid signature' })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // ── Find the pending transaction ───────────────────────────────────
    const transaction = await prisma.transaction.findFirst({
      where: { providerPaymentId: razorpay_order_id, status: 'pending' },
    })

    if (!transaction) {
      logApiResponse('POST', '/api/payment/verify', 404, { email, error: 'Transaction not found' })
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // ── Idempotency — skip if already processed ────────────────────────
    if (transaction.status === 'success') {
      logApiResponse('POST', '/api/payment/verify', 200, {
        extras: { transactionType: transaction.transactionType, alreadyProcessed: true },
      })
      return NextResponse.json({
        success: true,
        transactionType: transaction.transactionType,
        alreadyProcessed: true,
      })
    }

    // ── Mark transaction as success ─────────────────────────────────────
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        providerPaymentId: razorpay_payment_id,
        status: 'success',
      },
    })

    // ── Handle by type ─────────────────────────────────────────────────
    if (transaction.transactionType === 'subscription') {
      // Premium subscription: set 30-day expiry from now (or extend existing)
      const user = await prisma.user.findUnique({
        where: { id: transaction.userId },
        select: { premiumExpiresAt: true },
      })
      const baseDate = user?.premiumExpiresAt && user.premiumExpiresAt > new Date()
        ? user.premiumExpiresAt
        : new Date()
      const newExpiry = new Date(baseDate)
      newExpiry.setDate(newExpiry.getDate() + 30)

      await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          premiumStatus: 'premium',
          premiumExpiresAt: newExpiry,
        },
      })
    } else if (transaction.transactionType === 'alpha_purchase') {
      // Pay-Per-Alpha: add credits. Credit count is based on what the
      // server-side order creation determined (metadata), not a hardcoded value.
      const metadata = transaction.metadata as Record<string, unknown> | null
      const signalType = metadata?.signalType as string | undefined

      // Pricing tiers per alpha-purchase/route.ts:
      //   diamond → $3.50, whale → $2.50, default → $1.00
      // The effective credit value = $1 per credit.
      // A $1 signal = 1 credit, $2.50 = 2.5 credits (rounded up to 3),
      // $3.50 = 3.5 credits (rounded up to 4).
      const usdAmount: number =
        signalType === 'diamond' ? 3.50 :
        signalType === 'whale' ? 2.50 :
        1.00

      const creditsToAdd = Math.ceil(usdAmount)

      await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          credits: { increment: creditsToAdd },
        },
      })

      // Record credit addition in transaction
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          creditsAdded: creditsToAdd,
        },
      })

      console.log(
        `[payment/verify] Added ${creditsToAdd} credit(s) to user ${transaction.userId.slice(0, 8)} ` +
        `(signalType: ${signalType ?? 'default'})`
      )
    }

    logApiResponse('POST', '/api/payment/verify', 200, {
      email,
      extras: {
        transactionType: transaction.transactionType,
        transactionId: transaction.id.slice(0, 8),
      },
    })
    return NextResponse.json({
      success: true,
      transactionType: transaction.transactionType,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Verification failed'
    logApiResponse('POST', '/api/payment/verify', 500, { email, error: msg })
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
})
