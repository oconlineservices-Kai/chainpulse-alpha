import { Metadata } from 'next'
import { MessageCircle, HelpCircle, Send } from 'lucide-react'
import FadeIn from '@/components/animations/FadeIn'

export const metadata: Metadata = {
  title: 'Contact Us | ChainPulse Alpha',
  description: 'Get in touch with ChainPulse Alpha. Check our FAQ or send us a message.',
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
      url: 'https://chainpulsealpha.com',
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
                  Check our FAQ or send us a message directly.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Message Form */}
        <section className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <FadeIn delay={0.1}>
              <div className="bg-[#12121a] rounded-2xl p-8 border border-slate-800">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Send Us a Message</h2>
                  <p className="text-slate-400">
                    Have a question or feedback? We&apos;ll get back to you within 24 hours.
                  </p>
                </div>
                
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="How can we help?"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      placeholder="Tell us what you need help with..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Send Message
                  </button>
                  
                  <p className="text-center text-sm text-slate-500 mt-4">
                    We&apos;ll respond within 24 hours. For urgent matters, check our FAQ below.
                  </p>
                </form>
              </div>
            </FadeIn>
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
                  Still have questions? Use the form above to reach us directly.
                </p>
              </div>
            </FadeIn>

          </div>
        </section>
      </main>
    </>
  )
}
