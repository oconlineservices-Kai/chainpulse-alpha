import type { Metadata } from 'next'
import SignalsContent from './SignalsContent'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Live Crypto Signals & Alpha Feed | ChainPulse Alpha',
  description: 'Real-time AI-powered crypto signals with whale wallet tracking and Twitter sentiment analysis. Browse live crypto trading signals, free tier available with daily updates.',
  openGraph: {
    title: 'Live Crypto Signals | ChainPulse Alpha',
    description: 'Browse real-time AI-powered crypto trading signals. Whale wallet tracking, sentiment analysis, and high-confidence alpha signals updated daily.',
    url: 'https://chainpulsealpha.com/signals',
  },
  alternates: {
    canonical: 'https://chainpulsealpha.com/signals',
  },
}

export default function SignalsPage() {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://chainpulsealpha.com' },
        { '@type': 'ListItem', position: 2, name: 'Signals', item: 'https://chainpulsealpha.com/signals' },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': 'https://chainpulsealpha.com/signals#faq',
      name: 'ChainPulse Alpha Signals FAQ',
      description: 'Frequently asked questions about ChainPulse Alpha crypto signals, pricing, and how the signal system works.',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How are crypto signals generated?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Each signal is generated through a multi-stage pipeline: (1) On-chain whale wallet tracking monitors 500+ elite wallets across ETH, BSC, and SOL; (2) Social sentiment analysis scans 10,000+ crypto Twitter accounts; (3) The correlation engine cross-references both data sources; (4) Signals pass through validation before delivery.',
          },
        },
        {
          '@type': 'Question',
          name: 'What does the signal score mean?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Each signal receives a correlation score from 0-100 representing the alignment between whale activity and social sentiment. Scores above 85 indicate Diamond Signal status - the strongest confluence where whales are actively accumulating while sentiment trends positive simultaneously.',
          },
        },
        {
          '@type': 'Question',
          name: 'How many signals can I see for free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Free tier users can see the first 3 signals in the Alpha Feed with a 24-hour delay. Premium subscribers ($49/mo) get all signals in real-time, including exclusive Diamond Signals. We also offer Pay-Per-Alpha credits ($1 each) for flexible signal access without a subscription.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the win rate of Diamond Signals?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Diamond Signals (85%+ correlation) have demonstrated a 78% win rate over the last 90 days, with an average return of +8.3% per buy signal and a maximum drawdown of -4.2%. Past performance does not guarantee future results.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I get signals via Telegram?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Premium users can link their Telegram account to receive instant signal notifications. Our Telegram bot delivers Diamond Signals directly to your phone with zero delay. Link your account from the Profile page after upgrading.',
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
      <SignalsContent />
    </>
  )
}
