'use client'

import { usePathname } from 'next/navigation'
import Navigation from './Navigation'

/**
 * Renders the main site Navigation only on non-dashboard routes.
 * Dashboard routes use their own DashboardNav via the dashboard layout.
 */
export default function ConditionalNavigation() {
  const pathname = usePathname()

  // Suppress main site nav for dashboard and any nested dashboard pages
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')) {
    return null
  }

  return <Navigation />
}
