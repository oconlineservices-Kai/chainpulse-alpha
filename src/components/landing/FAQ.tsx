'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react'
import FadeIn from '../animations/FadeIn'

const faqs = [
  {
    question: 'What are Diamond Signals?',
    answer:
      'Diamond Signals are our highest-confidence alerts triggered when whale accumulation and positive social sentiment line up around the same asset.',
    href: '/contact',
    linkLabel: 'Ask for a Diamond Signals walkthrough',
  },
  {
    question: 'How accurate are the alerts?',
    answer:
      'We prioritize fewer, higher-confidence alerts. Historical hit rate messaging should be treated as informational, not a guarantee of future performance.',
    href: '/pricing',
    linkLabel: 'See what is included in Premium alerts',
  },
  {
    question: 'Which blockchains do you support?',
    answer:
      'ChainPulse currently focuses on the highest-signal ecosystems and expands based on demand, liquidity, and observed whale activity.',
    href: '/contact',
    linkLabel: 'Request coverage for another chain',
  },
  {
    question: 'Do I need trading experience?',
    answer:
      'No. The product is designed to be readable for beginners while still useful for advanced traders who want faster signal context.',
    href: '/pricing',
    linkLabel: 'Compare Free vs Premium access',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      'Yes. You can cancel anytime and keep access through the end of the active billing period.',
    href: '/terms',
    linkLabel: 'Read billing and cancellation terms',
  },
  {
    question: 'How quickly do I receive alerts?',
    answer:
      'Premium delivery is intended to be immediate. Free access includes a delay so paying users receive the first actionable signal window.',
    href: '/pricing',
    linkLabel: 'View alert delivery differences',
  },
  {
    question: 'What makes ChainPulse different from other crypto tools?',
    answer:
      'Instead of relying on a single signal source, ChainPulse combines wallet activity, sentiment inputs, and AI scoring into one trading workflow.',
    href: '/#features',
    linkLabel: 'Explore core product features',
  },
  {
    question: 'Is my data secure?',
    answer:
      'The app is built to minimize sensitive data exposure and avoid storing anything unnecessary for product access and billing workflows.',
    href: '/privacy',
    linkLabel: 'Read the privacy policy',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <section id="faq" className="py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }}
      />

      <div className="container mx-auto px-4 max-w-4xl">
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
              Quick answers, plus helpful next steps for deeper information.
            </p>
          </div>
        </FadeIn>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FadeIn key={faq.question} delay={index * 0.08}>
              <motion.div
                className="glass-card overflow-hidden hover:border-primary-500/30 transition-colors"
                whileHover={{ y: -2 }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left group"
                  aria-expanded={openIndex === index}
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
                        <p className="text-text-secondary leading-relaxed mb-4">{faq.answer}</p>
                        <Link
                          href={faq.href}
                          className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm font-medium"
                        >
                          {faq.linkLabel}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.8}>
          <div className="text-center mt-16">
            <div className="glass-card p-8 max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-4">Still have questions?</h3>
              <p className="text-text-secondary mb-6">
                Reach out directly if you need onboarding help, product clarification, or billing support.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/contact" className="button-secondary text-sm">
                  Contact Support
                </Link>
                <a
                  href="https://discord.gg/chainpulsealpha"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-ghost text-sm"
                >
                  Join Discord
                </a>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
