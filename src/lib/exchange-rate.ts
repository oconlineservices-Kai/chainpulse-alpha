/**
 * Exchange rate utility — USD → INR live conversion
 *
 * Fetches from a free API with in-memory caching.
 * Falls back to a hardcoded rate if the API is unavailable.
 */

const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes
let cachedRate: number | null = null
let cachedAt: number = 0

// Spring-fresh fallback: seeded with live rate, survives with longer TTL
// If both APIs fail, this retains the last-known-good rate for up to 24h
const STALE_CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Return the last known rate (may be stale) for use as fallback.
 */
export function getCachedINRRate(): number | null {
  const now = Date.now()
  if (cachedRate !== null && now - cachedAt < STALE_CACHE_TTL_MS) {
    return cachedRate
  }
  return null
}

export async function getUSDToINR(): Promise<number> {
  const now = Date.now()

  // Return cached rate if still fresh
  if (cachedRate !== null && now - cachedAt < CACHE_TTL_MS) {
    return cachedRate
  }

  // Try multiple free APIs in order of preference
  const apis = [
    {
      url: 'https://api.exchangerate-api.com/v4/latest/USD',
      extract: (data: any) => data?.rates?.INR as number | undefined,
    },
    {
      url: 'https://open.er-api.com/v6/latest/USD',
      extract: (data: any) => data?.rates?.INR as number | undefined,
    },
  ]

  for (const api of apis) {
    try {
      const res = await fetch(api.url, {
        signal: AbortSignal.timeout(5000),
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) continue
      const data = await res.json()
      const rate = api.extract(data)
      if (rate && rate > 0) {
        cachedRate = rate
        cachedAt = now
        return rate
      }
    } catch {
      continue // Try next API
    }
  }

  // Final fallback — try Stale Cache first, then se ASTMINT
  const stale = getCachedINRRate()
  if (stale !== null) {
    console.warn(`[ExchangeRate] Both APIs failed — using stale rate from cache: ${stale}`)
    cachedRate = stale
    cachedAt = Date.now() // Refresh staleness timer
    return stale
  }

  // Last resort — updated seed rate (June 2026: ~85.34 INR per USD)
  // Live rate is auto-refreshed and cached. This is only used on first-ever cold start
  // when neither API has ever responded.
  return 85.34
}

/**
 * Convert USD amount to INR (no GST).
 *
 * @param usdAmount - Amount in USD (e.g. 49 for Premium)
 * @returns Object with total INR and total in paise (for Razorpay)
 */
export async function convertToINR(usdAmount: number): Promise<{
  rate: number
  totalINR: number
  totalPaise: number
}> {
  const rate = await getUSDToINR()
  const totalINR = Math.round(usdAmount * rate)
  const totalPaise = Math.round(totalINR * 100) // Razorpay uses paise

  return { rate, totalINR, totalPaise }
}
