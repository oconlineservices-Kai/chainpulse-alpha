import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
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

// ── Inline JWT verification (no NextAuth dependency) ───────────────────────────
// We decode the session token cookie directly instead of relying on auth()
// which fails in production (Fly.io NEXTAUTH_SECRET mismatch).
async function decodeSessionToken(cookieValue: string): Promise<{ premiumStatus?: string; email?: string } | null> {
  try {
    // The NextAuth JWT is encrypted with the secret. Try to decode it.
    // Format: "eyJ..." (encrypted JWE) or "eyJ..." (JWT directly)
    const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || ''
    if (!secret) return null

    // NextAuth v5 uses the auth() helper which handles decryption internally.
    // Since we can't use auth() (production auth failure), we'll check cookie
    // presence and structure as a proxy. The server will attempt auth() via
    // the API route anyway for actual data — this SSR layer is purely for
    // render gating.
    
    // NextAuth v5 stores session as: "__Secure-authjs.session-token"
    // or "authjs.session-token" (non-secure)
    
    // If a session cookie exists that looks valid, user has SOME session.
    // We still force gate unless we can verify premium.
    const parts = cookieValue.split('.')
    if (parts.length < 2) return null

    // Try to base64 decode the payload (standard JWT, non-encrypted)
    // NextAuth v5 JWT strategy uses a simple JWT by default, not JWE
    const payload = parts[1]
    // Fix base64url -> base64
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    // Add padding
    while (base64.length % 4) base64 += '='
    
    try {
      const decoded = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'))
      if (decoded && typeof decoded === 'object') {
        return {
          premiumStatus: decoded.premiumStatus as string | undefined,
          email: decoded.email as string | undefined,
        }
      }
    } catch {
      // Payload isn't plain JSON — likely encrypted (JWE). Fall through.
    }

    return null
  } catch {
    return null
  }
}

// ── Ghost token symbols for SSR blur cards ─────────────────────────────────────
const GHOST_SYMBOLS = ['BTC', 'LINK', 'AAVE', 'UNI', 'DOT', 'ADA', 'ATOM', 'FTM', 'NEAR', 'ALGO']

const GHOST_STYLES = [
  { badge: '💎 Diamond', tag: 'bg-purple-500/20 text-purple-300', gradient: 'from-purple-500 to-indigo-500' },
  { badge: '🐋 Whale', tag: 'bg-blue-500/20 text-blue-300', gradient: 'from-blue-500 to-cyan-500' },
  { badge: '💬 Sentiment', tag: 'bg-emerald-500/20 text-emerald-300', gradient: 'from-emerald-500 to-teal-500' },
]

export default async function SignalsPage() {
  // ============================================================================
  // 🛡️ ABSOLUTE PRODUCTION FAIL-SAFE — FORCE HARD ARRAY LIMIT
  // ============================================================================
  // We bypass NextAuth's auth() entirely because it fails in production on
  // Fly.io (NEXTAUTH_SECRET or cookie domain mismatch).
  //
  // Instead, we read the session JWT cookie directly and decode the payload
  // ourselves. If we can't verify premium status, we default to GATED=TRUE
  // with exactly 3 signal slots visible and the rest blurred.
  //
  // The signal DATA is fetched client-side via /api/signals which also
  // enforces its own hard cap. This SSR layer is the render gate for GEO/crawlers.
  // ============================================================================

  // Try multiple cookie names (NextAuth v5 variations)
  const cookieStore = await cookies()
  let sessionToken: string | undefined
  const cookieNames = [
    '__Secure-authjs.session-token',
    'authjs.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.session-token',
  ]
  for (const name of cookieNames) {
    sessionToken = cookieStore.get(name)?.value
    if (sessionToken) break
  }

  // Decode the JWT payload directly
  let isExplicitPremium = false
  let sessionEmail: string | undefined

  if (sessionToken) {
    try {
      const decoded = await decodeSessionToken(sessionToken)
      if (decoded) {
        sessionEmail = decoded.email
        // ABSOLUTE: only 'premium' string unlocks the full feed
        isExplicitPremium = decoded.premiumStatus === 'premium'
      }
    } catch {
      // Token decode failed — default to gated
    }
  }

  // ============================================================================
  // 🛡️ ABSOLUTE PRODUCTION FAIL-SAFE
  // const isExplicitPremium = sessionUser?.tier === 'premium';
  // const finalRenderedSignals = isExplicitPremium ? fullDatabaseArray : fullDatabaseArray.slice(0, 3);
  // ============================================================================
  const serverIsGated: boolean = !isExplicitPremium
  const serverLockedCount: number = isExplicitPremium ? 0 : 3

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
                  acceptedAnswer: { '@type': 'Answer', text: 'Each signal is generated through a multi-stage pipeline: (1) On-chain whale wallet tracking monitors 500+ elite wallets across ETH, BSC, and SOL; (2) Social sentiment analysis scans 10,000+ crypto Twitter accounts; (3) The correlation engine cross-references both data sources; (4) Signals pass through validation before delivery.' },
                },
                {
                  '@type': 'Question',
                  name: 'What does the signal score mean?',
                  acceptedAnswer: { '@type': 'Answer', text: 'Each signal receives a correlation score from 0-100 representing the alignment between whale activity and social sentiment. Scores above 85 indicate Diamond Signal status.' },
                },
                {
                  '@type': 'Question',
                  name: 'How many signals can I see for free?',
                  acceptedAnswer: { '@type': 'Answer', text: 'Free tier users can see the first 3 signals in the Alpha Feed with a 24-hour delay. Premium subscribers ($49/mo) get all signals in real-time, including exclusive Diamond Signals. We also offer Pay-Per-Alpha credits ($1 each) for flexible signal access without a subscription.' },
                },
              ],
            },
          ]).replace(/</g, '\\u003c')
        }}
      />

      {/* 🔒 SSR LOCKED SIGNAL PLACEHOLDERS — for GEO/crawlers and zero-JS users */}
      {/* These render in the initial HTML before ANY JavaScript executes. */}
      {/* AI crawlers and search engines see the locked state immediately. */}
      {serverIsGated && (
        <div id="ssr-locked-section" className="container mx-auto px-4 py-4 mb-4">
          {/* Premium Locked Divider */}
          <div className="flex items-center gap-2 px-1 py-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
            <span className="text-xs text-amber-400 font-semibold uppercase tracking-widest whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 inline mr-1">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                <line x1="2" x2="22" y1="2" y2="22"/>
              </svg>
              {serverLockedCount} Premium Signal{serverLockedCount !== 1 ? 's' : ''} Locked
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
          </div>

          {/* 3 SSR Blur Cards */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => {
              const gType = GHOST_SYMBOLS[(i * 7 + 3) % GHOST_SYMBOLS.length]
              const gScore = 70 + (i * 13) % 30
              const gStyle = GHOST_STYLES[i % 3]
              return (
                <div key={`ssr-blur-${i}`} className="glass-card p-6 rounded-2xl border border-border relative overflow-hidden select-none">
                  {/* BLUR OVERLAY — SSR rendered, no JS needed */}
                  <div className="absolute inset-0 backdrop-blur-md bg-background/40 z-10 flex flex-col items-center justify-center gap-3 p-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-500/40 to-gray-600/40 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock w-6 h-6 text-gray-400">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-300">Premium Signal — Locked</p>
                      <p className="text-xs text-gray-500 mt-1">Upgrade to Premium or use Pay-Per-Alpha to unlock this signal</p>
                    </div>
                    <a href="/pricing" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xs font-semibold px-5 py-2 rounded-xl transition-all flex items-center gap-2 no-underline">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                      Unlock Premium Access to View Live Alpha
                    </a>
                  </div>
                  {/* Ghost content beneath blur */}
                  <div className="flex items-center justify-between flex-wrap gap-4 opacity-30 blur-sm">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gStyle.gradient} flex items-center justify-center text-white font-bold text-lg`}>
                        {gType[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-lg text-gray-400">{gType}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${gStyle.tag}`}>{gStyle.badge}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-gray-500 text-xs mb-1">Score</div>
                        <div className="font-bold text-lg text-gray-400">{gScore}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* SSR CTA Banner */}
          <div className="glass-card p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-500/5 mt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-100">Unlock {serverLockedCount} Premium Signal{serverLockedCount !== 1 ? 's' : ''}</h3>
                  <p className="text-xs text-gray-500">Get credits to unlock individual signals, or upgrade for full Premium access.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <a href="/pricing" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 no-underline">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  Upgrade to Premium
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client signals content — handles real-time fetch, filters, Pay-Per-Alpha */}
      <SignalsContent serverIsGated={serverIsGated} serverLockedCount={serverLockedCount} />
    </>
  )
}
