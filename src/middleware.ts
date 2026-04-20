import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isAdmin = req.auth?.user?.isAdmin

  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth')
  const isApiHealthRoute = nextUrl.pathname === '/api/health'
  const isApiPaymentRoute = nextUrl.pathname.startsWith('/api/payment')
  const isPublicRoute = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/pricing',
    '/features',
    '/signals',
    '/payment/success',
    '/payment/failed',
    '/privacy',
    '/terms',
    '/contact',
    '/blog',
    '/sitemap.xml',
    '/robots.txt',
    '/admin/login',  // Admin login page is public
    '/admin/test'    // Public demo admin dashboard
  ].includes(nextUrl.pathname) || nextUrl.pathname.startsWith('/blog/')
  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard')

  // Allow API auth routes, health check, and payment routes
  if (isApiAuthRoute || isApiHealthRoute || isApiPaymentRoute) {
    return NextResponse.next()
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated for dashboard
  if (!isLoggedIn && isDashboardRoute) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname)
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl))
  }

  // Redirect to admin login if not authenticated for admin routes
  if (!isLoggedIn && isAdminRoute) {
    return NextResponse.redirect(new URL('/admin/login', nextUrl))
  }

  // Check admin access — non-admin authenticated users get bounced to dashboard
  if (isAdminRoute && isLoggedIn && !isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (fonts, images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|fonts/|images/|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.webp|robots\\.txt|manifest\\.json).*)'
  ]
}
