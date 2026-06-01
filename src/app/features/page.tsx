import type { Metadata } from 'next'
import FeaturesContent from './FeaturesContent'

export const metadata: Metadata = {
  title: 'Features - AI-Powered Crypto Signals | ChainPulse Alpha',
  description: 'Explore ChainPulse Alpha features: whale wallet tracking, Twitter sentiment analysis, AI-powered signals, correlation scoring, and real-time alerts for crypto traders.',
  openGraph: {
    title: 'Features | ChainPulse Alpha - AI Crypto Signal Platform',
    description: 'Real-time whale tracking, sentiment analysis, and AI-powered crypto signals. Features include 500+ wallet monitoring, 250K+ daily tweets analyzed, and multi-exchange correlation scoring.',
    url: 'https://chainpulsealpha.com/features',
  },
  alternates: {
    canonical: 'https://chainpulsealpha.com/features',
  },
}

export default function FeaturesPage() {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://chainpulsealpha.com' },
        { '@type': 'ListItem', position: 2, name: 'Features', item: 'https://chainpulsealpha.com/features' },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': 'https://chainpulsealpha.com/features#faq',
      name: 'ChainPulse Alpha Features FAQ',
      description: 'Frequently asked questions about ChainPulse Alpha features, methodology, and signal types.',
      mainEntity: [
        {
          '@type': 'Question',
          name: "How does ChainPulse Alpha's whale wallet tracking work?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Our system monitors 500+ known elite crypto wallets across Ethereum, BSC, and Solana in real-time. Each wallet is categorized by behavior profile (accumulator, trader, institutional). When a significant transaction is detected, it is flagged and scored for conviction signal generation.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is Twitter/X sentiment analysis and how accurate is it?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We analyze 10,000+ crypto Twitter accounts using a proprietary NLP pipeline. Accounts are weighted by influence score. Sentiment is scored 0-100 and updated in near real-time. Combined with whale data, our Diamond Signals achieve 85%+ correlation accuracy.',
          },
        },
        {
          '@type': 'Question',
          name: 'What are Diamond Signals?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Diamond Signals are our highest-conviction alerts where whale activity and social sentiment alignment exceed 85% correlation. These premium-only signals represent the strongest confluence between on-chain data and market sentiment, offering the highest probability trade setups.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does the correlation scoring engine work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The correlation engine cross-references whale activity data with social sentiment metrics using a proprietary multi-factor algorithm. When both signals align - whales accumulating while sentiment trends positive - the signal confidence score increases. Scores are published per signal with confidence intervals.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the difference between Free and Premium signals?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Free users receive the top 5 daily signals with a 24-hour delay. Premium members ($49/mo or $39/mo yearly) get all signals in real-time including Diamond Signals, custom alerts, and full historical data access. We also offer Pay-Per-Alpha credits at $1 per signal for flexible access.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I export signal data for tax reporting?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Premium users have access to CSV export functionality for all signals including historical data up to 12 months. This includes performance benchmarks, win/loss ratios, and market condition correlation data for comprehensive tax reporting.',
          },
        },
      ],
    },
  ]

  return (
    <>
      {/* Structured Data Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026') }}
      />
      <FeaturesContent />
    </>
  )
}
