import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllPosts, getPostBySlug } from '@/lib/blog'

type PageProps = {
  params: { slug: string }
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const post = getPostBySlug(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found - ChainPulse Alpha',
    }
  }

  const canonical = `https://chainpulsealpha.com/blog/${post.slug}`

  return {
    title: `${post.title} | ChainPulse Alpha`,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: canonical,
      publishedTime: post.date,
      siteName: 'ChainPulse Alpha',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chainpulsealpha.com'

export default function BlogPostPage({ params }: PageProps) {
  const post = getPostBySlug(params.slug)

  if (!post) notFound()

  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: 'ChainPulse Alpha Team',
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'ChainPulse Alpha',
      url: siteUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
    url: `${siteUrl}/blog/${post.slug}`,
    image: `${siteUrl}/og-image.png`,
  }

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
        name: 'Blog',
        item: `${siteUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${siteUrl}/blog/${post.slug}`,
      },
    ],
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white">
      {/* BlogPosting Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      {/* BreadcrumbList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" className="text-2xl font-bold hover:text-blue-400 transition">ChainPulse Alpha</Link>
        <div className="flex gap-5 text-sm flex-wrap">
          <Link href="/blog" className="text-blue-400">Blog</Link>
          <Link href="/features" className="hover:text-blue-400 transition">Features</Link>
          <Link href="/signals" className="hover:text-blue-400 transition">Signals</Link>
          <Link href="/pricing" className="hover:text-blue-400 transition">Pricing</Link>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto px-4 pb-20 pt-6">
        <header className="mb-10">
          <div className="flex items-center gap-3 text-sm text-slate-400 mb-4 flex-wrap">
            <span className="rounded-full bg-slate-700 px-3 py-1 text-slate-200">{post.category}</span>
            <span>{post.date}</span>
            <span>{post.readingTime}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">{post.title}</h1>
          <p className="text-xl text-slate-300 leading-relaxed mb-6">{post.description}</p>
          <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-6 text-slate-300">
            <strong className="text-white">Media placeholder:</strong> Add a hero chart, wallet flow visualization, or sentiment heatmap here for richer social previews and engagement.
          </div>
        </header>

        <div className="prose prose-invert prose-slate max-w-none">
          {post.content.map((paragraph, index) => (
            <p key={index} className="mb-6 text-lg leading-8 text-slate-200">
              {paragraph}
            </p>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <h3 className="text-xl font-semibold text-white mb-3">Want Real-Time Signals?</h3>
          <p className="text-gray-300 mb-4">
            Get AI-powered whale tracking and sentiment analysis alerts delivered in real time. 
            Start with a free account and try Pay-Per-Alpha for just $1.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="/pricing" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:shadow-lg transition-all">
              View Pricing →
            </a>
            <a href="/signup" className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-all">
              Try Free →
            </a>
          </div>
        </div>

        <section className="mt-12 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-8">
          <h2 className="text-2xl font-bold mb-4">Next step for readers</h2>
          <p className="text-slate-300 mb-6 leading-relaxed">
            If this topic matches what you are trying to solve, continue with the product pages to see how ChainPulse Alpha turns these ideas into usable workflows.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/signals" className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 transition">Explore Signals</Link>
            <Link href="/features" className="rounded-lg border border-slate-500 px-5 py-3 font-semibold hover:border-slate-300 transition">Learn the Method</Link>
            <Link href="/pricing" className="rounded-lg border border-slate-500 px-5 py-3 font-semibold hover:border-slate-300 transition">Compare Plans</Link>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Related reading</h2>
          <div className="flex flex-wrap gap-3">
            {getAllPosts()
              .filter((item) => item.slug !== post.slug)
              .slice(0, 4)
              .map((item) => (
                <Link
                  key={item.slug}
                  href={`/blog/${item.slug}`}
                  className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:border-blue-400 hover:text-blue-300 transition"
                >
                  {item.title}
                </Link>
              ))}
          </div>
        </section>
      </article>
    </main>
  )
}
