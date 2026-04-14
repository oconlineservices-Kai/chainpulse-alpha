'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Activity, Zap } from 'lucide-react'
import FadeIn from '../animations/FadeIn'
import { AnimatedBackground } from '../animations/FloatingElements'
import DashboardPreview from './DashboardPreview'
import { cn } from '@/lib/utils'

export default function Hero() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || status === 'loading') return
    
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      
      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Status Badge */}
          <FadeIn delay={0.1}>
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border text-primary-400 text-sm mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <Activity className="w-4 h-4" />
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-success-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <span>Now in Early Access</span>
            </motion.div>
          </FadeIn>
          
          {/* Main Headline */}
          <FadeIn delay={0.2}>
            <h1 className="text-5xl md:text-7xl xl:text-8xl font-bold mb-6 leading-tight">
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
            <motion.form 
              onSubmit={handleSubmit} 
              className="max-w-md mx-auto mb-8"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={cn(
                      "input-field pr-12 transition-all duration-300",
                      status === 'success' && "border-success-500 focus:border-success-500"
                    )}
                    required
                  />
                  {status === 'success' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <CheckCircle2 className="w-5 h-5 text-success-400" />
                    </motion.div>
                  )}
                </div>
                
                <motion.button
                  type="submit"
                  disabled={status === 'loading'}
                  className={cn(
                    "button-primary min-w-[160px] group h-[52px]",
                    status === 'success' && "bg-success-500 hover:bg-success-600"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {status === 'loading' ? (
                    <div className="loading-spinner" />
                  ) : status === 'success' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      You're In!
                    </>
                  ) : (
                    <>
                      Get Free Alerts →
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </div>
              
              {status === 'success' && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-success-400 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  You're on the list! Check your inbox.
                </motion.p>
              )}
              
              {status === 'error' && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-danger-400"
                >
                  Something went wrong. Please try again.
                </motion.p>
              )}
            </motion.form>
          </FadeIn>
          
          {/* Reassurance Text */}
          <FadeIn delay={0.5}>
            <p className="text-sm text-text-muted">
              Free alerts • No credit card required • <span className="text-warning-400 font-medium">Only 47 spots left this month</span>
            </p>
          </FadeIn>
          
          {/* Dashboard Preview - VISUAL PROOF */}
          <DashboardPreview />
          
          {/* Social Proof Stats */}
          <FadeIn delay={0.9}>
            <div className="flex items-center justify-center gap-8 mt-16 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-400">47,329</div>
                <div className="text-text-muted">Signals Generated</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-success-400">85%</div>
                <div className="text-text-muted">Diamond Signals Hit +20%</div>
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
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-border rounded-full flex justify-center">
            <motion.div
              className="w-1 h-2 bg-text-muted rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </FadeIn>
    </section>
  )
}