/**
 * /api/payment/alpha-verify — Verify Razorpay payment for alpha signal purchase
 *
 * Called after Razorpay checkout completes successfully.
 * Verifies the signature, marks transaction as success, and creates AlphaPurchase record.
 */

import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { checkRateLimit, getClientIP, getRateLimitKey } from '@/lib/security'
import { logApiResponse } from '@/lib/api/response-logger'
import { getRequestEmail } from '@/lib/auth-request'

export const dynamic = 'force-dynamic'

/**
 * Get the authenticated user from the request's session cookie directly.
 * This is more reliable than calling auth() in a route-handler context,
 * because it reads the cookie from the incoming request (not from next/headers)
 * and decodes the JWT using @auth/core's own decode function.
 */
async function getSessionEmail(req: NextRequest): Promise<string | null> {
  try {
    return await getRequestEmail(req)
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  // Get session by decoding the JWT from the request cookie directly
  const email = await getSessionEmail(req)

  // Rate limiting: 10 requests per IP per minute
  const clientIp = getClientIP(req)
  const rateKey = getRateLimitKey(clientIp, 'payment:alpha-verify')
  if (!checkRateLimit(rateKey, 10, 60 * 1000)) {
    logApiResponse('POST', '/api/payment/alpha-verify', 429, { email: email ?? undefined, error: 'Rate limit exceeded' })
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  if (!email) {
    logApiResponse('POST', '/api/payment/alpha-verify', 401, { error: 'Unauthorized' })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      signalId,
      transactionId,
    } = await req.json()

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !signalId) {
      logApiResponse('POST', '/api/payment/alpha-verify', 400, { error: 'Missing required fields' })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify Razorpay signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSig !== razorpay_signature) {
      logApiResponse('POST', '/api/payment/alpha-verify', 400, { error: 'Invalid signature' })
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email! },
    })
    if (!user) {
      logApiResponse('POST', '/api/payment/alpha-verify', 404, { email, error: 'User not found' })
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check for duplicate
    const existing = await prisma.alphaPurchase.findFirst({
      where: { userId: user.id, signalId },
    })
    if (existing) {
      logApiResponse('POST', '/api/payment/alpha-verify', 200, { email, extras: { signalId, alreadyOwned: true } })
      return NextResponse.json({ success: true, alreadyOwned: true })
    }

    // Update transaction & create purchase record atomically
    await prisma.$transaction(async (tx) => {
      // Update transaction status
      if (transactionId) {
        await tx.transaction.update({
          where: { id: transactionId },
          data: {
            providerPaymentId: razorpay_payment_id,
            status: 'success',
          },
        })
      } else {
        // Find by order ID if transactionId not provided
        await tx.transaction.updateMany({
          where: { providerPaymentId: razorpay_order_id },
          data: {
            providerPaymentId: razorpay_payment_id,
            status: 'success',
          },
        })
      }

      // Create alpha purchase record (valid for 30 days)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

      const txRecord = transactionId
        ? await tx.transaction.findUnique({ where: { id: transactionId } })
        : null

      await tx.alphaPurchase.create({
        data: {
          userId:        user.id,
          transactionId: txRecord?.id ?? null,
          signalId,
          creditsUsed:   0, // paid, not credit-based
          expiresAt:     thirtyDaysFromNow,
        },
      })
    })

    logApiResponse('POST', '/api/payment/alpha-verify', 200, {
      email,
      extras: { signalId, transactionId: transactionId?.slice(0, 8) },
    })
    return NextResponse.json({
      success: true,
      message: 'Signal unlocked successfully!',
      signalId,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Verification failed'

    // 🔑 Handle "Server has closed the connection" — see alpha-purchase for details
    if (
      msg.toLowerCase().includes('closed the connection') ||
      msg.toLowerCase().includes('connection terminated') ||
      msg.toLowerCase().includes('connection pool exhausted') ||
      msg.toLowerCase().includes('timeout')
    ) {
      logApiResponse('POST', '/api/payment/alpha-verify', 503, {
        email,
        error: 'Database connection temporarily unavailable',
        extras: { details: msg.slice(0, 200) },
      })
      return NextResponse.json({
        error: 'Database connection temporarily unavailable. Please try again — your payment will still be verified.',
        code: 'DB_CONNECTION_CLOSED',
        retry: true,
      }, { status: 503 })
    }

    logApiResponse('POST', '/api/payment/alpha-verify', 500, { email, error: msg })
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
