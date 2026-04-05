import { prisma } from '@/lib/db'
import { notifyPremiumUser } from '@/lib/telegram'

export async function POST(req: Request) {
  try {
    // PayPal webhook verification would go here
    const event = await req.json()
    
    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.PAYMENT.COMPLETED':
        await handleSubscriptionPayment(event.resource)
        break
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(event.resource)
        break
      case 'CHECKOUT.ORDER.COMPLETED':
        await handleOrderCompleted(event.resource)
        break
    }
    
    return Response.json({ received: true })
  } catch (error) {
    console.error('PayPal webhook error:', error)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}

async function handleSubscriptionPayment(resource: any) {
  const email = resource.subscriber?.email_address
  if (!email) return
  
  const amount = parseFloat(resource.billing_info?.last_payment?.amount?.value || 0)
  const subscriptionId = resource.id
  
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
      provider: 'paypal',
      transactionType: 'subscription',
      providerPaymentId: subscriptionId,
      providerSubscriptionId: subscriptionId,
      amount,
      currency: 'USD',
      status: 'captured',
    }
  })
  
  await notifyPremiumUser(user.id, 'subscription_activated')
}

async function handleSubscriptionCancelled(resource: any) {
  const email = resource.subscriber?.email_address
  if (!email) return
  
  const user = await prisma.user.findUnique({ where: { email } })
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { premiumStatus: 'cancelled', updatedAt: new Date() }
    })
  }
}

async function handleOrderCompleted(resource: any) {
  const amount = parseFloat(resource.purchase_units?.[0]?.amount?.value || 0)
  
  // Only process $1 orders for pay-per-alpha
  if (amount !== 1.0) return
  
  const email = resource.payer?.email_address
  if (!email) return
  
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
      provider: 'paypal',
      transactionType: 'pay_per_alpha',
      providerPaymentId: resource.id,
      amount: 1,
      currency: 'USD',
      status: 'captured',
      creditsAdded: 1,
    }
  })
}
