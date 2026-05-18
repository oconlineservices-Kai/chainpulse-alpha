// CoinGecko API integration for real crypto data

export interface CoinGeckoCoin {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  image: string
}

export interface Signal {
  id: string
  tokenSymbol: string
  tokenName: string
  price: number
  priceChange: number
  sentimentScore: number
  whaleConfidence: number
  correlationScore: number
  timestamp: string
  status: 'Free' | 'Premium' | 'Locked'
  twitterMentions: number
  whaleWallets: string[]
  recommendation: 'Buy' | 'Sell' | 'Skip'
  volume24h: number
  marketCap: number
  image?: string
  signalSource?: 'live' | 'cached' | 'demo'
}

// Generate AI scores based on real market data
const generateScores = (priceChange: number): { sentiment: number; whale: number; correlation: number } => {
  // Sentiment based on price movement (higher change = higher sentiment)
  const sentiment = Math.min(95, Math.max(40, 60 + priceChange * 1.5))
  
  // Whale confidence (randomized but weighted by price change)
  const whale = Math.min(95, Math.max(45, 55 + Math.random() * 25 + priceChange * 0.5))
  
  // Correlation is average
  const correlation = Math.round((sentiment + whale) / 2)
  
  return {
    sentiment: Math.round(sentiment),
    whale: Math.round(whale),
    correlation,
  }
}

// Generate recommendation based on scores
const generateRecommendation = (scores: { sentiment: number; whale: number; correlation: number }): 'Buy' | 'Sell' | 'Skip' => {
  const avg = (scores.sentiment + scores.whale + scores.correlation) / 3
  if (avg >= 75) return 'Buy'
  if (avg <= 45) return 'Sell'
  return 'Skip'
}

// Determine signal status based on correlation score
const determineStatus = (correlation: number): 'Free' | 'Premium' | 'Locked' => {
  if (correlation >= 85) return 'Premium'
  if (correlation >= 70) return 'Free'
  return 'Locked'
}

// Generate mock whale wallets (real 42-char hex addresses for valid explorer links)
const generateWhaleWallets = (count: number): string[] => {
  const wallets: string[] = []
  const knownWallets = [
    '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae',
    '0x220866b1a2219f40e72f5c628b65d54268ca3a9d',
    '0x00000000219ab540356cbb839cbe05303d7705fa',
    '0x8894e0a0c962cb723c1976a4421c959dfbe81251',
    '0xf977814e90da44bfa03e56b3c38bf12f1e7c3571',
    '0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503',
    '0x5a52e96bacdabb82fd05763e25335261b270efcb',
    '0x2b1a6a34c56a89b2e91f255c89771738ec2c6ea9',
  ]
  for (let i = 0; i < count; i++) {
    wallets.push(knownWallets[i % knownWallets.length])
  }
  return wallets
}

// Fetch top coins from internal API (server-side proxy to CoinGecko)
export async function fetchTopCoins(limit: number = 20): Promise<Signal[]> {
  try {
    const response = await fetch('/api/crypto', {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const coins: CoinGeckoCoin[] = await response.json()

    return coins.map((coin) => {
      const scores = generateScores(coin.price_change_percentage_24h || 0)
      const status = determineStatus(scores.correlation)
      const recommendation = generateRecommendation(scores)

      return {
        id: coin.id,
        tokenSymbol: coin.symbol.toUpperCase(),
        tokenName: coin.name,
        price: coin.current_price,
        priceChange: coin.price_change_percentage_24h || 0,
        sentimentScore: scores.sentiment,
        whaleConfidence: scores.whale,
        correlationScore: scores.correlation,
        timestamp: new Date().toISOString(),
        status,
        twitterMentions: Math.floor(Math.random() * 2000) + 100,
        whaleWallets: generateWhaleWallets(status === 'Premium' ? 3 : status === 'Free' ? 2 : 1),
        recommendation,
        volume24h: coin.total_volume,
        marketCap: coin.market_cap,
        image: coin.image,
      }
    })
  } catch (error) {
    console.error('Failed to fetch coins:', error)
    throw error
  }
}

// Fetch single coin details
export async function fetchCoinDetails(coinId: string): Promise<Partial<Signal>> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=false`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const coin = await response.json()
    const priceChange = coin.market_data?.price_change_percentage_24h || 0
    const scores = generateScores(priceChange)

    return {
      price: coin.market_data?.current_price?.usd || 0,
      priceChange,
      sentimentScore: scores.sentiment,
      whaleConfidence: scores.whale,
      correlationScore: scores.correlation,
      volume24h: coin.market_data?.total_volume?.usd || 0,
      marketCap: coin.market_data?.market_cap?.usd || 0,
      image: coin.image?.small,
    }
  } catch (error) {
    console.error('Failed to fetch coin details:', error)
    throw error
  }
}

// Fallback mock data in case API fails
export const mockSignals: Signal[] = [
  {
    id: 'bitcoin',
    tokenSymbol: 'BTC',
    tokenName: 'Bitcoin',
    price: 65000,
    priceChange: 2.5,
    sentimentScore: 82,
    whaleConfidence: 88,
    correlationScore: 85,
    timestamp: new Date().toISOString(),
    status: 'Premium',
    twitterMentions: 1247,
    whaleWallets: [
      '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae',
      '0x220866b1a2219f40e72f5c628b65d54268ca3a9d',
    ],
    recommendation: 'Buy',
    volume24h: 35000000000,
    marketCap: 1250000000000,
  },
  {
    id: 'ethereum',
    tokenSymbol: 'ETH',
    tokenName: 'Ethereum',
    price: 3200,
    priceChange: 1.8,
    sentimentScore: 78,
    whaleConfidence: 82,
    correlationScore: 80,
    timestamp: new Date().toISOString(),
    status: 'Premium',
    twitterMentions: 892,
    whaleWallets: [
      '0x00000000219ab540356cbb839cbe05303d7705fa',
      '0x8894e0a0c962cb723c1976a4421c959dfbe81251',
    ],
    recommendation: 'Buy',
    volume24h: 15000000000,
    marketCap: 380000000000,
  },
]

export default { fetchTopCoins, fetchCoinDetails, mockSignals }
