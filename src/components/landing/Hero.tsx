'use client'

import { useState, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Activity } from 'lucide-react'
import FadeIn from '../animations/FadeIn'
import { AnimatedBackground } from '../animations/FloatingElements'
import { cn } from '@/lib/utils'

const DashboardPreview = lazy(() => import('./DashboardPreview'))

export default function Hero() {
  const router = useRouter()
  const [email, setEmail] = useState('')

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
              Our AI monitors <span className="text-warning-400 font-semibold">10,000+ tweets</span> and{' '}
              <span className="text-primary-400 font-semibold">1,000+ whale wallets</span> daily. 
              When smart money meets social buzz, you get alerted.
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
              Free alerts • No credit card required • <span className="text-warning-400 font-medium">Only 47 spots left this month</span>
            </p>
          </FadeIn>
          
          {/* Dashboard Preview - VISUAL PROOF (lazy loaded) */}
          <Suspense fallback={<div className="h-64 rounded-xl bg-white/5 animate-pulse" />}>
            <DashboardPreview />
          </Suspense>
          
          {/* Social Proof Stats */}
          <FadeIn delay={0.9}>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mt-16 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-400">47,329</div>
                <div className="text-text-muted">Signals Generated</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-success-400">High</div>
                <div className="text-text-muted">Signal Correlation</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-warning-400">1,247</div>
                <div className="text-text-muted">Whale Wallets</div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <FadeIn delay={1}>
        <div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-border rounded-full flex justify-center">
            <div
              className="w-1 h-2 bg-text-muted rounded-full mt-2"
            />
          </div>
        </div>
      </FadeIn>
    </section>
  )
}