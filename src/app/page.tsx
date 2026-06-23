'use client'

import { Suspense } from 'react'
// Landing components
import Hero from '@/components/landing/Hero'
import SocialProof from '@/components/landing/SocialProof'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import Pricing from '@/components/landing/Pricing'
import FAQ from '@/components/landing/FAQ'
import CTA from '@/components/landing/CTA'
import Footer from '@/components/landing/Footer'
import WhaleActivityWidget from '@/components/whale/WhaleActivityWidget'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chainpulsealpha.com'

const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  '@id': `${siteUrl}/#webapp`,
  name: 'ChainPulse Alpha',
  description: 'AI-powered crypto signal platform combining whale wallet tracking with Twitter sentiment analysis for real-time trading signals.',
  url: siteUrl,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  browserRequirements: 'Requires modern browser with JavaScript enabled',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
}

const datasetSchema = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  '@id': `${siteUrl}/#signals-dataset`,
  name: 'ChainPulse Alpha Crypto Signal Dataset',
  description: 'Real-time AI-generated crypto trading signals derived from on-chain whale wallet movements and Twitter sentiment analysis. Includes sentiment scores, whale confidence levels, correlation scoring, and wallet addresses.',
  url: `${siteUrl}/signals`,
  keywords: ['crypto signals', 'whale tracking', 'sentiment analysis', 'trading signals', 'on-chain data'],
  publisher: {
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
  },
  temporalCoverage: 'P30D',
  frequency: 'P1D',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is a crypto signal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A crypto signal is a data-driven alert that indicates a potential trading opportunity. ChainPulse Alpha generates signals by combining whale wallet tracking with Twitter sentiment analysis, giving traders high-conviction entry points based on on-chain activity and market attention shifts.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does ChainPulse Alpha detect whale movements?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ChainPulse Alpha monitors on-chain wallet activity across supported blockchains. It tracks large transactions, exchange inflows and outflows, accumulation patterns, and wallet cluster behavior. The system filters noise by focusing on wallets with a proven track record and flags only behavior that is statistically significant.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is ChainPulse Alpha free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, ChainPulse Alpha offers a free tier that includes the first 3 daily crypto signals with a 15-minute delay. For real-time alerts, push notifications, and priority Diamond Signals, you can upgrade to Premium starting at $49 per month or use Pay-Per-Alpha for $1 per signal.',
      },
    },
    {
      '@type': 'Question',
      name: 'How accurate are ChainPulse Alpha signals?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ChainPulse Alpha improves accuracy by requiring confluence across multiple data sources — whale wallet activity, social sentiment trends, and price structure — before issuing a signal. Diamond Signals represent the highest-conviction alerts where all indicators align. No signal is guaranteed, but the multi-source approach significantly reduces noise compared to single-source alerts.',
      },
    },
    {
      '@type': 'Question',
      name: 'What cryptocurrencies do you support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ChainPulse Alpha supports a wide range of cryptocurrencies including major assets like Bitcoin (BTC) and Ethereum (ETH), plus popular altcoins, DeFi tokens, and memecoins. Coverage expands regularly based on market activity and liquidity.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is the sentiment score calculated?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The ChainPulse Alpha sentiment score is calculated by analyzing Twitter conversation velocity, polarity (positive vs. negative), influencer credibility weighting, and keyword clustering. The system tracks rate-of-change in discussion volume and assigns higher weight to respected voices in the crypto space, filtering out bot activity and low-signal noise.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I try premium before paying?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. You can start with the free tier to explore basic signals, sentiment scores, and the ChainPulse Alpha dashboard. When you are ready for real-time data, you can upgrade to Premium or buy individual signals with Pay-Per-Alpha starting at just $1. There is no long-term commitment and you can cancel anytime.',
      },
    },
  ],
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationSchema)
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
            .replace(/&/g, '\\u0026'),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(datasetSchema)
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
            .replace(/&/g, '\\u0026'),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema)
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
            .replace(/&/g, '\\u0026'),
        }}
      />
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <div
        >
          {/* Hero Section */}
          <Hero />

          {/* 🐋 Live On-Chain Whale Activity — aggregated stats from real whale tracker */}
          <section className="py-8 -mt-4 relative z-10">
            <div className="container mx-auto px-4 max-w-4xl">
              <WhaleActivityWidget compact />
            </div>
          </section>
          
          {/* Social Proof */}
          <SocialProof />
          
          {/* Features */}
          <Features />
          
          {/* How It Works */}
          <HowItWorks />
          
          {/* Pricing */}
          <Pricing />
          
          {/* FAQ */}
          <FAQ />
          
          {/* Final CTA */}
          <CTA />
          
          {/* Footer */}
          <Footer />
        </div>
      </Suspense>
    </main>
  )
}