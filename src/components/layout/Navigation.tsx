'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Activity, UserPlus, Zap, Menu, X, LayoutDashboard, Shield, User, Settings, LogOut } from 'lucide-react'

export default function PremiumNavigationSimple() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false)
      }
    }
    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isProfileDropdownOpen])

  const user = session?.user
  const isLoggedIn = !!user
  const isAdmin = (user as { isAdmin?: boolean })?.isAdmin
  // Show authenticated nav for ALL pages when logged in
  // Public marketing nav only for unauthenticated users
  const showAuthNav = isLoggedIn

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/80 backdrop-blur-lg border-b border-gray-800' : 'bg-transparent'
    }`}>
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </div>
            <span className="font-bold text-xl text-white hidden sm:block">
              ChainPulse Alpha
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {showAuthNav ? (
              /* ── Authenticated nav — clean workspace, shown on ALL routes when logged in ── */
              <>
                <Link href="/dashboard" className="text-cyan-400 font-medium transition flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <Link href="/signals" className="text-gray-300 hover:text-white transition">
                  Signals
                </Link>
                <Link href="/pricing" className="text-gray-300 hover:text-white transition">
                  Pricing
                </Link>
                {isAdmin && (
                  <Link href="/admin/dashboard" className="text-orange-400 hover:text-orange-300 transition flex items-center gap-1.5">
                    <Shield className="w-4 h-4" /> Admin
                  </Link>
                )}

                {/* Profile dropdown in nav — visible on non-dashboard pages too */}
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm hover:opacity-90 transition"
                  >
                    {(user?.email || 'U').slice(0, 2).toUpperCase()}
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50">
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-sm text-white font-medium truncate">{user?.email || 'User'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{isAdmin ? 'Admin' : 'Free Plan'}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all text-sm"
                        >
                          <User className="w-4 h-4" />
                          Profile Settings
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all text-sm"
                        >
                          <Settings className="w-4 h-4" />
                          Preferences
                        </Link>
                        <div className="my-2 h-px bg-gray-700" />
                        <button
                          onClick={() => signOut({ callbackUrl: '/' })}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* ── Public marketing nav ── */
              <>
                <Link href="/" className="text-gray-300 hover:text-white transition">Home</Link>
                <Link href="/features" className="text-gray-300 hover:text-white transition">Features</Link>
                <Link href="/signals" className="text-gray-300 hover:text-white transition">Signals</Link>
                <Link href="/pricing" className="text-gray-300 hover:text-white transition">Pricing</Link>
                <Link href="/about" className="text-gray-300 hover:text-white transition">About</Link>
                <Link href="/contact" className="text-gray-300 hover:text-white transition">Contact</Link>
                {isAdmin && (
                  <Link href="/admin/dashboard" className="text-orange-400 hover:text-orange-300 transition flex items-center gap-1.5">
                    <Shield className="w-4 h-4" /> Admin
                  </Link>
                )}
                {isLoggedIn ? (
                  <>
                    <Link href="/pricing" className="text-white font-semibold bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-purple-500/40 px-3 py-1.5 rounded-lg hover:border-purple-400 transition flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-purple-400" /> Upgrade
                    </Link>
                    <Link href="/dashboard" className="text-white font-semibold bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 px-3 py-1.5 rounded-lg hover:border-cyan-400 transition flex items-center gap-1.5">
                      <LayoutDashboard className="w-4 h-4 text-cyan-400" /> Dashboard
                    </Link>
                  </>
                ) : (
                  <Link 
                    href="/signup" 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" /> Get Started
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden text-white"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileOpen && (
          <div className="lg:hidden bg-black/95 backdrop-blur-lg border-t border-gray-800">
            <div className="px-4 py-6 space-y-4">
              {showAuthNav ? (
                <>
                  <Link href="/dashboard" className="block text-cyan-400 font-medium py-2 flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link href="/pricing" className="block text-gray-300 hover:text-white py-2">Pricing</Link>
                  <Link href="/signals" className="block text-gray-300 hover:text-white py-2">Signals</Link>
                  {isAdmin && (
                    <Link href="/admin/dashboard" className="block text-orange-400 hover:text-orange-300 py-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Admin Dashboard
                    </Link>
                  )}
                  <Link href="/profile" className="block text-gray-300 hover:text-white py-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">{(user?.email || 'U').slice(0, 2).toUpperCase()}</span>
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/" className="block text-gray-300 hover:text-white py-2">Home</Link>
                  <Link href="/features" className="block text-gray-300 hover:text-white py-2">Features</Link>
                  <Link href="/signals" className="block text-gray-300 hover:text-white py-2">Signals</Link>
                  <Link href="/pricing" className="block text-gray-300 hover:text-white py-2">Pricing</Link>
                  <Link href="/about" className="block text-gray-300 hover:text-white py-2">About</Link>
                  <Link href="/contact" className="block text-gray-300 hover:text-white py-2">Contact</Link>
                  {isAdmin && (
                    <Link href="/admin/dashboard" className="block text-orange-400 hover:text-orange-300 py-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Admin Dashboard
                    </Link>
                  )}
                  {isLoggedIn ? (
                    <>
                      <Link href="/dashboard" className="block text-white font-semibold bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 px-3 py-2.5 rounded-lg hover:border-cyan-400 transition flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4 text-cyan-400" /> Dashboard
                      </Link>
                      <Link href="/pricing" className="block text-center text-sm text-gray-400 hover:text-white border border-gray-700 px-3 py-2 rounded-lg mt-2">
                        Upgrade Plan
                      </Link>
                    </>
                  ) : (
                    <div className="pt-4 border-t border-gray-800">
                      <Link 
                        href="/signup" 
                        className="block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 rounded-lg text-center"
                      >
                        Get Started
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
