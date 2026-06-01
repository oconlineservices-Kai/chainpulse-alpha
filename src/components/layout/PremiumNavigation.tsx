'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Activity, 
  LogIn, 
  UserPlus, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Contact', href: '/contact' },
]

export default function PremiumNavigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        {/* Gradient glow effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className={`absolute -top-32 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px] transition-opacity duration-500 ${
              isScrolled ? 'opacity-50' : 'opacity-30'
            }`}
          />
          <div 
            className={`absolute -top-32 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-[100px] transition-opacity duration-500 ${
              isScrolled ? 'opacity-50' : 'opacity-30'
            }`}
          />
        </div>

        <nav className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-text-primary tracking-tight">
                  ChainPulse
                </span>
                <span className="text-[10px] text-text-secondary uppercase tracking-widest -mt-1">
                  Alpha
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item, index) => (
                <div
                >
                  <Link
                    href={item.href}
                    className="relative px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors group"
                  >
                    <span className="relative z-10">{item.label}</span>
                    <span className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100" />
                    <span className="absolute bottom-1 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
                  </Link>
                </div>
              ))}
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <div
              >
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors group"
                >
                  <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  Login
                </Link>
              </div>
              
              <div
              >
                <Link
                  href="/signup"
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 group"
                >
                  <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Get Started
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              
                {isMobileMenuOpen ? (
                  <div
                    key="close"
                  >
                    <X className="w-5 h-5 text-text-primary" />
                  </div>
                ) : (
                  <div
                    key="menu"
                  >
                    <Menu className="w-5 h-5 text-text-primary" />
                  </div>
                )}
              
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />

            {/* Mobile Menu Panel */}
            <div
              className="fixed top-0 right-0 bottom-0 z-40 w-full max-w-sm bg-background-card/95 backdrop-blur-xl border-l border-border lg:hidden"
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between h-16 px-6 border-b border-border">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-text-primary">ChainPulse</span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-text-primary" />
                </button>
              </div>

              {/* Mobile Menu Items */}
              <div className="p-6 space-y-2">
                {navItems.map((item, index) => (
                  <div
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-xl transition-all group"
                    >
                      <span className="font-medium">{item.label}</span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </div>
                ))}
              </div>

              {/* Mobile Menu Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border space-y-3">
                <div
                >
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-text-primary bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                </div>
                
                <div
                >
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all shadow-lg shadow-primary-500/25"
                  >
                    <UserPlus className="w-4 h-4" />
                    Get Started
                  </Link>
                </div>
              </div>

              {/* Decorative gradient */}
              <div className="absolute top-1/2 left-0 w-32 h-32 bg-primary-500/20 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-1/3 right-0 w-32 h-32 bg-secondary-500/20 rounded-full blur-[80px] pointer-events-none" />
            </div>
          </>
        )}
      
    </>
  )
}
