'use client'

import { 
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
  CheckCircle2,
  Cpu,
  AlertTriangle,
  Network,
  Database,
  Filter,
  GitBranch
} from 'lucide-react'
import FadeIn, { FadeInStagger } from '@/components/animations/FadeIn'
import { HoverScale } from '@/components/animations/ScaleIn'
import Link from 'next/link'
import { usePageMeta } from '@/lib/usePageMeta'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

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
    title: 'Real-Time Push Alerts',
    description: 'Get Diamond Signals delivered instantly. Never miss a high-confidence opportunity again — zero delay on premium.',
    color: 'from-green-500 to-emerald-500',
    details: [
      'Instant push notifications',
      'Customizable alert filters',
      'Priority Diamond Signal queue',
      'Real-time signal delivery',
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
      'CSV export for tax reporting',
    ]
  },
  {
    icon: Wallet,
    title: 'Diamond Signals',
    description: 'Our highest-conviction signals where whale activity and sentiment alignment meet our correlation threshold. These are the ones that matter.',
    color: 'from-sky-500 to-indigo-500',
    details: [
      'High-confidence correlation threshold',
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

]

const stats = [
  { value: '500+', label: 'Wallets Tracked' },
  { value: '10K+', label: 'Twitter Accounts' },
  { value: 'High', label: 'Correlation Threshold' },
  { value: '0s', label: 'Alert Delay (Premium)' },
]

const methodologySteps = [
  {
    icon: Cpu,
    title: '1. On-Chain Whale Tracking',
    description: 'Our system monitors 500+ known elite crypto wallets across Ethereum, BSC, and Solana in real-time. Each wallet is categorized by behavior profile (accumulator, trader, institutional, etc.). When a wallet initiates a significant transaction, it is flagged and scored for conviction.',
    details: [
      '500+ labeled whale wallets monitored 24/7',
      'Cross-chain coverage (ETH, BSC, SOL)',
      'Behavioral profiling per wallet address',
      'Transaction size and pattern analysis',
    ]
  },
  {
    icon: Database,
    title: '2. Social Sentiment Analysis',
    description: 'We analyze 10,000+ crypto Twitter accounts using a proprietary NLP pipeline. Each account is weighted by influence score (follower count, engagement rate, historical accuracy). Sentiment is scored from 0-100 and updated in near real-time.',
    details: [
      '10K+ Twitter accounts continuously analyzed',
      'Influence-weighted sentiment scoring',
      'Real-time sentiment shifts detection',
      'Trending token identification',
    ]
  },
  {
    icon: GitBranch,
    title: '3. Confluence & Correlation Scoring',
    description: 'The correlation engine cross-references whale activity data with social sentiment metrics. When both signals align — whales accumulate while sentiment trends positive — the signal confidence score increases. Our Diamond Signal threshold is calibrated for high-confidence confluence.',
    details: [
      'Proprietary multi-factor correlation algorithm',
      'Whale + sentiment alignment detection',
      'High-confidence threshold for Diamond Signals',
      'Confidence intervals published per signal',
    ]
  },
  {
    icon: Filter,
    title: '4. Validation & Signal Delivery',
    description: 'Each potential signal passes through validation checks: historical backtesting, false-positive filters, and market condition context. Validated signals are pushed in real-time to Premium users via push alerts and the dashboard, with 24hr delay on the Free tier.',
    details: [
      'Multi-stage validation pipeline',
      'False-positive filtering',
      'Real-time push to Premium users',
      '24hr delay for Free tier signals',
    ]
  },
]

export default function FeaturesContent() {
  usePageMeta({
    title: 'Features - AI-Powered Crypto Signals | ChainPulse Alpha',
    description: 'Explore ChainPulse Alpha features: whale wallet tracking, Twitter sentiment analysis, AI-powered signals, correlation scoring, and real-time alerts for crypto traders.',
    ogTitle: 'Features | ChainPulse Alpha - AI Crypto Signal Platform',
    ogDescription: 'Real-time whale tracking, sentiment analysis, and AI-powered crypto signals. Features include 500+ wallet monitoring, 250K+ daily tweets analyzed, and multi-exchange correlation scoring.',
    ogUrl: 'https://chainpulsealpha.com/features',
    canonical: 'https://chainpulsealpha.com/features',
    keywords: 'crypto signals features, whale tracking, sentiment analysis crypto, AI trading signals, crypto alert system, blockchain analytics features'
  })

  useEffect(() => {
    // Inject JSON-LD structured data for software application
    const scriptId = 'schema-features'
    const existing = document.getElementById(scriptId)
    if (existing) existing.remove()

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = scriptId
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'ChainPulse Alpha - Crypto Signal Platform',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        offerCount: '2',
        offers: [
          {
            '@type': 'Offer',
            name: 'Free Tier',
            price: '0',
            priceCurrency: 'USD',
            description: 'Daily signals with 24hr delay'
          },
          {
            '@type': 'Offer',
            name: 'Premium Tier',
            price: '29.99',
            priceCurrency: 'USD',
            description: 'Real-time signals with Diamond tier access'
          }
        ]
      },
      description: 'AI-powered crypto signal platform combining on-chain whale wallet tracking with Twitter sentiment analysis. Generates high-conviction trading signals using a proprietary correlation engine.',
      featureList: [
        'Whale Wallet Tracking (500+ wallets)',
        'Twitter/X Sentiment Analysis (10K+ accounts)',
        'Correlation Score Engine',
        'Diamond Signals (high confidence)',
        'Real-Time Push Alerts',
        'Advanced Signal Dashboard',
        'Historical Data Access (12+ months)',
      ],
      about: {
        '@type': 'Thing',
        name: 'Crypto Trading Signal Methodology',
        description: 'Signals are generated by cross-referencing on-chain whale transactions with AI-powered social sentiment analysis. The correlation engine requires strong multi-signal alignment for Diamond Signal designation.'
      }
    })
    document.head.appendChild(script)

    return () => {
      const el = document.getElementById(scriptId)
      if (el) el.remove()
    }
  }, [])

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
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 xs:gap-6 mb-16">
            {stats.map((stat) => (
              <div className="glass-card p-6 text-center">
                <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-text-muted text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Feature Grid */}
        <FadeInStagger stagger={0.08} className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature) => (
            <HoverScale>
              <div
                className="glass-card p-8 rounded-2xl border border-border hover:border-primary-500/30 transition-all duration-300"
              >
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${feature.color} p-0.5 flex-shrink-0`}>
                    <div className="w-full h-full rounded-xl bg-background-card flex items-center justify-center">
                      <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold mb-1">{feature.title}</h3>
                    <p className="text-text-secondary text-sm">{feature.description}</p>
                  </div>
                </div>
                <ul className="space-y-2 ml-13 sm:ml-16">
                  {feature.details.map((detail) => (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success-400 flex-shrink-0" />
                      <span className="text-text-muted text-sm">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </HoverScale>
          ))}
        </FadeInStagger>

        {/* CTA */}
        <FadeIn delay={0.5}>
          <div className="text-center glass-card p-12 rounded-2xl border border-primary-500/30">
            <Shield className="w-12 h-12 text-primary-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Ready to get the edge?</h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Join early access traders using ChainPulse Alpha to stay ahead of the market.
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

        {/* ===== E-E-A-T / METHODOLOGY SECTION ===== */}
        <div className="mb-8 pt-8 border-t border-border">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-500/20 text-secondary-400 text-sm mb-6">
                <Network className="w-4 h-4" />
                <span>Signal Methodology &amp; Verification</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How signals are{' '}
                <span className="gradient-text">generated &amp; verified</span>
              </h2>
              <p className="text-text-secondary max-w-3xl mx-auto">
                Every ChainPulse Alpha signal is the result of a multi-stage pipeline combining
                on-chain data, social sentiment analysis, and rigorous validation. Below is a
                transparent breakdown of how our system works — from raw data to the signals
                you see in your feed.
              </p>
            </div>
          </FadeIn>

          {/* Methodology Steps */}
          <FadeInStagger stagger={0.1} className="space-y-8 mb-12">
            {methodologySteps.map((step, idx) => (
              <HoverScale>
                <div
                  className="glass-card p-8 rounded-2xl border border-border hover:border-primary-500/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 p-0.5 flex-shrink-0">
                      <div className="w-full h-full rounded-xl bg-background-card flex items-center justify-center">
                        <step.icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                      <p className="text-text-secondary text-sm leading-relaxed mb-3">{step.description}</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {step.details.map((detail) => (
                          <li className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 text-success-400 flex-shrink-0" />
                            <span className="text-text-muted">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </HoverScale>
            ))}
          </FadeInStagger>

          {/* Signal Verification Pipeline */}
          <FadeIn delay={0.2}>
            <div className="glass-card p-8 rounded-2xl border border-accent-400/20 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Filter className="w-6 h-6 text-accent-400" />
                <h3 className="text-xl font-semibold">Signal Verification Pipeline</h3>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { step: 'Raw Data', desc: 'On-chain txs + social posts collected from multiple data sources', color: 'from-blue-500 to-blue-600' },
                  { step: 'Processing', desc: 'NLP sentiment scoring + wallet behavior analysis + anomaly detection', color: 'from-purple-500 to-purple-600' },
                  { step: 'Confluence', desc: 'Cross-reference whale activity with sentiment trends for correlation score', color: 'from-orange-500 to-orange-600' },
                  { step: 'Published', desc: 'Validated signals delivered via dashboard, push alerts, and API in real-time', color: 'from-green-500 to-green-600' },
                ].map((item) => (
                  <div className="glass-card p-4 rounded-xl border-border text-center">
                    <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-sm font-bold`}>
                      {item.step[0]}
                    </div>
                    <h4 className="text-sm font-semibold mb-1">{item.step}</h4>
                    <p className="text-text-muted text-xs leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Risk Disclaimer */}
          <FadeIn delay={0.25}>
            <div className="glass-card p-8 rounded-2xl border border-warning-500/30 bg-gradient-to-r from-warning-500/5 via-warning-500/10 to-warning-500/5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning-500 to-orange-500 p-0.5 flex-shrink-0">
                  <div className="w-full h-full rounded-xl bg-background-card flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-warning-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-warning-400 mb-2">Important Risk Disclaimer</h3>
                  <div className="text-text-secondary text-sm space-y-2 leading-relaxed">
                    <p>
                      <strong className="text-text-primary">No signal is guaranteed.</strong> Cryptocurrency trading carries
                      substantial risk of loss, including the potential loss of your entire investment.
                      ChainPulse Alpha signals are generated by an AI-powered analysis engine and are
                      provided for informational and educational purposes only. They do not constitute
                      financial advice, investment recommendations, or solicitation to trade.
                    </p>
                    <p>
                      Our methodology combines on-chain whale tracking with social sentiment analysis,
                      but past performance — including high-conviction Diamond Signals —
                      does not guarantee future results. Market conditions change rapidly, API data
                      sources can become unreliable, and signal accuracy depends on factors outside
                      our control.
                    </p>
                    <p>
                      <strong>Always conduct your own research (DYOR)</strong> before making any trading
                      decision. Never trade with money you cannot afford to lose. Consider consulting
                      with a qualified financial advisor for personalized advice.
                    </p>
                    <p className="text-text-muted text-xs pt-2">
                      This methodology description is provided as part of our commitment to
                      transparency. Last updated: May 2026.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </main>
  )
}
