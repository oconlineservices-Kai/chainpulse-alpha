import { Metadata } from 'next'
import { Mail, Clock, MessageCircle, HelpCircle } from 'lucide-react'
import FadeIn from '@/components/animations/FadeIn'

export const metadata: Metadata = {
  title: 'Contact Us | ChainPulse Alpha',
  description: 'Get in touch with ChainPulse Alpha. Email support, social media, or check our FAQ for quick answers.',
  openGraph: {
    title: 'Contact Us | ChainPulse Alpha',
    description: 'Contact ChainPulse Alpha support team.',
  },
}

export default function ContactPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'ChainPulse Alpha Contact',
    url: 'https://chainpulsealpha.com/contact',
    mainEntity: {
      '@type': 'Organization',
      name: 'ChainPulse Alpha',
      email: 'support@chainpulsealpha.com',
      url: 'https://chainpulsealpha.com',
      sameAs: [
        'https://twitter.com/chainpulsealpha',
        'https://github.com/chainpulsealpha',
      ],
    },
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
                  <MessageCircle className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-cyan-300">We&apos;re Here to Help</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Contact Us
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  Questions? Feedback? We&apos;d love to hear from you.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Email */}
              <FadeIn delay={0.1}>
                <div className="bg-[#12121a] rounded-2xl p-8 border border-slate-800 hover:border-indigo-500/50 transition-colors group">
                  <div className="w-14 h-14 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 transition-colors">
                    <Mail className="w-7 h-7 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Email Support</h3>
                  <p className="text-slate-400 mb-4">
                    For general inquiries and support requests
                  </p>
                  <a 
                    href="mailto:support@chainpulsealpha.com"
                    className="text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    support@chainpulsealpha.com
                  </a>
                  <div className="flex items-center gap-2 mt-4 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>Response: 24-48 hours</span>
                  </div>
                </div>
              </FadeIn>

              {/* Twitter */}
              <FadeIn delay={0.2}>
                <div className="bg-[#12121a] rounded-2xl p-8 border border-slate-800 hover:border-cyan-500/50 transition-colors group">
                  <div className="w-14 h-14 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors">
                    <svg className="w-7 h-7 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Twitter/X</h3>
                  <p className="text-slate-400 mb-4">
                    Follow us for updates and quick questions
                  </p>
                  <a 
                    href="https://twitter.com/chainpulsealpha"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    @chainpulsealpha
                  </a>
                  <div className="flex items-center gap-2 mt-4 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>Response: Same day</span>
                  </div>
                </div>
              </FadeIn>

              {/* GitHub */}
              <FadeIn delay={0.3}>
                <div className="bg-[#12121a] rounded-2xl p-8 border border-slate-800 hover:border-purple-500/50 transition-colors group">
                  <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                    <svg className="w-7 h-7 text-purple-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">GitHub</h3>
                  <p className="text-slate-400 mb-4">
                    For technical issues and feature requests
                  </p>
                  <a 
                    href="https://github.com/chainpulsealpha"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 font-medium"
                  >
                    github.com/chainpulsealpha
                  </a>
                  <div className="flex items-center gap-2 mt-4 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>Response: 2-3 days</span>
                  </div>
                </div>
              </FadeIn>

            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <FadeIn delay={0.4}>
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-300">Quick Answers</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-slate-400">
                  Common questions answered before you email
                </p>
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-2 gap-6">
              
              <FadeIn delay={0.5}>
                <div className="bg-[#12121a] rounded-2xl p-6 border border-slate-800">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    How do I reset my password?
                  </h3>
                  <p className="text-slate-400">
                    Go to the login page and click &quot;Forgot Password.&quot; We&apos;ll send a reset link to your email within minutes.
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={0.55}>
                <div className="bg-[#12121a] rounded-2xl p-6 border border-slate-800">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Can I cancel my subscription?
                  </h3>
                  <p className="text-slate-400">
                    Yes, you can cancel anytime from your account settings. You&apos;ll retain access until the end of your billing period.
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={0.6}>
                <div className="bg-[#12121a] rounded-2xl p-6 border border-slate-800">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    How accurate are the signals?
                  </h3>
                  <p className="text-slate-400">
                    Our Diamond Signals have an 85% accuracy rate for predicting 20%+ price movements within 48 hours. Past performance doesn&apos;t guarantee future results.
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={0.65}>
                <div className="bg-[#12121a] rounded-2xl p-6 border border-slate-800">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    What blockchains do you support?
                  </h3>
                  <p className="text-slate-400">
                    We currently monitor Ethereum, BSC, and Solana. More chains coming soon based on user demand.
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={0.7}>
                <div className="bg-[#12121a] rounded-2xl p-6 border border-slate-800">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Is there a free trial?
                  </h3>
                  <p className="text-slate-400">
                    Yes! Our free tier includes top 5 daily signals with a 15-minute delay. No credit card required.
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={0.75}>
                <div className="bg-[#12121a] rounded-2xl p-6 border border-slate-800">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    How do I upgrade to Premium?
                  </h3>
                  <p className="text-slate-400">
                    Go to your dashboard and click &quot;Upgrade&quot; in the sidebar. We accept credit cards and crypto payments.
                  </p>
                </div>
              </FadeIn>

            </div>

            {/* Still Need Help */}
            <FadeIn delay={0.8}>
              <div className="mt-12 text-center">
                <p className="text-slate-400 mb-4">
                  Still have questions?
                </p>
                <a 
                  href="mailto:support@chainpulsealpha.com"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all"
                >
                  <Mail className="w-5 h-5" />
                  Email Support Team
                </a>
              </div>
            </FadeIn>

          </div>
        </section>
      </main>
    </>
  )
}
