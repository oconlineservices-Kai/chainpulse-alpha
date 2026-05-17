/**
 * ChainPulse Alpha — Real Signal Generator
 *
 * Fetches live crypto market data from CoinGecko (free API, no key needed)
 * and generates signal scores based on price movement, volume, and market cap.
 *
 * Rate limiting: CoinGecko free tier is 10-30 calls/min.
 * We cache aggressively (5 min TTL) and only fetch on demand.
 */

import { prisma } from '@/lib/prisma'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface MarketData {
  id: string
  symbol: string
  name: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  total_volume: number
  price_change_percentage_24h: number
  image: string
}

export interface GeneratedSignal {
  tokenSymbol: string
  tokenName: string
  sentimentScore: number
  whaleConfidence: number
  correlationScore: number
  isDiamondSignal: boolean
  twitterMentions: number
  whaleWallets: string[]
  entryPrice: number
  currentPrice: number
  priceChangePct: number
  expiresAt: Date
}

export type SignalType = 'Diamond Signal' | 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell'

// ── Memoized whale wallets (for demo realism) ──────────────────────────────────
const WHALE_WALLETS_BY_SYMBOL: Record<string, string[]> = {
  BTC: [
    'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    'bc1qgdjqv0av3q56jgt82m4w4t3l2h6h4r8k5c9a0x',
    '3LYJfcf6G1dA2Tf6HBfXa8e8iYnZnHq7aD',
  ],
  ETH: [
    '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae',
    '0x220866b1a2219f40e72f5c628b65d54268ca3a9d',
    '0x00000000219ab540356cbb839cbe05303d7705fa',
  ],
  SOL: [
    '7VJ9dhBMkq3KUAhUXQZFQfBPJQzKdN8K5fYCVSG5Pf1u',
    '3bLggfFhRFNDQqUys1SLaLLDCBkHjNBFTxCjCnPLYcKx',
    '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV',
  ],
}

// ── Simple deterministic wallet generator based on token and rank ──────────────
function generateWhaleWallets(symbol: string, marketCapRank: number): string[] {
  // Use pre-defined wallets for major tokens
  if (WHALE_WALLETS_BY_SYMBOL[symbol]) {
    return [...WHALE_WALLETS_BY_SYMBOL[symbol]]
  }

  // For unknown tokens, return real known ethereum whale wallets
  const REAL_FALLBACK_WALLETS = [
    '0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503',
    '0x5a52e96bacdabb82fd05763e25335261b270efcb',
  ]

  // Use marketCapRank as seed to pick from real wallets
  const idx = marketCapRank % REAL_FALLBACK_WALLETS.length
  return [REAL_FALLBACK_WALLETS[idx], REAL_FALLBACK_WALLETS[(idx + 1) % REAL_FALLBACK_WALLETS.length]]
}

// ── In-memory cache for CoinGecko data ─────────────────────────────────────────
interface CacheEntry {
  data: MarketData[]
  timestamp: number
}

let marketCache: CacheEntry | null = null
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

// ── Fetch top cryptos from CoinGecko ──────────────────────────────────────────
export async function fetchTopCryptos(count: number = 50): Promise<MarketData[]> {
  const now = Date.now()

  // Return cached data if fresh
  if (marketCache && (now - marketCache.timestamp) < CACHE_TTL_MS) {
    return marketCache.data.slice(0, count)
  }

  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=${Math.min(count, 50)}&page=1&sparkline=false&price_change_percentage=24h`

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      // Cache the HTTP response in addition to our in-memory cache
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      const text = await response.text()
      // If rate limited, return stale cache
      if (response.status === 429 && marketCache?.data) {
        console.warn('[SignalGenerator] CoinGecko rate limited, using stale cache')
        return marketCache.data.slice(0, count)
      }
      throw new Error(`CoinGecko returned ${response.status}: ${text.slice(0, 200)}`)
    }

    const rawData: any[] = await response.json()

    const marketData: MarketData[] = rawData.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol?.toUpperCase() ?? 'UNKNOWN',
      name: coin.name ?? coin.symbol?.toUpperCase() ?? 'Unknown',
      current_price: coin.current_price ?? 0,
      market_cap: coin.market_cap ?? 0,
      market_cap_rank: coin.market_cap_rank ?? 999,
      total_volume: coin.total_volume ?? 0,
      price_change_percentage_24h: coin.price_change_percentage_24h ?? 0,
      image: coin.image ?? '',
    }))

    // Update cache
    marketCache = {
      data: marketData,
      timestamp: now,
    }

    return marketData
  } catch (error) {
    // On any fetch error, return stale cache if available
    if (marketCache?.data) {
      console.warn('[SignalGenerator] Fetch failed, using stale cache:', error)
      return marketCache.data.slice(0, count)
    }
    throw error
  }
}

// ── Calculate signal score from market data ────────────────────────────────────
interface SignalScoreResult {
  score: number
  type: SignalType
  sentimentScore: number
  whaleConfidence: number
  correlationScore: number
  isDiamondSignal: boolean
  twitterMentions: number
}

export function calculateSignalScore(coin: MarketData): SignalScoreResult {
  const {
    price_change_percentage_24h,
    total_volume,
    market_cap_rank,
    market_cap,
  } = coin

  // ── Price change component (0-40 points) ────────────────────────────────
  // +10% → 40pts, +5% → 20pts, 0% → 0pts, -5% → -20pts (negative), -10% → -40pts
  const priceScore = Math.max(-40, Math.min(40, price_change_percentage_24h * 4))

  // ── Volume confidence component (0-25 points) ───────────────────────────
  // Higher volume = more reliable signal
  // Scale: >$1B → 25pts, >$500M → 20pts, >$100M → 15pts, >$50M → 10pts, >$10M → 5pts
  let volumeScore = 0
  if (total_volume > 1_000_000_000) volumeScore = 25
  else if (total_volume > 500_000_000) volumeScore = 22
  else if (total_volume > 100_000_000) volumeScore = 18
  else if (total_volume > 50_000_000) volumeScore = 14
  else if (total_volume > 10_000_000) volumeScore = 8
  else volumeScore = 3

  // ── Market cap stability component (0-20 points) ────────────────────────
  // Top 10 → 20pts, Top 25 → 16pts, Top 50 → 12pts, Top 100 → 8pts, >100 → 4pts
  let stabilityScore = 0
  if (market_cap_rank <= 10) stabilityScore = 20
  else if (market_cap_rank <= 25) stabilityScore = 16
  else if (market_cap_rank <= 50) stabilityScore = 12
  else if (market_cap_rank <= 100) stabilityScore = 8
  else stabilityScore = 4

  // ── Market cap size bonus (0-15 points) ────────────────────────────────
  // >$10B → 15pts, >$1B → 10pts, >$100M → 5pts
  let marketCapScore = 0
  if (market_cap > 10_000_000_000) marketCapScore = 15
  else if (market_cap > 1_000_000_000) marketCapScore = 10
  else if (market_cap > 100_000_000) marketCapScore = 5

  // ── Total raw score ────────────────────────────────────────────────────
  const rawScore = priceScore + volumeScore + stabilityScore + marketCapScore

  // Normalize to 0-100 range (raw is roughly -40 to 100)
  const normalizedScore = Math.max(0, Math.min(100, Math.round((rawScore + 40) * (100 / 140))))

  // ── Signal type determination ──────────────────────────────────────────
  let signalType: SignalType
  if (normalizedScore > 80) signalType = 'Diamond Signal'
  else if (normalizedScore >= 65) signalType = 'Strong Buy'
  else if (normalizedScore >= 50) signalType = 'Buy'
  else if (normalizedScore >= 30) signalType = 'Neutral'
  else signalType = 'Sell'

  const isDiamondSignal = signalType === 'Diamond Signal'

  // ── Sentiment score (0-100) ────────────────────────────────────────────
  // Based on price change + volume as a proxy for market sentiment
  const sentimentPrice = Math.max(0, Math.min(50, (price_change_percentage_24h + 10) * 2.5))
  const sentimentVolume = Math.min(50, (total_volume / 20_000_000_000) * 50)
  const sentimentScore = Math.max(0, Math.min(100, Math.round(sentimentPrice + sentimentVolume)))

  // ── Whale confidence (0-100) ────────────────────────────────────────────
  // Higher volume + lower market cap rank = more whale activity potential
  const whaleVol = Math.min(40, (total_volume / 50_000_000_000) * 40)
  const whaleCap = Math.max(0, 40 - (market_cap_rank * 0.4))
  const whalePrice = price_change_percentage_24h > 5 ? 20 : price_change_percentage_24h > 0 ? 10 : 0
  const whaleConfidence = Math.max(0, Math.min(100, Math.round(whaleVol + whaleCap + whalePrice)))

  // ── Correlation score (0-100) ──────────────────────────────────────────
  // How well metrics align — strong correlation when all signals point same direction
  const priceDir = price_change_percentage_24h > 2 ? 1 : price_change_percentage_24h < -2 ? -1 : 0
  const volDir = total_volume > 500_000_000 ? 1 : total_volume > 100_000_000 ? 0 : -1
  const capDir = market_cap_rank <= 25 ? 1 : -1
  const alignment = priceDir + volDir + capDir
  const correlationScore = Math.max(0, Math.min(100, Math.round((alignment + 3) * (100 / 6))))

  // ── Simulated Twitter mentions (based on volume and market cap) ─────────
  const mentionBase = Math.round(total_volume / 1_000_000)
  const mentionBonus = Math.max(100, Math.min(50000, market_cap_rank <= 10 ? 30000 : market_cap_rank <= 25 ? 15000 : 5000))
  const twitterMentions = Math.round(mentionBase + mentionBonus + (price_change_percentage_24h * 200))

  return {
    score: normalizedScore,
    type: signalType,
    sentimentScore,
    whaleConfidence,
    correlationScore,
    isDiamondSignal,
    twitterMentions: Math.max(100, twitterMentions),
  }
}

// ── Generate and store signals ──────────────────────────────────────────────────
interface GenerationResult {
  generated: number
  diamonds: number
  errors: string[]
}

export async function generateSignals(count: number = 20): Promise<GenerationResult> {
  const result: GenerationResult = {
    generated: 0,
    diamonds: 0,
    errors: [],
  }

  try {
    // Fetch market data
    const marketData = await fetchTopCryptos(count)

    for (const coin of marketData) {
      try {
        const scoreResult = calculateSignalScore(coin)
        const wallets = generateWhaleWallets(coin.symbol, coin.market_cap_rank)

        // Generate 24h expiry from now
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

        const signalData: GeneratedSignal = {
          tokenSymbol: coin.symbol,
          tokenName: coin.name,
          sentimentScore: scoreResult.sentimentScore,
          whaleConfidence: scoreResult.whaleConfidence,
          correlationScore: scoreResult.correlationScore,
          isDiamondSignal: scoreResult.isDiamondSignal,
          twitterMentions: scoreResult.twitterMentions,
          whaleWallets: wallets,
          entryPrice: coin.current_price,
          currentPrice: coin.current_price,
          priceChangePct: coin.price_change_percentage_24h,
          expiresAt,
        }

        // Upsert signal to database
        await prisma.signal.upsert({
          where: {
            id: `cg-${coin.id}-${new Date().toISOString().slice(0, 10)}`,
          },
          update: {
            sentimentScore: scoreResult.sentimentScore,
            whaleConfidence: scoreResult.whaleConfidence,
            correlationScore: scoreResult.correlationScore,
            isDiamondSignal: scoreResult.isDiamondSignal,
            twitterMentions: scoreResult.twitterMentions,
            whaleWallets: wallets,
            currentPrice: coin.current_price,
            priceChangePct: coin.price_change_percentage_24h,
            expiresAt,
          },
          create: {
            id: `cg-${coin.id}-${new Date().toISOString().slice(0, 10)}`,
            tokenSymbol: coin.symbol,
            tokenName: coin.name,
            sentimentScore: scoreResult.sentimentScore,
            whaleConfidence: scoreResult.whaleConfidence,
            correlationScore: scoreResult.correlationScore,
            isDiamondSignal: scoreResult.isDiamondSignal,
            twitterMentions: scoreResult.twitterMentions,
            whaleWallets: wallets,
            entryPrice: coin.current_price,
            currentPrice: coin.current_price,
            priceChangePct: coin.price_change_percentage_24h,
            expiresAt,
          },
        })

        result.generated++

        if (scoreResult.isDiamondSignal) {
          result.diamonds++
        }
      } catch (coinError) {
        result.errors.push(`${coin.symbol}: ${coinError instanceof Error ? coinError.message : 'Unknown error'}`)
      }
    }
  } catch (error) {
    result.errors.push(`Fatal: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return result
}

// ── Get last generation stats ──────────────────────────────────────────────────
export interface SignalGeneratorStatus {
  running: boolean
  lastRun: Date | null
  totalSignalsGenerated: number
  totalDiamondSignals: number
  lastErrors: string[]
}

let generatorState: SignalGeneratorStatus = {
  running: false,
  lastRun: null,
  totalSignalsGenerated: 0,
  totalDiamondSignals: 0,
  lastErrors: [],
}

export function getGeneratorStatus(): SignalGeneratorStatus {
  return { ...generatorState }
}

export function updateGeneratorState(update: Partial<SignalGeneratorStatus>): void {
  generatorState = { ...generatorState, ...update }
}
