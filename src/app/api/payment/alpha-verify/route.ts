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

export const dynamic = 'force-dynamic'

export const POST = auth(async (req) => {
  if (!req.auth?.user?.email) {
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
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify Razorpay signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSig !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: req.auth.user.email },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check for duplicate
    const existing = await prisma.alphaPurchase.findFirst({
      where: { userId: user.id, signalId },
    })
    if (existing) {
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

      // Create alpha purchase record
      const txRecord = transactionId
        ? await tx.transaction.findUnique({ where: { id: transactionId } })
        : null

      await tx.alphaPurchase.create({
        data: {
          userId:        user.id,
          transactionId: txRecord?.id ?? null,
          signalId,
          creditsUsed:   0, // paid, not credit-based
        },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Signal unlocked successfully!',
      signalId,
    })
  } catch (error) {
    console.error('[alpha-verify] Error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
})
