# Dashboard + Whale Widget Deploy — June 23 2026

## What was deployed
- **`/api/whale-activity`** — New API endpoint returning aggregated on-chain stats
  - Free tier: movement count, ETH volume, net flow, chains tracked, wallet count (addresses masked)
  - Premium: full wallet breakdown with labels, addresses, balances, movement history
- **`WhaleActivityWidget`** — New client component (`src/components/whale/WhaleActivityWidget.tsx`)
  - Compact variant (homepage): summary stats with live indicator, net flow direction
  - Full variant (dashboard): stat cards + recent movements + wallet breakdown (premium)
- **Dashboard integration**: Widget renders above AlphaFeed for all users
- **Homepage integration**: Compact widget renders between Hero and SocialProof sections

## API endpoint details
- Route: `/api/whale-activity/route.ts`
- Queries whale_activities DB table (populated by engine/whale-tracker.js every 15 min)
- Uses raw SQL for whale_wallet_states table (no Prisma model exists)
- Returns summary (24h/6h/1h), recent movements, and optional wallet breakdown

## Files created
- `src/app/api/whale-activity/route.ts`
- `src/components/whale/WhaleActivityWidget.tsx`

## Files modified
- `src/app/dashboard/page.tsx` — Import + render WhaleActivityWidget
- `src/app/page.tsx` — Import + render compact WhaleActivityWidget

## Deploy commit
- `62151f3` (whale widget files)
- `ef90c5e` (raw SQL fix)
- `2ea1775` (tokenSymbol removal from WhaleActivity model query)
