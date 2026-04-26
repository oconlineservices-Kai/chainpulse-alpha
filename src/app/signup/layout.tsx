import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up — ChainPulse Alpha | Start Catching Crypto Moves for Free',
  description: 'Create your free ChainPulse Alpha account. Get access to 5 daily crypto signals powered by whale tracking and AI sentiment analysis. No credit card required.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: 'https://chainpulsealpha.com/signup',
  },
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children
}
