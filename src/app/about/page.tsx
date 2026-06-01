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
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://chainpulsealpha.com' },
        { '@type': 'ListItem', position: 2, name: 'About', item: 'https://chainpulsealpha.com/about' },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      '@id': 'https://chainpulsealpha.com/about',
      name: 'About ChainPulse Alpha',
      description: 'AI-powered crypto signal platform combining on-chain whale wallet tracking with social sentiment analysis.',
      url: 'https://chainpulsealpha.com/about',
      mainEntity: {
        '@type': 'SoftwareApplication',
        name: 'ChainPulse Alpha',
        applicationCategory: 'FinanceApplication',
        description: 'AI-powered crypto trading signals with whale wallet tracking and Twitter sentiment analysis',
      },
      significantLink: [
        'https://chainpulsealpha.com/features',
        'https://chainpulsealpha.com/signals',
        'https://chainpulsealpha.com/pricing',
      ],
    },
  ]

  return (
    <>
      {/* Structured Data Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\u003c').replace(/>/g, '\u003e').replace(/&/g, '\u0026') }}
      />
      <AboutContent />
    </>
  )
}
