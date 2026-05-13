import { NextResponse } from 'next/server'
import { getAllPosts } from '@/lib/blog'

export const dynamic = 'force-dynamic'

export async function GET() {
  const baseUrl = 'https://chainpulsealpha.com'
  const buildTs = Date.now()
  
  const urls = [
    { url: baseUrl, lastMod: new Date(), freq: 'daily', pri: 1 },
    { url: `${baseUrl}/pricing`, lastMod: new Date(), freq: 'weekly', pri: 0.9 },
    { url: `${baseUrl}/features`, lastMod: new Date(), freq: 'monthly', pri: 0.8 },
    { url: `${baseUrl}/signals`, lastMod: new Date(), freq: 'daily', pri: 0.8 },
    { url: `${baseUrl}/login`, lastMod: new Date(), freq: 'monthly', pri: 0.5 },
    { url: `${baseUrl}/signup`, lastMod: new Date(), freq: 'monthly', pri: 0.6 },
    { url: `${baseUrl}/dashboard`, lastMod: new Date(), freq: 'weekly', pri: 0.7 },
    { url: `${baseUrl}/forgot-password`, lastMod: new Date(), freq: 'monthly', pri: 0.3 },
    { url: `${baseUrl}/reset-password`, lastMod: new Date(), freq: 'monthly', pri: 0.2 },
    { url: `${baseUrl}/payment/success`, lastMod: new Date(), freq: 'monthly', pri: 0.2 },
    { url: `${baseUrl}/payment/failed`, lastMod: new Date(), freq: 'monthly', pri: 0.2 },
    { url: `${baseUrl}/blog`, lastMod: new Date(), freq: 'weekly', pri: 0.7 },
    { url: `${baseUrl}/contact`, lastMod: new Date(), freq: 'monthly', pri: 0.6 },
    { url: `${baseUrl}/privacy`, lastMod: new Date(), freq: 'monthly', pri: 0.4 },
    { url: `${baseUrl}/terms`, lastMod: new Date(), freq: 'monthly', pri: 0.4 },
    ...getAllPosts().map(post => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastMod: new Date(post.date),
      freq: 'monthly' as const,
      pri: 0.6,
    })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated: ${new Date().toISOString()} | build: ${buildTs} -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.url}</loc>
    <lastmod>${u.lastMod.toISOString()}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.pri}</priority>
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'no-store, max-age=0, must-revalidate',
      'Vary': '*',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Robots-Tag': 'noindex',
      'X-Generated': new Date().toISOString(),
    },
  })
}
