/**
 * Dashboard layout
 *
 * The root layout.tsx already renders <Navigation /> (fixed top bar).
 * This layout adds NO extra headers — the dashboard sub-header lives
 * directly in dashboard/page.tsx to avoid overlap.
 *
 * Previous version had a <Sidebar> + <Header> that conflicted with
 * the global Navigation and caused visual overlap. Removed.
 */

import Head from 'next/head'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <meta name="build-version" content="2026-05-30-v2" />
      </Head>
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </>
  )
}
