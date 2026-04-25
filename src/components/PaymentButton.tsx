'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface PaymentButtonProps {
  amount: number
  plan: string
  buttonText: string
  className?: string
}

// Window.Razorpay type is declared in BuySignalButton.tsx
// Avoid redeclaration conflict — use (window as any).Razorpay in this file

export default function PaymentButton({
  amount,
  plan,
  buttonText,
  className = ''
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false)
  const { data: session, status } = useSession()

  const handlePayment = async () => {
    // Redirect to login if not authenticated
    if (status !== 'authenticated' || !session) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent('/pricing')}`
      return
    }

    setLoading(true)

    try {
      // Create order
      const orderRes = await fetch('/api/payment/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, plan })
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to create order')
      }

      // Load Razorpay script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.body.appendChild(script)

      await new Promise((resolve) => {
        script.onload = resolve
      })

      // Initialize Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ChainPulse Alpha',
        description: `${plan} Plan Subscription`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          // Verify payment
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            })
          })

          if (verifyRes.ok) {
            window.location.href = '/payment/success'
          } else {
            window.location.href = '/payment/failed'
          }
        },
        prefill: {
          name: '',
          email: ''
        },
        theme: {
          color: '#0ea5e9'
        }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (error: any) {
      console.error('Payment error:', error)
      alert(error?.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.button
      onClick={handlePayment}
      disabled={loading}
      className={`relative ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Processing...
        </>
      ) : (
        buttonText
      )}
    </motion.button>
  )
}
