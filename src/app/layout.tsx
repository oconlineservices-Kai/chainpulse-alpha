import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import ConditionalNavigation from '@/components/layout/ConditionalNavigation'
import SessionProvider from '@/components/providers/SessionProvider'

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
  description: 'AI-powered crypto signals combining whale tracking + Twitter sentiment. Get high-confidence alpha before the crowd. Join 500+ traders getting Diamond Signals.',
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

// JSON-LD structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ChainPulse Alpha',
  description: 'AI-powered crypto signals combining whale tracking and Twitter sentiment analysis',
  url: 'https://chainpulsealpha.com',
  logo: 'https://chainpulsealpha.com/logo.png',
  sameAs: [
    'https://twitter.com/chainpulsealpha',
    'https://github.com/chainpulsealpha',
    'https://discord.gg/chainpulsealpha'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: 'English'
  },
  offers: {
    '@type': 'Offer',
    name: 'ChainPulse Alpha Premium',
    description: 'Real-time crypto signals with whale tracking and sentiment analysis',
    price: '49',
    priceCurrency: 'USD'
  }
}

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
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') 
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
            <ConditionalNavigation />
            <main id="main-content">
              {children}
            </main>
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