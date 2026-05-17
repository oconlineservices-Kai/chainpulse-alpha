'use client'

import { Suspense } from 'react'
import { motion } from 'framer-motion'

// Landing components
import Hero from '@/components/landing/Hero'
import SocialProof from '@/components/landing/SocialProof'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import Pricing from '@/components/landing/Pricing'
import FAQ from '@/components/landing/FAQ'
import CTA from '@/components/landing/CTA'
import Footer from '@/components/landing/Footer'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chainpulsealpha.com'

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
        text: 'Yes, ChainPulse Alpha offers a free tier that includes top 5 daily crypto signals with a 15-minute delay. For real-time alerts, push notifications, and priority Diamond Signals, you can upgrade to Premium starting at $49 per month or use Pay-Per-Alpha for $1 per signal.',
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
          __html: JSON.stringify(faqSchema)
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
            .replace(/&/g, '\\u0026'),
        }}
      />
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero Section */}
          <Hero />
          
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
        </motion.div>
      </Suspense>
    </main>
  )
}