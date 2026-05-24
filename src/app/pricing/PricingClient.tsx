'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Zap, Crown, Sparkles, Lock, Unlock, ArrowLeft, Loader2, AlertCircle, Check } from 'lucide-react'
import PaymentButton from '@/components/PaymentButton'
import FadeIn, { FadeInStagger } from '@/components/animations/FadeIn'
import { HoverScale } from '@/components/animations/ScaleIn'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

// Credit pack definitions
const CREDIT_PACKS = [
  { id: 'starter' as const, credits: 5,  amount: 499, disp: '$5',    label: 'Starter',  icon: Sparkles },
  { id: 'value' as const,   credits: 10, amount: 899, disp: '$9',    label: 'Value',    icon: Zap },
  { id: 'pro' as const,     credits: 25, amount: 1399, disp: '$14',   label: 'Pro',      icon: Crown },
]

// Window.Razorpay types
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}
interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayResponse) => void
  prefill?: { email?: string; name?: string }
  theme?: { color?: string }
  modal?: { ondismiss?: () => void }
}
interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}
interface RazorpayInstance {
  open: () => void
}

// Base plans always shown (no Free plan in the main display)
const basePlans = [
  {
    id: 'premium',
    name: 'Premium',
    price: '$49',
    yearlyPrice: '$39',
    period: '/mo',
    description: 'For serious traders',
    icon: Crown,
    color: 'from-primary-500 to-secondary-500',
    features: [
      'Real-time alerts (0 delay)',
      'Real-time push alerts',
      'Full dashboard access',
      'Diamond Signals priority',
      'Whale wallet deep dives',
      'Historical data access',
      'Advanced filtering',
      'Priority support',
    ],
    limitations: [],
    cta: 'Upgrade to Premium',
    popular: true,
  },
  {
    id: 'payper',
    name: 'Pay-Per-Alpha',
    price: '$1',
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
    ],
    cta: 'Buy Credits',
    popular: false,
  },
]

export default function PricingClient() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [mounted, setMounted] = useState(false)
  const { data: session, status, update: refreshSession } = useSession()
  const isLoggedIn = mounted && status === 'authenticated'
  const userTier = isLoggedIn ? (session?.user as any)?.premiumStatus ?? 'free' : null
  const isPremium = userTier === 'premium'

  // Credit purchase state
  const [creditLoading, setCreditLoading] = useState<string | null>(null)
  const [creditError, setCreditError] = useState<string | null>(null)
  const [creditSuccess, setCreditSuccess] = useState<string | null>(null)
  const [sessionRefreshed, setSessionRefreshed] = useState(false)

  // Check if user has current plan to show "Your Plan" badge
  const isUserPlan = (planId: string) => {
    if (!isLoggedIn) return false
    if (planId === 'premium' && isPremium) return true
    return false
  }

  // Defer session-dependent rendering until after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleCreditPurchase = async (packId: string) => {
    // Redirect to login if not authenticated
    if (status !== 'authenticated' || !session) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent('/pricing')}`
      return
    }

    setCreditLoading(packId)
    setCreditError(null)
    setCreditSuccess(null)

    try {
      // Step 1: Create order
      const orderRes = await fetch('/api/payment/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack: packId }),
      })
      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to create order')
      }

      // Step 2: Load Razorpay script
      const loaded = await loadRazorpayScript()
      if (!loaded) throw new Error('Failed to load payment gateway')

      // Step 3: Open Razorpay checkout
      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ChainPulse Alpha',
        description: orderData.label,
        order_id: orderData.orderId,
        handler: async (response: RazorpayResponse) => {
          // Step 4: Verify payment via PATCH /api/payment/credits
          try {
            const verifyRes = await fetch('/api/payment/credits', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                transactionId: orderData.transactionId,
              }),
            })
            const verifyData = await verifyRes.json()

            if (verifyData.success) {
              setCreditSuccess(`🎉 ${verifyData.creditsAdded} credits added!`)
              setCreditLoading(null)

              // Refresh session to get updated credits
              await refreshSession()
              setSessionRefreshed(true)

              // Redirect to dashboard after 2 seconds
              setTimeout(() => {
                window.location.href = '/dashboard'
              }, 2000)
            } else {
              throw new Error(verifyData.error || 'Verification failed')
            }
          } catch (err) {
            setCreditError('Payment was completed but verification failed. Contact support if credits are missing.')
            setCreditLoading(null)
          }
        },
        prefill: {
          email: session.user?.email ?? '',
          name: session.user?.name ?? '',
        },
        theme: { color: '#0ea5e9' },
        modal: {
          ondismiss: () => {
            setCreditLoading(null)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error('Credit purchase error:', error)
      setCreditError(error instanceof Error ? error.message : 'Payment failed. Please try again.')
      setCreditLoading(null)
    }
  }

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
              {isLoggedIn && !isPremium ? 'Upgrade your experience' : 'Start free,'}{' '}
              <span className="gradient-text">scale when ready</span>
            </h1>
            <p className="text-text-secondary max-w-2xl mx-auto mb-8">
              {isLoggedIn && !isPremium
                ? 'Unlock real-time signals, push alerts, and advanced analytics. Upgrade to Premium or buy signals as needed.'
                : 'Choose the plan that fits your trading style. Upgrade, downgrade, or cancel anytime.'
              }
            </p>

            {/* Billing Toggle — only show when Premium is available */}
            <div className="inline-flex items-center gap-2 p-1 rounded-xl bg-background-card border border-border">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  billingPeriod === 'monthly'
                    ? 'bg-primary-500 text-white'
                    : 'text-text-muted hover:text-text-secondary',
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                  billingPeriod === 'yearly'
                    ? 'bg-primary-500 text-white'
                    : 'text-text-muted hover:text-text-secondary',
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

        {/* Pricing Cards — Only Premium + Pay-Per-Alpha */}
        <FadeInStagger stagger={0.1} className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {basePlans.map((plan) => {
            const isCurrentPlan = isUserPlan(plan.id)
            const showUpgrade = isLoggedIn && !isPremium && plan.id === 'premium'
            const showBuyButton = !isPremium || plan.id === 'payper'

            return (
              <HoverScale key={plan.id}>
                <motion.div
                  className={cn(
                    'relative p-8 rounded-2xl border transition-all duration-300',
                    plan.popular
                      ? 'glass-card border-primary-500/50 hover:border-primary-500'
                      : 'glass-card hover:border-primary-500/30',
                    isCurrentPlan && 'border-success-500/50',
                  )}
                  whileHover={{ y: -4 }}
                >
                  {/* Popular Badge */}
                  {plan.popular && !isCurrentPlan && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold"
                    >
                      Most Popular
                    </motion.div>
                  )}

                  {/* Your Current Plan Badge */}
                  {isCurrentPlan && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-success-500 text-white text-sm font-semibold"
                    >
                      ✓ Your Plan
                    </motion.div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} p-0.5 mx-auto mb-4`}
                    >
                      <div className="w-full h-full rounded-2xl bg-background-card flex items-center justify-center">
                        <plan.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>

                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-4xl font-bold">
                        {billingPeriod === 'yearly' && plan.id === 'premium'
                          ? plan.yearlyPrice
                          : plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-text-muted">
                          {billingPeriod === 'yearly' ? '/mo' : plan.period}
                        </span>
                      )}
                    </div>

                    {billingPeriod === 'yearly' && plan.id === 'premium' && (
                      <div className="text-sm text-success-400">
                        $468 billed annually (save $120)
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
                  {isCurrentPlan ? (
                    <Link
                      href="/dashboard"
                      className="w-full py-3 rounded-xl font-semibold transition-all block text-center bg-success-500/20 text-success-400 border border-success-500/30 hover:bg-success-500/30"
                    >
                      Go to Dashboard
                    </Link>
                  ) : plan.id === 'premium' && showUpgrade ? (
                    <PaymentButton
                      amount={billingPeriod === 'yearly' ? 39 : 49}
                      plan={billingPeriod === 'yearly' ? 'Premium Yearly' : 'Premium Monthly'}
                      buttonText={plan.cta}
                      className={cn(
                        'w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center',
                        plan.popular ? 'button-primary' : 'button-secondary',
                      )}
                    />
                  ) : plan.id === 'payper' && (
                    <div className="space-y-3">
                      {/* Credit pack selection */}
                      <div className="grid grid-cols-3 gap-2">
                        {CREDIT_PACKS.map((pack) => {
                          const isLoading = creditLoading === pack.id
                          const Icon = pack.icon
                          return (
                            <button
                              key={pack.id}
                              onClick={() => handleCreditPurchase(pack.id)}
                              disabled={creditLoading !== null}
                              className={cn(
                                'flex flex-col items-center gap-1.5 p-3 rounded-xl text-sm font-medium transition-all border',
                                'bg-background-muted hover:bg-background-card border-border/50 hover:border-primary-500/40',
                                isLoading && 'opacity-70 pointer-events-none',
                                creditSuccess && 'opacity-50 pointer-events-none'
                              )}
                            >
                              {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-warning-500 to-orange-500 flex items-center justify-center">
                                  <Icon className="w-4 h-4 text-white" />
                                </div>
                              )}
                              <span className="font-bold">
                                {pack.credits} credits
                              </span>
                              <span className="text-text-muted text-xs">
                                {pack.disp}
                              </span>
                            </button>
                          )
                        })}
                      </div>

                      {/* Success message */}
                      {creditSuccess && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 justify-center text-success-400 text-sm bg-success-500/10 rounded-lg px-3 py-2 border border-success-500/20"
                        >
                          <Check className="w-4 h-4" />
                          {creditSuccess}
                        </motion.div>
                      )}

                      {/* Error message */}
                      {creditError && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 justify-center text-danger-400 text-xs bg-danger-500/10 rounded-lg px-3 py-2 border border-danger-500/20"
                        >
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{creditError}</span>
                        </motion.div>
                      )}

                      {!creditSuccess && !isLoggedIn && (
                        <p className="text-center text-xs text-text-muted">
                          <Link
                            href={`/login?callbackUrl=/pricing`}
                            className="text-primary-400 hover:text-primary-300 underline underline-offset-2"
                          >
                            Log in
                          </Link>
                          {' '}to purchase credits
                        </p>
                      )}
                    </div>
                  )}

                  {/* Background Effect */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-[0.01] rounded-2xl pointer-events-none`}
                    whileHover={{ opacity: 0.02 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </HoverScale>
            )
          })}
        </FadeInStagger>

        {/* What current Free users can do */}
        {isLoggedIn && !isPremium && (
          <FadeIn delay={0.3}>
            <div className="glass-card p-8 max-w-3xl mx-auto mb-16 border border-warning-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-background-muted flex items-center justify-center flex-shrink-0">
                  <Unlock className="w-6 h-6 text-warning-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Your Free Plan Features</h3>
                  <p className="text-text-secondary text-sm mb-4">
                    You currently have access to basic signals. Upgrade to unlock the full power of ChainPulse Alpha.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2 text-sm text-text-muted">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success-400" />
                      Top 5 daily signals
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success-400" />
                      15-minute delay
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success-400" />
                      Basic sentiment scores
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success-400" />
                      Web dashboard access
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success-400" />
                      Community Discord
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Not logged in — show a CTA */}
        {!isLoggedIn && (
          <FadeIn delay={0.3}>
            <div className="text-center mb-16">
              <Link
                href="/signup"
                className="button-primary px-8 py-3 rounded-xl font-semibold text-lg inline-flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Start Free — No Credit Card Required
              </Link>
              <p className="text-text-muted text-sm mt-3">
                Already have an account?{' '}
                <Link href="/login" className="text-primary-400 hover:text-primary-300 underline underline-offset-2">
                  Log in
                </Link>
              </p>
            </div>
          </FadeIn>
        )}

        {/* FAQ Preview */}
        <FadeIn delay={0.5}>
          <div className="text-center">
            <div className="glass-card p-8 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-4">Questions about pricing?</h3>
              <p className="text-text-secondary mb-6">
                Start with Free. Upgrade anytime. Cancel anytime — no questions asked.
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-text-muted flex-wrap">
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
