import type { Metadata } from 'next'
import AboutContent from './AboutContent'

export const metadata: Metadata = {
  title: 'About ChainPulse Alpha | AI-Powered Crypto Signal Platform',
  description: 'Learn about ChainPulse Alpha - the AI-powered crypto signal platform combining on-chain whale wallet tracking with social sentiment analysis for retail traders.',
  openGraph: {
    title: 'About Us | ChainPulse Alpha',
    description: 'Discover how ChainPulse Alpha democratizes professional-grade crypto trading signals through AI-powered whale tracking and sentiment analysis.',
    url: 'https://chainpulsealpha.com/about',
  },
  alternates: {
    canonical: 'https://chainpulsealpha.com/about',
  },
}

export default function AboutPage() {
  return <AboutContent />
}
