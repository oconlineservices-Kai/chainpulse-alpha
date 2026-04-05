export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            ChainPulse Alpha
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            AI-powered crypto alpha signals. Whale tracking, sentiment analysis, 
            and diamond-grade opportunities delivered to your dashboard.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition">
              Get Started
            </button>
            <button className="border border-slate-500 hover:border-slate-400 px-8 py-3 rounded-lg font-semibold transition">
              View Pricing
            </button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <FeatureCard 
            title="Whale Tracking"
            description="Monitor whale wallet movements and identify accumulation patterns before they pump."
          />
          <FeatureCard 
            title="Sentiment Analysis"
            description="AI-powered Twitter sentiment scoring to gauge market mood and predict trends."
          />
          <FeatureCard 
            title="Diamond Signals"
            description="High-confidence signals combining multiple data sources for maximum accuracy."
          />
        </div>
      </div>
    </main>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
      <h3 className="text-xl font-semibold mb-3 text-blue-400">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  )
}
