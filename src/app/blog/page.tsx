import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Crypto Blog - ChainPulse Alpha',
  description:
    'Read ChainPulse Alpha insights on crypto market analysis, whale tracking, sentiment analysis, and trading signal interpretation.',
  keywords: [
    'crypto blog',
    'crypto market analysis',
    'whale tracking',
    'crypto sentiment analysis',
    'trading signals',
  ],
  openGraph: {
    title: 'Crypto Blog - ChainPulse Alpha',
    description:
      'Educational crypto content covering whale wallets, sentiment trends, signal strategy, and market analysis.',
    url: 'https://chainpulsealpha.com/blog',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crypto Blog - ChainPulse Alpha',
    description:
      'Guides and analysis on crypto signals, whale tracking, and sentiment-driven trading workflows.',
  },
  alternates: {
    canonical: 'https://chainpulsealpha.com/blog',
  },
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white">
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-bold hover:text-blue-400 transition">
          ChainPulse Alpha
        </Link>
        <div className="flex gap-6 text-sm flex-wrap justify-end">
          <Link href="/features" className="hover:text-blue-400 transition">Features</Link>
          <Link href="/signals" className="hover:text-blue-400 transition">Signals</Link>
          <Link href="/pricing" className="hover:text-blue-400 transition">Pricing</Link>
          <Link href="/blog" className="text-blue-400">Blog</Link>
          <Link href="/contact" className="hover:text-blue-400 transition">Contact</Link>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-4 pt-10 pb-6 text-center">
        <span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-sm text-blue-300">
          SEO Hub for Organic Growth
        </span>
        <h1 className="mt-6 text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          ChainPulse Alpha Blog
        </h1>
        <p className="mt-6 text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Practical research and educational content for traders using whale tracking, sentiment analysis, and AI-assisted crypto signals.
          Each article is built to answer real search intent while connecting readers back to the ChainPulse Alpha platform.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-2">
        {posts.map((post) => (
          <article key={post.slug} className="rounded-2xl border border-slate-700 bg-slate-800/40 p-8 shadow-lg shadow-slate-950/20">
            <div className="flex items-center gap-3 text-sm text-slate-400 mb-4 flex-wrap">
              <span className="rounded-full bg-slate-700 px-3 py-1 text-slate-200">{post.category}</span>
              <span>{post.date}</span>
              <span>{post.readingTime}</span>
            </div>
            <h2 className="text-2xl font-bold mb-4 leading-tight">
              <Link href={`/blog/${post.slug}`} className="hover:text-blue-400 transition">
                {post.title}
              </Link>
            </h2>
            <p className="text-slate-300 leading-relaxed mb-5">{post.excerpt}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {post.keywords.slice(0, 3).map((keyword) => (
                <span key={keyword} className="text-xs rounded-full border border-slate-600 px-3 py-1 text-slate-300">
                  {keyword}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between gap-4">
              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 font-medium hover:bg-blue-500 transition"
              >
                Read article
              </Link>
              <Link href="/pricing" className="text-sm text-blue-300 hover:text-blue-200 transition">
                Explore premium signals →
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-10 text-center">
          <h2 className="text-3xl font-bold mb-4">Turn market noise into clearer trade ideas</h2>
          <p className="text-slate-300 max-w-2xl mx-auto mb-8">
            Learn with the blog, then move into live product workflows with ChainPulse Alpha features, signal pages, and pricing plans.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/signals" className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 transition">View Signals</Link>
            <Link href="/features" className="rounded-lg border border-slate-500 px-6 py-3 font-semibold hover:border-slate-300 transition">See Features</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
