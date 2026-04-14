import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export const POST = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    } = await req.json()

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    const isAuthentic = expectedSignature === razorpay_signature

    if (!isAuthentic) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Update transaction
    await prisma.transaction.updateMany({
      where: { providerPaymentId: razorpay_order_id },
      data: {
        providerPaymentId: razorpay_payment_id,
        status: 'success'
      }
    })

    // Get user and update premium status
    const user = await prisma.user.findUnique({
      where: { email: req.auth.user?.email! }
    })

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          premiumStatus: 'premium',
          premiumExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
})
