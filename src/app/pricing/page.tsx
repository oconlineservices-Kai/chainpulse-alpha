import type { Metadata } from 'next'
import PricingClient from './PricingClient'

export const metadata: Metadata = {
  title: 'Pricing | ChainPulse Alpha',
  description: 'Choose your plan — Free, Premium, or Enterprise. Get real-time crypto signals with whale tracking and sentiment analysis.',
  openGraph: {
    title: 'Pricing | ChainPulse Alpha',
    description: 'Get real-time AI-powered crypto signals. Plans start free. Upgrade for Diamond Signals and real-time whale alerts.',
    url: 'https://chainpulsealpha.com/pricing',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ChainPulse Alpha Pricing',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing | ChainPulse Alpha',
    description: 'AI crypto signal plans — free tier available. Real-time whale + sentiment alerts.',
    images: ['/twitter-card.png'],
  },
  alternates: {
    canonical: 'https://chainpulsealpha.com/pricing',
  },
}

export default function PricingPage() {
  return <PricingClient />
}
