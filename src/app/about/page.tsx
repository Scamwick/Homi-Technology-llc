import { HOMI_MESSAGING } from '@homi/shared'

export default function AboutPage() {
  return (
    <div className="bg-[#0a1628]">
      <section className="pt-32 pb-20">
        <div className="max-w-[800px] mx-auto px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-8">Our Story</h1>
          
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-[#94a3b8] text-xl leading-relaxed mb-6">
              {HOMI_MESSAGING.problem.body}
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-12 mb-4">The Missing Piece</h2>
            <p className="text-[#94a3b8] leading-relaxed mb-6">
              {HOMI_MESSAGING.missingPiece.body}
            </p>
            
            <ul className="space-y-3 my-8">
              {HOMI_MESSAGING.missingPiece.examples.map((example, i) => (
                <li key={i} className="flex items-start gap-3 text-[#e2e8f0]">
                  <span className="text-[#facc15] mt-1">→</span>
                  <em>&quot;{example}&quot;</em>
                </li>
              ))}
            </ul>
            
            <h2 className="text-2xl font-bold text-white mt-12 mb-4">What HōMI Is</h2>
            <p className="text-[#94a3b8] leading-relaxed mb-6">
              {HOMI_MESSAGING.whatHomiIs.body}
            </p>
            
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 my-8">
              <h3 className="text-lg font-semibold text-white mb-4">Our Principles</h3>
              <ul className="space-y-3">
                {HOMI_MESSAGING.whatHomiIs.principles.map((principle, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#e2e8f0]">
                    <span className="w-2 h-2 rounded-full bg-[#22d3ee]"></span>
                    {principle}
                  </li>
                ))}
              </ul>
            </div>
            
            <h2 className="text-2xl font-bold text-white mt-12 mb-4">Trust Over Transaction</h2>
            <p className="text-[#94a3b8] leading-relaxed">
              {HOMI_MESSAGING.trust.body}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
