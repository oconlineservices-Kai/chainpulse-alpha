'use client'

import { useState } from 'react'
import { ShoppingCart, Zap, CreditCard, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface BuySignalButtonProps {
  signalId: string
  signalType: 'diamond' | 'whale' | 'default'
  onUnlocked?: () => void
  compact?: boolean
}

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

const PRICE_LABELS: Record<string, string> = {
  diamond: '$3.50',
  whale:   '$2.50',
  default: '$1.00',
}

const PRICE_DESCRIPTIONS: Record<string, string> = {
  diamond: '💎 Diamond Signal',
  whale:   '🐋 Whale Signal',
  default: '📊 Alpha Signal',
}

export default function BuySignalButton({
  signalId,
  signalType,
  onUnlocked,
  compact = false,
}: BuySignalButtonProps) {
  const { data: session, status: authStatus } = useSession()
  const [buyStatus, setBuyStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const userCredits = (session?.user as any)?.credits ?? 0
  const hasCredits = userCredits >= 1

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

  const handleBuy = async (e?: React.MouseEvent) => {
    if (!session) return

    setBuyStatus('loading')
    setErrorMsg(null)

    try {
      // Step 1: Create order
      const orderRes = await fetch('/api/payment/alpha-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signalId, signalType }),
      })
      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        if (orderData.alreadyOwned) {
          setBuyStatus('success')
          onUnlocked?.()
          return
        }
        throw new Error(orderData.error || 'Failed to create order')
      }

      // Step 2: If paid with credits, done
      if (orderData.method === 'credits') {
        setBuyStatus('success')
        onUnlocked?.()
        return
      }

      // Step 3: Load Razorpay and open payment modal
      const loaded = await loadRazorpayScript()
      if (!loaded) throw new Error('Failed to load payment gateway')

      const options: RazorpayOptions = {
        key:         orderData.keyId,
        amount:      orderData.amount,
        currency:    orderData.currency,
        name:        'ChainPulse Alpha',
        description: PRICE_DESCRIPTIONS[signalType] ?? 'Alpha Signal',
        order_id:    orderData.orderId,
        handler:     async (response: RazorpayResponse) => {
          try {
            // Step 4: Verify payment
            const verifyRes = await fetch('/api/payment/alpha-verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_signature:  response.razorpay_signature,
                signalId,
                transactionId:       orderData.transactionId,
              }),
            })
            const verifyData = await verifyRes.json()

            if (verifyData.success) {
              setBuyStatus('success')
              // Clear abandonment tracking on successful purchase
              try { localStorage.removeItem('abandoned_checkout') } catch {}
              onUnlocked?.()
            } else {
              throw new Error(verifyData.error || 'Verification failed')
            }
          } catch (err) {
            setBuyStatus('error')
            setErrorMsg('Payment failed to verify. Contact support if amount was deducted.')
          }
        },
        prefill: {
          email: session.user?.email ?? '',
          name:  session.user?.name ?? '',
        },
        theme: { color: '#6366f1' },
        modal: {
          ondismiss: () => {
            if (buyStatus === 'loading') {
              setBuyStatus('idle')
              // Track modal dismissal for analytics
              try {
                const events = JSON.parse(localStorage.getItem('payment_analytics') || '[]')
                events.push({ event: 'modal_dismissed', timestamp: Date.now(), signalId })
                localStorage.setItem('payment_analytics', JSON.stringify(events.slice(-20)))
              } catch {}
            }
          },
        },
      }

      // Track checkout initiation for abandonment recovery
      try {
        localStorage.setItem('abandoned_checkout', JSON.stringify({
          signalId,
          signalType,
          timestamp: Date.now(),
          amount: PRICE_LABELS[signalType] ?? '$1.00',
        }))
        localStorage.setItem('abandoned_checkout_dismissed', 'false')
      } catch { /* localStorage may be unavailable */ }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Purchase failed'
      setBuyStatus('error')
      setErrorMsg(message)
    }
  }

  // Session loading — show skeleton / disabled button
  if (authStatus === 'loading') {
    return (
      <span
        className={`inline-flex items-center gap-2 bg-background-card text-text-muted font-semibold rounded-lg animate-pulse ${
          compact ? 'text-xs px-3 py-1.5' : 'text-sm px-4 py-2'
        }`}
      >
        <Zap className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
        {compact ? '...' : 'Loading...'}
      </span>
    )
  }

  // Not logged in
  if (authStatus === 'unauthenticated') {
    return (
      <Link
        href={`/login?callbackUrl=/dashboard`}
        onClick={(e) => e.stopPropagation()}
        className={`inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors ${
          compact ? 'text-xs px-3 py-1.5' : 'text-sm px-4 py-2'
        }`}
      >
        <Zap className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
        {compact ? 'Login to Buy' : 'Login to Buy Signal'}
      </Link>
    )
  }

  if (buyStatus === 'success') {
    return (
      <span className={`inline-flex items-center gap-2 bg-success-500/20 text-success-400 font-semibold rounded-lg border border-success-500/30 ${
        compact ? 'text-xs px-3 py-1.5' : 'text-sm px-4 py-2'
      }`}>
        <CheckCircle className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
        Unlocked!
      </span>
    )
  }

  if (buyStatus === 'error') {
    return (
      <div className="flex flex-col gap-1">
        <span className={`inline-flex items-center gap-2 bg-danger-500/20 text-danger-400 font-semibold rounded-lg border border-danger-500/30 ${
          compact ? 'text-xs px-3 py-1.5' : 'text-sm px-4 py-2'
        }`}>
          <AlertCircle className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
          Failed
        </span>
        {errorMsg && <p className="text-xs text-danger-400">{errorMsg}</p>}
        <button onClick={() => { setBuyStatus('idle'); setErrorMsg(null) }} className="text-xs text-text-muted hover:text-text-secondary">
          Try again →
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={(e) => handleBuy(e)}
      disabled={buyStatus === 'loading'}
      className={`inline-flex items-center gap-2 font-semibold rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
        signalType === 'diamond'
          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white'
          : signalType === 'whale'
          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
          : 'bg-primary-500 hover:bg-primary-600 text-white'
      } ${compact ? 'text-xs px-3 py-1.5' : 'text-sm px-4 py-2'}`}
    >
      {buyStatus === 'loading' ? (
        <Loader2 className={`animate-spin ${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
      ) : hasCredits ? (
        <Zap className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
      ) : (
        <CreditCard className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
      )}
      {buyStatus === 'loading'
        ? 'Processing...'
        : hasCredits
        ? 'Unlock (1 credit)'
        : compact
        ? `Buy ${PRICE_LABELS[signalType] ?? '$1.00'}`
        : `Buy Signal ${PRICE_LABELS[signalType] ?? '$1.00'}`}
    </button>
  )
}
