import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login — ChainPulse Alpha | Access Your Crypto Signal Dashboard',
  description: 'Sign in to your ChainPulse Alpha account to access real-time crypto signals, whale alerts, Diamond Signals, and your personalized trading dashboard.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: 'https://chainpulsealpha.com/login',
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
