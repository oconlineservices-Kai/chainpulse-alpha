'use client'

import { motion } from 'framer-motion'
import { 
  Target, 
  Eye, 
  Shield, 
  TrendingUp, 
  Users, 
  MessageSquare,
  ArrowLeft,
  Rocket,
  Heart,
  Zap
} from 'lucide-react'
import Link from 'next/link'

const values = [
  {
    icon: Shield,
    title: 'Radical Transparency',
    description: 'Every signal comes with full data lineage — you see exactly why we recommended it, not just a black box output.'
  },
  {
    icon: Zap,
    title: 'Speed Over Everything',
    description: 'We process whale transactions and sentiment shifts in seconds. In crypto, the first mover wins.'
  },
  {
    icon: Heart,
    title: 'User-First Design',
    description: 'Built by traders for traders. Clean UI, actionable insights, zero noise.'
  }
]

const team = [
  { name: 'Krishanu Maity', role: 'Founder & CEO', bio: 'Serial entrepreneur with deep expertise in Web3 infrastructure and AI-powered trading systems.' },
  { name: 'AI Core', role: 'Signal Engine', bio: 'Proprietary AI model trained on 3+ years of on-chain, sentiment, and market data.' },
  { name: 'Community', role: 'Beta Testers', bio: '500+ early adopters shaping the product with real feedback.' }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mb-6">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">About ChainPulse Alpha</h1>
          <p className="text-xl text-text-secondary mb-8 leading-relaxed">
            We&apos;re building the intelligence layer for crypto trading — combining on-chain whale tracking, 
            social sentiment analysis, and proprietary AI to give retail traders the same edge as institutions.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-background-card border border-border rounded-2xl p-8 mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="w-6 h-6 text-primary-400" />
            <h2 className="text-2xl font-bold">Our Mission</h2>
          </div>
          <p className="text-text-secondary leading-relaxed">
            Crypto markets never sleep, and neither does the information advantage. Institutions have dedicated 
            teams monitoring whale wallets, social sentiment, and market patterns 24/7. We believe retail traders 
            deserve the same edge.
          </p>
          <p className="text-text-secondary leading-relaxed mt-4">
            ChainPulse Alpha aggregates millions of data points across on-chain activity, Twitter sentiment, 
            and market microstructure into clear, actionable signals. No noise. No FOMO. Just data.
          </p>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.1 }}
                className="bg-background-card border border-border rounded-xl p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center mb-4">
                  <v.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-text-secondary">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6">Team</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {team.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.1 }}
                className="bg-background-card border border-border rounded-xl p-6 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold">{m.name}</h3>
                <p className="text-sm text-primary-400 mb-2">{m.role}</p>
                <p className="text-sm text-text-muted">{m.bio}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-6 mb-12"
        >
          {[
            { label: 'Signals Generated', value: '150+' },
            { label: 'Active Traders', value: '500+' },
            { label: 'Avg Win Rate', value: '72%' }
          ].map((s, i) => (
            <div key={s.label} className="text-center p-6 bg-background-card border border-border rounded-xl">
              <p className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                {s.value}
              </p>
              <p className="text-sm text-text-muted mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-primary-500/20 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold mb-3">Ready to trade smarter?</h2>
          <p className="text-text-secondary mb-6">Join 500+ traders already catching moves before they happen.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup" className="button-primary px-6 py-3">
              Get Started Free
            </Link>
            <Link href="/features" className="button-secondary px-6 py-3">
              View Features
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
