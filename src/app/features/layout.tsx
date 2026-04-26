import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Features — ChainPulse Alpha | Real-Time Crypto Whale Tracking & Sentiment Analysis',
  description: 'Discover ChainPulse Alpha features: real-time whale wallet tracking, AI-powered Twitter sentiment analysis, Diamond Signals, Telegram alerts, and advanced analytics dashboard for crypto traders.',
  alternates: {
    canonical: 'https://chainpulsealpha.com/features',
  },
  openGraph: {
    title: 'Features — ChainPulse Alpha | Crypto Whale Tracking & AI Signals',
    description: 'Real-time whale wallet tracking, Twitter sentiment analysis, Diamond Signals and more. Get the edge in crypto markets with ChainPulse Alpha.',
    url: 'https://chainpulsealpha.com/features',
  },
}

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return children
}
