# CHAINPULSE ALPHA — WEBHOOK LOGIC SPECIFICATION

## 1. DATABASE SCHEMA (Neon Postgres)

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    wallet_address VARCHAR(42) UNIQUE,
    premium_status VARCHAR(20) DEFAULT 'free', -- 'free', 'premium', 'cancelled'
    premium_expires_at TIMESTAMP,
    credits INTEGER DEFAULT 0, -- For pay-per-alpha
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table (Razorpay + PayPal)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    provider VARCHAR(20) NOT NULL, -- 'razorpay', 'paypal'
    transaction_type VARCHAR(30) NOT NULL, -- 'subscription', 'pay_per_alpha'
    provider_payment_id VARCHAR(100) NOT NULL,
    provider_subscription_id VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) NOT NULL, -- 'captured', 'failed', 'refunded'
    credits_added INTEGER DEFAULT 0, -- For pay-per-alpha
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pay-per-alpha purchases
CREATE TABLE alpha_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    transaction_id UUID REFERENCES transactions(id),
    signal_id UUID NOT NULL,
    credits_used INTEGER DEFAULT 1,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Signals table (for reference)
CREATE TABLE signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_symbol VARCHAR(20) NOT NULL,
    token_name VARCHAR(100),
    sentiment_score INTEGER, -- 0-100
    whale_confidence INTEGER, -- 0-100
    correlation_score INTEGER, -- 0-100
    is_diamond_signal BOOLEAN DEFAULT FALSE,
    twitter_mentions INTEGER,
    whale_wallets TEXT[], -- Array of wallet addresses
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);
```

---

## 2. RAZORPAY WEBHOOK LOGIC

### Endpoint: `POST /api/webhooks/razorpay`

```javascript
// Webhook Handler Structure

const crypto = require('crypto');

async function handleRazorpayWebhook(req, res) {
    // 1. Verify webhook signature
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');
    
    if (signature !== expectedSignature) {
        return res.status(400).json({ error: 'Invalid signature' });
    }
    
    const event = req.body.event;
    const payload = req.body.payload;
    
    // 2. Handle events
    switch(event) {
        case 'payment.captured':
            await handlePaymentCaptured(payload.payment.entity);
            break;
            
        case 'subscription.charged':
            await handleSubscriptionCharged(payload.subscription.entity);
            break;
            
        case 'subscription.cancelled':
            await handleSubscriptionCancelled(payload.subscription.entity);
            break;
            
        case 'subscription.pending':
            await handleSubscriptionPending(payload.subscription.entity);
            break;
    }
    
    res.status(200).json({ received: true });
}

// SUBSCRIPTION PAYMENT HANDLER
async function handleSubscriptionCharged(payment) {
    const subscriptionId = payment.subscription_id;
    const customerEmail = payment.email;
    const amount = payment.amount / 100; // Convert from paise
    
    // Find or create user
    let user = await db.query('SELECT * FROM users WHERE email = $1', [customerEmail]);
    
    if (!user.rows[0]) {
        const newUser = await db.query(
            'INSERT INTO users (email, premium_status, premium_expires_at) VALUES ($1, $2, $3) RETURNING *',
            [customerEmail, 'premium', calculateExpiryDate(30)]
        );
        user = newUser;
    } else {
        // Update existing user to premium
        await db.query(
            'UPDATE users SET premium_status = $1, premium_expires_at = $2, updated_at = NOW() WHERE id = $3',
            ['premium', calculateExpiryDate(30), user.rows[0].id]
        );
    }
    
    // Record transaction
    await db.query(
        `INSERT INTO transactions 
         (user_id, provider, transaction_type, provider_payment_id, provider_subscription_id, amount, currency, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [user.rows[0].id, 'razorpay', 'subscription', payment.id, subscriptionId, amount, payment.currency, 'captured']
    );
    
    // Trigger Telegram bot notification
    await notifyPremiumUser(user.rows[0].id, 'subscription_activated');
}

// PAY-PER-ALPHA HANDLER
async function handlePaymentCaptured(payment) {
    // Check if this is a pay-per-alpha purchase (amount = $1)
    if (payment.amount !== 100) return; // 100 paise = $1
    
    const customerEmail = payment.email;
    const notes = payment.notes || {};
    
    // Find user
    let user = await db.query('SELECT * FROM users WHERE email = $1', [customerEmail]);
    
    if (!user.rows[0]) {
        // Create user with 1 credit
        const newUser = await db.query(
            'INSERT INTO users (email, credits) VALUES ($1, $2) RETURNING *',
            [customerEmail, 1]
        );
        user = newUser;
    } else {
        // Add 1 credit
        await db.query(
            'UPDATE users SET credits = credits + 1, updated_at = NOW() WHERE id = $1',
            [user.rows[0].id]
        );
    }
    
    // Record transaction
    await db.query(
        `INSERT INTO transactions 
         (user_id, provider, transaction_type, provider_payment_id, amount, currency, status, credits_added)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [user.rows[0].id, 'razorpay', 'pay_per_alpha', payment.id, 1, payment.currency, 'captured', 1]
    );
    
    // If signal_id provided in notes, auto-unlock
    if (notes.signal_id) {
        await unlockSignalForUser(user.rows[0].id, notes.signal_id);
    }
}

// SUBSCRIPTION CANCELLATION
async function handleSubscriptionCancelled(subscription) {
    const customerEmail = subscription.email;
    
    const user = await db.query('SELECT * FROM users WHERE email = $1', [customerEmail]);
    if (user.rows[0]) {
        await db.query(
            'UPDATE users SET premium_status = $1, updated_at = NOW() WHERE id = $2',
            ['cancelled', user.rows[0].id]
        );
        
        // User keeps premium until expiry date
    }
}
```

---

## 3. PAYPAL WEBHOOK LOGIC

### Endpoint: `POST /api/webhooks/paypal`

```javascript
async function handlePayPalWebhook(req, res) {
    // 1. Verify webhook (PayPal uses certificate-based verification)
    const authAlgo = req.headers['paypal-auth-algo'];
    const transmissionId = req.headers['paypal-transmission-id'];
    const certUrl = req.headers['paypal-cert-url'];
    const transmissionSig = req.headers['paypal-transmission-sig'];
    
    const isValid = await verifyPayPalWebhook(
        authAlgo, transmissionId, certUrl, transmissionSig, req.body
    );
    
    if (!isValid) {
        return res.status(400).json({ error: 'Invalid webhook' });
    }
    
    const eventType = req.body.event_type;
    const resource = req.body.resource;
    
    // 2. Handle events
    switch(eventType) {
        case 'BILLING.SUBSCRIPTION.ACTIVATED':
        case 'BILLING.SUBSCRIPTION.PAYMENT.COMPLETED':
            await handlePayPalSubscriptionPayment(resource);
            break;
            
        case 'BILLING.SUBSCRIPTION.CANCELLED':
            await handlePayPalSubscriptionCancelled(resource);
            break;
            
        case 'CHECKOUT.ORDER.COMPLETED':
            await handlePayPalOrderCompleted(resource);
            break;
    }
    
    res.status(200).json({ received: true });
}

// PAYPAL SUBSCRIPTION HANDLER
async function handlePayPalSubscriptionPayment(resource) {
    const subscriptionId = resource.id;
    const customerEmail = resource.subscriber.email_address;
    const amount = parseFloat(resource.billing_info.last_payment.amount.value);
    const currency = resource.billing_info.last_payment.amount.currency_code;
    
    // Same logic as Razorpay subscription
    let user = await db.query('SELECT * FROM users WHERE email = $1', [customerEmail]);
    
    if (!user.rows[0]) {
        const newUser = await db.query(
            'INSERT INTO users (email, premium_status, premium_expires_at) VALUES ($1, $2, $3) RETURNING *',
            [customerEmail, 'premium', calculateExpiryDate(30)]
        );
        user = newUser;
    } else {
        await db.query(
            'UPDATE users SET premium_status = $1, premium_expires_at = $2, updated_at = NOW() WHERE id = $3',
            ['premium', calculateExpiryDate(30), user.rows[0].id]
        );
    }
    
    await db.query(
        `INSERT INTO transactions 
         (user_id, provider, transaction_type, provider_subscription_id, amount, currency, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [user.rows[0].id, 'paypal', 'subscription', subscriptionId, amount, currency, 'captured']
    );
}

// PAYPAL PAY-PER-ALPHA (One-time order)
async function handlePayPalOrderCompleted(resource) {
    const amount = parseFloat(resource.purchase_units[0].amount.value);
    
    // Only process $1 orders for pay-per-alpha
    if (amount !== 1.0) return;
    
    const customerEmail = resource.payer.email_address;
    
    // Same credit logic as Razorpay
    let user = await db.query('SELECT * FROM users WHERE email = $1', [customerEmail]);
    
    if (!user.rows[0]) {
        const newUser = await db.query(
            'INSERT INTO users (email, credits) VALUES ($1, $2) RETURNING *',
            [customerEmail, 1]
        );
        user = newUser;
    } else {
        await db.query(
            'UPDATE users SET credits = credits + 1, updated_at = NOW() WHERE id = $1',
            [user.rows[0].id]
        );
    }
    
    await db.query(
        `INSERT INTO transactions 
         (user_id, provider, transaction_type, provider_payment_id, amount, currency, status, credits_added)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [user.rows[0].id, 'paypal', 'pay_per_alpha', resource.id, 1, 'USD', 'captured', 1]
    );
}
```

---

## 4. CREDIT CONSUMPTION LOGIC

```javascript
// When user wants to unlock a signal
async function unlockSignal(userId, signalId) {
    // Check if user has credits or premium
    const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (user.rows[0].premium_status === 'premium' && new Date(user.rows[0].premium_expires_at) > new Date()) {
        // Premium user - unlock free
        return await getFullSignal(signalId);
    }
    
    if (user.rows[0].credits > 0) {
        // Deduct 1 credit
        await db.query('UPDATE users SET credits = credits - 1 WHERE id = $1', [userId]);
        
        // Record purchase
        await db.query(
            'INSERT INTO alpha_purchases (user_id, signal_id, credits_used) VALUES ($1, $2, $3)',
            [userId, signalId, 1]
        );
        
        return await getFullSignal(signalId);
    }
    
    // No credits, no premium - show paywall
    return { error: 'Insufficient credits', buy_url: generatePaymentUrl(signalId) };
}
```

---

## 5. WEBHOOK SECURITY CHECKLIST

- ✅ HTTPS only (TLS 1.2+)
- ✅ Signature verification (Razorpay HMAC, PayPal cert)
- ✅ Idempotency (check transaction_id before processing)
- ✅ IP whitelisting (Razorpay/PayPal IPs only)
- ✅ Rate limiting (max 100 req/min per endpoint)
- ✅ Logging (all webhook events to audit log)

---

## 6. ENVIRONMENT VARIABLES REQUIRED

```bash
# Database
NEON_DATABASE_URL="postgresql://user:pass@host/db"

# Razorpay
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_KEY_SECRET="..."
RAZORPAY_WEBHOOK_SECRET="whsec_..."

# PayPal
PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."
PAYPAL_WEBHOOK_ID="..."

# Telegram (for notifications)
TELEGRAM_BOT_TOKEN="..."
```

---

_Document Version: 1.0_  
_Status: Ready for Sonnet Implementation_  
_Nova Approval: PENDING Commander Review_
