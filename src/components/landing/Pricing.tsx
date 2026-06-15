'use client'

import { useState } from 'react'
import { CheckCircle2, Zap, Crown, Sparkles, Lock, Unlock, Loader2, AlertCircle, Check } from 'lucide-react'
import PaymentButton from '../PaymentButton'
import FadeIn, { FadeInStagger } from '../animations/FadeIn'
import { HoverScale } from '../animations/ScaleIn'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

// Credit pack definitions
const CREDIT_PACKS = [
  { id: 'starter' as const, credits: 5,  amount: 499, disp: '\$5',    label: 'Starter',  icon: Sparkles },
  { id: 'value' as const,   credits: 10, amount: 899, disp: '\$9',    label: 'Value',    icon: Zap },
  { id: 'pro' as const,     credits: 25, amount: 1399, disp: '\$14',   label: 'Pro',      icon: Crown },
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

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '',
    description: 'Perfect for getting started',
    icon: Unlock,
    color: 'from-success-500 to-emerald-500',
    features: [
      'First 3 daily signals',
      '15-minute delay',
      'Basic sentiment scores',
      'Web dashboard access',
      'Early access pricing',
    ],
    limitations: [
      'Limited historical data',
      'No push alerts',
    ],
    cta: 'Get Started',
    popular: false,
    comingSoon: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$49',
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
    comingSoon: false,
  },
  {
    id: 'payper',
    name: 'Pay-Per-Alpha',
    price: '\$1',
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
    comingSoon: false,
  },
]

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const { data: session, status, update: refreshSession } = useSession()
  const isLoggedIn = status === 'authenticated'

  // Credit purchase state
  const [creditLoading, setCreditLoading] = useState<string | null>(null)
  const [creditError, setCreditError] = useState<string | null>(null)
  const [creditSuccess, setCreditSuccess] = useState<string | null>(null)

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
    <section id="pricing" className="py-24 bg-background-muted/30 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning-500/20 text-warning-400 text-sm mb-6">
              <Zap className="w-4 h-4" />
              <span>Simple, transparent pricing</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Start free,{' '}
              <span className="gradient-text">scale when ready</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto mb-8">
              Choose the plan that fits your trading style.
            </p>

            {/* Billing Toggle */}
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

        {/* Pricing Cards */}
        <FadeInStagger stagger={0.1} className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan) => (
            <HoverScale>
              <div
                className={cn(
                  'relative p-8 rounded-2xl border transition-all duration-300',
                  plan.popular
                    ? 'glass-card border-primary-500/50 hover:border-primary-500'
                    : 'glass-card hover:border-primary-500/30',
                )}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold"
                  >
                    Most Popular
                  </div>
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
                        ? '$39'
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
                      $468/year (save $120)
                    </div>
                  )}

                  <p className="text-text-muted text-sm">{plan.description}</p>
                </div>

                {/* Features */}
                <div className="mb-8">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li className="flex items-center gap-3">
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
                          <li className="flex items-center gap-3">
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
                    amount={billingPeriod === 'yearly' ? 39 : 49}
                    plan={billingPeriod === 'yearly' ? 'Premium Yearly' : 'Premium Monthly'}
                    buttonText={plan.cta}
                    className={cn(
                      'w-full py-3 rounded-xl font-semibold transition-all button-primary flex items-center justify-center',
                    )}
                  />
                ) : plan.id === 'payper' ? (
                  <div className="space-y-3">
                    {/* Credit pack selection */}
                    <div className="grid grid-cols-3 gap-2">
                      {CREDIT_PACKS.map((pack) => {
                        const isLoading = creditLoading === pack.id
                        const Icon = pack.icon
                        return (
                          <button
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
                      <div
                        className="flex items-center gap-2 justify-center text-success-400 text-sm bg-success-500/10 rounded-lg px-3 py-2 border border-success-500/20"
                      >
                        <Check className="w-4 h-4" />
                        {creditSuccess}
                      </div>
                    )}

                    {/* Error message */}
                    {creditError && (
                      <div
                        className="flex items-center gap-2 justify-center text-danger-400 text-xs bg-danger-500/10 rounded-lg px-3 py-2 border border-danger-500/20"
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{creditError}</span>
                      </div>
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
                ) : (
                  <a
                    href="/signup"
                    className={cn(
                      'w-full py-3 rounded-xl font-semibold transition-all block text-center',
                      plan.popular ? 'button-primary' : 'button-secondary',
                    )}
                  >
                    {plan.cta}
                  </a>
                )}

                {/* Background Effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-[0.01] rounded-2xl`}
                />
              </div>
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
    </section>
  )
}
