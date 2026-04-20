/**
 * /api/payment/credits — Purchase Alpha Signal Credits
 *
 * Users can buy credit bundles to unlock individual signals.
 * Credits are cheaper than pay-per-signal (bulk discount).
 *
 * Credit Packs:
 *   - 5 credits  → ₹399  (₹80/signal vs ₹99)
 *   - 10 credits → ₹699  (₹70/signal vs ₹99)
 *   - 25 credits → ₹1499 (₹60/signal vs ₹99)
 */

import Razorpay from 'razorpay'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const CREDIT_PACKS: Record<string, { credits: number; amountPaise: number; label: string }> = {
  starter:    { credits: 5,  amountPaise: 39900,  label: '⚡ Starter Pack — 5 credits (₹399)' },
  value:      { credits: 10, amountPaise: 69900,  label: '🔥 Value Pack — 10 credits (₹699)' },
  pro:        { credits: 25, amountPaise: 149900, label: '💎 Pro Pack — 25 credits (₹1,499)' },
}

function getRazorpay() {
  const keyId     = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) throw new Error('Razorpay credentials not configured')
  return new Razorpay({ key_id: keyId, key_secret: keySecret })
}

// ── POST /api/payment/credits — Create order ─────────────────────────────────
export const POST = auth(async (req) => {
  if (!req.auth?.user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const { pack } = await req.json() as { pack: string }

    const packConfig = CREDIT_PACKS[pack]
    if (!packConfig) {
      return NextResponse.json(
        { error: `Invalid pack. Choose: ${Object.keys(CREDIT_PACKS).join(', ')}` },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: req.auth.user.email },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const razorpay = getRazorpay()
    const order = await razorpay.orders.create({
      amount:   packConfig.amountPaise,
      currency: 'INR',
      receipt:  `credits_${pack}_${Date.now()}`,
      notes:    { userId: user.id, pack, credits: String(packConfig.credits), purchaseType: 'credits' },
    })

    const txn = await prisma.transaction.create({
      data: {
        userId:          user.id,
        provider:        'razorpay',
        transactionType: 'credits',
        providerPaymentId: order.id,
        amount:          packConfig.amountPaise / 100,
        currency:        'INR',
        status:          'pending',
        creditsAdded:    packConfig.credits,
        metadata:        { pack, credits: packConfig.credits },
      },
    })

    return NextResponse.json({
      orderId:       order.id,
      amount:        order.amount,
      currency:      order.currency,
      keyId:         process.env.RAZORPAY_KEY_ID,
      label:         packConfig.label,
      credits:       packConfig.credits,
      transactionId: txn.id,
    })
  } catch (error) {
    console.error('[credits] Order error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
})

// ── PATCH /api/payment/credits — Verify payment & credit account ──────────────
export const PATCH = auth(async (req) => {
  if (!req.auth?.user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      transactionId,
    } = await req.json()

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: req.auth.user.email },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get transaction to know how many credits to add
    const txn = await prisma.transaction.findUnique({ where: { id: transactionId } })
    if (!txn || txn.userId !== user.id) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const creditsToAdd = txn.creditsAdded

    await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transactionId },
        data:  { providerPaymentId: razorpay_payment_id, status: 'success' },
      }),
      prisma.user.update({
        where: { id: user.id },
        data:  { credits: { increment: creditsToAdd } },
      }),
    ])

    return NextResponse.json({
      success:        true,
      creditsAdded:   creditsToAdd,
      newBalance:     user.credits + creditsToAdd,
      message:        `${creditsToAdd} credits added to your account!`,
    })
  } catch (error) {
    console.error('[credits] Verify error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
})

// ── GET /api/payment/credits — Return available packs ────────────────────────
export async function GET() {
  return NextResponse.json({
    packs: Object.entries(CREDIT_PACKS).map(([id, p]) => ({
      id,
      credits:      p.credits,
      amountINR:    p.amountPaise / 100,
      pricePerUnit: Math.round(p.amountPaise / p.credits) / 100,
      label:        p.label,
    })),
  })
}
