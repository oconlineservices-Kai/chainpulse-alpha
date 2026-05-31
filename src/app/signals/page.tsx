import type { Metadata } from 'next'
import SignalsContent from './SignalsContent'

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
  return <SignalsContent />
}
