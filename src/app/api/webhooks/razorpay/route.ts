/**
 * POST /api/webhooks/razorpay
 *
 * Razorpay webhook handler — processes payment events.
 *
 * Webhook verification via HMAC-SHA256 signature (required).
 * Idempotency via x-razorpay-event-id header (in-memory 24h TTL).
 *
 * Events handled:
 *   - payment.captured       → Adds credits for Pay-Per-Alpha
 *   - subscription.charged   → Activates premium subscription (30 days)
 *   - subscription.cancelled → Marks premium as cancelled
 *
 * ⚠ DEPLOYMENT: For multi-instance deployments, replace the in-memory
 * idempotency store with Redis or DB-backed dedup.
 */

import crypto from 'crypto'
import { prisma } from '@/lib/db'

// ── Idempotency (in-memory; replace with Redis for multi-instance) ──────────
const processedEvents = new Map<string, number>()
const EVENT_TTL = 24 * 60 * 60 * 1000

function isAlreadyProcessed(eventId: string): boolean {
  const ts = processedEvents.get(eventId)
  if (!ts) return false
  if (Date.now() - ts > EVENT_TTL) {
    processedEvents.delete(eventId)
    return false
  }
  return true
}

// ── POST ────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')
    const eventId = req.headers.get('x-razorpay-event-id') ?? null

    // Signature verification
    if (!signature || !verifyWebhook(body, signature)) {
      return Response.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Idempotency check (skip duplicates)
    if (eventId && isAlreadyProcessed(eventId)) {
      return Response.json({ received: true, duplicate: true })
    }
    if (eventId) {
      processedEvents.set(eventId, Date.now())
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
      default:
        console.log(`[razorpay/webhook] Unhandled event type: ${event.event}`)
    }

    return Response.json({ received: true })
  } catch (error) {
    console.error('[razorpay/webhook] Error:', error)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}

// ── Signature verification ──────────────────────────────────────────────────
function verifyWebhook(body: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) {
    console.error('[razorpay/webhook] RAZORPAY_WEBHOOK_SECRET not set')
    return false
  }
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

// ── Payment captured (Pay-Per-Alpha: $1 = 1 credit) ─────────────────────────
async function handlePaymentCaptured(payment: any) {
  const amountINR = payment.amount  // in paise (100 paise = ₹1 = ~$0.012)
  const currency = payment.currency

  if (!payment.notes?.purchaseType && !payment.email) return // Not one of ours

  const email = payment.email
  if (!email) {
    console.error('[razorpay/webhook] payment.captured missing email')
    return
  }

  let user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    user = await prisma.user.create({
      data: { email, credits: 0 },
    })
  }

  // Determine credits to add based on order notes or fallback
  const notes = payment.notes || {}
  let creditsToAdd = 1 // default: 1 credit per capture

  if (notes.purchaseType === 'alpha') {
    creditsToAdd = 1
  } else if (notes.plan === 'Pay Per Alpha') {
    creditsToAdd = 10 // standard credit pack
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { credits: { increment: creditsToAdd } },
  })

  // Fetch updated user to log correct balance
  const updatedUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { credits: true },
  })

  console.log(
    `[razorpay/webhook] Added ${creditsToAdd} credit(s) to user ${user.id.slice(0, 8)} ` +
    `(balance: ${updatedUser?.credits ?? '?'})`
  )

  await prisma.transaction.create({
    data: {
      userId: user.id,
      provider: 'razorpay',
      transactionType: 'pay_per_alpha',
      providerPaymentId: payment.id,
      amount: amountINR / 100, // convert paise → INR rupees
      currency,
      status: 'captured',
      creditsAdded: creditsToAdd,
      metadata: { notes },
    },
  })
}

// ── Subscription charged (monthly recurring) ────────────────────────────────
async function handleSubscriptionCharged(subscription: any) {
  const email = subscription.email
  if (!email) {
    console.error('[razorpay/webhook] subscription.charged missing email')
    return
  }

  const amount = subscription.amount / 100 // paise → INR rupees

  let user = await prisma.user.findUnique({ where: { email } })

  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + 30)

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        premiumStatus: 'premium',
        premiumExpiresAt: expiryDate,
      },
    })
  } else {
    // Extend expiry from now (or from existing expiry if still valid)
    const baseDate = user.premiumExpiresAt && user.premiumExpiresAt > new Date()
      ? user.premiumExpiresAt
      : new Date()
    const newExpiry = new Date(baseDate)
    newExpiry.setDate(newExpiry.getDate() + 30)

    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        premiumStatus: 'premium',
        premiumExpiresAt: newExpiry,
        updatedAt: new Date(),
      },
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
      currency: subscription.currency || 'INR',
      status: 'captured',
    },
  })

  console.log(`[razorpay/webhook] Subscription activated for user ${user.id.slice(0, 8)}`)
}

// ── Subscription cancelled ──────────────────────────────────────────────────
async function handleSubscriptionCancelled(subscription: any) {
  const email = subscription.email
  if (!email) {
    console.error('[razorpay/webhook] subscription.cancelled missing email')
    return
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { premiumStatus: 'cancelled', updatedAt: new Date() },
    })
    console.log(`[razorpay/webhook] Subscription cancelled for user ${user.id.slice(0, 8)}`)
  }
}
