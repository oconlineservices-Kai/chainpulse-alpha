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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
