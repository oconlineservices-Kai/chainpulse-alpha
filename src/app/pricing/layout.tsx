import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — ChainPulse Alpha | Start Free, Upgrade for Premium Signals',
  description: 'Simple, transparent pricing for crypto traders. Start free with 5 daily signals, or upgrade to Premium for real-time Diamond Signals, Telegram alerts, and full dashboard access.',
  alternates: {
    canonical: 'https://chainpulsealpha.com/pricing',
  },
  openGraph: {
    title: 'Pricing — ChainPulse Alpha | Start Free, Upgrade for Premium Signals',
    description: 'Free plan available. Premium at ₹4,099/mo for real-time Diamond Signals, Telegram alerts, and full whale intelligence dashboard.',
    url: 'https://chainpulsealpha.com/pricing',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
