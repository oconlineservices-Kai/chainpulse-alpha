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
            // CSP: 'unsafe-inline' in script-src is required because:
            // 1) Next.js inline <script> for RSC payloads and hydration
            // 2) Google Analytics gtag.js inline config
            // 3) Razorpay checkout inline scripts
            // 'unsafe-eval' is intentionally NOT present (no eval() needed).
            // Future: migrate to strict-dynamic + nonce-based CSP when feasible.
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.razorpay.com https://api.coingecko.com wss:; frame-src https://api.razorpay.com; worker-src blob: 'self'; upgrade-insecure-requests; report-uri /api/csp-report;"
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups'
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-site'
          },
        ],
      },
    ];
  },
  // Note: trustHostHeader was attempted but is not a supported option in Next.js 14.2.0
  // (Next.js server ignores X-Forwarded-Proto header from nginx/Fly proxy,
  // which causes __Secure- cookie values to be stripped on HTTP connections).
  // The fallback auth-request.ts now tries both cookie salts to handle this.
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
};

module.exports = nextConfig;
