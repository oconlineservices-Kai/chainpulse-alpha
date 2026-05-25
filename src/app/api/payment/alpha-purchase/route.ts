/**
 * /api/payment/alpha-purchase — Pay-per-Alpha Signal Purchase
 *
 * Creates a Razorpay order for a one-time signal purchase.
 * Users pay a small fee to unlock a single Diamond/Whale signal
 * without subscribing to premium.
 *
 * Signal pricing is in USD, converted to INR at checkout via live exchange rate.
 *
 * Flow:
 *   1. POST with { signalId, signalType } → get Razorpay orderId
 *   2. User completes payment via Razorpay UI
 *   3. POST /api/payment/alpha-verify with razorpay_* fields → signal unlocked
 *   OR: User has credits → 1 credit deducted → signal unlocked immediately
 */

import Razorpay from 'razorpay'
import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { convertToINR } from '@/lib/exchange-rate'
import { checkRateLimit, getClientIP, getRateLimitKey } from '@/lib/security'
import { logApiResponse } from '@/lib/api/response-logger'
import { getRequestEmail } from '@/lib/auth-request'

export const dynamic = 'force-dynamic'

// Signal tier pricing in USD
const SIGNAL_PRICES_USD: Record<string, { usd: number; label: string }> = {
  diamond: { usd: 3.50, label: '💎 Diamond Signal — $3.50' },
  whale:   { usd: 2.50, label: '🐋 Whale Signal — $2.50' },
  default: { usd: 1.00, label: '📊 Alpha Signal — $1.00' },
}

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) throw new Error('Razorpay credentials not configured')
  return new Razorpay({ key_id: keyId, key_secret: keySecret })
}

/**
 * Get the authenticated user from the request's session cookie directly.
 * This is more reliable than calling auth() in a route-handler context,
 * because it reads the cookie from the incoming request (not from next/headers)
 * and decodes the JWT using @auth/core's own decode function.
 */
async function getSessionEmail(req: NextRequest): Promise<string | null> {
  try {
    const email = await getRequestEmail(req)
    return email
  } catch {
    return null
  }
}

// ── POST /api/payment/alpha-purchase ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Rate limiting: 10 requests per IP per minute
  const clientIp = getClientIP(req)
  const rateKey = getRateLimitKey(clientIp, 'payment:alpha-purchase')
  if (!checkRateLimit(rateKey, 10, 60 * 1000)) {
    logApiResponse('POST', '/api/payment/alpha-purchase', 429, { error: 'Rate limit exceeded' })
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  // Get session by decoding the JWT from the request cookie directly
  const userEmail = await getSessionEmail(req)

  if (!userEmail) {
    logApiResponse('POST', '/api/payment/alpha-purchase', 401, { error: 'Authentication required' })
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { signalId, signalType = 'default' } = body as {
      signalId?: string
      signalType?: 'diamond' | 'whale' | 'default'
    }

    if (!signalId) {
      logApiResponse('POST', '/api/payment/alpha-purchase', 400, { error: 'signalId required' })
      return NextResponse.json({ error: 'signalId is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })
    if (!user) {
      logApiResponse('POST', '/api/payment/alpha-purchase', 404, { error: 'User not found' })
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already purchased this signal
    const existing = await prisma.alphaPurchase.findFirst({
      where: { userId: user.id, signalId },
    })
    if (existing) {
      logApiResponse('POST', '/api/payment/alpha-purchase', 409, { error: 'Already purchased', extras: { signalId } })
      return NextResponse.json(
        { error: 'Signal already purchased', alreadyOwned: true },
        { status: 409 },
      )
    }

    // Check if user has enough credits (1 credit = free purchase)
    if (user.credits >= 1) {
      // Deduct 1 credit and unlock signal immediately (valid for 30 days)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { credits: { decrement: 1 } },
        }),
        prisma.alphaPurchase.create({
          data: {
            userId: user.id,
            signalId,
            creditsUsed: 1,
            expiresAt: thirtyDaysFromNow,
          },
        }),
      ])

      logApiResponse('POST', '/api/payment/alpha-purchase', 200, { extras: { method: 'credits', signalId } })
      return NextResponse.json({
        success: true,
        method: 'credits',
        creditsRemaining: user.credits - 1,
        message: '1 credit used — signal unlocked!',
      })
    }

    // No credits — create a Razorpay payment order with live INR conversion
    const pricing = SIGNAL_PRICES_USD[signalType] ?? SIGNAL_PRICES_USD.default
    const { totalPaise, totalINR, rate } = await convertToINR(pricing.usd)

    const razorpay = getRazorpay()

    const order = await razorpay.orders.create({
      amount:   totalPaise,
      currency: 'INR',
      receipt:  `alpha_${signalId.slice(0, 8)}_${Date.now()}`,
      notes: {
        userId:     user.id,
        signalId,
        signalType,
        purchaseType: 'alpha',
        baseUSD:      String(pricing.usd),
        exchangeRate: String(rate),
      },
    })

    // Record pending transaction
    const txn = await prisma.transaction.create({
      data: {
        userId:            user.id,
        provider:          'razorpay',
        transactionType:   'alpha_purchase',
        providerPaymentId:  order.id,
        amount:            totalINR, // Store in INR rupees
        currency:          'INR',
        status:            'pending',
        metadata: {
          signalId,
          signalType,
          baseUSD: pricing.usd,
          exchangeRate: rate,
        },
      },
    })

    logApiResponse('POST', '/api/payment/alpha-purchase', 200, {
      email: userEmail,
      extras: { method: 'payment', signalId, orderId: order.id.slice(0, 12) },
    })
    return NextResponse.json({
      success:    true,
      method:     'payment',
      orderId:    order.id,
      amount:     order.amount,
      currency:   order.currency,
      keyId:      process.env.RAZORPAY_KEY_ID,
      label:      pricing.label,
      transactionId: txn.id,
      signalId,
    })
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error')
    const msg = err.message
    
    // Friendly message for Prisma schema/column mismatch errors (deploy gap)
    // e.g. "column alpha_purchases.expires_at does not exist"
    if (msg.includes('does not exist') || msg.includes('column')) {
      logApiResponse('POST', '/api/payment/alpha-purchase', 500, {
        error: 'Schema mismatch — please contact support',
        extras: { details: msg.slice(0, 200) },
      })
      return NextResponse.json({
        error: 'A database schema mismatch was detected. The application has been deployed incorrectly. Please contact support.',
        code: 'SCHEMA_MISMATCH',
      }, { status: 500 })
    }

    // 🔑 Handle "Server has closed the connection" — this happens when
    // Neon drops an idle connection (direct connections, not pooled).
    // The fix is documented in src/lib/prisma.ts:
    //   1. Use the Neon **pooled** connection string (-pooler suffix)
    //   2. Set PRISMA_CONNECTION_LIMIT env var for higher concurrency
    if (
      msg.toLowerCase().includes('closed the connection') ||
      msg.toLowerCase().includes('connection terminated') ||
      msg.toLowerCase().includes('connection pool exhausted') ||
      msg.toLowerCase().includes('timeout')
    ) {
      logApiResponse('POST', '/api/payment/alpha-purchase', 503, {
        error: 'Database connection temporarily unavailable',
        extras: { details: msg.slice(0, 200) },
      })
      return NextResponse.json({
        error: 'Database connection temporarily unavailable. Our payment system uses a direct database connection that may drop after idle periods. Please try again — your payment will be processed correctly.',
        code: 'DB_CONNECTION_CLOSED',
        retry: true,
      }, { status: 503 })
    }

    logApiResponse('POST', '/api/payment/alpha-purchase', 500, { error: msg })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
