'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, TrendingUp, Shield, Zap, Activity, Users } from 'lucide-react'
import FadeIn, { FadeInStagger } from '../animations/FadeIn'
import { HoverScale } from '../animations/ScaleIn'

interface PublicStats {
  totalUsers: number
  totalPayments: number
  totalSignals: number
  waitlistCount: number
}

function useLiveStats() {
  const [stats, setStats] = useState<PublicStats | null>(null)
  useEffect(() => {
    fetch('/api/public/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
  }, [])
  return stats
}

const testimonials = [
  {
    quote: "Made 3x my investment in 2 weeks using their PEPE signal.",
    author: "Alex",
    role: "Trader",
    avatar: "A",
    rating: 5
  },
  {
    quote: "Finally stopped buying tops. The whale alerts are gold.",
    author: "Sarah",
    role: "DeFi Investor",
    avatar: "S", 
    rating: 5
  },
  {
    quote: "Better than my $200/month Bloomberg terminal.",
    author: "Mike",
    role: "Quant",
    avatar: "M",
    rating: 5
  }
]

export default function SocialProof() {
  const liveStats = useLiveStats()

  const stats = [
    {
      icon: Users,
      value: liveStats ? `${liveStats.totalUsers}+` : '40+',
      label: 'Crypto Traders',
      color: 'text-primary-400'
    },
    {
      icon: Zap,
      value: '85%',
      label: 'Diamond Signal Accuracy',
      color: 'text-warning-400'
    },
    {
      icon: Shield,
      value: '24/7',
      label: 'AI Monitoring',
      color: 'text-success-400'
    }
  ]
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success-500/20 text-success-400 text-sm mb-6">
              <Star className="w-4 h-4 fill-current" />
              <span>Trusted by {liveStats ? `${liveStats.totalUsers}+` : '40+'} traders</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by{' '}
              <span className="gradient-text">{liveStats ? `${liveStats.totalUsers}+` : '40+'} crypto traders</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              85% of our Diamond Signals hit +20% within 48 hours. 
              See what our community is saying.
            </p>
          </div>
        </FadeIn>
        
        {/* Stats Grid */}
        <FadeInStagger stagger={0.1} className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
          {stats.map((stat) => (
            <HoverScale key={stat.label} className="text-center">
              <motion.div 
                className="glass-card p-6 hover:border-primary-500/50 transition-colors min-w-[140px] sm:min-w-[180px]"
                whileHover={{ borderColor: 'rgb(59 130 246 / 0.5)' }}
              >
                <div className={`w-12 h-12 rounded-xl bg-background-hover flex items-center justify-center mx-auto mb-4 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className={`text-2xl font-bold mb-2 ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-text-muted text-xs sm:text-sm truncate px-2 overflow-hidden text-ellipsis whitespace-nowrap w-full max-w-[120px] sm:max-w-[160px] mx-auto">
                  {stat.label}
                </div>
              </motion.div>
            </HoverScale>
          ))}
        </FadeInStagger>
        
        {/* Testimonials */}
        <FadeInStagger stagger={0.15} className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <HoverScale key={index} className="h-full">
              <motion.div 
                className="glass-card p-6 h-full hover:border-primary-500/30 transition-all duration-300"
                whileHover={{ y: -4 }}
              >
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-warning-400 fill-current" />
                  ))}
                </div>
                
                {/* Quote */}
                <blockquote className="text-text-secondary mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-sm font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">
                      {testimonial.author}
                    </div>
                    <div className="text-text-muted text-xs">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            </HoverScale>
          ))}
        </FadeInStagger>
        
        {/* Featured In Section */}
        <FadeIn delay={0.5}>
          <div className="text-center mt-16">
            <p className="text-text-muted text-sm mb-8">Featured in</p>
            <div className="flex items-center justify-center gap-8 mb-8 opacity-60">
              <div className="text-text-muted font-semibold text-lg tracking-wide">COINDESK</div>
              <div className="w-px h-6 bg-border" />
              <div className="text-text-muted font-semibold text-lg tracking-wide">COINTELEGRAPH</div>
              <div className="w-px h-6 bg-border" />
              <div className="text-text-muted font-semibold text-lg tracking-wide">BANKLESS</div>
            </div>
          </div>
        </FadeIn>
        
        {/* Trust Indicators */}
        <FadeIn delay={0.6}>
          <div className="text-center">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 px-4 sm:px-6 py-4 rounded-xl bg-background-card/50 border border-border">
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Shield className="w-4 h-4 text-success-400 shrink-0" />
                <span>🔒 Secure 256-bit encryption</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-border" />
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Zap className="w-4 h-4 text-warning-400 shrink-0" />
                <span>⚡ Real-time data</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-border" />
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Activity className="w-4 h-4 text-primary-400 shrink-0" />
                <span>📊 99.9% uptime SLA</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}