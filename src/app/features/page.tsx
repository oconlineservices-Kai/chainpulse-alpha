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
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://chainpulsealpha.com' },
      { '@type': 'ListItem', position: 2, name: 'Features', item: 'https://chainpulsealpha.com/features' },
    ],
  }

  return (
    <>
      {/* BreadcrumbList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <FeaturesContent />
    </>
  )
}
