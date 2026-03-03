'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Logo } from '@/components/brand/Logo'
import { ThresholdCompass } from '@/components/brand/ThresholdCompass'
import { 
  Calculator, 
  Heart, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Users,
  Sparkles,
  Shield
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-0">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-0/80 backdrop-blur-lg border-b border-surface-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="md" />
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-text-2 hover:text-text-1 transition-colors">Features</Link>
              <Link href="#how-it-works" className="text-text-2 hover:text-text-1 transition-colors">How It Works</Link>
              <Link href="#pricing" className="text-text-2 hover:text-text-1 transition-colors">Pricing</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-cyan/10 border border-brand-cyan/30 rounded-full text-brand-cyan text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Decision Readiness Intelligence™</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Most people don&apos;t regret{' '}
                <span className="text-brand-cyan">what</span> they bought.
                <br />
                They regret{' '}
                <span className="text-brand-yellow">when</span> they bought it.
              </h1>
              <p className="text-lg text-text-2 mb-8 max-w-xl">
                HōMI evaluates your decision readiness across three dimensions: 
                Financial Reality, Emotional Truth, and Perfect Timing. 
                Know if you&apos;re ready before you leap.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    Start Your Assessment
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    See How It Works
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-text-3">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-emerald" />
                  Free to start
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-emerald" />
                  12-minute assessment
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-emerald" />
                  No credit card required
                </span>
              </div>
            </div>
            <div
              className="flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-brand-cyan/20 blur-3xl rounded-full" />
                <ThresholdCompass
                  financial={75}
                  emotional={68}
                  timing={82}
                  verdict="ready"
                  size="lg"
                  interactive
                  showLabels
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 73% Insight */}
      <section className="py-20 bg-surface-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              The <span className="text-brand-yellow">73%</span> Insight
            </h2>
            <p className="text-lg text-text-2 mb-8">
              Our data shows that 73% of people who take our assessment receive a 
              &quot;NOT YET&quot; verdict. Not because they&apos;ll never be ready — but because 
              they&apos;re not ready <em>right now</em>.
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              <Card variant="elevated" padding="lg" className="text-center">
                <div className="text-4xl font-bold text-brand-cyan mb-2">73%</div>
                <p className="text-text-2">Receive NOT YET verdict</p>
              </Card>
              <Card variant="elevated" padding="lg" className="text-center">
                <div className="text-4xl font-bold text-brand-emerald mb-2">27%</div>
                <p className="text-text-2">Are READY to proceed</p>
              </Card>
              <Card variant="elevated" padding="lg" className="text-center">
                <div className="text-4xl font-bold text-brand-yellow mb-2">12min</div>
                <p className="text-text-2">Average assessment time</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Three Dimensions */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Three Dimensions of Readiness</h2>
            <p className="text-text-2 max-w-2xl mx-auto">
              HōMI evaluates your decision across three critical dimensions. 
              All three must align for a READY verdict.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div
            >
              <Card variant="glow" glowColor="#22d3ee" padding="lg" className="h-full">
                <div className="w-12 h-12 bg-brand-cyan/10 rounded-brand flex items-center justify-center mb-4">
                  <Calculator className="w-6 h-6 text-brand-cyan" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Financial Reality</h3>
                <p className="text-text-2 text-sm mb-4">
                  Can you actually afford this — not just the down payment, 
                  but the full picture? We analyze your savings, debt, income 
                  stability, and long-term financial health.
                </p>
                <div className="text-brand-cyan font-medium">35% of overall score</div>
              </Card>
            </div>
            <div
            >
              <Card variant="glow" glowColor="#34d399" padding="lg" className="h-full">
                <div className="w-12 h-12 bg-brand-emerald/10 rounded-brand flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-brand-emerald" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Emotional Truth</h3>
                <p className="text-text-2 text-sm mb-4">
                  Are you making this decision for yourself, or for someone 
                  else&apos;s timeline? We explore your motivations, fears, and 
                  emotional readiness for this life change.
                </p>
                <div className="text-brand-emerald font-medium">35% of overall score</div>
              </Card>
            </div>
            <div
            >
              <Card variant="glow" glowColor="#facc15" padding="lg" className="h-full">
                <div className="w-12 h-12 bg-brand-yellow/10 rounded-brand flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-brand-yellow" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Perfect Timing</h3>
                <p className="text-text-2 text-sm mb-4">
                  Is this the right moment — financially, emotionally, and 
                  practically? We assess market conditions, life stage, and 
                  external factors.
                </p>
                <div className="text-brand-yellow font-medium">30% of overall score</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-surface-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-text-2 max-w-2xl mx-auto">
              A simple 4-step process to discover your decision readiness
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Choose Your Decision',
                description: 'Select what you\'re evaluating: home buying, career change, investment, or major purchase.',
              },
              {
                step: '02',
                title: 'Answer 42 Questions',
                description: 'Spend 12 minutes answering questions across our three dimensions of readiness.',
              },
              {
                step: '03',
                title: 'Get Your Verdict',
                description: 'Receive your personalized READY or NOT YET verdict with detailed breakdown.',
              },
              {
                step: '04',
                title: 'Take Action',
                description: 'If READY, proceed with confidence. If NOT YET, follow your transformation path.',
              },
            ].map((item, index) => (
              <div
                key={item.step}
                className="relative"
              >
                <div className="text-6xl font-bold text-surface-3 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-text-2 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-text-2 max-w-2xl mx-auto">
              Everything you need to make confident decisions
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'AI-Powered Insights',
                description: 'Get personalized recommendations from our Trinity Engine with three perspectives.',
              },
              {
                icon: Users,
                title: 'Couples Mode',
                description: 'Compare readiness with your partner and get joint recommendations.',
              },
              {
                icon: Shield,
                title: 'Privacy First',
                description: 'Your data is encrypted and never sold. You control what you share.',
              },
              {
                icon: Calculator,
                title: 'Monte Carlo Simulation',
                description: 'Stress-test your decision against 10,000 possible futures.',
              },
              {
                icon: Clock,
                title: 'Transformation Paths',
                description: 'If NOT YET, get a guided path to become READY.',
              },
              {
                icon: CheckCircle,
                title: 'Reassess Anytime',
                description: 'Retake assessments as your situation changes.',
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
              >
                <Card variant="default" padding="lg" className="h-full">
                  <feature.icon className="w-6 h-6 text-brand-cyan mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-text-2 text-sm">{feature.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-surface-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-text-2 max-w-2xl mx-auto">
              Start free, upgrade when you&apos;re ready
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Free',
                price: '$0',
                description: 'Get started with basic assessments',
                features: ['3 assessments/month', '10 AI advisor messages/day', 'Basic reports'],
                cta: 'Get Started',
                variant: 'secondary' as const,
              },
              {
                name: 'Plus',
                price: '$9.99',
                period: '/month',
                description: 'For serious decision-makers',
                features: ['Unlimited assessments', '50 AI advisor messages/day', 'PDF reports', 'Full transformation paths'],
                cta: 'Start Free Trial',
                variant: 'secondary' as const,
              },
              {
                name: 'Pro',
                price: '$19.99',
                period: '/month',
                description: 'Complete decision intelligence',
                features: ['Everything in Plus', 'Unlimited AI advisor', 'Couples mode', 'Priority support'],
                cta: 'Start Free Trial',
                variant: 'primary' as const,
                highlighted: true,
              },
              {
                name: 'Family',
                price: '$29.99',
                period: '/month',
                description: 'For households',
                features: ['Everything in Pro', 'Up to 5 family members', 'Shared assessments', 'Family insights'],
                cta: 'Start Free Trial',
                variant: 'secondary' as const,
              },
            ].map((plan, index) => (
              <div
                key={plan.name}
              >
                <Card
                  variant={plan.highlighted ? 'glow' : 'elevated'}
                  glowColor="#22d3ee"
                  padding="lg"
                  className={cn(
                    'h-full flex flex-col',
                    plan.highlighted && 'border-brand-cyan/50'
                  )}
                >
                  {plan.highlighted && (
                    <div className="mb-4 px-3 py-1 bg-brand-cyan/10 border border-brand-cyan/30 rounded-full text-brand-cyan text-xs font-medium text-center">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                  <div className="flex items-baseline mb-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-text-3">{plan.period}</span>}
                  </div>
                  <p className="text-text-2 text-sm mb-4">{plan.description}</p>
                  <ul className="space-y-2 mb-6 flex-grow">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-brand-emerald flex-shrink-0 mt-0.5" />
                        <span className="text-text-2">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/signup">
                    <Button
                      variant={plan.variant}
                      fullWidth
                      size={plan.highlighted ? 'lg' : 'md'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: 'How long does the assessment take?',
                a: 'The full assessment takes about 12-15 minutes to complete. You can save your progress and return later if needed.',
              },
              {
                q: 'What does READY vs NOT YET mean?',
                a: 'READY means your scores across all three dimensions (Financial, Emotional, Timing) meet our thresholds for confident decision-making. NOT YET means one or more dimensions need attention before proceeding.',
              },
              {
                q: 'Is my data private?',
                a: 'Absolutely. Your data is encrypted, never sold to third parties, and you can delete it anytime. We use your responses only to generate your assessment.',
              },
              {
                q: 'Can I retake the assessment?',
                a: 'Yes! You can retake assessments as your situation changes. Many users reassess every 90 days to track their progress.',
              },
              {
                q: 'What if my partner and I get different results?',
                a: 'Our Couples Mode helps you understand alignment gaps and provides discussion prompts to get on the same page.',
              },
              {
                q: 'Is HōMI a financial advisor?',
                a: 'No. HōMI provides decision readiness assessments, not financial advice. Always consult licensed professionals for financial, legal, and tax advice.',
              },
            ].map((faq, index) => (
              <div
                key={index}
              >
                <Card variant="default" padding="md">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-text-2 text-sm">{faq.a}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-surface-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to know if you&apos;re ready?
            </h2>
            <p className="text-text-2 mb-8 max-w-xl mx-auto">
              Join thousands of people who have discovered their decision readiness with HōMI.
            </p>
            <Link href="/auth/signup">
              <Button variant="primary" size="lg">
                Start Your Free Assessment
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-surface-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo size="sm" className="mb-4" />
              <p className="text-text-3 text-sm">
                Decision Readiness Intelligence™
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-text-2">
                <li><Link href="#features" className="hover:text-text-1">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-text-1">Pricing</Link></li>
                <li><Link href="#how-it-works" className="hover:text-text-1">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-text-2">
                <li><Link href="/about" className="hover:text-text-1">About</Link></li>
                <li><a href="https://x.com/homi_tech" target="_blank" rel="noopener noreferrer" className="hover:text-text-1">Twitter</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-text-2">
                <li><Link href="/terms" className="hover:text-text-1">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-text-1">Privacy Policy</Link></li>
                <li><Link href="/disclaimer" className="hover:text-text-1">Disclaimer</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-surface-3 text-center text-sm text-text-3">
            <p>© {new Date().getFullYear()} HOMI TECHNOLOGIES LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Helper function for className merging
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
