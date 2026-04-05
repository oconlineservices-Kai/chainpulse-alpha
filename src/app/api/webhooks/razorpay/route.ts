import crypto from 'crypto'
import { prisma } from '@/lib/db'
import { notifyPremiumUser } from '@/lib/telegram'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')
    
    if (!signature || !verifyWebhook(body, signature)) {
      return Response.json({ error: 'Invalid signature' }, { status: 400 })
    }
    
    const event = JSON.parse(body)
    
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity)
        break
      case 'subscription.charged':
        await handleSubscriptionCharged(event.payload.subscription.entity)
        break
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.payload.subscription.entity)
        break
    }
    
    return Response.json({ received: true })
  } catch (error) {
    console.error('Razorpay webhook error:', error)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}

function verifyWebhook(body: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')
  return signature === expected
}

async function handlePaymentCaptured(payment: any) {
  // Pay-per-alpha: $1 = 1 credit
  if (payment.amount !== 100) return
  
  const email = payment.email
  
  let user = await prisma.user.findUnique({ where: { email } })
  
  if (!user) {
    user = await prisma.user.create({
      data: { email, credits: 1 }
    })
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { credits: { increment: 1 }, updatedAt: new Date() }
    })
  }
  
  await prisma.transaction.create({
    data: {
      userId: user.id,
      provider: 'razorpay',
      transactionType: 'pay_per_alpha',
      providerPaymentId: payment.id,
      amount: 1,
      currency: payment.currency,
      status: 'captured',
      creditsAdded: 1,
    }
  })
}

async function handleSubscriptionCharged(subscription: any) {
  const email = subscription.email
  const amount = subscription.amount / 100
  
  let user = await prisma.user.findUnique({ where: { email } })
  
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + 30)
  
  if (!user) {
    user = await prisma.user.create({
      data: { 
        email, 
        premiumStatus: 'premium',
        premiumExpiresAt: expiryDate
      }
    })
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { 
        premiumStatus: 'premium',
        premiumExpiresAt: expiryDate,
        updatedAt: new Date()
      }
    })
  }
  
  await prisma.transaction.create({
    data: {
      userId: user.id,
      provider: 'razorpay',
      transactionType: 'subscription',
      providerPaymentId: subscription.id,
      providerSubscriptionId: subscription.subscription_id,
      amount,
      currency: subscription.currency,
      status: 'captured',
    }
  })
  
  await notifyPremiumUser(user.id, 'subscription_activated')
}

async function handleSubscriptionCancelled(subscription: any) {
  const email = subscription.email
  
  const user = await prisma.user.findUnique({ where: { email } })
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { premiumStatus: 'cancelled', updatedAt: new Date() }
    })
  }
}
