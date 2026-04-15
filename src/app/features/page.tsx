'use client'

import { motion } from 'framer-motion'
import { 
  Activity, 
  Eye, 
  TrendingUp, 
  MessageSquare, 
  Zap, 
  Shield, 
  Bell, 
  BarChart3, 
  Wallet, 
  History,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react'
import FadeIn, { FadeInStagger } from '@/components/animations/FadeIn'
import { HoverScale } from '@/components/animations/ScaleIn'
import Link from 'next/link'

const features = [
  {
    icon: Eye,
    title: 'Whale Wallet Tracking',
    description: 'Monitor on-chain activity of 500+ elite crypto wallets. Know exactly when the big players are accumulating or dumping before it hits the price.',
    color: 'from-blue-500 to-cyan-500',
    details: [
      'Real-time transaction monitoring',
      'Smart money wallet alerts',
      'Wallet label database (500+ known wallets)',
      'Cross-chain tracking (ETH, BSC, SOL)',
    ]
  },
  {
    icon: MessageSquare,
    title: 'Twitter/X Sentiment Analysis',
    description: 'AI-powered sentiment scoring across 10,000+ crypto Twitter accounts. Detect sentiment shifts hours before they move the market.',
    color: 'from-purple-500 to-pink-500',
    details: [
      'Real-time sentiment scoring (0-100)',
      'Influencer tracking & weighting',
      'Trending token detection',
      'Sentiment divergence alerts',
    ]
  },
  {
    icon: BarChart3,
    title: 'Correlation Score Engine',
    description: 'Unique correlation algorithm that combines whale activity + social sentiment into a single high-confidence signal score.',
    color: 'from-orange-500 to-yellow-500',
    details: [
      'Proprietary correlation formula',
      'Historical accuracy backtesting',
      'Confidence intervals per signal',
      'Multi-factor signal validation',
    ]
  },
  {
    icon: Bell,
    title: 'Real-Time Telegram Alerts',
    description: 'Get Diamond Signals delivered instantly to your Telegram. Never miss a high-confidence opportunity again — zero delay on premium.',
    color: 'from-green-500 to-emerald-500',
    details: [
      'Instant Telegram notifications',
      'Customizable alert filters',
      'Priority Diamond Signal queue',
      'Mobile-first notification design',
    ]
  },
  {
    icon: TrendingUp,
    title: 'Advanced Signal Dashboard',
    description: 'Full-featured web dashboard with real-time data, historical performance, and deep-dive analytics on every signal.',
    color: 'from-red-500 to-rose-500',
    details: [
      'Live alpha feed with sorting & filtering',
      'Signal performance tracking',
      'Portfolio PnL calculator',
      'CSV export for tax reporting',
    ]
  },
  {
    icon: Wallet,
    title: 'Diamond Signals',
    description: 'Our highest-conviction signals where whale activity + sentiment alignment exceeds 85% correlation. These are the ones that matter.',
    color: 'from-sky-500 to-indigo-500',
    details: [
      '85%+ correlation score threshold',
      'Premium-only access',
      'Historical win rate tracking',
      'Full signal rationale provided',
    ]
  },
  {
    icon: History,
    title: 'Historical Data Access',
    description: 'Access 12+ months of historical signal data. Backtest your strategies and validate signal quality before trusting your capital.',
    color: 'from-violet-500 to-purple-500',
    details: [
      '12 months signal history',
      'Performance benchmarks',
      'Win/loss ratio analytics',
      'Market condition correlation',
    ]
  },
  {
    icon: Activity,
    title: 'API Access (Beta)',
    description: 'Integrate ChainPulse signals directly into your trading bot or custom dashboard via our REST API.',
    color: 'from-teal-500 to-cyan-500',
    details: [
      'RESTful API endpoints',
      'WebSocket real-time stream',
      'Rate limits: 1000 req/hour',
      'Full API documentation',
    ]
  },
]

const stats = [
  { value: '500+', label: 'Wallets Tracked' },
  { value: '10K+', label: 'Twitter Accounts' },
  { value: '85%+', label: 'Signal Accuracy' },
  { value: '0s', label: 'Alert Delay (Premium)' },
]

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Back Link */}
        <FadeIn>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-text-muted hover:text-primary-400 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </FadeIn>

        {/* Hero */}
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 text-primary-400 text-sm mb-6">
              <Zap className="w-4 h-4" />
              <span>Full Feature Overview</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Everything you need to{' '}
              <span className="gradient-text">trade smarter</span>
            </h1>
            <p className="text-text-secondary max-w-2xl mx-auto">
              ChainPulse Alpha combines on-chain whale intelligence with social sentiment analysis 
              to give you an unfair advantage in crypto markets.
            </p>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card p-6 text-center">
                <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-text-muted text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Feature Grid */}
        <FadeInStagger stagger={0.08} className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature) => (
            <HoverScale key={feature.title}>
              <motion.div
                className="glass-card p-8 rounded-2xl border border-border hover:border-primary-500/30 transition-all duration-300"
                whileHover={{ y: -4 }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-0.5 flex-shrink-0`}>
                    <div className="w-full h-full rounded-xl bg-background-card flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                    <p className="text-text-secondary text-sm">{feature.description}</p>
                  </div>
                </div>
                <ul className="space-y-2 ml-16">
                  {feature.details.map((detail) => (
                    <li key={detail} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success-400 flex-shrink-0" />
                      <span className="text-text-muted text-sm">{detail}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </HoverScale>
          ))}
        </FadeInStagger>

        {/* CTA */}
        <FadeIn delay={0.5}>
          <div className="text-center glass-card p-12 rounded-2xl border border-primary-500/30">
            <Shield className="w-12 h-12 text-primary-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Ready to get the edge?</h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Join 500+ traders already using ChainPulse Alpha to stay ahead of the market.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="button-primary px-8 py-3 rounded-xl font-semibold text-center"
              >
                Start Free Today
              </Link>
              <Link
                href="/pricing"
                className="button-secondary px-8 py-3 rounded-xl font-semibold text-center"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </main>
  )
}
