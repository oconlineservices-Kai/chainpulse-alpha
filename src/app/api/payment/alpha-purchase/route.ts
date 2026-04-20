/**
 * /api/payment/alpha-purchase — Pay-per-Alpha Signal Purchase
 *
 * Creates a Razorpay order for a one-time signal purchase.
 * Users pay a small fee to unlock a single Diamond/Whale signal
 * without subscribing to premium.
 *
 * Flow:
 *   1. POST with { signalId, signalType } → get Razorpay orderId
 *   2. User completes payment via Razorpay UI
 *   3. POST /api/payment/alpha-verify with razorpay_* fields → signal unlocked
 */

import Razorpay from 'razorpay'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Signal tier pricing (in INR paise — 1 INR = 100 paise)
const SIGNAL_PRICES: Record<string, { amountPaise: number; label: string }> = {
  diamond: { amountPaise: 29900, label: '💎 Diamond Signal — ₹299' },  // ₹299
  whale:   { amountPaise: 19900, label: '🐋 Whale Signal — ₹199' },    // ₹199
  default: { amountPaise: 9900,  label: '📊 Alpha Signal — ₹99' },     // ₹99
}

function getRazorpay() {
  const keyId     = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) throw new Error('Razorpay credentials not configured')
  return new Razorpay({ key_id: keyId, key_secret: keySecret })
}

// ── POST /api/payment/alpha-purchase ─────────────────────────────────────────
export const POST = auth(async (req) => {
  if (!req.auth?.user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { signalId, signalType = 'default' } = body as {
      signalId?: string
      signalType?: 'diamond' | 'whale' | 'default'
    }

    if (!signalId) {
      return NextResponse.json({ error: 'signalId is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: req.auth.user.email },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already purchased this signal
    const existing = await prisma.alphaPurchase.findFirst({
      where: { userId: user.id, signalId },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Signal already purchased', alreadyOwned: true },
        { status: 409 }
      )
    }

    // Check if user has enough credits (1 credit = free purchase)
    if (user.credits >= 1) {
      // Deduct 1 credit and unlock signal immediately
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
          },
        }),
      ])

      return NextResponse.json({
        success: true,
        method: 'credits',
        creditsRemaining: user.credits - 1,
        message: '1 credit used — signal unlocked!',
      })
    }

    // No credits — create a Razorpay payment order
    const pricing = SIGNAL_PRICES[signalType] ?? SIGNAL_PRICES.default
    const razorpay = getRazorpay()

    const order = await razorpay.orders.create({
      amount:   pricing.amountPaise,
      currency: 'INR',
      receipt:  `alpha_${signalId.slice(0, 8)}_${Date.now()}`,
      notes:    { userId: user.id, signalId, signalType, purchaseType: 'alpha' },
    })

    // Record pending transaction
    const txn = await prisma.transaction.create({
      data: {
        userId:          user.id,
        provider:        'razorpay',
        transactionType: 'alpha_purchase',
        providerPaymentId: order.id,
        amount:          pricing.amountPaise / 100,
        currency:        'INR',
        status:          'pending',
        metadata:        { signalId, signalType },
      },
    })

    return NextResponse.json({
      success:     true,
      method:      'payment',
      orderId:     order.id,
      amount:      order.amount,
      currency:    order.currency,
      keyId:       process.env.RAZORPAY_KEY_ID,
      label:       pricing.label,
      transactionId: txn.id,
      signalId,
    })
  } catch (error) {
    console.error('[alpha-purchase] Error:', error)
    return NextResponse.json({ error: 'Failed to create purchase order' }, { status: 500 })
  }
})
