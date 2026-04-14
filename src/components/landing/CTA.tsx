'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Rocket, Code } from 'lucide-react'
import FadeIn from '../animations/FadeIn'
import { AnimatedBackground } from '../animations/FloatingElements'
import { cn } from '@/lib/utils'

export default function CTA() {
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
    <footer className="py-24 border-t border-border relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <AnimatedBackground />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Main CTA */}
        <FadeIn>
          <div className="max-w-4xl mx-auto text-center mb-16">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success-500/20 text-success-400 text-sm mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <Rocket className="w-4 h-4" />
              <span>Ready to join the alpha hunters?</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Get the signal that could{' '}
              <span className="gradient-text">change your portfolio</span>
            </h2>
            
            <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
              Join 500+ traders getting Diamond Signals. When smart money meets social buzz, 
              you get alerted first.
            </p>
            
            {/* Email Form */}
            <motion.form 
              onSubmit={handleSubmit} 
              className="max-w-md mx-auto mb-8"
              whileHover={{ y: -2 }}
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={cn(
                      "input-field pr-12",
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
                  className="button-primary min-w-[140px] group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {status === 'loading' ? (
                    <div className="loading-spinner" />
                  ) : status === 'success' ? (
                    'Welcome!'
                  ) : (
                    <>
                      Get Free Alerts →
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
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
                  <CheckCircle2 className="w-4 h-4" />
                  You're in! Check your inbox for next steps.
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
            
            <p className="text-sm text-text-muted">
              Free alerts • No credit card required • <span className="text-warning-400 font-medium">Only 47 spots left this month</span>
            </p>
          </div>
        </FadeIn>
        
        {/* Footer Links */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-border">
          {/* Logo & Social */}
          <FadeIn delay={0.2}>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  <span className="font-bold text-lg">C</span>
                </div>
                <span className="font-bold text-xl">ChainPulse Alpha</span>
              </div>
              
              {/* Social Links */}
              <div className="flex items-center gap-4">
                <motion.a
                  href="https://twitter.com/chainpulsealpha"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background-card border border-border flex items-center justify-center hover:border-primary-500 hover:bg-primary-500/10 transition-all group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 group-hover:text-primary-400 transition-colors" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </motion.a>
                
                <motion.a
                  href="https://github.com/chainpulsealpha"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background-card border border-border flex items-center justify-center hover:border-primary-500 hover:bg-primary-500/10 transition-all group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Code className="w-5 h-5 group-hover:text-primary-400 transition-colors" />
                </motion.a>
                
                <motion.a
                  href="https://discord.gg/chainpulsealpha"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background-card border border-border flex items-center justify-center hover:border-primary-500 hover:bg-primary-500/10 transition-all group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 group-hover:text-primary-400 transition-colors" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.010c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                  </svg>
                </motion.a>
              </div>
            </div>
          </FadeIn>
          
          {/* Footer Nav */}
          <FadeIn delay={0.3}>
            <div className="flex items-center gap-6 text-sm text-text-muted">
              <a href="/privacy" className="hover:text-text-primary transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-text-primary transition-colors">Terms</a>
              <a href="/contact" className="hover:text-text-primary transition-colors">Support</a>
              <div className="text-text-muted">
                © {new Date().getFullYear()} ChainPulse Alpha
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </footer>
  )
}