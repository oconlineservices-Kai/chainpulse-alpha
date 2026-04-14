'use client'

import { motion } from 'framer-motion'
import { Wallet, Brain, Diamond, Activity, Zap, Target } from 'lucide-react'
import FadeIn, { FadeInStagger } from '../animations/FadeIn'
import { HoverScale } from '../animations/ScaleIn'
import { FloatingIcon } from '../animations/FloatingElements'

const features = [
  {
    icon: Wallet,
    title: 'Follow the Smart Money',
    description: 'Monitor wallets with $1M+ holdings. Get alerted when whales accumulate before pumps.',
    gradient: 'from-primary-500 to-cyan-500',
    benefits: [
      'Track 1,247+ whale wallets',
      'Real-time accumulation alerts', 
      'Historical pattern analysis',
      'Smart money flow mapping'
    ]
  },
  {
    icon: Brain,
    title: 'Read the Market Mood',
    description: 'AI scans 10,000+ tweets daily. Spot trending tokens before they hit CoinMarketCap.',
    gradient: 'from-secondary-500 to-pink-500',
    benefits: [
      '10K+ tweets analyzed daily',
      'Sentiment trend prediction',
      'Influencer impact scoring',
      'Narrative tracking system'
    ]
  },
  {
    icon: Diamond,
    title: 'High-Confidence Alerts',
    description: 'Only when whale data + social sentiment align. No noise, just alpha.',
    gradient: 'from-warning-500 to-orange-500',
    benefits: [
      '85%+ confidence threshold',
      'Multi-signal correlation',
      'Risk-adjusted recommendations',
      'Precision over quantity'
    ]
  }
]

export default function Features() {
  return (
    <section id="features" className="py-24 relative bg-background-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 text-primary-400 text-sm mb-6">
              <Zap className="w-4 h-4" />
              <span>Three signals. One edge.</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The{' '}
              <span className="gradient-text">Alpha Trinity</span>
            </h2>
            <p className="text-text-secondary max-w-3xl mx-auto">
              Our AI combines multiple data sources to deliver signals you can actually trade on.
              When all three align, magic happens.
            </p>
          </div>
        </FadeIn>
        
        {/* Features Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <FadeIn key={feature.title} delay={index * 0.1}>
              <HoverScale>
                <motion.div 
                  className="group glass-card p-8 h-full hover:border-primary-500/30 transition-all duration-300 relative overflow-hidden"
                  whileHover={{ y: -8 }}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-[0.02] group-hover:opacity-[0.05] transition-opacity`} />
                  
                  {/* Icon */}
                  <div className="relative z-10 mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-0.5`}>
                      <div className="w-full h-full rounded-2xl bg-background-card flex items-center justify-center group-hover:bg-background-hover transition-colors">
                        <FloatingIcon delay={index * 0.5}>
                          <feature.icon className="w-8 h-8 text-white" />
                        </FloatingIcon>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl font-semibold mb-3 text-text-primary group-hover:text-primary-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-text-secondary leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    
                    {/* Benefits List */}
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-text-muted">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${feature.gradient}`} />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Hover Effect */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                    layoutId={`feature-${index}`}
                  />
                </motion.div>
              </HoverScale>
            </FadeIn>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <FadeIn delay={0.5}>
          <div className="text-center">
            <div className="glass-card p-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Activity className="w-6 h-6 text-primary-400" />
                <h3 className="text-xl font-semibold">Ready to see it in action?</h3>
              </div>
              <p className="text-text-secondary mb-6">
                Join thousands of traders who trust ChainPulse Alpha for their crypto intelligence.
              </p>
              <motion.button 
                className="button-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Target className="w-5 h-5 mr-2" />
                Start Getting Alpha
              </motion.button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}