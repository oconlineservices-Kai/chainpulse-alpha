export interface Signal {
  id: string
  tokenSymbol: string
  tokenName?: string
  sentimentScore?: number
  whaleConfidence?: number
  correlationScore?: number
  isDiamondSignal: boolean
  twitterMentions?: number
  whaleWallets?: string[]
  createdAt: Date
  expiresAt?: Date
}

export interface User {
  id: string
  email: string
  walletAddress?: string
  premiumStatus: 'free' | 'premium' | 'cancelled'
  premiumExpiresAt?: Date
  credits: number
  createdAt: Date
}

export interface Transaction {
  id: string
  userId: string
  provider: 'razorpay' | 'paypal'
  transactionType: 'subscription' | 'pay_per_alpha'
  amount: number
  currency: string
  status: 'captured' | 'failed' | 'refunded'
  creditsAdded?: number
  createdAt: Date
}
