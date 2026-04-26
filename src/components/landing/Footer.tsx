'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Shield, Zap, Activity } from 'lucide-react'
import FadeIn from '../animations/FadeIn'

const footerLinks = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Dashboard', href: '/dashboard' },
  ],
  resources: [
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
  // Social links removed - accounts don't exist yet
  // Will be added when actual accounts are created
  social: []
}

const trustBadges = [
  {
    icon: Shield,
    text: '🔒 Secure 256-bit encryption',
    color: 'text-success-400'
  },
  {
    icon: Zap,
    text: '⚡ Real-time data',
    color: 'text-warning-400'
  },
  {
    icon: Activity,
    text: '📊 99.9% uptime SLA',
    color: 'text-primary-400'
  }
]

export default function Footer() {
  return (
    <footer className="bg-background-card border-t border-border">
      {/* Trust Signals */}
      <div className="container mx-auto px-4 py-8">
        <FadeIn>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-8">
            {trustBadges.map((badge, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2 text-sm"
                whileHover={{ scale: 1.05 }}
              >
                <badge.icon className={`w-4 h-4 ${badge.color}`} />
                <span className="text-text-secondary">{badge.text}</span>
              </motion.div>
            ))}
          </div>
        </FadeIn>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo & Description */}
          <FadeIn className="col-span-2 lg:col-span-1">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">ChainPulse</span>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">
                AI-powered crypto signals that combine whale tracking with Twitter sentiment for high-confidence alpha.
              </p>
              {/* Social links removed - will be added when accounts exist */}
            </div>
          </FadeIn>

          {/* Product */}
          <FadeIn delay={0.1}>
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-text-primary">
                Product
              </h3>
              <ul className="space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <motion.a
                      href={link.href}
                      className="text-text-secondary hover:text-primary-400 transition-colors text-sm"
                      whileHover={{ x: 2 }}
                    >
                      {link.label}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          {/* Resources */}
          <FadeIn delay={0.2}>
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-text-primary">
                Resources
              </h3>
              <ul className="space-y-2">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <motion.a
                      href={link.href}
                      className="text-text-secondary hover:text-primary-400 transition-colors text-sm"
                      whileHover={{ x: 2 }}
                    >
                      {link.label}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          {/* Legal */}
          <FadeIn delay={0.3}>
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-text-primary">
                Legal
              </h3>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <motion.a
                      href={link.href}
                      className="text-text-secondary hover:text-primary-400 transition-colors text-sm"
                      whileHover={{ x: 2 }}
                    >
                      {link.label}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          {/* Newsletter */}
          <FadeIn delay={0.4}>
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-text-primary">
                Stay Updated
              </h3>
              <p className="text-text-secondary text-sm">
                Get the latest alpha and product updates.
              </p>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary-500 transition-colors"
                />
                <motion.button
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <FadeIn>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-text-muted text-sm">
                © {new Date().getFullYear()} ChainPulse Alpha. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-text-muted">
                  Made with ❤️ for crypto traders
                </span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse" />
                  <span className="text-text-muted">All systems operational</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </footer>
  )
}