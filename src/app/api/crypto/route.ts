import { NextResponse } from 'next/server'

// Force dynamic rendering (required for request.headers access)
export const dynamic = 'force-dynamic'

// In-memory cache with 60-second TTL
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60000 // 60 seconds

// Rate limiting
const rateLimitMap = new Map<string, number[]>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowStart = now - 60 * 1000 // 1 minute
  
  const requests = rateLimitMap.get(ip) || []
  const recentRequests = requests.filter(time => time > windowStart)
  
  if (recentRequests.length >= 30) {
    return false // Rate limited
  }
  
  recentRequests.push(now)
  rateLimitMap.set(ip, recentRequests)
  return true
}

export async function GET(request: Request) {
  try {
    // Get client IP
    const forwarded = (request.headers as any).get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    
    // Rate limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
    
    // Check cache
    const cacheKey = 'crypto-data'
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }
    
    // Fetch from CoinGecko (server-side only) — returns array of coin objects
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ChainPulse-Alpha/1.0',
        },
        next: { revalidate: 60 }
      }
    )
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }
    
    // Return the raw CoinGeckoCoin[] array — matches what fetchTopCoins() expects
    const data = await response.json()
    
    // Update cache
    cache.set(cacheKey, { data, timestamp: Date.now() })
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      }
    })
    
  } catch (error) {
    console.error('Crypto API error:', error)
    
    // Return a structured fallback so the client can degrade gracefully
    return NextResponse.json(
      { error: 'Failed to fetch crypto data. Please try again.' },
      { status: 500 }
    )
  }
}
