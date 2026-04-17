/**
 * ChainPulse Signal Engine v3 - WITH PRICE TRACKING
 * 
 * Enhanced version that:
 * 1. Generates signals based on market data
 * 2. Tracks entry price at signal creation
 * 3. Updates performance metrics over time
 * 4. Calculates ROI for signal validation
 */

const { PrismaClient } = require('@prisma/client')
const https = require('https')
const http = require('http')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || 
           'postgresql://chainpulse:chainpulse123@localhost:5432/chainpulse'
    }
  }
})

// ── Config ────────────────────────────────────────────────────────────────────

const SIGNAL_EXPIRY_HOURS = 48
const MAX_SIGNALS_PER_RUN = 5
const MIN_MARKET_CAP_USD = 50_000_000 // $50M min market cap
const MIN_VOLUME_USD = 1_000_000 // $1M min 24h volume
const PERFORMANCE_TRACKING_HOURS = 24 // Track performance for 24h after signal

// Tokens to track (expand as needed)
const TRACKED_TOKENS = [
  'bitcoin', 'ethereum', 'binancecoin', 'solana', 'arbitrum',
  'avalanche-2', 'chainlink', 'optimism', 'polygon', 'uniswap',
  'aave', 'the-graph', 'render-token', 'injective-protocol',
  'sui', 'aptos', 'near', 'cosmos', 'polkadot', 'cardano'
]

// ── HTTP Helper ───────────────────────────────────────────────────────────────

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    const req = client.get(url, {
      headers: {
        'User-Agent': 'ChainPulse/3.0 (signal-generator-enhanced)',
        'Accept': 'application/json',
      },
      timeout: 10000
    }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${url}`))
        return
      }
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch (err) {
          reject(new Error(`Invalid JSON: ${err.message}`))
        }
      })
    })
    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
  })
}

// ── CoinGecko API ─────────────────────────────────────────────────────────────

async function fetchCoinGeckoMarketData() {
  const ids = TRACKED_TOKENS.join(',')
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h,24h,7d`
  
  try {
    const data = await fetchJSON(url)
    return data.map(coin => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      currentPrice: coin.current_price,
      marketCap: coin.market_cap,
      totalVolume: coin.total_volume,
      priceChange1h: coin.price_change_percentage_1h_in_currency || 0,
      priceChange24h: coin.price_change_percentage_24h_in_currency || 0,
      priceChange7d: coin.price_change_percentage_7d_in_currency || 0,
      high24h: coin.high_24h,
      low24h: coin.low_24h,
      ath: coin.ath,
      athChangePercentage: coin.ath_change_percentage,
      lastUpdated: coin.last_updated
    }))
  } catch (error) {
    console.error('CoinGecko API error:', error.message)
    throw error
  }
}

// ── Scoring Logic ─────────────────────────────────────────────────────────────

function scoreToken(coin) {
  // 1. Sentiment Score (0-100): Based on recent price performance
  const sentimentScore = Math.min(100, Math.max(0,
    50 + // Base score
    (coin.priceChange1h || 0) * 2 + // 1h momentum
    (coin.priceChange24h || 0) * 1.5 + // 24h trend
    (coin.priceChange7d || 0) * 0.5 // 7d trend
  ))

  // 2. Whale Confidence (0-100): Based on volume vs market cap ratio
  const volumeToMarketCap = coin.totalVolume / coin.marketCap
  const whaleConfidence = Math.min(100, Math.max(0,
    50 + // Base score
    (volumeToMarketCap > 0.05 ? 30 : 0) + // High volume ratio
    (coin.priceChange24h > 5 ? 20 : 0) + // Strong 24h move
    (coin.currentPrice > coin.ath * 0.8 ? 10 : 0) // Near ATH
  ))

  // 3. Correlation Score (0-100): How well factors align
  const correlationScore = Math.min(100, Math.max(0,
    (sentimentScore + whaleConfidence) / 2 + // Average of other scores
    (sentimentScore > 70 && whaleConfidence > 70 ? 20 : 0) + // Both strong
    (coin.priceChange1h > 0 && coin.priceChange24h > 0 ? 10 : 0) // Positive momentum
  ))

  // 4. Diamond Signal: High confidence across all metrics
  const isDiamondSignal = 
    sentimentScore >= 75 && 
    whaleConfidence >= 80 && 
    correlationScore >= 80

  // 5. Twitter mentions (simulated - would come from Twitter API)
  const twitterMentions = Math.floor(
    1000 + 
    Math.abs(coin.priceChange24h) * 100 + 
    coin.marketCap / 1000000000 * 10
  )

  return {
    sentimentScore: Math.round(sentimentScore),
    whaleConfidence: Math.round(whaleConfidence),
    correlationScore: Math.round(correlationScore),
    isDiamondSignal,
    twitterMentions
  }
}

function shouldGenerateSignal(coin, scores) {
  // Basic filters
  if (coin.marketCap < MIN_MARKET_CAP_USD) return false
  if (coin.totalVolume < MIN_VOLUME_USD) return false
  
  // Quality filters
  if (scores.sentimentScore < 60) return false
  if (scores.whaleConfidence < 65) return false
  if (scores.correlationScore < 70) return false
  
  return true
}

// ── Performance Tracking ──────────────────────────────────────────────────────

async function updateSignalPerformance() {
  console.log('Updating performance for existing signals...')
  
  try {
    // Get signals that need performance updates (created in last 24h, not expired)
    const performanceCutoff = new Date(Date.now() - PERFORMANCE_TRACKING_HOURS * 60 * 60 * 1000)
    const activeSignals = await prisma.signal.findMany({
      where: {
        createdAt: { gt: performanceCutoff },
        expiresAt: { gt: new Date() }
      }
    })

    if (activeSignals.length === 0) {
      console.log('No active signals to update')
      return
    }

    // Get current prices for all active signal tokens
    const symbols = [...new Set(activeSignals.map(s => s.tokenSymbol.toLowerCase()))]
    const ids = symbols.map(sym => TRACKED_TOKENS.find(t => t.includes(sym.toLowerCase()))).filter(Boolean)
    
    if (ids.length === 0) {
      console.log('No matching tokens found for performance update')
      return
    }

    const currentMarketData = await fetchCoinGeckoMarketData()
    const priceMap = {}
    currentMarketData.forEach(coin => {
      priceMap[coin.symbol.toUpperCase()] = coin.currentPrice
    })

    // Update each signal with current performance
    let updated = 0
    for (const signal of activeSignals) {
      const currentPrice = priceMap[signal.tokenSymbol.toUpperCase()]
      
      if (!currentPrice || !signal.entryPrice) {
        continue // Can't calculate performance without entry price
      }

      const priceChange = ((currentPrice - signal.entryPrice) / signal.entryPrice) * 100
      const hoursSinceSignal = (Date.now() - signal.createdAt.getTime()) / (1000 * 60 * 60)
      
      // Determine performance status
      let performanceStatus = 'NEUTRAL'
      if (priceChange >= 5) performanceStatus = 'STRONG_GAIN'
      else if (priceChange >= 2) performanceStatus = 'GAIN'
      else if (priceChange <= -5) performanceStatus = 'STRONG_LOSS'
      else if (priceChange <= -2) performanceStatus = 'LOSS'

      // Update signal with performance data
      await prisma.signal.update({
        where: { id: signal.id },
        data: {
          currentPrice,
          priceChangePct: Math.round(priceChange * 100) / 100, // 2 decimal places
          performanceStatus,
          hoursTracked: Math.round(hoursSinceSignal * 10) / 10, // 1 decimal place
          lastPerformanceUpdate: new Date()
        }
      })

      updated++
    }

    console.log(`Updated performance for ${updated} signals`)
    
  } catch (error) {
    console.error('Performance update error:', error.message)
  }
}

// ── Main Signal Generation ────────────────────────────────────────────────────

async function generateSignals() {
  const runId = Date.now()
  console.log(`[${runId}] Signal generation run #${runId} started`)

  try {
    console.log(`[${runId}] Fetching CoinGecko market data...`)
    const marketData = await fetchCoinGeckoMarketData()
    console.log(`[${runId}] Got ${marketData.length} coins from CoinGecko`)

    // Score each token
    const scoredCoins = marketData.map(coin => ({
      coin,
      scores: scoreToken(coin)
    }))

    // Filter to only signal-worthy tokens
    const signalWorthy = scoredCoins
      .filter(({ coin, scores }) => shouldGenerateSignal(coin, scores))
      .sort((a, b) => b.scores.correlationScore - a.scores.correlationScore) // Best first
      .slice(0, MAX_SIGNALS_PER_RUN)

    console.log(`[${runId}] ${signalWorthy.length} tokens qualify for signals`)

    if (signalWorthy.length === 0) {
      console.log(`[${runId}] No signal-worthy tokens this run — market may be quiet`)
      return
    }

    // Check which signals already exist in DB to avoid duplicates (24h window)
    const recentCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const existingSignals = await prisma.signal.findMany({
      where: { createdAt: { gt: recentCutoff } },
      select: { tokenSymbol: true }
    })
    const existingSet = new Set(existingSignals.map(s => s.tokenSymbol.toUpperCase()))

    // Create signals for new tokens WITH ENTRY PRICE
    let created = 0
    const expiresAt = new Date(Date.now() + SIGNAL_EXPIRY_HOURS * 60 * 60 * 1000)

    for (const { coin, scores } of signalWorthy) {
      const symbol = coin.symbol.toUpperCase()
      
      if (existingSet.has(symbol)) {
        console.log(`[${runId}] Skipping ${symbol} — signal already exists in last 24h`)
        continue
      }

      try {
        const signal = await prisma.signal.create({
          data: {
            tokenSymbol: symbol,
            tokenName: coin.name,
            sentimentScore: scores.sentimentScore,
            whaleConfidence: scores.whaleConfidence,
            correlationScore: scores.correlationScore,
            isDiamondSignal: scores.isDiamondSignal,
            twitterMentions: scores.twitterMentions,
            whaleWallets: [], // Real whale wallets would come from on-chain data
            entryPrice: coin.currentPrice, // CRITICAL: Store entry price
            currentPrice: coin.currentPrice, // Initial current price
            priceChangePct: 0, // Initial 0% change
            performanceStatus: 'NEW',
            hoursTracked: 0,
            expiresAt,
          }
        })

        console.log(`[${runId}] ✓ Created signal: ${symbol} | entry=$${coin.currentPrice} sentiment=${scores.sentimentScore} whale=${scores.whaleConfidence} correlation=${scores.correlationScore} diamond=${scores.isDiamondSignal}`)
        created++
      } catch (err) {
        console.error(`[${runId}] Failed to create signal for ${symbol}:`, err.message)
      }
    }

    console.log(`[${runId}] Signal generation complete. Created ${created} new signals.`)

    // Update performance for existing signals
    await updateSignalPerformance()

    // Clean up expired signals older than 7 days
    const cleanupCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const deleted = await prisma.signal.deleteMany({
      where: { createdAt: { lt: cleanupCutoff } }
    })
    if (deleted.count > 0) {
      console.log(`[${runId}] Cleaned up ${deleted.count} old signals`)
    }

  } catch (error) {
    console.error(`[${runId}] Signal generation error:`, error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// ── Entry Point ───────────────────────────────────────────────────────────────

generateSignals()
  .then(() => {
    console.log('Enhanced signal generator finished.')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })