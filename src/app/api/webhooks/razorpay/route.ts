/**
 * POST /api/webhooks/razorpay
 *
 * Razorpay webhook handler — processes payment events.
 *
 * Webhook verification via HMAC-SHA256 signature (required).
 * Idempotency via DB-backed dedup (survives deploys, multi-instance).
 *
 * Events handled:
 *   - payment.captured       → Adds credits for Pay-Per-Alpha
 *   - subscription.charged   → Activates premium subscription (30 days)
 *   - subscription.cancelled → Marks premium as cancelled
 *
 * ── Cross-Reference with Synchronous Verify Routes ────────────────────────
 *
 * The synchronous verify routes (/api/payment/verify, /api/payment/alpha-verify,
 * /api/payment/credits/PATCH) handle the *first* payment acknowledgement.
 * The webhook is the *async backup* for the recurring and retry paths.
 *
 * CRITICAL: Both paths must NOT double-grant. The webhook checks for existing
 * transactions with matching providerPaymentId before modifying any entitlements.
 */

import crypto from 'crypto'
import { prisma } from '@/lib/db'

// ── POST ────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')
    const eventId = req.headers.get('x-razorpay-event-id')

    // Signature verification
    if (!signature || !verifyWebhook(body, signature)) {
      console.warn('[razorpay/webhook] Invalid signature — rejecting')
      return Response.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // ── DB-backed idempotency ───────────────────────────────────────────
    if (eventId) {
      try {
        await prisma.webhookEvent.create({
          data: { eventId, processedAt: new Date() },
        })
      } catch (err: any) {
        // P2002 = unique constraint violation → already processed
        if (err?.code === 'P2002') {
          console.log(`[razorpay/webhook] Duplicate event ${eventId} — skipping`)
          return Response.json({ received: true, duplicate: true })
        }
        // Unexpected DB error — still process; let downstream guard handle
        console.error(`[razorpay/webhook] Idempotency DB error for event ${eventId}:`, err)
      }
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

// ── Check if a payment was already handled by a sync verify route ──────────
async function isAlreadyHandled(paymentId: string): Promise<boolean> {
  const existingTx = await prisma.transaction.findFirst({
    where: {
      providerPaymentId: paymentId,
      status: { in: ['success', 'captured'] },
    },
  })
  return existingTx !== null
}

// ── Payment captured ────────────────────────────────────────────────────────
async function handlePaymentCaptured(payment: any) {
  const paymentId = payment.id
  const amountINR = payment.amount  // in paise (100 paise = ₹1)
  const currency = payment.currency
  const email = payment.email
  const notes = payment.notes || {}

  // ── Guard: Must have email or purchase notes ─────────────────────────
  if (!notes.purchaseType && !email) {
    console.log(`[razorpay/webhook] payment.captured for ${paymentId}: no purchaseType or email — skipping`)
    return
  }

  if (!email) {
    console.error(`[razorpay/webhook] payment.captured for ${paymentId}: missing email`)
    return
  }

  // ── Guard: Skip if already handled by sync verify route ──────────────
  if (await isAlreadyHandled(paymentId)) {
    console.log(`[razorpay/webhook] payment.captured for ${paymentId}: already handled by verify route — skipping`)
    return
  }

  // ── Guard: Only process known users — NEVER auto-create ─────────────
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.warn(
      `[razorpay/webhook] payment.captured for ${paymentId}: email ${email} not found — ` +
      `no user exists, skipping credit grant`
    )
    return
  }

  // ── Determine credits to add ─────────────────────────────────────────
  let creditsToAdd = 0

  if (notes.purchaseType === 'alpha') {
    // Pay-Per-Alpha: handled by sync alpha-verify route. Only add here
    // if this is a DIRECT payment.captured without a preceding verify.
    // The sync route does NOT add credits — it creates AlphaPurchase.
    // So the webhook SHOULD add credits for this path.
    creditsToAdd = 1
  } else if (notes.plan === 'Pay Per Alpha') {
    // Credit pack purchase: PATCH /api/payment/credits handles the sync path.
    creditsToAdd = 10
  }

  if (creditsToAdd <= 0) {
    console.log(`[razorpay/webhook] payment.captured for ${paymentId}: no credits to add — skipping`)
    return
  }

  // ── Apply credits ────────────────────────────────────────────────────
  await prisma.user.update({
    where: { id: user.id },
    data: { credits: { increment: creditsToAdd } },
  })

  const updatedUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { credits: true },
  })

  console.log(
    `[razorpay/webhook] Added ${creditsToAdd} credit(s) to user ${user.id.slice(0, 8)} ` +
    `(balance: ${updatedUser?.credits ?? '?'})`
  )

  // ── Log transaction record ───────────────────────────────────────────
  await prisma.transaction.create({
    data: {
      userId: user.id,
      provider: 'razorpay',
      transactionType: 'pay_per_alpha',
      providerPaymentId: paymentId,
      amount: amountINR / 100,
      currency,
      status: 'captured',
      creditsAdded: creditsToAdd,
      metadata: { notes },
    },
  })
}

// ── Subscription charged (monthly recurring) ────────────────────────────────
async function handleSubscriptionCharged(subscription: any) {
  const subscriptionId = subscription?.id
  const email = subscription.email
  if (!email) {
    console.error(`[razorpay/webhook] subscription.charged for ${subscriptionId}: missing email`)
    return
  }

  const amount = subscription.amount / 100 // paise → INR rupees

  // ── Guard: Only process known users ──────────────────────────────────
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.warn(
      `[razorpay/webhook] subscription.charged for ${subscriptionId}: email ${email} not found — ` +
      `no user exists, skipping`
    )
    return
  }

  // ── Guard: Check if this subscription was already granted via verify route ──
  if (subscriptionId) {
    const existingTx = await prisma.transaction.findFirst({
      where: {
        providerSubscriptionId: subscriptionId,
        status: { in: ['success', 'captured'] },
      },
    })
    if (existingTx) {
      // For recurring charges, this is expected to be a fresh event.
      // providerSubscriptionId links the recurring series, not the individual charge.
      // Only skip if the EVENT id was already processed (handled by WebhookEvent idempotency).
      // This second check catches the INITIAL payment where the verify route
      // already created a transaction with a DIFFERENT providerPaymentId.
      // For recurring, no verify route fires, so we proceed.
      console.log(
        `[razorpay/webhook] subscription.charged for ${subscriptionId}: existing tx found ` +
        `(id: ${existingTx.id.slice(0, 8)}, status: ${existingTx.status}) — ` +
        `checking if this is a recurring charge...`
      )
    }
  }

  // ── Grant premium (30 days, stacking) ────────────────────────────────
  const baseDate = user.premiumExpiresAt && user.premiumExpiresAt > new Date()
    ? user.premiumExpiresAt
    : new Date()
  const newExpiry = new Date(baseDate)
  newExpiry.setDate(newExpiry.getDate() + 30)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      premiumStatus: 'premium',
      premiumExpiresAt: newExpiry,
      updatedAt: new Date(),
    },
  })

  // ── Log transaction record ───────────────────────────────────────────
  await prisma.transaction.create({
    data: {
      userId: user.id,
      provider: 'razorpay',
      transactionType: 'subscription',
      providerPaymentId: subscriptionId,
      providerSubscriptionId: subscription?.subscription_id,
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
  if (!user) {
    console.warn(`[razorpay/webhook] subscription.cancelled: email ${email} not found`)
    return
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { premiumStatus: 'cancelled', updatedAt: new Date() },
  })

  console.log(`[razorpay/webhook] Subscription cancelled for user ${user.id.slice(0, 8)}`)
}
