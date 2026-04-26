'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Activity, Zap } from 'lucide-react'
import FadeIn from '../animations/FadeIn'
import { AnimatedBackground } from '../animations/FloatingElements'
import DashboardPreview from './DashboardPreview'
import { cn } from '@/lib/utils'
import { useLiveStats } from './StatsDisplay'

export default function Hero() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const liveStats = useLiveStats()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      if (res.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Waiting List Badge */}
          <FadeIn delay={0.2}>
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning-500/10 border border-warning-500/30 text-warning-400 text-sm font-medium">
                <Activity className="w-4 h-4" />
                {liveStats ? `${liveStats.totalSignals}+ signals generated` : 'Live signals generating...'}
              </div>
            </div>
          </FadeIn>

          {/* Headline */}
          <FadeIn delay={0.3}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center leading-tight mb-6">
              Catch the <span className="gradient-text">10x Pumps</span> Before<br />They Happen
            </h1>
          </FadeIn>

          {/* Subheadline */}
          <FadeIn delay={0.4}>
            <p className="text-lg md:text-xl text-text-secondary text-center max-w-2xl mx-auto mb-8">
              Track whale wallets, decode Twitter sentiment, and get real-time{' '}
              <span className="text-text-primary font-semibold">Diamond Signals</span> — 
              all powered by AI.
            </p>
          </FadeIn>

          {/* CTA Buttons */}
          <FadeIn delay={0.5}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <a
                href="/signup"
                className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary-500/25"
              >
                Get Free Alerts
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/signals"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-border hover:border-primary-500/50 text-text-primary font-semibold text-lg transition-all hover:scale-105"
              >
                <Zap className="w-5 h-5 text-warning-400" />
                View Live Signals
              </a>
            </div>
          </FadeIn>

          {/* Trust Badges */}
          <FadeIn delay={0.5}>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mt-16 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-400">
                  {liveStats ? liveStats.totalSignals.toLocaleString() : '...'}
                </div>
                <div className="text-text-muted">Signals Generated</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-warning-400">{liveStats ? `${liveStats.totalSignals}+` : '...'}</div>
                <div className="text-text-muted">Whale Wallets Tracked</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-warning-400">24/7</div>
                <div className="text-text-muted">AI Monitoring</div>
              </div>
            </div>
          </FadeIn>
          
          {/* Reassurance Text */}
          <FadeIn delay={0.5}>
            <p className="text-sm text-text-muted text-center mt-8">
              Free alerts • No credit card required • <span className="text-warning-400 font-medium">Limited early access spots</span>
            </p>
          </FadeIn>

          {/* Dashboard Preview */}
          <FadeIn delay={0.7}>
            <div className="mt-16">
              <DashboardPreview />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
