'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Activity, LogIn, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Features', href: '/#features' },
  { name: 'Pricing', href: '/#pricing' },
  { name: 'Signals', href: '/signals' }
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const scrollToSection = (href: string) => {
    if (href.startsWith('/#')) {
      const elementId = href.substring(2)
      const element = document.getElementById(elementId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const handleNavClick = (href: string, e: React.MouseEvent) => {
    if (href.startsWith('/#')) {
      // Only smooth-scroll if we're already on the home page
      if (pathname === '/') {
        e.preventDefault()
        scrollToSection(href)
        setIsOpen(false)
      }
      // Otherwise, let the browser navigate normally to /#section
    } else {
      setIsOpen(false)
    }
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-background/90 backdrop-blur-lg border-b border-border/50'
          : 'bg-transparent'
      )}
    >
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div
          >
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center transition-transform group-hover:scale-105">
                  <span className="font-bold text-lg">C</span>
                </div>
                <div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-success-400 rounded-full"
                />
              </div>
              <span className="font-bold text-xl hidden sm:block">ChainPulse Alpha</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigation.map((item, index) => (
              <div
              >
                <Link
                  href={item.href}
                  onClick={(e) => handleNavClick(item.href, e)}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary-400 relative',
                    pathname === item.href
                      ? 'text-primary-400'
                      : 'text-text-secondary'
                  )}
                >
                  {item.name}
                  {pathname === item.href && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-400" />
                  )}
                </Link>
              </div>
            ))}
          </div>

          {/* Auth Buttons - Desktop */}
          <div
            className="hidden lg:flex items-center space-x-4"
          >
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all hover:scale-105"
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            'lg:hidden overflow-hidden',
            isOpen ? 'border-t border-border/50' : ''
          )}
        >
          <div className="py-4 space-y-4">
            {navigation.map((item) => (
              <Link
                href={item.href}
                onClick={(e) => handleNavClick(item.href, e)}
                className={cn(
                  'block px-4 py-2 text-base font-medium transition-colors',
                  pathname === item.href
                    ? 'text-primary-400'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile Auth Buttons */}
            <div className="px-4 pt-4 space-y-3 border-t border-border/50">
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-3 text-text-secondary hover:text-text-primary transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}