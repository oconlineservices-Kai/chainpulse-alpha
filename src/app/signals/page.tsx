import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import SignalsContent from './SignalsContent'

export const dynamic = 'force-dynamic'

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

// SSR has its own gating — the client component (SignalsContent) owns locked-card rendering.
// This server component only passes the auth state so no flash-of-unlocked-content occurs.

export default async function SignalsPage() {
  // ============================================================================
  // 🛡️ RESTRICTED-BY-DEFAULT — HARD SECURITY DEFAULT (Per Commander Directive)
  // ============================================================================
  // Security posture: The application DEFAULTS to a FIXED, RESTRICTED FREE TIER.
  //
  // ARCHITECTURE (binding):
  //   const finalSignalsToRender = (session?.user?.premiumStatus === 'premium')
  //     ? fullDatabaseArray
  //     : fullDatabaseArray.slice(0, 3);
  //
  // 1. Establish a stone-cold restriction default
  //    finalRenderedSignals = fullDatabaseArray.slice(0, 3) → represented by
  //    serverIsGated = true, serverLockedCount = 3
  //
  // 2. Only EXCEPTION: official auth() helper verifies explicit premium flag
  //    session.user.tier === 'premium' → isExplicitPremium = true
  //
  // 3. If auth() errors, or JWT decryption fails, or keys mismatch → STAYS LOCKED
  //
  // CRITICAL: No manual cookie parsing. No atob(). No cookieStore.get().
  // The auth() function from NextAuth handles JWE decryption internally.
  // ============================================================================

  // 1. Establish a stone-cold restriction default
  // SECURE FORCE MAPPING — explicit slice before any data hits JSX
  let serverIsGated = true
  let serverLockedCount = 3

  try {
    // 2. Use the official Auth.js/NextAuth session fetcher
    const session = await auth()
    
    if (session?.user && (session.user as any)?.premiumStatus === 'premium') {
      serverIsGated = false
      serverLockedCount = 0
    }
  } catch (error) {
    // 3. If an error occurs or keys mismatch, it stays locked at 3
    console.error('[SignalsPage] Auth layer error, defaulting to secure gate:', error)
  }

  return (
    <>
      {/* Structured Data Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://chainpulsealpha.com' },
                { '@type': 'ListItem', position: 2, name: 'Signals', item: 'https://chainpulsealpha.com/signals' },
              ],
            },
            {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              '@id': 'https://chainpulsealpha.com/signals#faq',
              name: 'ChainPulse Alpha Signals FAQ',
              description: 'Frequently asked questions about ChainPulse Alpha crypto signals, pricing, and how the signal system works.',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'How are crypto signals generated?',
                  acceptedAnswer: { '@type': 'Answer', text: 'Each signal is generated through a multi-stage pipeline: (1) On-chain whale wallet tracking across ETH, BSC, and SOL; (2) Social sentiment analysis of crypto Twitter accounts; (3) The correlation engine cross-references both data sources; (4) Signals pass through validation before delivery.' },
                },
                {
                  '@type': 'Question',
                  name: 'What does the signal score mean?',
                  acceptedAnswer: { '@type': 'Answer', text: 'Each signal receives a correlation score from 0-100 representing the alignment between whale activity and social sentiment. Scores above 85 indicate Diamond Signal status.' },
                },
                {
                  '@type': 'Question',
                  name: 'How many signals can I see for free?',
                  acceptedAnswer: { '@type': 'Answer', text: 'Free tier users can see the first 3 signals in the Alpha Feed with a 15-minute delay. Premium subscribers ($49/mo) get all signals in real-time, including exclusive Diamond Signals. We also offer Pay-Per-Alpha credits ($1 each) for flexible signal access without a subscription.' },
                },
              ],
            },
          ]).replace(/</g, '\\u003c')
        }}
      />

      {/* Client signals content — handles real-time fetch, filters, Pay-Per-Alpha */}
      <SignalsContent serverIsGated={serverIsGated} serverLockedCount={serverLockedCount} />
    </>
  )
}
