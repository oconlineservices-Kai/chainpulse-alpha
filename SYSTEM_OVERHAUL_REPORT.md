# ChainPulse Alpha — System Overhaul Report
**Date:** 2026-04-20  
**Performed by:** Nova (Claude Sonnet 4.6 subagent)

---

## Summary of Changes

### 1. ✅ Vercel Deployment REMOVED
**File:** `.github/workflows/deploy.yml`

**Problem:** Two competing workflows both triggered on `push main`:
- `deploy.yml` → Vercel (failing, unnecessary)
- `fly-deploy.yml` → Fly.io (correct)

**Fix:** Replaced `deploy.yml` with a stub comment file explaining the deprecation.
The Vercel workflow is now a no-op comment explaining why it was removed.

**Result:** Single deployment pipeline via Fly.io only.

---

### 2. ✅ Dashboard Security Hardened

**Admin Dashboard:** Already at `/admin/dashboard` — correct.

**Middleware fixes** (`src/middleware.ts`):
- Added `/admin/login` to public routes (was missing)
- Added `/blog` and `/blog/*` to public routes (was missing)
- Changed admin redirect: non-authenticated → `/admin/login` (was `/login`)
- Changed non-admin authenticated → `/dashboard` (not `/login`)
- Dashboard redirect now passes `?callbackUrl` for UX

**Admin Dashboard page** (`src/app/admin/dashboard/page.tsx`):
- Added `useSession()` client-side guard
- Unauthenticated → redirect to `/admin/login`
- Authenticated but not admin → redirect to `/dashboard`
- Logout now uses `signOut({ callbackUrl: '/admin/login' })`

**Admin Login page** (`src/app/admin/login/page.tsx`):
- Created dedicated admin login UI (was missing)
- Branded with Shield icon + danger/warning gradient
- Verifies admin access via `/api/admin/enhanced-stats` after login

**Navigation** (`src/components/layout/Navigation.tsx`):
- Admin link (🛡 Admin) only visible to `isAdmin === true` users
- Dashboard link only visible to logged-in users
- Login/Signup only shown to logged-out users
- Works on both desktop and mobile menus

---

### 3. ✅ Pay-Per-Alpha Flow Implemented

#### New API Routes

**`POST /api/payment/alpha-purchase`**
- Creates Razorpay order for single signal unlock
- If user has credits (≥1): deducts 1 credit, unlocks immediately (no payment needed)
- If no credits: creates Razorpay order
- Prices: Diamond ₹299, Whale ₹199, Default ₹99

**`POST /api/payment/alpha-verify`**
- Verifies Razorpay signature after payment
- Creates `AlphaPurchase` record in DB
- Updates transaction to `success`

**`GET/PATCH /api/payment/credits`**
- GET: Returns available credit pack options
- PATCH: Verifies payment + credits user's account
- Credit packs: Starter (5 credits ₹399), Value (10 credits ₹699), Pro (25 credits ₹1,499)

**`GET /api/user/purchased-signals`**
- Returns list of signal IDs user has purchased
- Also returns current credit balance

#### New UI Component

**`src/components/signals/BuySignalButton.tsx`**
- Renders inline "Buy Signal" button on locked signals
- If not logged in → shows "Login to Buy" link
- If logged in + has credits → uses credit (free, instant)
- If logged in + no credits → triggers Razorpay modal
- States: idle → loading → success/error
- After unlock → calls `onUnlocked()` callback to refresh signals
- Color-coded by signal type (purple=diamond, blue=whale, indigo=default)

#### Signals Page Integration

**`src/app/signals/page.tsx`**
- Locked signals now show `BuySignalButton` inline
- Users see: lock icon + signal tier + Buy button + "or Upgrade for All →" link
- Pay-per-alpha and premium upgrade are co-presented as choices

---

### 4. ✅ Dashboard UI Overlap Fixed

**Problem:** `dashboard/layout.tsx` rendered a `<Sidebar>` + `<Header>` that conflicted
with the global `<Navigation />` in `app/layout.tsx` (which is always rendered).
This caused visual overlap — two headers stacked on top.

**Fix:** Replaced `dashboard/layout.tsx` with a minimal passthrough layout.
The dashboard sub-header lives in `dashboard/page.tsx` only (unchanged) which correctly
uses `pt-20 lg:pt-24` top padding to account for the fixed global nav.

---

### 5. ✅ Process Flow Redesign

#### User Journey (3 Tiers)

```
ANONYMOUS
  └─ /signals → sees 3 signals (no auth)
  └─ /pricing → upgrade options
  └─ Sign up → FREE user

FREE (authenticated)
  └─ /dashboard → 5 signals, Diamond locked
  └─ /signals → 3 signals visible, BuySignalButton on locked ones
  └─ CTA: Upgrade to Premium OR Buy individual signals (₹99-₹299)
  └─ Buy Credits pack (₹399-₹1,499) for bulk unlocks

PREMIUM (authenticated + premiumStatus='premium')
  └─ /dashboard → all 20+ signals, real-time
  └─ /signals → full access, real-time
  └─ No purchase needed

ADMIN (isAdmin=true)
  └─ /admin/dashboard → stats, revenue, signals
  └─ /admin/login → dedicated secure login
  └─ NOT accessible without admin flag
```

#### Signal Purchase Flow
```
User on /signals sees locked signal
  → Clicks "Buy Signal ₹299"
  → If credits available: instant unlock (1 credit deducted)
  → If no credits: Razorpay modal opens
    → User pays ₹299
    → Razorpay callback → /api/payment/alpha-verify
    → Signal unlocked, shown inline
    → UI refreshes to show signal data
```

#### Credit Purchase Flow
```
User wants bulk signal access (cheaper than per-signal)
  → GET /api/payment/credits → see pack options
  → POST /api/payment/credits { pack: 'value' }
  → Razorpay modal → pay ₹699
  → PATCH /api/payment/credits → 10 credits added
  → Credits visible on dashboard/profile
  → Each credit = 1 signal unlock
```

---

### 6. ✅ Architecture Summary

| Component | Status |
|-----------|--------|
| Deployment | Fly.io only (Vercel removed) |
| Admin access | /admin/dashboard (auth + isAdmin guard) |
| User dashboard | /dashboard (auth required) |
| Public signals | /signals (3 free, buy-per-signal enabled) |
| Pay-per-alpha | Razorpay + Credits system |
| Credit bundles | 3 tiers: 5/10/25 credits |
| DB schema | AlphaPurchase model already existed ✓ |

---

## Files Changed

| File | Action |
|------|--------|
| `.github/workflows/deploy.yml` | Replaced with deprecation stub |
| `src/middleware.ts` | Fixed public routes, admin redirects |
| `src/app/admin/login/page.tsx` | Created dedicated admin login UI |
| `src/app/admin/dashboard/page.tsx` | Added useSession auth guard |
| `src/app/dashboard/layout.tsx` | Removed conflicting Sidebar+Header |
| `src/components/layout/Navigation.tsx` | Auth-aware nav (admin/login/dashboard) |
| `src/components/signals/BuySignalButton.tsx` | **NEW** pay-per-alpha component |
| `src/app/signals/page.tsx` | Integrated BuySignalButton on locked signals |
| `src/app/api/payment/alpha-purchase/route.ts` | **NEW** create alpha purchase order |
| `src/app/api/payment/alpha-verify/route.ts` | **NEW** verify alpha purchase |
| `src/app/api/payment/credits/route.ts` | **NEW** credit pack purchase + verify |
| `src/app/api/user/purchased-signals/route.ts` | **NEW** get user's purchased signals |

---

## Next Steps (Recommended)

1. **Deploy to Fly.io** — push to main, fly-deploy.yml will trigger
2. **Test payment flow** — use Razorpay test keys (rzp_test_*)
3. **Add credits UI** — show credit balance in dashboard header
4. **Admin signal management** — add signal CRUD to admin dashboard
5. **Webhook for credits** — `/api/webhooks/razorpay` for async payment confirmation
6. **Delete old Vercel project** — on vercel.com dashboard (optional cleanup)
