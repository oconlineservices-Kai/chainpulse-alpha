import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found — ChainPulse Alpha',
  description: 'The page you are looking for does not exist or has been moved.',
}

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
      <div className="container mx-auto px-4 py-16 max-w-lg text-center">
        <div className="text-8xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-6">
          404
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved. 
          Check the URL or head back to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            Back to Homepage
          </Link>
          <Link
            href="/signals"
            className="rounded-lg border border-slate-600 px-6 py-3 font-semibold text-slate-300 transition hover:border-slate-400 hover:text-white"
          >
            View Signals
          </Link>
        </div>
      </div>
    </main>
  )
}
