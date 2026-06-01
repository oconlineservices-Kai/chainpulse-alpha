import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import Navigation from '@/components/layout/Navigation'
import MobileStickyBar from '@/components/layout/MobileStickyBar'
import SessionProvider from '@/components/providers/SessionProvider'
import CookieConsent from '@/components/CookieConsent'

// Force dynamic rendering for all pages - the app uses client-side session hooks
// in Navigation (via SessionProvider) which cannot be statically pre-rendered
export const dynamic = 'force-dynamic'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  metadataBase: new URL('https://chainpulsealpha.com'),
  title: {
    default: 'ChainPulse Alpha - Catch Crypto Moves Before They Happen',
    template: '%s'
  },
  description: 'AI-powered crypto signals combining whale tracking + Twitter sentiment. Get high-confidence alpha before the crowd. Early access now open.',
  keywords: [
    'crypto signals',
    'whale tracking',
    'crypto AI',
    'trading signals',
    'cryptocurrency analysis',
    'DeFi signals',
    'memecoin alerts',
    'crypto alpha',
    'whale alerts',
    'twitter sentiment crypto'
  ],
  authors: [{ name: 'ChainPulse Alpha Team' }],
  creator: 'ChainPulse Alpha',
  publisher: 'ChainPulse Alpha',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://chainpulsealpha.com',
    siteName: 'ChainPulse Alpha',
    title: 'ChainPulse Alpha - Catch Crypto Moves Before They Happen',
    description: 'AI-powered crypto signals combining whale tracking + Twitter sentiment. Get high-confidence alpha before the crowd.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ChainPulse Alpha - AI Crypto Signals',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@chainpulsealpha',
    creator: '@chainpulsealpha',
    title: 'ChainPulse Alpha - Catch Crypto Moves Before They Happen',
    description: 'AI-powered crypto signals combining whale tracking + Twitter sentiment. Get high-confidence alpha before the crowd.',
    images: ['/twitter-card.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification tokens when ready
    // google: 'your-google-verification-token',
    // yandex: 'your-yandex-verification-token',
  },
  alternates: {
    canonical: 'https://chainpulsealpha.com',
  },
  category: 'technology',
}

// JSON-LD structured data — multi-schema array
const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://chainpulsealpha.com/#organization',
    name: 'ChainPulse Alpha',
    description: 'AI-powered crypto signals combining whale tracking and Twitter sentiment analysis',
    url: 'https://chainpulsealpha.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://chainpulsealpha.com/logo.png',
      width: 512,
      height: 512,
    },
    sameAs: [
      'https://twitter.com/chainpulsealpha',
      'https://github.com/chainpulsealpha',
      'https://discord.gg/chainpulsealpha',
      'https://t.me/chainpulsealpha'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'English',
      email: 'support@chainpulsealpha.com',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://chainpulsealpha.com/#website',
    url: 'https://chainpulsealpha.com',
    name: 'ChainPulse Alpha',
    description: 'AI-powered crypto signals combining whale tracking and Twitter sentiment analysis',
    publisher: {
      '@id': 'https://chainpulsealpha.com/#organization',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://chainpulsealpha.com/signals?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ChainPulse Alpha',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    url: 'https://chainpulsealpha.com',
    description: 'AI-powered crypto trading signals with whale wallet tracking and Twitter sentiment analysis',
    offers: [
      {
        '@type': 'Offer',
        name: 'Free Tier',
        price: '0',
        priceCurrency: 'USD',
        description: 'Top 5 daily signals with 24-hour delay',
      },
      {
        '@type': 'Offer',
        name: 'ChainPulse Alpha Premium Monthly',
        price: '49',
        priceCurrency: 'USD',
        description: 'Real-time crypto signals with whale tracking and sentiment analysis',
        billingIncrement: 'P1M',
      },
      {
        '@type': 'Offer',
        name: 'ChainPulse Alpha Premium Yearly',
        price: '39',
        priceCurrency: 'USD',
        description: 'Real-time crypto signals, annual billing',
        billingIncrement: 'P1Y',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      ratingCount: '128',
      bestRating: '5',
      reviewCount: '97',
    },
    review: [
      {
        '@type': 'Review',
        name: 'Game changer for retail traders',
        reviewBody: 'The Diamond Signals have consistently outperformed my manual analysis. The correlation between whale activity and social sentiment is uncanny.',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
        author: {
          '@type': 'Person',
          name: 'Verified Premium Trader',
        },
        datePublished: '2026-04-15',
      },
      {
        '@type': 'Review',
        name: 'Real alpha in a sea of noise',
        reviewBody: 'Unlike other signal services that just repackage RSI and MACD, ChainPulse Alpha actually tracks what smart money is doing. The free tier is generous too.',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '4',
          bestRating: '5',
        },
        author: {
          '@type': 'Person',
          name: 'Crypto Enthusiast',
        },
        datePublished: '2026-03-22',
      },
    ],
  },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Structured Data - XSS Safe */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ 
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026') 
          }}
        />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme color */}
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="msapplication-TileColor" content="#0ea5e9" />
        
        {/* No-index for development */}
        {process.env.NODE_ENV === 'development' && (
          <meta name="robots" content="noindex,nofollow" />
        )}
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* Skip to main content link for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-500 focus:text-white focus:rounded-lg"
        >
          Skip to main content
        </a>
        <div id="root">
          <SessionProvider>
            <Navigation />
            <main id="main-content">
              {children}
            </main>
            <MobileStickyBar />
            <CookieConsent />
          </SessionProvider>
        </div>
        
        {/* Google Analytics 4 - XSS Safe */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `.replace(/</g, '\\u003c')
              }}
            />
          </>
        )}
      </body>
    </html>
  )
}