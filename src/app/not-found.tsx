'use client'
import Link from 'next/link'
import { Home, Tag, Activity, ArrowLeft, Zap } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Animated number */}
        <div className="relative mb-8">
          <div className="text-9xl font-black text-primary-500/20 select-none leading-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Activity className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold mb-3 text-text-primary">
          Signal Not Found
        </h1>
        <p className="text-text-secondary mb-2 leading-relaxed">
          Even our whale-tracking AI couldn't find this page. It might have been moved, deleted, or the URL is off by a pip.
        </p>
        <p className="text-text-muted text-sm mb-10">
          No stress — there's plenty of alpha back on the main site. 🐋
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-all hover:scale-105"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/signals"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-background-card border border-border hover:border-primary-500/50 text-text-primary font-semibold transition-all hover:scale-105"
          >
            <Zap className="w-4 h-4 text-warning-400" />
            Live Signals
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-background-card border border-border hover:border-primary-500/50 text-text-primary font-semibold transition-all hover:scale-105"
          >
            <Tag className="w-4 h-4 text-success-400" />
            Pricing
          </Link>
        </div>

        {/* Quick links */}
        <p className="text-text-muted text-sm">
          Or go back{' '}
          <button
            onClick={() => typeof window !== 'undefined' && window.history.back()}
            className="text-primary-400 hover:text-primary-300 underline underline-offset-2"
          >
            to the previous page
          </button>
        </p>
      </div>
    </div>
  )
}
