'use client'

import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle, Wallet, Bell, Zap } from 'lucide-react'
import FadeIn from '../animations/FadeIn'
import { HoverScale } from '../animations/ScaleIn'

const steps = [
  {
    number: 1,
    title: 'Scan Twitter',
    description: 'Our AI monitors millions of tweets to identify trending tokens and emerging narratives.',
    icon: MessageCircle,
    color: 'from-blue-500 to-cyan-500',
    details: [
      'Real-time sentiment analysis',
      'Influencer impact tracking',
      'Viral content detection',
      'Narrative emergence mapping'
    ]
  },
  {
    number: 2,
    title: 'Track Whales',
    description: 'We monitor 1,000+ whale wallets across Ethereum, BSC, and Solana for accumulation patterns.',
    icon: Wallet,
    color: 'from-purple-500 to-pink-500',
    details: [
      '1,247+ whale wallets tracked',
      'Multi-chain monitoring',
      'Pattern recognition AI',
      'Flow correlation analysis'
    ]
  },
  {
    number: 3,
    title: 'Correlate Signals',
    description: 'Our AI correlates social hype with on-chain activity to identify high-probability setups.',
    icon: Zap,
    color: 'from-amber-500 to-orange-500',
    details: [
      'Multi-signal correlation',
      'Confidence scoring',
      'Risk assessment',
      'Timing optimization'
    ]
  },
  {
    number: 4,
    title: 'Get Alerts',
    description: 'You receive instant Diamond Signals when confidence scores exceed 85%.',
    icon: Bell,
    color: 'from-green-500 to-emerald-500',
    details: [
      'Real-time notifications',
      'Telegram integration',
      'Mobile-first alerts',
      'Actionable insights'
    ]
  }
]

export default function HowItWorks() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-500/20 text-secondary-400 text-sm mb-6">
              <Zap className="w-4 h-4" />
              <span>From data to decision</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Four simple steps that turn market chaos into clear signals
            </p>
          </div>
        </FadeIn>
        
        {/* Steps */}
        <div className="max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <FadeIn key={step.number} delay={index * 0.2}>
              <div className="relative">
                {/* Step Container */}
                <div className={`flex flex-col lg:flex-row items-center gap-8 mb-16 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}>
                  {/* Content */}
                  <div className="flex-1 lg:max-w-md">
                    <HoverScale>
                      <motion.div 
                        className="glass-card p-8 hover:border-primary-500/30 transition-all duration-300"
                        whileHover={{ y: -4 }}
                      >
                        {/* Step Number */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-lg`}>
                            {step.number}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-text-primary">
                              {step.title}
                            </h3>
                          </div>
                        </div>
                        
                        <p className="text-text-secondary mb-6 leading-relaxed">
                          {step.description}
                        </p>
                        
                        {/* Details */}
                        <ul className="space-y-2">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-text-muted">
                              <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${step.color}`} />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    </HoverScale>
                  </div>
                  
                  {/* Icon Visualization */}
                  <div className="flex-1 flex justify-center">
                    <motion.div
                      className={`relative w-32 h-32 rounded-3xl bg-gradient-to-br ${step.color} p-0.5`}
                      whileHover={{ scale: 1.05 }}
                      animate={{ 
                        rotateY: [0, 5, 0, -5, 0],
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.5
                      }}
                    >
                      <div className="w-full h-full rounded-3xl bg-background-card flex items-center justify-center">
                        <motion.div
                          animate={{
                            y: [0, -4, 0],
                            rotate: [0, 2, 0, -2, 0]
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: index * 0.3
                          }}
                        >
                          <step.icon className="w-16 h-16 text-white" />
                        </motion.div>
                      </div>
                      
                      {/* Floating particles */}
                      <motion.div
                        className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-warning-400"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [1, 0.5, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.4
                        }}
                      />
                      <motion.div
                        className="absolute -bottom-2 -left-2 w-2 h-2 rounded-full bg-primary-400"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [1, 0.7, 1]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: index * 0.6
                        }}
                      />
                    </motion.div>
                  </div>
                </div>
                
                {/* Connecting Arrow */}
                {index < steps.length - 1 && (
                  <motion.div
                    className="flex justify-center mb-8"
                    animate={{ y: [0, 4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-background-card border border-border flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-text-muted rotate-90" />
                    </div>
                  </motion.div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
        
        {/* Bottom Stats */}
        <FadeIn delay={0.8}>
          <div className="text-center mt-16">
            <div className="glass-card p-6 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-2">
                  85%+
                </div>
                <div className="text-text-secondary">
                  Minimum confidence score for Diamond Signals
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}