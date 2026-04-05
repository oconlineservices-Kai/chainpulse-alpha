# ChainPulse Alpha

AI-powered crypto alpha signals platform with pay-per-alpha and subscription monetization.

## Features

- 🤖 AI-generated crypto signals
- 💎 Diamond signals (high confidence)
- 🐋 Whale wallet tracking
- 🐦 Twitter sentiment analysis
- 💳 Razorpay & PayPal integration
- 💰 Pay-per-alpha + Subscription models
- 🔐 NextAuth authentication

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- Neon Postgres
- NextAuth.js
- Razorpay/PayPal APIs

## Environment Variables

```bash
# Database
NEON_DATABASE_URL=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=

# Telegram
TELEGRAM_BOT_TOKEN=
```

## Database Schema

See `/opt/chainpulse/schema.sql`

## Deployment

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy
