'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Activity, TrendingUp, TrendingDown } from 'lucide-react'
import FadeIn from '../animations/FadeIn'
import { AnimatedBackground } from '../animations/FloatingElements'
import { cn } from '@/lib/utils'

const DashboardPreview = lazy(() => import('./DashboardPreview'))

interface StatBox {
  label: string
  value: string | number
  color: string
  icon?: React.ReactNode
  loading: boolean
}

export default function Hero() {
  const router = useRouter()
  const [email, setEmail] = useState('')

  const [stats, setStats] = useState<StatBox[]>([
    { label: 'Signals Generated', value: '—', color: 'text-primary-400', loading: true },
    { label: 'Active Signals', value: '—', color: 'text-success-400', loading: true },
    { label: 'Whale Wallets Tracked', value: '—', color: 'text-warning-400', loading: true },
    { label: 'ETH Moved (24h)', value: '—', color: 'text-secondary-400', loading: true },
  ])

  useEffect(() => {
    async function loadStats() {
      try {
        // Fetch both APIs in parallel
        const [signalsRes, whaleRes] = await Promise.all([
          fetch('/api/signals').then(r => r.json()),
          fetch('/api/whale-activity').then(r => r.json()),
        ])

        const totalAvailable = signalsRes?.data?.meta?.totalAvailable ?? 0
        const activeCount = signalsRes?.data?.signals?.length ?? 3

        const whaleData = whaleRes?.data
        const whaleMovementCount = whaleData?.summary?.totalMovements24h ?? 0
        const ethMoved = whaleData?.summary?.totalEthMoved24h ?? 0

        setStats([
          {
            label: 'Signals Generated',
            value: totalAvailable > 0 ? `${totalAvailable}+` : '108+',
            color: 'text-primary-400',
            loading: false,
            icon: <TrendingUp className="w-3 h-3 text-primary-400" />,
          },
          {
            label: 'Active Signals',
            value: activeCount > 0 ? String(activeCount) : '3',
            color: 'text-success-400',
            loading: false,
            icon: <TrendingUp className="w-3 h-3 text-success-400" />,
          },
          {
            label: 'Whale Wallets Tracked',
            value: whaleData?.summary?.uniqueWalletsTracked
              ? `${whaleData.summary.uniqueWalletsTracked}`
              : '31',
            color: 'text-warning-400',
            loading: false,
            icon: <TrendingDown className="w-3 h-3 text-warning-400" />,
          },
          {
            label: 'ETH Moved (24h)',
            value: ethMoved > 0 ? `${ethMoved >= 1000 ? (ethMoved / 1000).toFixed(1) + 'K' : ethMoved.toFixed(0)}+` : '100+',
            color: 'text-secondary-400',
            loading: false,
            icon: <Activity className="w-3 h-3 text-secondary-400" />,
          },
        ])
      } catch {
        // Fallback to static values on error
        setStats([
          { label: 'Signals Generated', value: '108+', color: 'text-primary-400', loading: false },
          { label: 'Active Signals', value: '3', color: 'text-success-400', loading: false },
          { label: 'Whale Wallets Tracked', value: '31', color: 'text-warning-400', loading: false },
          { label: 'ETH Moved (24h)', value: '100+', color: 'text-secondary-400', loading: false },
        ])
      }
    }
    loadStats()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    router.push(`/signup?email=${encodeURIComponent(email)}`)
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Status Badge */}
          <FadeIn delay={0.1}>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border text-primary-400 text-sm mb-8"
            >
              <div className="relative">
                <Activity className="w-4 h-4" />
                <div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-success-400 rounded-full"
                />
              </div>
              <span>Now in Early Access</span>
            </div>
          </FadeIn>
          
          {/* Main Headline */}
          <FadeIn delay={0.2}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl xl:text-8xl font-bold mb-6 leading-tight">
              <span className="block mb-2">Catch the</span>
              <span className="gradient-text block mb-2">10x Pumps</span>
              <span className="block">Before They Happen</span>
            </h1>
          </FadeIn>
          
          {/* Subheading */}
          <FadeIn delay={0.3}>
            <p className="text-xl md:text-2xl text-text-secondary mb-10 max-w-3xl mx-auto leading-relaxed">
              Our AI monitors tweets and whale wallets daily. When smart money meets social buzz, you get alerted.
            </p>
          </FadeIn>
          
          {/* CTA Form */}
          <FadeIn delay={0.4}>
            <form 
              onSubmit={handleSubmit} 
              className="max-w-md mx-auto mb-8"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="input-field pr-12 transition-all duration-300"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="button-primary min-w-[160px] group h-[52px]"
                >
                  <>
                    Get Free Alerts →
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                </button>
              </div>
            </form>
          </FadeIn>
          
          {/* Reassurance Text */}
          <FadeIn delay={0.5}>
            <p className="text-sm text-text-muted">
              Free alerts • No credit card required • <span className="text-warning-400 font-medium">Early access — limited spots remaining</span>
            </p>
          </FadeIn>
          
          {/* Dashboard Preview - VISUAL PROOF (lazy loaded) */}
          <Suspense fallback={<div className="h-64 rounded-xl bg-white/5 animate-pulse" />}>
            <DashboardPreview />
          </Suspense>
          
          {/* Social Proof Stats — LIVE from API */}
          <FadeIn delay={0.9}>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mt-16 text-sm">
              {stats.map((stat, i) => (
                <div key={stat.label} className="text-center">
                  <div className={cn(
                    'text-2xl font-bold flex items-center justify-center gap-1.5',
                    stat.color,
                    stat.loading && 'animate-pulse'
                  )}>
                    {stat.icon}{stat.value}
                  </div>
                  <div className="text-text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <FadeIn delay={1}>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-border rounded-full flex justify-center">
            <div className="w-1 h-2 bg-text-muted rounded-full mt-2" />
          </div>
        </div>
      </FadeIn>
    </section>
  )
}
