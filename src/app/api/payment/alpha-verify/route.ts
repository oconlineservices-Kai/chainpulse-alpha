/**
 * /api/payment/alpha-verify — Verify Razorpay payment for alpha signal purchase
 *
 * Called after Razorpay checkout completes successfully.
 * Verifies the signature, marks transaction as success, and creates AlphaPurchase record.
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { checkRateLimit, getClientIP, getRateLimitKey } from '@/lib/security'
import { logApiResponse } from '@/lib/api/response-logger'

export const dynamic = 'force-dynamic'

export const POST = auth(async (req) => {
  const email = req.auth?.user?.email as string | undefined

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

    const email = req.auth!.user.email!
    const user = await prisma.user.findUnique({
      where: { email },
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
    logApiResponse('POST', '/api/payment/alpha-verify', 500, { email, error: msg })
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
})
