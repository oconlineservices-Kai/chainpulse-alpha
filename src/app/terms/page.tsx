import { Metadata } from 'next'
import { FileText, Scale, AlertTriangle, Shield, Gavel, Mail } from 'lucide-react'
import FadeIn from '@/components/animations/FadeIn'

export const metadata: Metadata = {
  title: 'Terms of Service | ChainPulse Alpha',
  description: 'ChainPulse Alpha Terms of Service. Read our terms and conditions for using our crypto signal platform.',
  openGraph: {
    title: 'Terms of Service | ChainPulse Alpha',
    description: 'Terms and conditions for using ChainPulse Alpha.',
  },
}

export default function TermsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TermsOfService',
    name: 'ChainPulse Alpha Terms of Service',
    url: 'https://chainpulsealpha.com/terms',
    datePublished: '2024-01-01',
    dateModified: '2024-04-06',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <main className="min-h-screen bg-[#0a0a0f]">
        {/* Hero */}
        <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <FadeIn>
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
                  <Scale className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm text-indigo-300">Legal Terms</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Terms of Service
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  Last updated: April 6, 2024
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Content */}
        <section className="pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <FadeIn delay={0.1}>
              <div className="prose prose-invert prose-slate max-w-none">
                
                {/* Agreement */}
                <div className="bg-[#12121a] rounded-2xl p-8 mb-8 border border-slate-800">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-indigo-400" />
                    1. Agreement to Terms
                  </h2>
                  <p className="text-slate-400 leading-relaxed">
                    By accessing or using ChainPulse Alpha (&quot;Service&quot;), you agree to be bound by these Terms of Service. 
                    If you disagree with any part of these terms, you may not access the Service.
                  </p>
                </div>

                {/* Service Description */}
                <div className="bg-[#12121a] rounded-2xl p-8 mb-8 border border-slate-800">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-cyan-400" />
                    2. Service Description
                  </h2>
                  <p className="text-slate-400 leading-relaxed mb-4">
                    ChainPulse Alpha provides AI-powered cryptocurrency trading signals based on:
                  </p>
                  <ul className="space-y-2 text-slate-400">
                    <li>• Whale wallet tracking and analysis</li>
                    <li>• Social media sentiment analysis</li>
                    <li>• On-chain data aggregation</li>
                    <li>• Algorithmic signal generation</li>
                  </ul>
                </div>

                {/* No Financial Advice */}
                <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl p-8 mb-8 border border-red-500/20">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                    3. No Financial Advice Disclaimer
                  </h2>
                  <div className="text-slate-300 space-y-4">
                    <p className="font-semibold text-white">
                      IMPORTANT: ChainPulse Alpha does not provide financial advice.
                    </p>
                    <ul className="space-y-2 text-slate-400">
                      <li>• Signals are informational only, not investment recommendations</li>
                      <li>• Past performance does not guarantee future results</li>
                      <li>• Cryptocurrency trading carries significant risk</li>
                      <li>• You are solely responsible for your trading decisions</li>
                      <li>• We are not registered investment advisors</li>
                      <li>• Always do your own research (DYOR)</li>
                    </ul>
                  </div>
                </div>

                {/* User Accounts */}
                <div className="bg-[#12121a] rounded-2xl p-8 mb-8 border border-slate-800">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-purple-400" />
                    4. User Accounts
                  </h2>
                  <div className="space-y-4 text-slate-400">
                    <p>When you create an account with us, you must provide accurate and complete information.</p>
                    <p>You are responsible for:</p>
                    <ul className="space-y-2 ml-4">
                      <li>• Safeguarding your account password</li>
                      <li>• All activities under your account</li>
                      <li>• Notifying us of unauthorized access</li>
                      <li>• Maintaining accurate account information</li>
                    </ul>
                  </div>
                </div>

                {/* Acceptable Use */}
                <div className="bg-[#12121a] rounded-2xl p-8 mb-8 border border-slate-800">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <Gavel className="w-6 h-6 text-yellow-400" />
                    5. Acceptable Use
                  </h2>
                  <p className="text-slate-400 mb-4">You agree not to:</p>
                  <ul className="space-y-2 text-slate-400">
                    <li>• Use the Service for any illegal purpose</li>
                    <li>• Attempt to gain unauthorized access to our systems</li>
                    <li>• Interfere with other users&apos; access to the Service</li>
                    <li>• Resell or redistribute signals without authorization</li>
                    <li>• Use automated systems to scrape data</li>
                    <li>• Share account credentials with third parties</li>
                  </ul>
                </div>

                {/* Subscriptions */}
                <div className="bg-[#12121a] rounded-2xl p-8 mb-8 border border-slate-800">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <Scale className="w-6 h-6 text-green-400" />
                    6. Subscriptions and Payments
                  </h2>
                  <div className="space-y-4 text-slate-400">
                    <p>Some parts of the Service are billed on a subscription basis.</p>
                    <ul className="space-y-2">
                      <li>• You will be billed in advance on a recurring basis</li>
                      <li>• Subscriptions auto-renew unless cancelled</li>
                      <li>• Refunds are provided at our discretion</li>
                      <li>• Price changes will be notified 30 days in advance</li>
                    </ul>
                  </div>
                </div>

                {/* Limitation of Liability */}
                <div className="bg-[#12121a] rounded-2xl p-8 mb-8 border border-slate-800">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-orange-400" />
                    7. Limitation of Liability
                  </h2>
                  <div className="space-y-4 text-slate-400">
                    <p>To the maximum extent permitted by law:</p>
                    <ul className="space-y-2">
                      <li>• We are not liable for trading losses</li>
                      <li>• We are not liable for missed opportunities</li>
                      <li>• Service is provided &quot;as is&quot; without warranties</li>
                      <li>• Maximum liability is limited to amount paid in last 12 months</li>
                    </ul>
                  </div>
                </div>

                {/* Termination */}
                <div className="bg-[#12121a] rounded-2xl p-8 mb-8 border border-slate-800">
                  <h2 className="text-2xl font-bold text-white mb-4">8. Termination</h2>
                  <p className="text-slate-400 mb-4">
                    We may terminate or suspend your account immediately, without prior notice, for:
                  </p>
                  <ul className="space-y-2 text-slate-400">
                    <li>• Violation of these Terms</li>
                    <li>• Fraudulent or illegal activity</li>
                    <li>• Non-payment of fees</li>
                    <li>• Abuse of the Service</li>
                  </ul>
                </div>

                {/* Changes */}
                <div className="bg-[#12121a] rounded-2xl p-8 mb-8 border border-slate-800">
                  <h2 className="text-2xl font-bold text-white mb-4">9. Changes to Terms</h2>
                  <p className="text-slate-400">
                    We reserve the right to modify these terms at any time. We will notify users of significant 
                    changes via email or website notice. Continued use after changes constitutes acceptance.
                  </p>
                </div>

                {/* Governing Law */}
                <div className="bg-[#12121a] rounded-2xl p-8 mb-8 border border-slate-800">
                  <h2 className="text-2xl font-bold text-white mb-4">10. Governing Law</h2>
                  <p className="text-slate-400">
                    These Terms shall be governed by and construed in accordance with the laws of Delaware, 
                    United States, without regard to conflict of law provisions.
                  </p>
                </div>

                {/* Contact */}
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl p-8 border border-indigo-500/20">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <Mail className="w-6 h-6 text-indigo-400" />
                    Contact Information
                  </h2>
                  <p className="text-slate-400 mb-6">
                    Questions about these Terms? Contact us:
                  </p>
                  <div className="space-y-3">
                    <a 
                      href="mailto:legal@chainpulsealpha.com"
                      className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors"
                    >
                      <Mail className="w-5 h-5 text-indigo-400" />
                      legal@chainpulsealpha.com
                    </a>
                  </div>
                </div>

                {/* Key Takeaways */}
                <div className="mt-12 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl p-8 border border-indigo-500/10">
                  <h3 className="text-xl font-bold text-white mb-4">Key Takeaways</h3>
                  <ul className="space-y-3 text-slate-400">
                    <li className="flex items-start gap-3">
                      <span className="text-indigo-400 mt-1">✓</span>
                      <span>ChainPulse provides informational signals, not financial advice</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-indigo-400 mt-1">✓</span>
                      <span>You are responsible for your own trading decisions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-indigo-400 mt-1">✓</span>
                      <span>We are not liable for trading losses or missed opportunities</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-indigo-400 mt-1">✓</span>
                      <span>Cryptocurrency trading involves significant risk</span>
                    </li>
                  </ul>
                </div>

              </div>
            </FadeIn>
          </div>
        </section>
      </main>
    </>
  )
}
