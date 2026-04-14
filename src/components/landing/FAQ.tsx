'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import FadeIn from '../animations/FadeIn'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: 'What are Diamond Signals?',
    answer: 'Diamond Signals are our highest-confidence alerts that occur when whale wallet accumulation strongly correlates with positive Twitter sentiment for the same token. These signals have historically shown the best risk/reward ratios, with confidence scores exceeding 85%.'
  },
  {
    question: 'How accurate are the alerts?',
    answer: 'Our Diamond Signals maintain an 82.4% success rate based on historical performance. While no signal is guaranteed (crypto is inherently risky), our AI combines multiple data points to identify high-probability setups. We focus on quality over quantity - you\'ll receive fewer signals, but each one is thoroughly vetted.'
  },
  {
    question: 'Which blockchains do you support?',
    answer: 'We currently support Ethereum, BSC (Binance Smart Chain), and Solana, covering the majority of DeFi and memecoin activity. We\'re actively adding Base, Arbitrum, and Polygon based on user demand and trading volume. Each chain is monitored 24/7 for whale movements and social sentiment.'
  },
  {
    question: 'Do I need trading experience?',
    answer: 'Not at all! Our dashboard is designed to be intuitive for beginners while providing the depth experienced traders need. Each signal includes a simple Buy/Skip recommendation with clear reasoning, risk assessment, and suggested position sizing. We also provide educational content to help you understand the signals.'
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Absolutely. You can cancel your subscription at any time with one click in your dashboard. There are no cancellation fees, and you\'ll continue to have access to your paid features until the end of your billing period. We also offer a 7-day money-back guarantee for new subscribers.'
  },
  {
    question: 'How quickly do I receive alerts?',
    answer: 'Premium users receive real-time alerts instantly via email, Telegram, and push notifications. Free users have a 15-minute delay to ensure our premium subscribers get first access to time-sensitive opportunities. Diamond Signals are typically valid for several hours, so even with the delay, free users can still benefit.'
  },
  {
    question: 'What makes ChainPulse different from other crypto tools?',
    answer: 'Unlike tools that focus on just technical analysis or social sentiment, ChainPulse Alpha combines whale wallet tracking, Twitter sentiment analysis, and AI correlation in real-time. We don\'t just tell you what\'s trending - we tell you when smart money is actually moving, creating a unique edge in the market.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, we take security seriously. We use 256-bit encryption, are SOC 2 compliant, and never store your private keys or trading credentials. We only collect the minimum data necessary to provide our service, and you can delete your account and all associated data at any time.'
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Section Header */}
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-500/20 text-secondary-400 text-sm mb-6">
              <HelpCircle className="w-4 h-4" />
              <span>Got questions?</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-text-secondary">
              Everything you need to know about ChainPulse Alpha
            </p>
          </div>
        </FadeIn>
        
        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FadeIn key={index} delay={index * 0.1}>
              <motion.div
                className="glass-card overflow-hidden hover:border-primary-500/30 transition-colors"
                whileHover={{ y: -2 }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left group"
                >
                  <span className="font-semibold pr-4 group-hover:text-primary-400 transition-colors">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-5 h-5 text-text-muted group-hover:text-primary-400 transition-colors" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5">
                        <div className="w-full h-px bg-border mb-4" />
                        <p className="text-text-secondary leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </FadeIn>
          ))}
        </div>
        
        {/* Contact CTA */}
        <FadeIn delay={0.8}>
          <div className="text-center mt-16">
            <div className="glass-card p-8 max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-4">Still have questions?</h3>
              <p className="text-text-secondary mb-6">
                Our support team is here to help you succeed.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.button
                  className="button-secondary text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Contact Support
                </motion.button>
                <motion.button
                  className="button-ghost text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Join Discord
                </motion.button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}