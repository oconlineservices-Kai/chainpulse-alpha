'use client'

import { useState } from 'react'
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

  const loadRazorpayScript = (retries = 2): Promise<boolean> => {
    return new Promise((resolve) => {
      // Immediate guard — if already loaded, resolve instantly
      if (window.Razorpay) return resolve(true)

      // Check for existing script tag to avoid duplicates
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        // Script tag exists but Razorpay isn't on window yet — wait for it
        let elapsed = 0
        const poll = setInterval(() => {
          elapsed += 200
          if (window.Razorpay) {
            clearInterval(poll)
            resolve(true)
          } else if (elapsed >= 5000) {
            clearInterval(poll)
            console.warn('[PaymentButton] Existing script but Razorpay never initialized')
            resolve(false)
          }
        }, 200)
        return
      }

      const attempt = () => {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true

        // Detect CSP violations that might block Razorpay
        if (!document.querySelector('meta[name="csp-check-razorpay"]')) {
          const cspMeta = document.createElement('meta')
          cspMeta.name = 'csp-check-razorpay'
          cspMeta.content = '1'
          document.head.appendChild(cspMeta)
          // Check if frame-src allows razorpay domains
          try {
            const testFrame = document.createElement('iframe')
            testFrame.src = 'https://api.razorpay.com/ping'
            testFrame.style.display = 'none'
            testFrame.onerror = () => {
              console.warn('[CSP] Razorpay iframe blocked by CSP. Check frame-src directive.')
            }
            // Timeout — iframe loads successfully, CSP allows it
            setTimeout(() => testFrame.remove(), 2000)
            document.body.appendChild(testFrame)
          } catch { /* CSP error doesn't throw, onerror handles it */ }
        }

        script.onload = () => {
          // Script loaded but Razorpay may not be on window yet.
          // Poll up to 5 seconds for it to initialize.
          let elapsed = 0
          const poll = setInterval(() => {
            elapsed += 200
            if (window.Razorpay) {
              clearInterval(poll)
              resolve(true)
            } else if (elapsed >= 5000) {
              clearInterval(poll)
              console.warn('[PaymentButton] Razorpay script loaded but Razorpay not on window after 5s')
              resolve(false)
            }
          }, 200)
        }

        script.onerror = () => {
          if (retries > 0) {
            console.warn(`[PaymentButton] Razorpay script load failed, retrying (${retries} left)...`)
            script.remove()
            setTimeout(() => attempt(), 1500)
          } else {
            resolve(false)
          }
        }

        document.body.appendChild(script)
      }

      attempt()
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
        console.error('[PaymentButton] Order creation failed:', JSON.stringify(orderData, null, 2))
        throw new Error(orderData.error || `Server error: ${orderRes.status}`)
      }

      // Validate required response fields before proceeding
      if (!orderData.keyId || !orderData.orderId || !orderData.amount || !orderData.currency) {
        console.error('[PaymentButton] Invalid order response:', orderData)
        throw new Error('Payment gateway returned invalid order data')
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
            const verifyErr = await verifyRes.json().catch(() => ({ error: 'Unknown verification error' }))
            console.error('[PaymentButton] Payment verification failed:', JSON.stringify(verifyErr, null, 2))
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
            console.log('[PaymentButton] Razorpay modal dismissed by user')
            setLoading(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      try {
        rzp.open()
      } catch (openError) {
        console.error('[PaymentButton] Razorpay open() threw:', openError)
        // If open() throws, it may be CSP blocking the modal creation
        throw new Error('Payment gateway blocked by browser security settings. Check CSP frame-src.')
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error'
      console.error('[PaymentButton] Payment error:', errMsg)
      
      // Tell the user exactly what went wrong
      const displayMessages: Record<string, string> = {
        'Failed to load payment gateway': 'Could not load payment gateway. Ensure your browser allows popups from this site and no ad blocker is blocking checkout.razorpay.com.',
        'Failed to create order': 'Could not create payment order. Please try again.',
        'Invalid order data': 'Payment system returned invalid data. Please contact support.',
      }
      const friendlyMsg = Object.entries(displayMessages).find(([key]) => 
        errMsg.includes(key)
      )?.[1] || 'Payment failed. Please try again.'
      
      alert(friendlyMsg)
    } finally {
      // Don't reset loading immediately — Razorpay modal is async; reset on dismiss or completion
      // The ondismiss handler above resets loading. Completion redirects away.
      // This finally runs only if an error occurs before the modal opens.
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <button
        onClick={handlePayment}
        disabled={loading}
        className={`relative ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2 inline-block" />
            Processing...
          </>
        ) : (
          buttonText
        )}
      </button>
    </div>
  )
}
