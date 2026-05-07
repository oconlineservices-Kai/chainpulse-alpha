import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const POST = auth(async (req) => {
  if (!req.auth?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const existingUsers = await prisma.user.count()
    const existingSignals = await prisma.signal.count()
    const existingTransactions = await prisma.transaction.count()

    const results: string[] = []

    // Only generate if empty
    if (existingUsers === 0) {
      await prisma.user.createMany({
        data: [
          { email: 'admin@chainpulsealpha.com', password: '$2a$10$dummy', premiumStatus: 'admin', credits: 999 },
          { email: 'premium@test.com', password: '$2a$10$dummy', premiumStatus: 'premium', credits: 100, premiumExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
          { email: 'free1@test.com', password: '$2a$10$dummy', premiumStatus: 'free', credits: 10 },
          { email: 'free2@test.com', password: '$2a$10$dummy', premiumStatus: 'free', credits: 5 },
          { email: 'user@demo.com', password: '$2a$10$dummy', premiumStatus: 'free', credits: 0 },
        ],
      })
      results.push('5 demo users created')
    } else {
      results.push(`${existingUsers} users already exist (skipped)`)
    }

    if (existingSignals === 0) {
      const tokens = [
        { symbol: 'BTC', name: 'Bitcoin', sentiment: 85, whale: 92, correlation: 88, diamond: true, price: 67420, change: 2.3 },
        { symbol: 'ETH', name: 'Ethereum', sentiment: 78, whale: 88, correlation: 82, diamond: true, price: 3520, change: 1.8 },
        { symbol: 'SOL', name: 'Solana', sentiment: 82, whale: 79, correlation: 76, diamond: false, price: 142.5, change: 5.2 },
        { symbol: 'ARB', name: 'Arbitrum', sentiment: 88, whale: 62, correlation: 71, diamond: false, price: 0.89, change: -1.2 },
        { symbol: 'AVAX', name: 'Avalanche', sentiment: 71, whale: 93, correlation: 80, diamond: true, price: 38.2, change: 3.1 },
        { symbol: 'INJ', name: 'Injective', sentiment: 88, whale: 90, correlation: 89, diamond: false, price: 24.5, change: 5.1 },
        { symbol: 'BNB', name: 'BNB Chain', sentiment: 65, whale: 78, correlation: 71, diamond: false, price: 595, change: -0.5 },
        { symbol: 'LINK', name: 'Chainlink', sentiment: 79, whale: 55, correlation: 67, diamond: false, price: 14.2, change: 2.8 },
        { symbol: 'MATIC', name: 'Polygon', sentiment: 84, whale: 88, correlation: 86, diamond: true, price: 0.72, change: 4.5 },
        { symbol: 'APT', name: 'Aptos', sentiment: 76, whale: 85, correlation: 80, diamond: false, price: 9.8, change: 6.7 },
      ]

      const now = new Date()
      await prisma.signal.createMany({
        data: tokens.map((t, i) => ({
          tokenSymbol: t.symbol,
          tokenName: t.name,
          sentimentScore: t.sentiment,
          whaleConfidence: t.whale,
          correlationScore: t.correlation,
          isDiamondSignal: t.diamond,
          twitterMentions: Math.floor(Math.random() * 50000) + 5000,
          whaleWallets: [],
          entryPrice: t.price,
          currentPrice: t.price * (1 + t.change / 100),
          priceChangePct: t.change,
          performanceStatus: t.change > 0 ? 'profitable' : 'losing',
          createdAt: new Date(now.getTime() - i * 2 * 60 * 60 * 1000),
          expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          lastPerformanceUpdate: now,
          hoursTracked: i * 2,
        })),
      })
      results.push('10 demo signals created')
    } else {
      results.push(`${existingSignals} signals already exist (skipped)`)
    }

    if (existingTransactions === 0) {
      const transactions = [
        { userId: null as string | null, provider: 'razorpay', transactionType: 'premium', providerPaymentId: 'pay_demo_001', status: 'completed', amount: 999, creditsAdded: 100 },
        { userId: null as string | null, provider: 'razorpay', transactionType: 'alpha_purchase', providerPaymentId: 'pay_demo_002', status: 'completed', amount: 49, creditsAdded: 0 },
        { userId: null as string | null, provider: 'razorpay', transactionType: 'premium', providerPaymentId: 'pay_demo_003', status: 'completed', amount: 999, creditsAdded: 100 },
      ]

      // Get user IDs for transactions
      const users = await prisma.user.findMany({ take: 3, select: { id: true } })
      if (users.length > 0) {
        for (const t of transactions) {
          await prisma.transaction.create({
            data: {
              ...t,
              userId: users[transactions.indexOf(t) % users.length]?.id ?? users[0]!.id,
            },
          })
        }
        results.push('3 demo transactions created')
      }
    } else {
      results.push(`${existingTransactions} transactions already exist (skipped)`)
    }

    return NextResponse.json({
      success: true,
      message: results.join('. ') || 'Nothing to generate (data already exists)',
    })
  } catch (error) {
    console.error('Demo data error:', error)
    return NextResponse.json(
      { error: 'Failed to generate demo data' },
      { status: 500 }
    )
  }
})
