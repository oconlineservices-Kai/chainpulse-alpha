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

export const POST = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Defensive check: email is required for DB lookup
  if (!req.auth.user?.email) {
    return NextResponse.json(
      { error: 'User email not found in session. Please log out and log in again.' },
      { status: 401 }
    )
  }

  try {
    const { amount, plan } = await req.json()

    if (!amount || !plan) {
      return NextResponse.json(
        { error: 'Amount and plan are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: req.auth.user?.email! }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create Razorpay order
    const razorpay = getRazorpay()
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise (INR) or cents (USD)
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
        amount: amount,
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
