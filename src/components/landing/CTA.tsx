'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2, Rocket } from 'lucide-react'
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
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success-500/20 text-success-400 text-sm mb-8"
            >
              <Rocket className="w-4 h-4" />
              <span>Ready to join the alpha hunters?</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Get the signal that could{' '}
              <span className="gradient-text">change your portfolio</span>
            </h2>
            
            <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
              Join early access traders getting Diamond Signals. When smart money meets social buzz, 
              you get alerted first.
            </p>
            
            {/* Email Form */}
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
                    className={cn(
                      "input-field pr-12",
                      status === 'success' && "border-success-500 focus:border-success-500"
                    )}
                    required
                  />
                  {status === 'success' && (
                    <div
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <CheckCircle2 className="w-5 h-5 text-success-400" />
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="button-primary min-w-[140px] group"
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
                </button>
              </div>
              
              {status === 'success' && (
                <p
                  className="mt-3 text-success-400 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  You're in! Check your inbox for next steps.
                </p>
              )}
              
              {status === 'error' && (
                <p
                  className="mt-3 text-danger-400"
                >
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
            
            <p className="text-sm text-text-muted">
              Free alerts • No credit card required • <span className="text-warning-400 font-medium">Limited time early access</span>
            </p>
          </div>
        </FadeIn>
        
        {/* Telegram Channel Promo */}
        <FadeIn delay={0.1}>
          <div className="max-w-lg mx-auto text-center mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <div className="flex items-center justify-center gap-3 mb-4">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-blue-400" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              <span className="font-semibold text-lg">Free Telegram Channel</span>
            </div>
            <p className="text-text-secondary mb-4">
              Get crypto signals directly on your phone. No need to check Twitter — we post 
              daily whale tracking, sentiment analysis, and market insights to 
              <span className="text-blue-400 font-medium"> @chainpulse_alpha</span>.
            </p>
            <a
              href="https://t.me/chainpulse_alpha"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Join @chainpulse_alpha on Telegram
            </a>
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
              
              {/* Active Channels — with visible Telegram CTA */}
              <div className="flex items-center gap-6">
                <a
                  href="https://t.me/chainpulse_alpha"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-5 py-3 rounded-xl bg-background-card border border-border hover:border-primary-500 hover:bg-primary-500/10 transition-all group"
                  title="Join our Telegram channel for live signals"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 group-hover:text-primary-400 transition-colors" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  <span className="text-sm font-medium text-text-secondary group-hover:text-primary-400 transition-colors">
                    Join traders on Telegram →
                  </span>
                </a>
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