import Link from 'next/link'

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Get started with basic readiness insights',
      features: [
        '1 comprehensive assessment',
        'Basic readiness score',
        '3-dimension breakdown',
        'Email summary'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Plus',
      price: '$9',
      period: '/month',
      description: 'For those serious about their decisions',
      features: [
        'Unlimited assessments',
        'Detailed reports',
        'Transformation paths',
        'AI Advisor (50 messages/mo)',
        'Priority support'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/month',
      description: 'Complete decision intelligence suite',
      features: [
        'Everything in Plus',
        'Unlimited AI Advisor',
        'PDF reports',
        'Couples Mode',
        'API access',
        'Dedicated support'
      ],
      cta: 'Start Free Trial',
      popular: false
    }
  ]

  return (
    <div className="bg-[#0a1628]">
      <section className="pt-32 pb-20">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">Simple pricing.</h1>
          <p className="text-lg text-[#94a3b8] max-w-2xl mx-auto">
            No hidden fees. No commissions. We only win when you make better decisions.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div 
                key={plan.name}
                className={`relative rounded-2xl p-8 ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-[#22d3ee]/10 to-[#34d399]/10 border-2 border-[#22d3ee]' 
                    : 'bg-[#0f172a] border border-[#1e293b]'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#22d3ee] text-[#0a1628] px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  {plan.period && <span className="text-[#94a3b8]">{plan.period}</span>}
                </div>
                <p className="text-[#94a3b8] mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-[#e2e8f0]">
                      <span className="text-[#34d399]">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center py-3 rounded-full font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-[#22d3ee] text-[#0a1628] hover:bg-[#06b6d4]'
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
