# Fix Report: Signal Unlock Buttons Missing from Locked Dashboard Cards

**Date:** 2026-05-25 20:20 UTC+2  
**Commits:** HEAD `8aa0bca` (base) + deploy fixes  
**Author:** Agent/Subagent  

## Root Causes Identified

### Bug 1: Dashboard mapper zeroed out API data (critical)
**File:** `src/app/dashboard/page.tsx`  
**Lines:** ~77-92 (inside `fetchData()` free tier mapping)  

The mapper hardcoded these fields to zero/reject instead of passing through the API data:
```typescript
price: 0,                    // Was: ignores API (should be s.price ?? 0)
priceChange: 0,              // Was: ignores API
recommendation: 'Skip',      // Was: always 'Skip' (should be s.recommendation ?? 'Skip')
volume24h: 0,                // Was: ignores API
marketCap: 0,                // Was: ignores API
```

**Impact:** Free (unlocked) preview signals showed `$0.0000` price, `0.00%` change, and `Skip` recommendation.

**Fix:** Changed to pass through API data with nullish fallback:
```typescript
price: s.price ?? 0,
priceChange: s.priceChange ?? 0,
recommendation: (s.recommendation ?? 'Skip') as 'Buy' | 'Sell' | 'Skip',
volume24h: s.volume24h ?? 0,
marketCap: s.marketCap ?? 0,
```

### Bug 2: Fallback path generated NO locked cards (critical)
**File:** `src/app/dashboard/page.tsx`  
**Lines:** ~100-110 (catch block)  

`mockSignals` (from `@/lib/api/crypto`) has only **2 entries** (BTC and ETH). When the API fails:
- Fallback does `mockSignals.slice(0, 5)` → still only 2 signals  
- Lock check `idx >= 3` is **never true** → zero locked cards → zero BuySignalButtons

**Impact:** If the live API is unreachable, the dashboard shows all signals as unlocked/free with NO Buy/Unlock buttons.

**Fix:** Replaced with `FALLBACK_SIGNALS` array that has 8 properly-constructed mock entries (like the API's demo signals), using the existing `mockSignals` plus additional premium entries with padded data.

### Bug 3: Deployed server was running OLD code (critical)
**Symptom:** Server at `/opt/chainpulse/app/` was built at **18:49** from code before commit `8aa0bca` (committed at **20:20**). The running Next.js standalone production server did not pick up source changes.

The old server had:
- Filter using `s.status === 'Premium'` (never matches, since mapper maps to 'Locked')
- Fallback data not setting `locked` field
- `BuySignalButton` IS rendered in locked card DOM (verified in old bundle), but the code was intermediate

**Fix:** Rebuilt and redeployed to `/opt/chainpulse/app/`. Server restarted via pm2.

## Files Changed

| File | Change |
|------|--------|
| `src/app/dashboard/page.tsx` | Mapper passes through API data; fallback generates 8+ signals with proper locked fields |
| (built-in node_modules) | None — API route was already correct |

## Verification

### API endpoint (fresh deploy):
```
demo-001: locked=False, price=3125.4, recommendation=Buy
demo-002: locked=False, price=143.8,  recommendation=Buy
demo-003: locked=False, price=0.85,   recommendation=Buy
demo-004: locked=True,  price=35.22,  recommendation=Buy
demo-005: locked=True,  price=578.1,  recommendation=Skip
demo-006: locked=True,  price=14.55,  recommendation=Buy
demo-007: locked=True,  price=0.52,   recommendation=Sell
demo-008: locked=True,  price=2.86,   recommendation=Skip
```

### Build checks:
- ✅ Filter uses `isGenuinelyLocked` (not status string comparison)
- ✅ Mapper passes through price from API
- ✅ Sufficient fallback signals to demonstrate locked cards
- ✅ BuySignalButton with `signalId` and `onUnlocked` in locked card DOM

## Remaining Considerations
1. **Deploy flow:** Future code changes need `pm2 restart chainpulse-alpha` after `npm run build`
2. **Source of truth:** The workspace at `/root/.openclaw/workspace/chainpulse-alpha/` builds to `.next/standalone/`, then gets copied to `/opt/chainpulse/app/` — consider a deploy script
3. **BuySignalButton renders in SignalDetail correctly** — the lock overlay shows the Buy Signal button for users with credits, or a "Buy Credits to Unlock" link for users with 0 credits, or "Login to Unlock" for unauthenticated users
