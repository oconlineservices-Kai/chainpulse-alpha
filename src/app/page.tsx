'use client'

import { Suspense } from 'react'
import { motion } from 'framer-motion'

// Landing components
import Hero from '@/components/landing/Hero'
import SocialProof from '@/components/landing/SocialProof'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import Pricing from '@/components/landing/Pricing'
import FAQ from '@/components/landing/FAQ'
import CTA from '@/components/landing/CTA'
import Footer from '@/components/landing/Footer'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero Section */}
          <Hero />
          
          {/* Social Proof */}
          <SocialProof />
          
          {/* Features */}
          <Features />
          
          {/* How It Works */}
          <HowItWorks />
          
          {/* Pricing */}
          <Pricing />
          
          {/* FAQ */}
          <FAQ />
          
          {/* Final CTA */}
          <CTA />
          
          {/* Footer */}
          <Footer />
        </motion.div>
      </Suspense>
    </main>
  )
}