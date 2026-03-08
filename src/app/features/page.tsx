import Link from 'next/link'
import { ThresholdCompass } from '@/components/compass/ThresholdCompass'
import { HOMI_MESSAGING } from '@homi/shared'

export default function FeaturesPage() {
  const features = [
    {
      icon: '🎯',
      title: 'Three-Dimension Assessment',
      description: `We measure ${HOMI_MESSAGING.model.dimensions.map((d) => `${d.name} (${Math.round(d.weight * 100)}%)`).join(', ')} — not just your credit score.`
    },
    {
      icon: '🤖',
      title: 'Trinity Engine',
      description: 'Three AI perspectives — Advocate, Skeptic, and Arbiter — debate your readiness to give you balanced insights.'
    },
    {
      icon: '⏮️',
      title: 'Temporal Twin',
      description: 'See what your future self might say. Visualize long-term implications of your decision.'
    },
    {
      icon: '📊',
      title: 'Transformation Paths',
      description: 'If you\'re not ready, get a personalized 12-month roadmap to improve your readiness score.'
    },
    {
      icon: '💑',
      title: 'Couples Mode',
      description: 'Take the assessment together. See where you align and where you diverge on your biggest decision.'
    },
    {
      icon: '🔒',
      title: 'Zero Conflict of Interest',
      description: 'We profit when you\'re ready, not when you transact. No commissions. No referral fees.'
    }
  ]

  return (
    <div className="bg-[#0a1628]">
      {/* Hero */}
      <section className="pt-32 pb-20">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">Built different.</h1>
          <p className="text-lg text-[#94a3b8] max-w-2xl mx-auto">
            HōMI measures what traditional tools ignore. Here&apos;s how we&apos;re different.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:border-[#22d3ee]/50 hover:shadow-xl hover:shadow-cyan-500/10"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-[#94a3b8] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dimensions Showcase */}
      <section className="py-24 bg-[#0f172a] border-y border-[#1e293b]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex justify-center">
              <ThresholdCompass size={300} animated={true} showLabels={true} />
            </div>
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-8">The Three Dimensions</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <span className="w-4 h-4 rounded-full bg-[#22d3ee] mt-1.5 flex-shrink-0 shadow-[0_0_8px_#22d3ee]"></span>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Financial Reality (35%)</h4>
                    <p className="text-[#94a3b8]">Income stability, savings, debt, credit score, emergency funds</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="w-4 h-4 rounded-full bg-[#34d399] mt-1.5 flex-shrink-0 shadow-[0_0_8px_#34d399]"></span>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Emotional Truth (35%)</h4>
                    <p className="text-[#94a3b8]">Motivation, stress levels, partner alignment, support system</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="w-4 h-4 rounded-full bg-[#facc15] mt-1.5 flex-shrink-0 shadow-[0_0_8px_#facc15]"></span>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Perfect Timing (30%)</h4>
                    <p className="text-[#94a3b8]">Market conditions, career trajectory, life stage, location stability</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to discover your readiness?</h2>
          <p className="text-[#94a3b8] mb-8">Take our comprehensive assessment. 42 questions. 12 minutes. One honest answer.</p>
          <Link 
            href="/register" 
            className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-[#22d3ee] text-[#0a1628] font-bold text-lg hover:bg-[#06b6d4] transition-all duration-300 hover:scale-105"
          >
            Start Free Assessment
          </Link>
        </div>
      </section>
    </div>
  )
}
