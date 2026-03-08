import Link from 'next/link'
import { ThresholdCompass } from '@/components/compass/ThresholdCompass'
import { HOMI_MESSAGING } from '@homi/shared'

export default function HomePage() {
  return (
    <div className="bg-[#0a1628]">
      {/* Hero Section */}
      <section className="min-h-[calc(100vh-80px)] flex items-center py-20 lg:py-32">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="order-2 lg:order-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8 animate-fade-in">
                <span className="w-2 h-2 bg-[#facc15] rounded-full animate-pulse shadow-[0_0_8px_#facc15]"></span>
                <span className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider">
                  {HOMI_MESSAGING.brand.tagline}
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.1] mb-6 animate-slide-up text-white">
                {HOMI_MESSAGING.hero.headline}
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-[#94a3b8] max-w-xl mb-8 animate-slide-up animation-delay-100">
                {HOMI_MESSAGING.hero.subhead}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-12 animate-slide-up animation-delay-200">
                <Link 
                  href="/register" 
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-[#22d3ee] text-[#0a1628] font-semibold text-lg hover:bg-[#06b6d4] transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/25"
                >
                  {HOMI_MESSAGING.hero.ctaPrimary}
                </Link>
                <Link 
                  href="/features" 
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-white/25 text-white font-semibold text-lg hover:bg-white/5 transition-all duration-300"
                >
                  {HOMI_MESSAGING.hero.ctaSecondary}
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 lg:gap-12 animate-slide-up animation-delay-300">
                <div className="flex flex-col">
                  <span className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-[#facc15] to-[#34d399] bg-clip-text text-transparent">73%</span>
                  <span className="text-sm text-[#64748b] uppercase tracking-wider mt-1">Receive &quot;NOT YET&quot;</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-[#facc15] to-[#34d399] bg-clip-text text-transparent">3</span>
                  <span className="text-sm text-[#64748b] uppercase tracking-wider mt-1">Dimensions</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-[#facc15] to-[#34d399] bg-clip-text text-transparent">42</span>
                  <span className="text-sm text-[#64748b] uppercase tracking-wider mt-1">Questions</span>
                </div>
              </div>
            </div>

            {/* Right Content - Compass */}
            <div className="order-1 lg:order-2 flex justify-center animate-fade-in animation-delay-400">
              <ThresholdCompass size={380} animated={true} showLabels={true} />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 lg:py-32 border-t border-[#1e293b]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-[1.875rem] font-bold mb-4 leading-tight">
              Traditional tools ask <span className="text-[#22d3ee]">&quot;Can you afford it?&quot;</span>
              <br />
              We ask <span className="text-[#34d399]">&quot;Will you be okay?&quot;</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Financial Reality Card */}
            <div className="group bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 border border-[#1e293b] rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:border-[#22d3ee] hover:shadow-xl hover:shadow-cyan-500/10">
              <div className="w-20 h-20 rounded-xl bg-[#22d3ee]/10 flex items-center justify-center text-3xl mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-[#22d3ee]">💰</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Financial Reality</h3>
              <p className="text-[#94a3b8] leading-relaxed">
                Beyond the numbers your bank sees. We analyze your complete financial picture including hidden costs and future obligations.
              </p>
            </div>

            {/* Emotional Truth Card */}
            <div className="group bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 border border-[#1e293b] rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:border-[#34d399] hover:shadow-xl hover:shadow-emerald-500/10">
              <div className="w-20 h-20 rounded-xl bg-[#34d399]/10 flex items-center justify-center text-3xl mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-[#34d399]">❤️</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Emotional Truth</h3>
              <p className="text-[#94a3b8] leading-relaxed">
                The dimension everyone ignores. Your psychological readiness, stress capacity, and values alignment matter just as much.
              </p>
            </div>

            {/* Perfect Timing Card */}
            <div className="group bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 border border-[#1e293b] rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:border-[#facc15] hover:shadow-xl hover:shadow-yellow-500/10">
              <div className="w-20 h-20 rounded-xl bg-[#facc15]/10 flex items-center justify-center text-3xl mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-[#facc15]">⏰</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Perfect Timing</h3>
              <p className="text-[#94a3b8] leading-relaxed">
                Because when matters as much as if. We assess market conditions, life trajectory, and opportunity windows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Three Dimensions Detail Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-[1.875rem] font-bold mb-4">
              {HOMI_MESSAGING.model.headline}
            </h2>
            <p className="text-lg text-[#94a3b8] max-w-3xl mx-auto">
              {HOMI_MESSAGING.model.body}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {HOMI_MESSAGING.model.dimensions.map((dimension) => (
              <div 
                key={dimension.key}
                className={`relative overflow-hidden rounded-2xl border border-[#1e293b] p-8 transition-all duration-300 hover:border-opacity-50 ${
                  dimension.color === 'cyan' ? 'hover:border-[#22d3ee]' :
                  dimension.color === 'emerald' ? 'hover:border-[#34d399]' :
                  'hover:border-[#facc15]'
                }`}
              >
                <div className={`absolute top-0 left-0 w-full h-1 ${
                  dimension.color === 'cyan' ? 'bg-[#22d3ee]' :
                  dimension.color === 'emerald' ? 'bg-[#34d399]' :
                  'bg-[#facc15]'
                }`} />
                
                <span className={`text-sm font-semibold ${
                  dimension.color === 'cyan' ? 'text-[#22d3ee]' :
                  dimension.color === 'emerald' ? 'text-[#34d399]' :
                  'text-[#facc15]'
                }`}>
                  {Math.round(dimension.weight * 100)}% Weight
                </span>
                
                <h3 className="text-2xl font-bold text-white mt-2 mb-4">{dimension.name}</h3>
                <p className="text-[#94a3b8] leading-relaxed">{dimension.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 lg:py-32 border-t border-[#1e293b]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#facc15]/20 to-[#34d399]/20 mb-8">
            <span className="text-4xl">🛡️</span>
          </div>
          
          <h2 className="text-3xl lg:text-[1.875rem] font-bold mb-6">
            {HOMI_MESSAGING.trust.headline}
          </h2>
          
          <p className="text-lg text-[#94a3b8] mb-8 max-w-2xl mx-auto">
            {HOMI_MESSAGING.trust.body}
          </p>
          
          <div className="inline-block px-6 py-3 rounded-full bg-white/5 border border-white/10">
            <span className="text-[#94a3b8] italic">&quot;{HOMI_MESSAGING.trust.line}&quot;</span>
          </div>
        </div>
      </section>

      {/* Insight Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-r from-[#facc15]/5 to-[#34d399]/5 border-y border-[#1e293b]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="mb-8">
            <span className="text-6xl lg:text-8xl font-black bg-gradient-to-r from-[#facc15] to-[#34d399] bg-clip-text text-transparent">
              73%
            </span>
            <p className="text-lg text-[#94a3b8] mt-4">of users receive NOT YET</p>
          </div>
          <p className="text-xl text-[#e2e8f0] leading-relaxed max-w-2xl mx-auto">
            That&apos;s not a bug — it&apos;s the feature that builds trust. We tell most people to wait because honesty is rarer than you think.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 border border-[#1e293b] p-12 lg:p-16 text-center">
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#22d3ee]/20 rounded-full blur-[128px] -z-10" />
            
            <h2 className="text-3xl lg:text-[1.875rem] font-bold mb-4">Stop guessing. Start knowing.</h2>
            <p className="text-lg text-[#94a3b8] mb-8">Join thousands who&apos;ve discovered their true readiness.</p>
            
            <Link 
              href="/register" 
              className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-[#22d3ee] text-[#0a1628] font-bold text-lg hover:bg-[#06b6d4] transition-all duration-300 hover:scale-105 shadow-xl shadow-cyan-500/25"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
