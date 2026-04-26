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
    let amount: number, plan: string
    try {
      const body = await req.json()
      amount = body.amount
      plan = body.plan
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid request body — could not parse JSON' },
        { status: 400 }
      )
    }

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
    let order
    try {
      order = await razorpay.orders.create({
        amount: amount * 100, // Razorpay expects amount in paise (INR) or cents (USD)
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          userId: user.id,
          plan: plan
        }
      })
    } catch (razorpayError: any) {
      console.error('Razorpay API error:', razorpayError)
      const rzpMsg = razorpayError?.error?.description
        || razorpayError?.message
        || 'Razorpay order creation failed'
      return NextResponse.json(
        { error: `Payment gateway error: ${rzpMsg}` },
        { status: 502 }
      )
    }

    // Create transaction record
    try {
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
    } catch (dbError: any) {
      console.error('Database error creating transaction:', dbError)
      // Order was created but DB record failed — still return success to user
      // since the order exists in Razorpay and can be matched during verification
      console.warn('Proceeding without DB transaction record for order:', order.id)
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    })
  } catch (error) {
    console.error('Razorpay order error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to create order: ${message}` },
      { status: 500 }
    )
  }
})
