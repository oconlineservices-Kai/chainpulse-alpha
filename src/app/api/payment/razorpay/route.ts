import Razorpay from 'razorpay'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!
  })
}

// Server-side canonical pricing — NEVER trust client-provided amounts
const PLAN_PRICES: Record<string, number> = {
  'Premium Monthly': 4900,   // INR paise (₹49)
  'Premium Yearly': 3900,    // INR paise (₹39/mo billed annually = ₹468)
  'Pay Per Alpha': 100,      // INR paise (₹1 per credit)
}

export const POST = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { plan } = body

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan is required' },
        { status: 400 }
      )
    }

    // Server-side price lookup — ignore any client-provided amount
    const serverAmount = PLAN_PRICES[plan]
    if (!serverAmount) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: req.auth.user?.email! }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create Razorpay order using server-side amount
    const razorpay = getRazorpay()
    const order = await razorpay.orders.create({
      amount: serverAmount, // Amount in paise — from server config, NOT client input
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: user.id,
        plan: plan
      }
    })

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: user.id,
        provider: 'razorpay',
        transactionType: 'subscription',
        providerPaymentId: order.id,
        amount: serverAmount / 100, // Store in INR rupees
        currency: 'INR',
        status: 'pending'
      }
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    })
  } catch (error) {
    console.error('Razorpay order error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
})
