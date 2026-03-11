import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Logo } from '@/components/brand/Logo'
import { Calculator, Heart, Clock, ArrowRight, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About | HōMI',
  description: 'HōMI evaluates your decision readiness across Financial Reality, Emotional Truth, and Perfect Timing. Learn about our mission and methodology.',
  openGraph: {
    title: 'About HōMI',
    description: 'HōMI evaluates your decision readiness across Financial Reality, Emotional Truth, and Perfect Timing.',
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface-0">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-0/80 backdrop-blur-lg border-b border-surface-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Logo size="md" />
            </Link>
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

      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

          {/* Mission */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-cyan/10 border border-brand-cyan/30 rounded-full text-brand-cyan text-sm mb-6">
              <span>Decision Readiness Intelligence™</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              We built HōMI because<br />
              <span className="text-brand-yellow">timing is everything.</span>
            </h1>
            <p className="text-lg text-text-2 max-w-2xl mx-auto">
              Most people don&apos;t regret <em>what</em> they bought. They regret <em>when</em> they bought it.
              HōMI exists to change that — by giving people the self-awareness and data to know if they&apos;re
              actually ready before they make life&apos;s biggest commitments.
            </p>
          </div>

          {/* The Problem */}
          <div className="mb-20">
            <Card variant="elevated" padding="lg">
              <h2 className="text-2xl font-bold mb-4">The Problem We&apos;re Solving</h2>
              <p className="text-text-2 mb-4">
                The average homebuyer spends 10 weeks searching for a home but fewer than 3 hours evaluating
                whether they are truly ready to buy one. Financial advisors focus on numbers. Real estate
                agents focus on inventory. Nobody focuses on <strong>you</strong> — your emotional readiness,
                your timing, your complete picture.
              </p>
              <p className="text-text-2 mb-4">
                The result: 73% of buyers experience significant post-purchase regret within 18 months.
                Not because they bought the wrong home — but because they weren&apos;t ready when they bought it.
              </p>
              <p className="text-text-2">
                HōMI gives you a READY or NOT YET verdict across three dimensions before you leap.
              </p>
            </Card>
          </div>

          {/* Three Dimensions */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-4">The Three-Dimension Model</h2>
            <p className="text-text-2 text-center mb-10 max-w-2xl mx-auto">
              Our assessment methodology evaluates decision readiness across three equally critical
              dimensions. All three must align for a READY verdict.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Card variant="glow" glowColor="#22d3ee" padding="lg" className="h-full">
                <div className="w-12 h-12 bg-brand-cyan/10 rounded-brand flex items-center justify-center mb-4">
                  <Calculator className="w-6 h-6 text-brand-cyan" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Financial Reality</h3>
                <p className="text-text-2 text-sm mb-4">
                  Can you actually afford this decision — not just the down payment, but the full picture?
                  We analyze your savings buffer, debt load, income stability, and long-term financial
                  resilience to stress-test your readiness.
                </p>
                <div className="text-brand-cyan font-medium text-sm">35% of overall score</div>
              </Card>
              <Card variant="glow" glowColor="#34d399" padding="lg" className="h-full">
                <div className="w-12 h-12 bg-brand-emerald/10 rounded-brand flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-brand-emerald" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Emotional Truth</h3>
                <p className="text-text-2 text-sm mb-4">
                  Are you making this decision for yourself, or for someone else&apos;s timeline? We explore
                  your motivations, fears, anxiety levels, and emotional alignment with this life change —
                  because your mindset shapes your outcome.
                </p>
                <div className="text-brand-emerald font-medium text-sm">35% of overall score</div>
              </Card>
              <Card variant="glow" glowColor="#facc15" padding="lg" className="h-full">
                <div className="w-12 h-12 bg-brand-yellow/10 rounded-brand flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-brand-yellow" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Perfect Timing</h3>
                <p className="text-text-2 text-sm mb-4">
                  Is this the right moment — not just personally, but in the context of market conditions,
                  life stage, and external factors? Timing can be the difference between a great decision
                  and a regrettable one.
                </p>
                <div className="text-brand-yellow font-medium text-sm">30% of overall score</div>
              </Card>
            </div>
          </div>

          {/* Company */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">About the Company</h2>
                <p className="text-text-2 mb-4">
                  HōMI is built by HOMI TECHNOLOGIES LLC, a team of engineers, behavioral economists,
                  and people who have personally experienced the cost of making a major decision before
                  they were truly ready.
                </p>
                <p className="text-text-2 mb-4">
                  We believe that decision readiness is a skill — and like any skill, it can be measured,
                  developed, and improved. Our platform gives you the honest assessment that your friends,
                  your realtor, and your gut feeling often can&apos;t provide.
                </p>
                <p className="text-text-2">
                  HōMI is not a financial advisor. We are a decision readiness tool. Always consult
                  licensed professionals for financial, legal, and tax decisions.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  'Built on behavioral science and decision psychology',
                  'Zero data selling — your profile is never shared',
                  '12-minute assessment, actionable in minutes',
                  'Retake anytime as your situation changes',
                  'Couples Mode for joint decision-making',
                  'Free to start, no credit card required',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-emerald flex-shrink-0 mt-0.5" />
                    <span className="text-text-2 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center py-12 border-t border-surface-3">
            <h2 className="text-2xl font-bold mb-4">Ready to know if you&apos;re ready?</h2>
            <p className="text-text-2 mb-8 max-w-md mx-auto">
              Start your free assessment and get your decision readiness verdict in 12 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button variant="primary" size="lg">
                  Start Free Assessment
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="lg">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-surface-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-3">
          <p>© {new Date().getFullYear()} HOMI TECHNOLOGIES LLC. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-text-1">Terms</Link>
            <Link href="/privacy" className="hover:text-text-1">Privacy</Link>
            <Link href="/disclaimer" className="hover:text-text-1">Disclaimer</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
