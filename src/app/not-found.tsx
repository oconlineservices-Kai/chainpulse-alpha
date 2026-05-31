import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Page Not Found | ChainPulse Alpha',
  description: 'Page not found — try exploring live crypto signals, features, or pricing. Head back to the mempool.',
}

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Subtle grid pattern background */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

      <div className="relative container mx-auto max-w-lg text-center animate-fade-in">
        {/* Large 404 with crypto flair */}
        <div className="mb-8">
          <div className="text-9xl font-bold bg-gradient-to-r from-primary-400 via-secondary-500 to-accent-400 bg-clip-text text-transparent leading-none select-none">
            404
          </div>
          <div className="mt-2 inline-block px-4 py-1.5 rounded-full bg-background-card border border-border text-text-muted text-xs font-mono tracking-wider uppercase">
            ⛏️ Page Not Found — Block Not Mined
          </div>
        </div>

        {/* Glass card body */}
        <div className="glass-card p-8 md:p-10 space-y-6">
          <h1 className="text-3xl font-bold text-text-primary">
            Page Not Found
          </h1>

          <p className="text-text-secondary leading-relaxed">
            This page doesn&apos;t exist on the ledger. It might have been{' '}
            <span className="text-danger-400 font-medium">rugged</span>,{' '}
            <span className="text-warning-400 font-medium">no-coined</span>, or{' '}
            <span className="text-text-muted font-medium">never mined</span>.
          </p>

          {/* Crypto-themed hint block */}
          <div className="bg-background-muted/60 rounded-xl p-4 border border-border text-left">
            <div className="flex items-center gap-2 text-xs font-mono text-text-muted mb-2">
              <span className="w-2 h-2 rounded-full bg-danger-500 animate-pulse" />
              <span>mempool.log</span>
            </div>
            <p className="text-sm font-mono text-text-muted">
              <span className="text-primary-400">$</span> curl -s /this/page
            </p>
            <p className="text-sm font-mono text-text-muted">
              <span className="text-danger-400">→</span> HTTP/1.1{' '}
              <span className="text-warning-400">404</span> Not Found
            </p>
            <p className="text-sm font-mono text-text-muted">
              <span className="text-accent-400">tx</span> status:{' '}
              <span className="text-danger-400">reverted</span>
            </p>
          </div>

          {/* Suggested pages */}
          <div className="bg-background-muted/60 rounded-xl p-4 border border-border text-left">
            <div className="flex items-center gap-2 text-xs font-mono text-text-muted mb-3">
              <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
              <span>Looking for something?</span>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/signals" className="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-2">
                📡 View Live Crypto Signals
              </Link>
              <Link href="/features" className="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-2">
                ⚙️ Explore Platform Features
              </Link>
              <Link href="/pricing" className="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-2">
                💎 See Pricing Plans
              </Link>
              <Link href="/about" className="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-2">
                ℹ️ About ChainPulse Alpha
              </Link>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/"
              className="button-primary flex-1"
            >
              ← Back to Homepage
            </Link>
            <Link
              href="/signals"
              className="button-secondary flex-1"
            >
              View Signals
            </Link>
          </div>
        </div>

        {/* Footer hint */}
        <p className="mt-8 text-xs text-text-muted/60 font-mono">
          error_code: ERR_PAGE_NOT_FOUND — try a different block height
        </p>
      </div>
    </main>
  )
}
