# ChainPulse Alpha — Signals Page Audit

**Audit date:** 2026-06-10  
**Audited files:**
- `/opt/chainpulse/app/src/app/signals/page.tsx` (SSR page)
- `/opt/chainpulse/app/src/app/signals/SignalsContent.tsx` (client component)
- `/opt/chainpulse/app/src/components/signals/BuySignalButton.tsx`
- `/opt/chainpulse/app/src/components/dashboard/AlphaFeed.tsx`
- `/opt/chainpulse/app/src/components/dashboard/SignalDetail.tsx`
- `/opt/chainpulse/app/src/lib/auth.ts`
- `/opt/chainpulse/app/src/app/api/signals/route.ts`
- `/opt/chainpulse/app/src/lib/usePageMeta.ts`

**Severity levels:** CRITICAL | HIGH | MEDIUM | LOW

---

## 1. LAYOUT & STRUCTURE

### 1.1 [MEDIUM] Reading hierarchy
- The page has a single `<h1>` tag ("ChainPulse Alpha Signals") — **correct** for SEO.
- However, the **SSR locked section** (page.tsx) uses `<h3>` for its "Unlock Premium Access" banner heading with no prior `<h2>`, violating the `h1 → h2 → h3` hierarchy.
- The **client-side locked section** (SignalsContent.tsx) also uses `<h3>` for the same banner, same violation.
- The bottom Upgrade CTA uses `<h2>` — correct.
- **Fix:** SSR locked banner `<h3>` should be a `<h2>`, or the section needs an `<h2>` wrapper.

### 1.2 [LOW] Back-to-home link
- A `Back to Home` link with `<ArrowLeft />` icon correctly navigates to `/` via `Link` component.
- Works. No issues.

### 1.3 [LOW] Mobile responsiveness
- Uses responsive grid: `grid-cols-2 md:grid-cols-4` for performance stats; `flex-wrap` on most flex containers.
- Signal cards use `flex-wrap gap-4` for score/buy/recommendation sections.
- Overall good responsive design. No obvious breakage.

---

## 2. UX & USER FLOW

### 2.1 [CRITICAL] Duplicate locked-card sections — SSR + client render TWO sets of locked cards

**The page renders locked cards TWICE:**

1. **SSR section** (`page.tsx` lines 90-165): When `serverIsGated === true`, renders 3 SSR-locked cards with blur overlays plus a CTA banner, inside `<div id="ssr-locked-section">`.

2. **Client section** (`SignalsContent.tsx` lines 340-440): When `effectiveIsGated && effectiveLockedCount > 0`, it renders ANOTHER set of locked cards with blur overlays, plus another CTA banner.

**Why this is a problem:**
- A free user visiting the page sees **3 SSR locked cards** (rendered server-side) immediately.
- Then client-side JS loads, fetches `/api/signals` which returns 3 unlocked preview signals.
- The client component renders the 3 unlocked signals, THEN renders the client-side locked cards below.
- **Net effect:** A free authenticated user could see: 3 SSR locked cards → 3 unlocked preview signals → 3 client locked cards = up to 9 rendered cards, of which only 3 show actual data.
- On initial SSR render (no JS), the user sees only the SSR locked section.

**Root cause:** The SSR and client systems both implement the same paywall logic independently, without coordinating whether the SSR section should hide once client-side data loads.

**Suggested fix:**
- Have `SignalsContent` unmount/remove the SSR section when client-side content loads. Simplest: add an `id="signals-content-root"` on the `<main>` and use CSS to hide `#ssr-locked-section` when `#signals-content-root` is visible, OR have the client component render a wrapper that's the single source of truth.
- Alternatively, make the SSR section render only when JavaScript is unavailable (noscript or detect JS).

### 2.2 [CRITICAL] SSR locked cards render even for premium users — layout flash

In `page.tsx`, the SSR locked cards render when `serverIsGated === true`:
```tsx
{serverIsGated && (
  <div id="ssr-locked-section">...
```
`serverIsGated` is set based on `await auth()` — **SSR will correctly NOT render locked cards for premium sessions.** So for premium users this is fine server-side.

**But**: The `serverIsGated` check only works for premium users. For **free logged-in users**, both the SSR locked cards AND the client unlocked preview cards render, creating a confusing double-section.

### 2.3 [HIGH] Filter state resets on every fetch

```tsx
useEffect(() => {
  fetchSignals()
}, [filter])
```
The `fetchSignals` function always includes `filter` in the API URL: `fetch(\`/api/signals?type=${filter}&limit=20\`)`.

When the user changes filter from "all" to "diamond", it re-fetches. Fine.

**BUT**: The auto-refresh interval also runs with the current `filter`:
```tsx
useEffect(() => {
  const interval = setInterval(fetchSignals, 2 * 60 * 1000)
  return () => clearInterval(interval)
}, [filter])
```
This creates a NEW interval every time filter changes, but that's acceptable (cleanup + re-create). The main issue: **every 2 minutes, the fetch refires for whatever the current filter is.** If user is on "diamond" filter, the API only returns diamond-type signals. If none exist, the user sees "No signals found" even though there are all-type signals. The interval should re-fetch with 'all' then re-apply client-side filter.

### 2.4 [MEDIUM] Auto-refresh every 2 minutes disrupts scroll position

- `fetchSignals` calls `setSignals(finalSignals)` which triggers a re-render. No scroll-position preservation.
- If a user has scrolled down through signal cards, the auto-refresh re-renders the whole list, losing scroll position.
- **Fix:** Use a stable list key strategy (already `signal.id` for keys), but the full `setSignals` call replaces the array reference. Use React's `useMemo` or reconcile instead of full replace.

### 2.5 [MEDIUM] Unauthenticated visitor experience

**Anonymous visitor sees:**
1. SSR locked cards (3 blur cards + "Upgrade to Premium" banner)
2. Client-side loading skeleton (3 shimmer cards)
3. After API call: 3 demo signals (preview) if `/api/signals` returns them (it does — `delayHours: 0.25` means 15-min delayed free preview)
4. Client-side locked cards (3 more blur cards)
5. Bottom "Unlock all Premium signals" CTA

**Confusing:** The user sees "Alpha Feed — Free Preview" label, which is good. But the duplicate sections are visually overwhelming.

---

## 3. UI CONSISTENCY

### 3.1 [HIGH] Signal card design differs between Signals page and AlphaFeed

| Aspect | SignalsContent.tsx | AlphaFeed.tsx |
|--------|-------------------|---------------|
| Token icon | `w-12 h-12` gradient circle | `w-12 h-12` gradient circle (same) |
| Scores layout | Horizontal 3-column (`sentiment`, `whale`, `score`) | Horizontal 3-column (`sentiment`, `whale conf`, `correlation`) — different labels |
| Recommendation display | Colored badge on right (Buy/Sell/Skip) | Badge next to timestamp |
| Buy button position | Inline with scores | Below card in its own row |
| Border treatment | `border-border` with type-specific hover border | `border-slate-700/50` with no type-specific coloring |
| Card bg | `glass-card` (global class) | `bg-slate-800/30` (inline) |
| Footer | Bottom divider with social mentions + diamond badge + expiry | Price change (up/down) + volume + market cap |

**Impact:** Users moving between the Signals page and Dashboard AlphaFeed see inconsistent visual treatment of the same signal data. The Signals page uses a more polished/glassy design while AlphaFeed uses a flatter/darker scheme.

### 3.2 [LOW] Gradient token icons
- SignalsContent uses type-specific gradients (`from-purple-500 to-indigo-500` for diamond, etc.).
- AlphaFeed always uses `from-primary-500 to-secondary-500`.
- Minor inconsistency.

### 3.3 [MEDIUM] Empty state messaging
- SignalsContent: "No signals found" with filter-specific guidance.
- AlphaFeed: More detailed "No signals found" with clear search/filter reset buttons.
- AlphaFeed is better. SignalsContent empty state is weaker.

---

## 4. SEO & ACCESSIBILITY

### 4.1 [LOW] Single `<h1>` — correct
- Only one `<h1>` exists: "ChainPulse Alpha Signals" — **good.**

### 4.2 [MEDIUM] No `aria-label` on interactive elements in SignalsContent
- Filter buttons (`All`, `Diamond`, `Whale`, `Sentiment`) have no `aria-label`. They display emojis + text, which is readable by screen readers as text content, but no explicit label.
- The "Refresh" button has no `aria-label`.
- The locked card "Unlock Premium Access" link has no `aria-label`.
- **Contrast:** AlphaFeed.tsx DOES use `aria-label` on filter buttons and cards.

### 4.3 [MEDIUM] Interactive cards lack proper roles in SignalsContent
- The signal cards in SignalsContent are `<div>` elements with `onClick` but no `role="button"` or `tabIndex`.
- AlphaFeed.tsx properly adds `role="button"`, `tabIndex={0}`, and keyboard handlers.

### 4.4 [LOW] JSON-LD structured data
- Valid `BreadcrumbList` and `FAQPage` schemas present in SSR.
- FAQPage contains good Q&A content.
- No escaping issues (uses `.replace(/</g, '\\u003c')`).
- **Good SEO practice.**

### 4.5 [MEDIUM] `usePageMeta` fires redundant metadata injection
In `SignalsContent.tsx`:
1. `usePageMeta(...)` is called in the component body (a hook).
2. A separate `useEffect` ALSO sets `document.title` and injects meta/OG tags.

**The `usePageMeta` hook itself already does all of this in its own `useEffect`.** The extra `useEffect` block in `SignalsContent.tsx` (lines 81-109) is completely redundant — it duplicates the effect with slightly different description strings. This means tags get set twice on every render.

### 4.6 [LOW] SSR page has proper metadata
- `metadata` export with `title`, `description`, `openGraph`, `alternates` canonical URL.
- Good.

### 4.7 [LOW] Crawlers can read locked content
- SSR locked cards render actual HTML content (token initials, blurred text) — crawlers see this, but it's behind a CSS `backdrop-filter: blur()` and `opacity: blur-sm`.
- The actual signal data is never leaked since these are ghost/placeholder values, not real data.
- The JSON-LD FAQ provides good content for SEO.
- **Acceptable.** No data leak, but crawlers get meaningful page content.

---

## 5. CODE QUALITY

### 5.1 [CRITICAL] `usePageMeta` called twice — redundant metadata injection

**The bug:** `usePageMeta(...)` is called at the top of the component function (line 68-78). This is a custom hook that internally uses `useEffect` to set document title, meta tags, OG tags, etc.

Immediately after, there's a separate `useEffect` (lines 81-109) that does the **exact same thing** — sets `document.title`, injects meta description, OG tags, Twitter card tags.

**Impact:** Meta tags are set twice during hydration. No visible issue for users, but wasteful.

**Also:** The `usePageMeta` call passes `keywords: 'live crypto signals, trading signals, crypto alerts, whale tracking signals, sentiment analysis, AI trading signals'` but **SSR metadata export doesn't include these keywords** — so JS-disabled users (and some crawlers) don't get keywords.

### 5.2 [MEDIUM] Confusing naming: `filtered` vs `visibleSignals` vs `signals`

Three related but distinct variables:
```tsx
const [signals, setSignals] = useState<LiveSignal[]>([])       // raw from API
const filtered = signals.filter(s => { ... })                   // filtered by type
const visibleSignals = isGated ? filtered.slice(0, MAX_FREE_SIGNALS) : filtered  // gated + filtered
```

Only `visibleSignals` is used in JSX rendering. The intermediate `filtered` is unnecessary — `visibleSignals` could compute the filter inline. Similarly, the `effectiveIsGated`, `effectiveLockedCount` variables add complexity.

### 5.3 [HIGH] SSR locked cards and client locked cards are duplicated implementations

**Both `page.tsx` (SSR) and `SignalsContent.tsx` (client) implement their own locked card rendering:**

| Aspect | SSR (page.tsx) | Client (SignalsContent.tsx) |
|--------|----------------|----------------------------|
| Ghost symbols | Uses `GHOST_SYMBOLS` array | Duplicates `ghostSymbols` array inline |
| Ghost styles | Uses `GHOST_STYLES` array | Uses `typeStyles` (imported) |
| Score generation | `70 + (i * 13) % 30` | `70 + (i * 13) % 30` (identical logic) |
| Card structure | `glass-card p-6 rounded-2xl` + `backdrop-blur-md` | `glass-card p-6 rounded-2xl` + `backdrop-blur-md` (same) |
| CTA button | Separate `<a>` with `bg-gradient-to-r from-blue-500 to-purple-500` | `<Link>` with `bg-gradient-to-r from-primary-500 to-secondary-500` |
| Lock icon | `<svg>` inline | `<Lock>` from lucide-react |
| "Premium Signature — Locked" text | Same | Same |

**This duplication is a maintenance hazard.** Changing the locked card design means updating both locations.

### 5.4 [HIGH] Performance stats are hardcoded, not from API

```tsx
const performanceStats = [
  { label: 'Signals This Month', value: '142', sub: '+23 vs last month' },
  { label: 'Diamond Signal Win Rate', value: '78%', sub: 'Last 90 days' },
  { label: 'Avg. Return per Signal', value: '+8.3%', sub: 'Buy signals only' },
  { label: 'Max Drawdown', value: '-4.2%', sub: 'Worst losing streak' },
]
```

**These are STATIC strings — they never change.** The `/api/signals` endpoint returns `performance.overall` with:
```json
"performance": {
  "overall": {
    "winRate": 85,
    "totalSignals": 1247
  }
}
```

- The API's `winRate: 85` differs from the hardcoded `'78%'`
- The API's `totalSignals: 1247` differs from the hardcoded `'142'`
- There is NO `avgReturn` or `maxDrawdown` or per-month signal count in the API response
- Premium users get more detail from the API (`byType`, `topSignals`, `last30Days`), but the UI never reads any of it

**Impact:**
1. Numbers are stale/wrong compared to actual performance
2. Diamond win rate (78%) doesn't match API diamond win rate (91%)
3. No connection between API data and display

**Fix:** Accept `performance` from the API response and derive display values from it. If API doesn't have all fields, compute them.

### 5.5 [MEDIUM] Magic numbers

| Value | Location | Problem |
|-------|----------|---------|
| `2 * 60 * 1000` | SignalsContent.tsx (auto-refresh interval) | Magic 2-minute refresh; not configurable |
| `3` | Multiple places | Free tier limit hardcoded as magic `3` instead of a named constant |
| `MAX_FREE_SIGNALS = 3` | SignalsContent.tsx | At least this is named, but SSR uses `serverLockedCount = 3` |
| `0.25` (15 min) | API route delayHours | Free tier delay is 15 minutes, but... |
| `"24-hour delay"` | page.tsx FAQ JSON-LD | Claims **24-hour** delay (see CRITICAL issue below) |

### 5.6 [MEDIUM] Duplicate `isDiamondOrHighConf` logic

In `SignalsContent.tsx`:
```tsx
const isDiamondOrHighConf = type === 'diamond' || confidence >= 80
```

In `AlphaFeed.tsx` (separate logic):
```tsx
signalType: (signal.correlationScore ?? 0) >= 85 ? 'diamond' : (signal.whaleConfidence ?? 0) >= 80 ? 'whale' : 'default'
```

The threshold for "high confidence" differs: `>= 80` vs `>= 85`. This means a signal might show a Buy button on the Signals page but not on AlphaFeed, or vice versa.

### 5.7 [LOW] `auth.ts` cookie comment — app assumes HTTP (non-secure cookies)

```tsx
cookies: {
  sessionToken: {
    name: 'authjs.session-token',
    options: {
      secure: false,  // must be false — Fly.io proxy terminates TLS
    }
  }
}
```
This is a known Fly.io workaround but makes cookies accessible over HTTP (non-secure). While the proxy handles TLS, this is an explicit security trade-off worth documenting more clearly.

---

## 6. PAYFLOW & PAYWALL

### 6.1 [HIGH] `BuySignalButton` shown only for Diamond/HighConf signals — misses eligible signals

In `SignalsContent.tsx`:
```tsx
{(isDiamondOrHighConf || userCredits > 0) && meta?.authenticated && !meta?.isRealTime && (
  <BuySignalButton ... />
)}
```

- `isDiamondOrHighConf = type === 'diamond' || confidence >= 80`
- ETH (score 88, diamond=true) → shows button ✅
- SOL (score 81, not diamond) → shows button (score >= 80) ✅
- ARB (score 75, not diamond) → does NOT show button ❌

**Problem:** ARB is still a preview signal accessible to free users. There's no Buy button on it even though it's in the unlocked preview. This is actually **correct behavior** — the signal is already visible, so no need to buy it. BUT the condition `isDiamondOrHighConf` is described as filtering "signals that user might want" when really it's filtering signals that are behind the paywall.

**The actual logic issue:** The Buy button should appear for ALL signals when the user is free/limited, not just high-confidence ones. A free user might want to unlock ANY signal. Currently, only signals with score >= 80 get a Buy button.

### 6.2 [MEDIUM] Credit banner shows for logged-in free users with credits
- The credits banner is correctly shown: `{isLoggedIn && !isPremium && userCredits > 0 && (...)`
- Banner tells users they have X credits and can click Buy.
- Good UX.

### 6.3 [HIGH] `BuySignalButton` condition complexity

The Buy button show/hide logic in SignalsContent is:
```tsx
{(isDiamondOrHighConf || userCredits > 0) && meta?.authenticated && !meta?.isRealTime}
```

This means:
- UNLOCKED signals (preview, not behind paywall) show Buy button only if high-confidence
- LOCKED signals (visible only through client-side locked cards) have their own Buy button... wait, **the premium locked cards created by `effectiveIsGated` don't show individual Buy buttons** — they just show a "Unlock Premium Access" link to `/pricing`. The BuySignalButton is only on the unlocked preview cards.

So the flow is: free user sees 3 preview signals → some have Buy buttons (the high-confidence ones) → 3 premium locked cards with generic CTA → bottom page-wide CTA.

**This is inconsistent and confusing.** Why would someone buy individual signals on the preview cards, but the locked cards below offer only a subscription link? If Pay-Per-Alpha is a real feature, ALL locked cards should show an individual Buy button.

### 6.4 [LOW] `isDiamondOrHighConf` naming — inaccurate variable name

The variable is `isDiamondOrHighConf` but it's used to gate Buy button visibility, not to identify diamond signals. Rename to something like `showBuyButton` for clarity.

---

## 7. CONTENT ISSUES

### 7.1 [CRITICAL] "24-hour delay" copy vs actual API `delayHours: 0.25` (15 minutes)

**The FAQ in SSR JSON-LD (page.tsx line 108) says:**
```
"Free tier users can see the first 3 signals in the Alpha Feed with a 24-hour delay."
```

**The API route sends free users:**
```tsx
delayHours: isFree ? 0.25 : 0,  // 15 minutes, not 24 hours
```

**This is a CRITICAL misrepresentation:**
- Users told they have a 24-hour delay may think the free tier is useless for day trading
- Users who sign up for premium expecting real-time data get "only" 15-minute delayed data (which is nearly real-time for most purposes)
- The API delivers fresh demo signals every request with the same 0.25-hour delay on all signals, so practically there's NO delay at all — the "delayedTimestamp" is just set 15 minutes earlier than createdAt
- If the intent WAS to have a 24-hour delay, the API is wrong. If 15 minutes is correct, the copy is 96x off

**Also appears in `SignalsContent.tsx`** (the bottom CTA):
```
'Free users see 3 signals with 24hr delay.'
```
Same discrepancy.

### 7.2 [HIGH] Performance stats: "142 signals this month" vs API `totalSignals: 1247`

| Stat | Hardcoded (UI) | API value |
|------|----------------|-----------|
| Signals This Month | 142 | N/A — API has `totalSignals: 1247` (all-time) |
| Diamond Signal Win Rate | 78% | API: `byType.diamond.winRate: 91` |
| Avg. Return per Signal | +8.3% | API: `overall.avgReturn: 22.1` |
| Max Drawdown | -4.2% | API: N/A — not in response |
| "vs last month" | "+23" | N/A — no month-over-month data |

**These are completely fabricated numbers that do not connect to the API.**

**Worst part:** The "142 signals this month" is wildly different from "1247 total signals" in the API. Even if "this month" vs "all time" is different, 142/month would mean 8+ years of data, while the platform (ChainPulse) appears newer.

### 7.3 [MEDIUM] `totalAvailable` vs SSR `serverLockedCount`

- API route returns `meta.totalAvailable: 5` (total DEMO_SIGNALS.length = 5)
- API shows `meta.signalsVisible: 3` (free users see 3 preview signals)
- API shows `meta.lockedCount: 2` (5 - 3 = 2)
- BUT SSR renders `serverLockedCount = 3`

**The discrepancy:**
- `page.tsx` sets `serverLockedCount = 3` (the free-tier gating limit)
- The API says there are 5 total signals, 3 visible, 2 locked
- SSR shows 3 locked placeholder cards for the "3 signals blurred"
- But after client load, the API says only 2 are actually locked

**Net result:** The SSR shows "3 Signals Blurred" but the client section shows "2 Premium Signals Locked". Text mismatch between initial render and hydrated render.

### 7.4 [LOW] Status label mismatch vs actual API data

- Demo signals API returns `status: 'Free'` for all three preview signals
- The API demo enrichment sets `status: 'Free'` for preview and `status: 'Premium'` for hidden signals
- But the SSR section labels everything as "Premium" even the free preview area
- Client component uses "Alpha Feed — Free Preview" which is correct context

---

## 8. ADDITIONAL FINDINGS

### 8.1 [MEDIUM] `getRecommendation` in SignalsContent vs dashboard

**SignalsContent.tsx:**
```tsx
function getRecommendation(signal: LiveSignal): 'Buy' | 'Sell' | 'Skip' {
  const avg = ((signal.sentimentScore ?? 50) + (signal.whaleConfidence ?? 50) + (signal.correlationScore ?? 50)) / 3
  if (avg >= 75) return 'Buy'
  if (avg <= 45) return 'Sell'
  return 'Skip'
}
```

**AlphaFeed.tsx (via crypto.ts):** uses the same threshold logic (`avg >= 75 → Buy`).

**Demo signal enrichment:** ALL five demo signals have `recommendation: 'Buy'` hardcoded. The `getRecommendation` function would compute the actual recommendation from scores, which might differ. For example, ARB (scores: 88, 62, 75 → avg = 75 → Buy) coincidentally matches, but BNB (65, 78, 71 → avg = 71.3 → Skip) doesn't match the hardcoded `'Skip'`. So there's potential misalignment.

### 8.2 [LOW] Missing `typeof window !== 'undefined'` guard in production

In `AlphaFeed.tsx`:
```tsx
if (typeof window !== 'undefined') {
  console.debug('[AlphaFeed] Signals lock status:', ...)
}
```
This debug logging will execute in production. Should be removed or gated by `process.env.NODE_ENV !== 'production'`.

### 8.3 [LOW] `localStorage` reads in `BuySignalButton` without SSR guard

`BuySignalButton.tsx` reads from `localStorage` in the component body:
```tsx
try { localStorage.removeItem('abandoned_checkout') } catch {}
```
This is inside an event handler (`handleBuy`), so it's safe (not SSR). But the modal dismiss handler also reads localStorage:
```tsx
const events = JSON.parse(localStorage.getItem('payment_analytics') || '[]')
```
This is also inside a callback, so safe. Fine.

### 8.4 [LOW] Razorpay script polling up to 3 seconds

`BuySignalButton.tsx` polls every 200ms for up to 3 seconds for `window.Razorpay` to appear after script load. If it times out, the user gets `'Failed to load payment gateway'` error. 3 seconds is acceptable but the timeout message is not actionable for the user.

---

## SUMMARY TABLE

| # | Severity | Finding | Area |
|---|----------|---------|------|
| 2.1 | CRITICAL | Duplicate locked-card sections — SSR + client render two sets | UX, Layout |
| 5.1 | CRITICAL | `usePageMeta` called twice — redundant metadata injection | Code Quality |
| 7.1 | CRITICAL | "24-hour delay" copy vs actual API `delayHours: 0.25` (15 min) — 96x error | Content |
| 2.2 | HIGH | SSR locked cards render for all non-premium, causing layout flash with client preview | UX |
| 2.3 | HIGH | Filter state triggers re-fetch — auto-refresh refires with active filter, can show empty state wrongly | UX |
| 3.1 | HIGH | Signal card design differs significantly between Signals page and AlphaFeed | UI |
| 5.3 | HIGH | SSR locked cards and client locked cards are duplicated implementations | Code Quality |
| 5.4 | HIGH | Performance stats are fully hardcoded, not from API — numbers are wrong | Code Quality |
| 7.2 | HIGH | Performance stats: "142 signals this month" vs API "1247 total" — completely fabricated | Content |
| 6.1 | HIGH | `BuySignalButton` condition only shows on high-confidence signals, not all locked signals | Paywall |
| 6.3 | HIGH | Locked premium cards show only generic subscription CTA, no individual Buy buttons | Paywall |
| 7.3 | MEDIUM | `totalAvailable: 5` vs SSR `serverLockedCount: 3` — mismatch between SSR and client | Content |
| 2.4 | MEDIUM | Auto-refresh loses scroll position | UX |
| 2.5 | MEDIUM | Unauthenticated visitor sees confusing duplicate sections | UX |
| 5.2 | MEDIUM | Confusing naming: `filtered` vs `visibleSignals` vs `signals` | Code Quality |
| 5.5 | MEDIUM | Magic numbers (2-min refresh, hardcoded 3, discrepancy in 0.25 vs 24 hours) | Code Quality |
| 5.6 | MEDIUM | `isDiamondOrHighConf` threshold mismatch (>=80 vs >=85 in AlphaFeed) | Code Quality |
| 8.1 | MEDIUM | `getRecommendation()` could differ from hardcoded demo `recommendation` values | Code Quality |
| 4.2 | MEDIUM | No `aria-label` on filter/refresh buttons in SignalsContent | Accessibility |
| 4.3 | MEDIUM | Interactive cards lack `role="button"` and keyboard handlers in SignalsContent | Accessibility |
| 4.5 | MEDIUM | `usePageMeta` + duplicate useEffect redundant | SEO/Code |
| 1.1 | MEDIUM | Reading hierarchy: `<h3>` used without preceding `<h2>` | Layout |
| 3.3 | MEDIUM | SignalsContent empty state is weaker than AlphaFeed | UI |
| 7.4 | LOW | Status labels vs API data: SSR calls everything "Premium" even free preview area | Content |
| 8.2 | LOW | Production debug logging in AlphaFeed | Code Quality |
| 5.7 | LOW | Auth cookies non-secure (Fly.io workaround) | Security |
| 1.3 | LOW | Good mobile responsiveness | Layout |
| 4.1 | LOW | Single `<h1>` — correct | SEO |
| 4.4 | LOW | Valid JSON-LD structured data (BreadcrumbList, FAQPage) | SEO |
| 4.7 | LOW | Crawlers can see meaningful content behind blur | SEO |

---

## PRIORITY ACTIONS

1. **CRITICAL — Fix 24h delay copy:** Change all references to "24-hour delay" to "15-minute delay" (or whatever the actual value is). Update FAQ JSON-LD and all UI copy.

2. **CRITICAL — Deduplicate locked-card rendering:** Decide whether SSR or client is the single source of truth for locked cards. The client section should hide/remove the SSR section once hydrated.

3. **CRITICAL — Fix `usePageMeta` double-fire:** Remove the standalone `useEffect` in SignalsContent.tsx (lines 81-109) since `usePageMeta` already handles all meta tag injection. Or remove `usePageMeta` and keep the manual effect.

4. **HIGH — Connect performance stats to API:** Remove hardcoded `performanceStats` array. Read from API response and derive display values. If API is missing fields, add them to the API or compute client-side.

5. **HIGH — Standardize card design:** Align SignalsContent cards with AlphaFeed cards, or extract a shared `SignalCard` component used by both. Address the border, background, label, and layout differences.

6. **HIGH — Show Buy buttons on all locked cards:** The locked premium cards should each have a BuySignalButton, not just a generic subscription link. This completes the Pay-Per-Alpha flow.

7. **MEDIUM — Fix SSR vs client serverLockedCount mismatch:** Ensure `serverLockedCount` matches the actual API `meta.lockedCount`. Currently SSR defaults to 3 but API says 2.

8. **MEDIUM — Add ARIA labels and keyboard handlers:** Add `aria-label` to all interactive elements in SignalsContent. Add `role="button"` and keyboard event handlers to clickable cards.
