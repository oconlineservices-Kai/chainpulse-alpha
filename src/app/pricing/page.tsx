import type { Metadata } from 'next'
import PricingClient from './PricingClient'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chainpulsealpha.com'

const productSchemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'ChainPulse Alpha Premium - Monthly',
    description: 'Real-time AI-powered crypto signals with whale tracking and Twitter sentiment analysis. Includes Diamond Signals, push alerts, full dashboard, and priority support.',
    url: `${siteUrl}/pricing`,
    offers: {
      '@type': 'Offer',
      price: '49',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}/pricing`,
      priceValidUntil: '2027-12-31',
    },
    brand: {
      '@type': 'Brand',
      name: 'ChainPulse Alpha',
    },
    category: 'Software Application',
    audience: {
      '@type': 'Audience',
      audienceType: 'Crypto Traders',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'ChainPulse Alpha Premium - Yearly',
    description: 'Real-time AI-powered crypto signals with whale tracking and Twitter sentiment analysis. Annual billing at $39/month. Includes Diamond Signals, push alerts, full dashboard, and priority support.',
    url: `${siteUrl}/pricing`,
    offers: {
      '@type': 'Offer',
      price: '468',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}/pricing`,
      priceValidUntil: '2027-12-31',
    },
    brand: {
      '@type': 'Brand',
      name: 'ChainPulse Alpha',
    },
    category: 'Software Application',
    audience: {
      '@type': 'Audience',
      audienceType: 'Crypto Traders',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'ChainPulse Alpha Pay-Per-Alpha',
    description: 'Unlock individual crypto signals on-demand for $1 per signal. No subscription required. Credits are stackable and valid for 30 days.',
    url: `${siteUrl}/pricing`,
    offers: {
      '@type': 'Offer',
      price: '1',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}/pricing`,
      priceValidUntil: '2027-12-31',
    },
    brand: {
      '@type': 'Brand',
      name: 'ChainPulse Alpha',
    },
    category: 'Software Application',
    audience: {
      '@type': 'Audience',
      audienceType: 'Crypto Traders',
    },
  },
]

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: siteUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Pricing',
      item: `${siteUrl}/pricing`,
    },
  ],
}

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
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchemas) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PricingClient />
    </>
  )
}
