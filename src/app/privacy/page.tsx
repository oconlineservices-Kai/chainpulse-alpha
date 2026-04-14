import { Metadata } from 'next'
import { Shield, Lock, Eye, Database, UserCheck, Globe } from 'lucide-react'
import FadeIn from '@/components/animations/FadeIn'

export const metadata: Metadata = {
  title: 'Privacy Policy | ChainPulse Alpha',
  description: 'ChainPulse Alpha privacy policy. Learn how we collect, use, and protect your data. GDPR and CCPA compliant.',
  openGraph: {
    title: 'Privacy Policy | ChainPulse Alpha',
    description: 'Learn how ChainPulse Alpha protects your data and privacy.',
  },
}

export default function PrivacyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'PrivacyPolicy',
    name: 'ChainPulse Alpha Privacy Policy',
    url: 'https://chainpulsealpha.com/privacy',
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-300">Your Privacy Matters</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Privacy Policy
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
                
                {/* Overview */}
                <div className="bg-[#12121a] rounded-2xl p-8 mb-8 border border-slate-800">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <Eye className="w-6 h-6 text-indigo-400" />
                    Overview
                  </h2>
                  <p className="text-slate-400 leading-relaxed">
                    ChainPulse Alpha (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. 
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                    when you use our crypto signal platform.
                  </p>
                </div>

                {/* Data We Collect */}
                <div className="bg-[#12121a] rounded-2xl p-8 mb-8 border border-slate-800">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Database className="w-6 h-6 text-cyan-400" />
                    What Data Do We Collect?
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Account Information</h3>
                      <ul className="space-y-2 text-slate-400">
                        <li>• Email address</li>
                        <li>• Username</li>
                        <li>• Password (encrypted)</li>
                        <li>• Profile preferences</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Usage Data</h3>
                      <ul className="space-y-2 text-slate-400">
                        <li>• Signal views and interactions</li>
                        <li>• Dashboard preferences</li>
                        <li>• Device and browser info</li>
                        <li>• IP address (anonymized)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* How We Use Data */}
                <div className="bg-[#12121a] rounded-2xl p-8 mb-8 border border-slate-800">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <Lock className="w-6 h-6 text-purple-400" />
                    How We Use Your Data
                  </h2>
                  <ul className="space-y-3 text-slate-400">
                    <li className="flex items-start gap-3">
                      <span className="text-indigo-400 mt-1">→</span>
                      <span>Provide and improve our crypto signal services</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-indigo-400 mt-1">→</span>
                      <span>Send signal alerts and notifications you request</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-indigo-400 mt-1">→</span>
                      <span>Personalize your dashboard experience</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-indigo-400 mt-1">→</span>
                      <span>Process payments and manage subscriptions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-indigo-400 mt-1">→</span>
                      <span>Comply with legal obligations</span>
                    </li>
                  </ul>
                </div>

                {/* Security */}
                <div className="bg-[#12121a] rounded-2xl p-8 mb-8 border border-slate-800">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-green-400" />
                    Data Security
                  </h2>
                  <p className="text-slate-400 leading-relaxed mb-4">
                    We implement industry-standard security measures:
                  </p>
                  <ul className="space-y-2 text-slate-400">
                    <li>• 256-bit AES encryption for data at rest</li>
                    <li>• TLS 1.3 for data in transit</li>
                    <li>• Regular security audits</li>
                    <li>• SOC 2 Type II compliant infrastructure</li>
                    <li>• No storage of private keys or wallet access</li>
                  </ul>
                </div>

                {/* Your Rights */}
                <div className="bg-[#12121a] rounded-2xl p-8 mb-8 border border-slate-800">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <UserCheck className="w-6 h-6 text-yellow-400" />
                    Your Rights
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">GDPR (EU Users)</h3>
                      <ul className="space-y-2 text-slate-400">
                        <li>• Right to access your data</li>
                        <li>• Right to rectification</li>
                        <li>• Right to erasure (&quot;Right to be forgotten&quot;)</li>
                        <li>• Right to data portability</li>
                        <li>• Right to object to processing</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">CCPA (California Users)</h3>
                      <ul className="space-y-2 text-slate-400">
                        <li>• Right to know what data we collect</li>
                        <li>• Right to delete personal information</li>
                        <li>• Right to opt-out of data sales</li>
                        <li>• Right to non-discrimination</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Third Party */}
                <div className="bg-[#12121a] rounded-2xl p-8 mb-8 border border-slate-800">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <Globe className="w-6 h-6 text-blue-400" />
                    Third-Party Services
                  </h2>
                  <p className="text-slate-400 leading-relaxed mb-4">
                    We use trusted third-party services:
                  </p>
                  <ul className="space-y-2 text-slate-400">
                    <li>• <strong className="text-white">Neon:</strong> Database hosting (PostgreSQL)</li>
                    <li>• <strong className="text-white">Vercel:</strong> Application hosting</li>
                    <li>• <strong className="text-white">Stripe/Razorpay:</strong> Payment processing</li>
                    <li>• <strong className="text-white">Postmark:</strong> Email delivery</li>
                  </ul>
                </div>

                {/* FAQ */}
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl p-8 border border-indigo-500/20">
                  <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Does ChainPulse store my wallet private keys?</h3>
                      <p className="text-slate-400">No. We never request or store private keys, seed phrases, or wallet access credentials. We only track public wallet addresses for whale monitoring.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">How can I delete my account and data?</h3>
                      <p className="text-slate-400">Email support@chainpulsealpha.com with subject &quot;Delete Account&quot; and we&apos;ll process your request within 30 days per GDPR requirements.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Do you sell my data to third parties?</h3>
                      <p className="text-slate-400">No. We do not sell, rent, or trade your personal information. We only share data with service providers necessary to operate our platform.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Where is my data stored?</h3>
                      <p className="text-slate-400">Data is stored on secure servers in the United States (AWS US-East). We use encryption and access controls to protect your information.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">How do I exercise my GDPR rights?</h3>
                      <p className="text-slate-400">Email privacy@chainpulsealpha.com with your request. We&apos;ll respond within 30 days and may need to verify your identity.</p>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="mt-12 text-center">
                  <h2 className="text-2xl font-bold text-white mb-4">Questions About Privacy?</h2>
                  <p className="text-slate-400 mb-6">
                    Contact our Data Protection Officer
                  </p>
                  <a 
                    href="mailto:privacy@chainpulsealpha.com"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
                  >
                    privacy@chainpulsealpha.com
                  </a>
                </div>

              </div>
            </FadeIn>
          </div>
        </section>
      </main>
    </>
  )
}
