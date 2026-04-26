import DashboardNav from '@/components/dashboard/DashboardNav'

/**
 * Dashboard layout
 *
 * Renders the dashboard-specific navigation (DashboardNav) instead of the
 * main site Navigation. The root layout's ConditionalNavigation suppresses
 * the main nav for all /dashboard routes, and this layout adds the proper
 * dashboard nav bar.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      {children}
    </div>
  )
}
