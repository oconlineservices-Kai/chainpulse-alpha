#!/usr/bin/env node
/**
 * ChainPulse Performance Updater
 * 
 * Updates price performance for existing signals
 * Runs every 15 minutes to track ROI
 * 
 * Fix: Runs from /opt/chainpulse/app/scripts/ so @prisma/client resolves correctly.
 * DB credentials are inherited from the shell environment (crontab).
 */

// Resolve modules from /opt/chainpulse/app
const path = require('path');
const appRoot = path.resolve(__dirname, '..');
const modulePath = path.join(appRoot, 'node_modules');
const Module = require('module');
const origResolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent) {
  try {
    return origResolve.call(this, request, parent);
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      return origResolve.call(this, request, { paths: [modulePath, ...(parent?.paths || [])] });
    }
    throw e;
  }
};

const { PrismaClient } = require('@prisma/client')
const https = require('https')
const http = require('http')

const prisma = new PrismaClient()

// Tokens to track
const TRACKED_TOKENS = [
  'bitcoin', 'ethereum', 'binancecoin', 'solana', 'arbitrum',
  'avalanche-2', 'chainlink', 'optimism', 'polygon', 'uniswap',
  'aave', 'the-graph', 'render-token', 'injective-protocol',
  'sui', 'aptos', 'near', 'cosmos', 'polkadot', 'cardano'
]

// HTTP Helper
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    const req = client.get(url, {
      headers: {
        'User-Agent': 'ChainPulse/3.0 (performance-updater)',
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

// Fetch current market data
async function fetchCoinGeckoMarketData() {
  const ids = TRACKED_TOKENS.join(',')
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
  
  try {
    const data = await fetchJSON(url)
    return data.map(coin => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      currentPrice: coin.current_price,
      marketCap: coin.market_cap,
      totalVolume: coin.total_volume,
      priceChange24h: coin.price_change_percentage_24h_in_currency || 0,
      lastUpdated: coin.last_updated
    }))
  } catch (error) {
    console.error('CoinGecko API error:', error.message)
    throw error
  }
}

// Update signal performance
async function updateSignalPerformance() {
  const runId = Date.now()
  console.log(`[${runId}] Performance update started`)

  try {
    // Get active signals (created in last 48 hours, not expired)
    const activeCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000)
    const activeSignals = await prisma.signal.findMany({
      where: {
        createdAt: { gt: activeCutoff },
        expiresAt: { gt: new Date() },
        signalType: { not: 'DIAMOND' }  // Don't track diamond signals publicly
      }
    })

    if (activeSignals.length === 0) {
      console.log(`[${runId}] No active signals to update`)
      return
    }

    console.log(`[${runId}] Found ${activeSignals.length} active signals`)

    // Get current prices for all active signal tokens
    const symbols = [...new Set(activeSignals.map(s => s.tokenSymbol?.toLowerCase()).filter(Boolean))]

    const currentMarketData = await fetchCoinGeckoMarketData()
    const priceMap = {}
    currentMarketData.forEach(coin => {
      priceMap[coin.symbol.toUpperCase()] = coin.currentPrice
    })

    // Update each signal with current performance
    let updated = 0
    let skipped = 0
    
    for (const signal of activeSignals) {
      const currentPrice = priceMap[signal.tokenSymbol?.toUpperCase()]
      
      if (!currentPrice) {
        skipped++
        continue
      }

      // Calculate performance metrics
      const hoursSinceSignal = (Date.now() - new Date(signal.createdAt).getTime()) / (1000 * 60 * 60)
      
      let priceChangePct = 0
      let performanceStatus = 'NEUTRAL'
      
      if (signal.entryPrice && signal.entryPrice > 0) {
        priceChangePct = ((currentPrice - signal.entryPrice) / signal.entryPrice) * 100
        
        if (priceChangePct >= 10) performanceStatus = 'STRONG_GAIN'
        else if (priceChangePct >= 3) performanceStatus = 'GAIN'
        else if (priceChangePct <= -10) performanceStatus = 'STRONG_LOSS'
        else if (priceChangePct <= -3) performanceStatus = 'LOSS'
        else performanceStatus = 'NEUTRAL'
      }

      await prisma.signal.update({
        where: { id: signal.id },
        data: {
          currentPrice: Math.round(currentPrice * 100) / 100,
          priceChangePct: Math.round(priceChangePct * 100) / 100,
          performanceStatus,
          hoursTracked: Math.round(hoursSinceSignal * 10) / 10,
          lastPerformanceUpdate: new Date()
        }
      })

      updated++
    }

    console.log(`[${runId}] Performance update complete: ${updated} updated, ${skipped} skipped`)
    
    // Generate performance summary
    await generatePerformanceSummary()
    
  } catch (error) {
    console.error(`[${runId}] Performance update error:`, error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Generate performance summary report
async function generatePerformanceSummary() {
  try {
    const weekCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentSignals = await prisma.signal.findMany({
      where: {
        createdAt: { gt: weekCutoff },
        priceChangePct: { not: null },
        signalType: { not: 'DIAMOND' }
      }
    })

    if (recentSignals.length === 0) {
      console.log('No signals with performance data to analyze')
      return
    }

    const totalSignals = recentSignals.length
    const profitableSignals = recentSignals.filter(s => s.priceChangePct > 0).length
    const losingSignals = recentSignals.filter(s => s.priceChangePct < 0).length
    const neutralSignals = recentSignals.filter(s => s.priceChangePct === 0).length
    
    const avgReturn = recentSignals.reduce((sum, s) => sum + (s.priceChangePct || 0), 0) / totalSignals
    const maxGain = Math.max(...recentSignals.map(s => s.priceChangePct || 0))
    const maxLoss = Math.min(...recentSignals.map(s => s.priceChangePct || 0))
    
    const winRate = totalSignals > 0 ? (profitableSignals / totalSignals) * 100 : 0

    console.log('\n📊 PERFORMANCE SUMMARY (Last 7 Days)')
    console.log('═════════════════════════════════════════')
    console.log(`Total Signals: ${totalSignals}`)
    console.log(`Profitable: ${profitableSignals} (${winRate.toFixed(1)}%)`)
    console.log(`Losing: ${losingSignals} (${((losingSignals/totalSignals)*100).toFixed(1)}%)`)
    console.log(`Average Return: ${avgReturn.toFixed(2)}%`)
    console.log(`Best Signal: +${maxGain.toFixed(2)}%`)
    console.log(`Worst Signal: ${maxLoss.toFixed(2)}%`)
    
    // Save summary to log file
    const summary = {
      timestamp: new Date().toISOString(),
      period: '7d',
      totalSignals,
      profitableSignals,
      losingSignals,
      neutralSignals,
      winRate,
      avgReturn,
      maxGain,
      maxLoss
    }
    
    const fs = require('fs')
    const logDir = '/opt/chainpulse/logs'
    const logFile = path.join(logDir, 'performance-summary.json')
    
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
    
    let history = []
    try {
      if (fs.existsSync(logFile)) {
        history = JSON.parse(fs.readFileSync(logFile, 'utf8'))
      }
    } catch (e) {
      // Start fresh
    }
    
    history.push(summary)
    if (history.length > 30) {
      history = history.slice(-30)
    }
    
    fs.writeFileSync(logFile, JSON.stringify(history, null, 2))
    console.log(`Performance summary saved to ${logFile}`)
    
  } catch (error) {
    console.error('Performance summary error:', error.message)
  }
}

// ── Entry Point ───────────────────────────────────────────────────────────────

updateSignalPerformance()
  .then(() => {
    console.log('Performance updater finished.')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
