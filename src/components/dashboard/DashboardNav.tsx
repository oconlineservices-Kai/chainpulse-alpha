'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  LayoutDashboard,
  Zap,
  Rss,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Signals', href: '/signals', icon: Zap },
  { label: 'Alpha Feed', href: '/dashboard#alpha-feed', icon: Rss },
]

export default function DashboardNav() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const userEmail = session?.user?.email || ''
  const userInitials = userEmail.slice(0, 2).toUpperCase()
  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-gray-800">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 group flex-shrink-0">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-bold text-base text-white leading-tight">ChainPulse</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest leading-tight">Alpha</span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}

              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition-all"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>

            {/* Desktop Right Section */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Live indicator */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-xs font-medium">Live</span>
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-gray-700 hover:border-gray-500 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                    {userInitials}
                  </div>
                  <span className="text-sm text-gray-300 max-w-[120px] truncate hidden xl:block">{userEmail}</span>
                  <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', isProfileOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-20 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-gray-800">
                          <p className="text-sm font-medium text-white truncate">{userEmail}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Logged in</p>
                        </div>
                        <div className="p-2">
                          <Link
                            href="/dashboard/profile"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <User className="w-4 h-4" />
                            Profile
                          </Link>
                          <Link
                            href="/dashboard/settings"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <Settings className="w-4 h-4" />
                            Settings
                          </Link>
                          <div className="my-1 h-px bg-gray-800" />
                          <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg bg-white/5 border border-gray-700 text-gray-300 hover:text-white transition-colors"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 left-0 right-0 z-40 bg-gray-950 border-b border-gray-800 lg:hidden"
            >
              <div className="container mx-auto px-4 py-4 space-y-1">
                {navLinks.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                        isActive
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  )
                })}

                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-orange-400 hover:bg-orange-500/10 transition-all"
                  >
                    <Shield className="w-5 h-5" />
                    Admin Dashboard
                  </Link>
                )}

                <div className="pt-3 border-t border-gray-800 space-y-1">
                  <div className="px-4 py-2">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-sm text-gray-300 font-medium truncate">{userEmail}</p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
