/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/api/webhooks/:path*',
        headers: [
          { 
            key: 'Access-Control-Allow-Origin', 
            value: 'https://chainpulsealpha.com' 
          },
          { 
            key: 'Access-Control-Allow-Methods', 
            value: 'POST, OPTIONS' 
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          },
        ],
      },
      {
        source: '/api/crypto',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://chainpulsealpha.com'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS'
          },
        ],
      },
      // Security headers for all pages
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            // CSP: hardened with strict-dynamic and resource-type restrictions.
            // 'unsafe-inline' retained for script-src because:
            // 1) Next.js 14.x emits inline <script> tags for RSC payloads and hydration
            //    that do NOT carry nonces (Next.js 15+ will add native nonce support)
            // 2) Razorpay checkout injects dynamic inline scripts
            // 3) Google Analytics gtag.js uses inline config via dataLayer
            // strict-dynamic is added so that if we later implement nonce-based CSP
            // with Next.js 15+, the migration path is clear: remove 'unsafe-inline',
            // add nonce generation in middleware, and pass nonce to all Script tags.
            // 'unsafe-eval' is intentionally NOT present (no eval() needed).
            // Nonce approach verified as infeasible in Next.js 14.x without modifying
            // Next.js internals (RSC scripts bypass custom _document).
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://*.razorpay.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://*.razorpay.com https://api.coingecko.com wss:; frame-src https://api.razorpay.com https://checkout.razorpay.com https://*.razorpay.com; frame-ancestors 'none'; worker-src blob: 'self'; base-uri 'self'; form-action 'self'; manifest-src 'self'; media-src 'self'; object-src 'none'; upgrade-insecure-requests; report-uri /api/csp-report;"
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), display-capture=(), fullscreen=(self), geolocation=(), microphone=(), interest-cohort=(), payment=(self), publickey-credentials-get=(self)'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups'
          },
          // NOTE: Removed to avoid conflict with COEP removal. Not needed standalone.
          // {
          //   key: 'Cross-Origin-Resource-Policy',
          //   value: 'same-site'
          // },
          // NOTE: 'require-corp' was removed because Razorpay checkout dynamically
          // loads cross-origin resources (images, fonts, frames) that lack the
          // required Cross-Origin-Resource-Policy headers, causing the modal to fail.
          // Razorpay security is handled by CSP frame-src + X-Frame-Options instead.
          // {
          //   key: 'Cross-Origin-Embedder-Policy',
          //   value: 'require-corp'
          // },
        ],
      },
    ];
  },
  // Note: trustHostHeader was attempted but is not a supported option in Next.js 14.2.0
  // (Next.js server ignores X-Forwarded-Proto header from nginx/Fly proxy,
  // which causes __Secure- cookie values to be stripped on HTTP connections).
  // The fallback auth-request.ts now tries both cookie salts to handle this.
  generateBuildId: async () => `build-${Date.now()}`,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'coin-images.coingecko.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
        pathname: '/**',
      },
    ],
    unoptimized: true,
  },
  webpack: (config) => {
    const path = require('path');
    if (!config.resolve) config.resolve = {};
    if (!config.resolve.alias) config.resolve.alias = {};
    config.resolve.alias['@'] = path.resolve('./src');
    return config;
  },
};

module.exports = nextConfig;
