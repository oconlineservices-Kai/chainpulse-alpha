import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Payment Cancelled | ChainPulse Alpha',
  robots: { index: false, follow: true },
}

export default function PaymentCancelPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="glass-card p-12 rounded-2xl border border-warning-500/30 text-center">
          <div className="w-24 h-24 rounded-full bg-warning-500/20 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-14 h-14 text-warning-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-3">Payment Cancelled</h1>
          <p className="text-text-secondary mb-2">
            No charges were made. Your payment was cancelled or abandoned.
          </p>
          <p className="text-text-muted text-sm mb-8">
            If you experienced any issues, feel free to try again or contact support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="button-primary px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 14a1 1 0 01-.78-1.63l9.9-10.2a.5.5 0 01.86.46l-1.92 6.02A1 1 0 0013 10h7a1 1 0 01.78 1.63l-9.9 10.2a.5.5 0 01-.86-.46l1.92-6.02A1 1 0 0011 14z" />
              </svg>
              Try Again
            </Link>
            <Link
              href="/signals"
              className="button-secondary px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              View Free Signals
            </Link>
          </div>
          <p className="text-text-muted text-xs mt-6">
            Need help? Email{' '}
            <a href="mailto:support@chainpulsealpha.com" className="text-primary-400 hover:text-primary-300 underline">
              support@chainpulsealpha.com
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
