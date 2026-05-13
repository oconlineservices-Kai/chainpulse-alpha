# ChainPulse Alpha — Audit & Fix Report (Final)

**Date:** 2026-05-13  
**Author:** Nova  
**Build:** ✅ Passes (0 errors, 1 warning from `supports-color` ESM dep)

---

## What Was Fixed

### 🔴 Critical: API Signals — Free logged-in users got full Premium access

**File:** `src/app/api/signals/route.ts`  
`isFree = !isAuthenticated` → `isFree = !isPremium` (checks DB premiumStatus)

### 🟡 Auth: JWT Session missing `credits`

**Files:** `src/lib/auth.ts`, `src/types/next-auth.d.ts`  
Credits now passed through authorize → JWT → session.

### 🟡 Dashboard: Redundant Free-tier marketing for logged-in users

**File:** `src/app/dashboard/page.tsx`  
Rewrote with single upgrade banner showing credit balance + one CTA.

### 🟡 Signals Page: "Login for free access" shown to logged-in free users

**File:** `src/app/signals/page.tsx`  
Contextual prompts — authenticated free users see "Upgrade to Premium" not "Login Free".

### 🟡 Pay-Per-Alpha: No expiry (30-day validity)

**Files:** `prisma/schema.prisma`, `src/app/api/payment/alpha-purchase/route.ts`, `src/app/api/payment/alpha-verify/route.ts`, `src/app/api/user/purchased-signals/route.ts`  
Added `expiresAt` field to `AlphaPurchase` model. 30-day expiry set on creation. Purchased-signals API filters out expired.

### 🟢 Telegram Bot: Now fully functional

**Files:** `prisma/schema.prisma` (+telegramChatId), `src/lib/telegram.ts` (actual delivery), `src/app/api/telegram/link/route.ts`, `src/app/api/telegram/unlink/route.ts`, `src/app/api/telegram/status/route.ts`, `src/app/api/telegram/webhook/route.ts`, `src/lib/telegram-link.ts`

- User DMs the bot → gets 6-digit code
- Enters code on web profile → account linked
- Notifications for: subscription activated/cancelled, credits added, signal unlocked, diamond signals, whale alerts
- Rate-limited code generation in webhook

### 🟡 Profile Page: Telegram linking + removed fake placeholder buttons

**File:** `src/app/profile/ProfileClient.tsx`  
Added `TelegramLinkSection` component in Notifications tab. Removed fake "View Sessions" and "API Keys" placeholder buttons from Security tab.

### 🟢 Webhook: Telegram notifications wired into payment flow

**File:** `src/app/api/webhooks/razorpay/route.ts`  
Credit purchases now call `notifyUser(user.id, 'credit_added', ...)` with actual Telegram delivery.

### 🟢 .env.example added

**File:** `.env.example`

---

## Remaining Known Gaps (None blocking)

| Feature | Status | Note |
|---------|--------|------|
| Portfolio tracking | ⚠️ Not implemented | Toggle in profile exists but no component |
| API access (beta) | ⚠️ Not implemented | Listed in marketing but no API key system |

These are marketing claims that should either be implemented or removed from the Premium card on the pricing page.
