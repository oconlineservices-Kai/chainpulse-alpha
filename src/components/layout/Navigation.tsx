'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Activity, LogIn, UserPlus, Menu, X, LayoutDashboard, Shield } from 'lucide-react'

export default function PremiumNavigationSimple() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { data: session } = useSession()

  const isLoggedIn = !!session
  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin

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
            <Link href="/" className="text-gray-300 hover:text-white transition">Home</Link>
            <Link href="/features" className="text-gray-300 hover:text-white transition">Features</Link>
            <Link href="/signals" className="text-gray-300 hover:text-white transition">Signals</Link>
            <Link href="/pricing" className="text-gray-300 hover:text-white transition">Pricing</Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition">Contact</Link>

            {/* Admin link — only visible to admins */}
            {isAdmin && (
              <Link href="/admin/dashboard" className="text-orange-400 hover:text-orange-300 transition flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Admin
              </Link>
            )}

            {isLoggedIn ? (
              <Link href="/dashboard" className="text-white font-semibold bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 px-3 py-1.5 rounded-lg hover:border-cyan-400 transition flex items-center gap-1.5">
                <LayoutDashboard className="w-4 h-4 text-cyan-400" /> Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-gray-300 hover:text-white transition flex items-center gap-2">
                  <LogIn className="w-4 h-4" /> Login
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" /> Get Started
                </Link>
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
              <Link href="/" className="block text-gray-300 hover:text-white py-2">Home</Link>
              <Link href="/features" className="block text-gray-300 hover:text-white py-2">Features</Link>
              <Link href="/signals" className="block text-gray-300 hover:text-white py-2">Signals</Link>
              <Link href="/pricing" className="block text-gray-300 hover:text-white py-2">Pricing</Link>
              <Link href="/contact" className="block text-gray-300 hover:text-white py-2">Contact</Link>
              {isAdmin && (
                <Link href="/admin/dashboard" className="block text-orange-400 hover:text-orange-300 py-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Admin Dashboard
                </Link>
              )}
              {isLoggedIn ? (
                <Link href="/dashboard" className="block text-white font-semibold bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 px-3 py-2.5 rounded-lg hover:border-cyan-400 transition flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-cyan-400" /> Dashboard
                </Link>
              ) : (
                <div className="pt-4 border-t border-gray-800 space-y-3">
                  <Link href="/login" className="block text-gray-300 hover:text-white py-2 flex items-center gap-2">
                    <LogIn className="w-4 h-4" /> Login
                  </Link>
                  <Link 
                    href="/signup" 
                    className="block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 rounded-lg text-center"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
