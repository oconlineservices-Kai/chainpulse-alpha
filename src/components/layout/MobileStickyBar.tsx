'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Zap } from 'lucide-react'

export default function MobileStickyBar() {
  const [visible, setVisible] = useState(true)
  const [lastY, setLastY] = useState(0)
  const { data: session } = useSession()
  const isLoggedIn = !!session

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      // Show on scroll up, hide on scroll down (after 200px)
      if (currentY > 200) {
        if (currentY < lastY) {
          setVisible(true)
        } else if (currentY > lastY + 20) {
          setVisible(false)
        }
      } else {
        setVisible(true)
      }
      setLastY(currentY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastY])

  // Don't show on logged-in users (they have dashboard nav)
  if (isLoggedIn) return null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-transform duration-300 ease-in-out ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-background-card/95 backdrop-blur-lg border-t border-border/70 px-4 py-3 flex items-center justify-between gap-3">
        <span className="text-xs text-text-muted leading-tight">
          <span className="text-warning-400 font-medium">47 spots left</span>
          <br />
          this month
        </span>
        <Link
          href="/pricing"
          className="flex-1 max-w-[240px] bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Get Premium Access
        </Link>
      </div>
    </div>
  )
}
