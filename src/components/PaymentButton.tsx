'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface PaymentButtonProps {
  /** USD amount (e.g. 49 for Premium) — used for display only; server does the conversion */
  amount: number
  /** Plan identifier sent to the backend */
  plan: string
  /** Button label */
  buttonText: string
  className?: string
}

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

export default function PaymentButton({
  amount,
  plan,
  buttonText,
  className = '',
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false)
  const { data: session, status } = useSession()

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

  const handlePayment = async () => {
    // Redirect to login if not authenticated
    if (status !== 'authenticated' || !session) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent('/pricing')}`
      return
    }

    setLoading(true)

    try {
      // Step 1: Create order — server converts USD → INR
      const orderRes = await fetch('/api/payment/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }), // amount is NOT sent — server uses plan name
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to create order')
      }

      // Step 2: Load Razorpay script if not already loaded
      const loaded = await loadRazorpayScript()
      if (!loaded) throw new Error('Failed to load payment gateway')

      // Step 3: Open Razorpay checkout
      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ChainPulse Alpha',
        description: plan === 'Pay Per Alpha' ? 'Signal Credits Purchase' : 'Premium Subscription',
        order_id: orderData.orderId,
        handler: async (response: RazorpayResponse) => {
          // Step 4: Verify payment
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })

          if (verifyRes.ok) {
            window.location.href = '/payment/success'
          } else {
            window.location.href = '/payment/failed'
          }
        },
        prefill: {
          email: session.user?.email ?? '',
          name: session.user?.name ?? '',
        },
        theme: { color: '#0ea5e9' },
        modal: {
          ondismiss: () => {
            setLoading(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      // Don't reset loading immediately — Razorpay modal is async; reset on dismiss or completion
      // The ondismiss handler above resets loading. Completion redirects away.
      // This finally runs only if an error occurs before the modal opens.
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <motion.button
        onClick={handlePayment}
        disabled={loading}
        className={`relative ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2 inline-block" />
            Processing...
          </>
        ) : (
          buttonText
        )}
      </motion.button>
    </div>
  )
}
