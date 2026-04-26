'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { CheckCircle2, Zap, Crown, Sparkles, Lock, Unlock, ArrowLeft } from 'lucide-react'
import PaymentButton from '@/components/PaymentButton'
import FadeIn, { FadeInStagger } from '@/components/animations/FadeIn'
import { HoverScale } from '@/components/animations/ScaleIn'
import { cn } from '@/lib/utils'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: '',
    description: 'Perfect for getting started',
    icon: Unlock,
    color: 'from-success-500 to-emerald-500',
    features: [
      'Top 5 daily signals',
      '15-minute delay',
      'Basic sentiment scores',
      'Web dashboard access',
      'Community Discord',
    ],
    limitations: [
      'Limited historical data',
      'No Telegram integration'
    ],
    cta: 'Get Started',
    popular: false,
    comingSoon: false
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹4,099',
    period: '/mo',
    description: 'For serious traders',
    icon: Crown,
    color: 'from-primary-500 to-secondary-500',
    features: [
      'Real-time alerts (0 delay)',
      'Telegram bot integration',
      'Full dashboard access',
      'Diamond Signals priority',
      'Whale wallet deep dives',
      'Historical data access',
      'Advanced filtering',
      'Portfolio tracking',
      'API access (beta)',
      'Priority support'
    ],
    limitations: [],
    cta: 'Upgrade to Premium',
    popular: true,
    comingSoon: false
  },
  {
    id: 'payper',
    name: 'Pay-Per-Alpha',
    price: '₹83',
    period: '',
    description: 'Unlock single signals',
    icon: Sparkles,
    color: 'from-warning-500 to-orange-500',
    features: [
      'Unlock any signal instantly',
      'No subscription required',
      'Full signal details',
      'Valid for 30 days',
      'Stackable credits',
      'Mobile-friendly',
    ],
    limitations: [
      'No bulk discounts',
      'No API access'
    ],
    cta: 'Buy Credits',
    popular: false,
    comingSoon: false
  },
]

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const { data: session } = useSession()

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Back Link */}
        <FadeIn>
          <a 
            href="/" 
            className="inline-flex items-center gap-2 text-text-muted hover:text-primary-400 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>
        </FadeIn>

        {/* Section Header */}
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning-500/20 text-warning-400 text-sm mb-6">
              <Zap className="w-4 h-4" />
              <span>Simple, transparent pricing</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Start free,{' '}
              <span className="gradient-text">scale when ready</span>
            </h1>
            <p className="text-text-secondary max-w-2xl mx-auto mb-8">
              Choose the plan that fits your trading style. Upgrade, downgrade, or cancel anytime.
            </p>
            
            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-2 p-1 rounded-xl bg-background-card border border-border">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  billingPeriod === 'monthly'
                    ? "bg-primary-500 text-white"
                    : "text-text-muted hover:text-text-secondary"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                  billingPeriod === 'yearly'
                    ? "bg-primary-500 text-white"
                    : "text-text-muted hover:text-text-secondary"
                )}
              >
                Yearly
                <span className="px-2 py-0.5 rounded-full bg-success-500/20 text-success-400 text-xs">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </FadeIn>
        
        {/* Pricing Cards */}
        <FadeInStagger stagger={0.1} className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan) => (
            <HoverScale key={plan.id}>
              <motion.div
                className={cn(
                  "relative p-8 rounded-2xl border transition-all duration-300",
                  plan.popular
                    ? "glass-card border-primary-500/50 hover:border-primary-500"
                    : "glass-card hover:border-primary-500/30"
                )}
                whileHover={{ y: -4 }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold"
                  >
                    Most Popular
                  </motion.div>
                )}
                
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} p-0.5 mx-auto mb-4`}>
                    <div className="w-full h-full rounded-2xl bg-background-card flex items-center justify-center">
                      <plan.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-4xl font-bold">
                      {billingPeriod === 'yearly' && plan.id === 'premium' 
                        ? '₹3,267' 
                        : plan.price
                      }
                    </span>
                    {plan.period && (
                      <span className="text-text-muted">
                        {billingPeriod === 'yearly' ? '/mo' : plan.period}
                      </span>
                    )}
                  </div>
                  
                  {billingPeriod === 'yearly' && plan.id === 'premium' && (
                    <div className="text-sm text-success-400">
                      ₹49,188/year (save ₹10,020)
                    </div>
                  )}
                  
                  <p className="text-text-muted text-sm">{plan.description}</p>
                </div>
                
                {/* Features */}
                <div className="mb-8">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-success-400 flex-shrink-0" />
                        <span className="text-text-secondary text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.limitations.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-text-muted mb-2">Not included:</p>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation) => (
                          <li key={limitation} className="flex items-center gap-3">
                            <Lock className="w-4 h-4 text-text-muted flex-shrink-0" />
                            <span className="text-text-muted text-xs">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* CTA Button */}
                {plan.id === 'premium' ? (
                  <PaymentButton
                    amount={billingPeriod === 'yearly' ? 39204 : 4099}
                    plan={billingPeriod === 'yearly' ? 'Premium Yearly' : 'Premium Monthly'}
                    buttonText={plan.cta}
                    className={cn(
                      "w-full py-3 rounded-xl font-semibold transition-all button-primary flex items-center justify-center"
                    )}
                  />
                ) : plan.id === 'payper' ? (
                  <PaymentButton
                    amount={83}
                    plan="Pay Per Alpha"
                    buttonText={plan.cta}
                    className={cn(
                      "w-full py-3 rounded-xl font-semibold transition-all button-secondary flex items-center justify-center"
                    )}
                  />
                ) : (
                  session?.user ? (
                    <div className="w-full py-3 rounded-xl font-semibold text-center bg-success-500/10 border border-success-500/30 text-success-400 text-sm">
                      ✓ Current Plan
                    </div>
                  ) : (
                    <motion.a
                      href="/signup"
                      className={cn(
                        "w-full py-3 rounded-xl font-semibold transition-all block text-center",
                        plan.popular
                          ? "button-primary"
                          : "button-secondary"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {plan.cta}
                    </motion.a>
                  )
                )}
                
                {/* Background Effect */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-[0.01] rounded-2xl pointer-events-none`}
                  whileHover={{ opacity: 0.02 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </HoverScale>
          ))}
        </FadeInStagger>
        
        {/* FAQ Preview */}
        <FadeIn delay={0.5}>
          <div className="text-center">
            <div className="glass-card p-8 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-4">Questions about pricing?</h3>
              <p className="text-text-secondary mb-6">
                All plans include a 7-day free trial. Cancel anytime, no questions asked.
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-text-muted">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success-400" />
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success-400" />
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success-400" />
                  <span>Money-back guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </main>
  )
}
