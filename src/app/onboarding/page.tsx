'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Logo } from '@/components/brand/Logo'
import { Calculator, Heart, Clock, Home, Briefcase, TrendingUp, Rocket, ShoppingBag, ArrowRight, ChevronRight } from 'lucide-react'

const decisionTypes = [
  { id: 'home_buying', label: 'Home Buying', icon: Home, color: 'cyan', popular: true },
  { id: 'career_change', label: 'Career Change', icon: Briefcase, color: 'emerald', popular: false },
  { id: 'investment', label: 'Investment', icon: TrendingUp, color: 'yellow', popular: false },
  { id: 'business_launch', label: 'Business Launch', icon: Rocket, color: 'slate', comingSoon: true },
  { id: 'major_purchase', label: 'Major Purchase', icon: ShoppingBag, color: 'slate', comingSoon: true },
]

const dimensions = [
  {
    icon: Calculator,
    title: 'Financial Reality',
    color: 'cyan',
    weight: '35%',
    description: 'Can you actually afford this — not just the down payment, but the full picture?',
  },
  {
    icon: Heart,
    title: 'Emotional Truth',
    color: 'emerald',
    weight: '35%',
    description: 'Are you making this decision for yourself, or for someone else\'s timeline?',
  },
  {
    icon: Clock,
    title: 'Perfect Timing',
    color: 'yellow',
    weight: '30%',
    description: 'Is this the right moment — financially, emotionally, and practically?',
  },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function completeOnboarding() {
    setIsCompleting(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await (supabase as any)
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id)
      
      // Store selected decision type for pre-fill
      if (selectedDecision) {
        sessionStorage.setItem('selectedDecisionType', selectedDecision)
      }
      
      router.push('/assessments/new')
    }
  }

  function skipToDashboard() {
    completeOnboarding()
  }

  const screens = [
    // Screen 1: Welcome
    <div key="welcome" className="text-center max-w-md mx-auto">
      <div
        className="mb-8"
      >
        <Logo size="xl" />
      </div>
      
      <h1
        className="text-3xl font-bold mb-4"
      >
        Welcome to HōMI
      </h1>
      
      <p
        className="text-text-2 mb-8"
      >
        You&apos;re about to discover something most platforms will never tell you: 
        whether you&apos;re actually ready.
      </p>
      
      <p
        className="text-text-3 text-sm mb-8"
      >
        It takes 12 minutes. No judgment. Just truth.
      </p>
      
      <div
        className="space-y-3"
      >
        <Button variant="primary" fullWidth onClick={() => setStep(1)}>
          Let&apos;s Begin
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <button
          onClick={skipToDashboard}
          className="text-text-3 text-sm hover:text-text-2 transition-colors"
        >
          Skip to Dashboard
        </button>
      </div>
    </div>,

    // Screen 2: Decision Type Selection
    <div key="decision" className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-center mb-2">First, a little context.</h2>
      <p className="text-text-2 text-center mb-8">What decision are you evaluating?</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {decisionTypes.map((type, index) => {
          const Icon = type.icon
          const isSelected = selectedDecision === type.id
          const isDisabled = type.comingSoon
          
          return (
            <button
              key={type.id}
              onClick={() => !isDisabled && setSelectedDecision(type.id)}
              disabled={isDisabled}
              className={`
                relative p-4 rounded-brand border text-left transition-all
                ${isSelected 
                  ? 'border-brand-cyan bg-brand-cyan/10' 
                  : 'border-surface-3 bg-surface-1 hover:border-surface-4'
                }
                ${isDisabled && 'opacity-50 cursor-not-allowed'}
              `}
            >
              {type.popular && (
                <span className="absolute -top-2 left-4 px-2 py-0.5 bg-brand-cyan text-surface-0 text-xs font-medium rounded-full">
                  Most Popular
                </span>
              )}
              {type.comingSoon && (
                <span className="absolute -top-2 right-4 px-2 py-0.5 bg-surface-3 text-text-2 text-xs font-medium rounded-full">
                  Coming Soon
                </span>
              )}
              <Icon className={`w-6 h-6 mb-2 ${
                type.color === 'cyan' ? 'text-brand-cyan' :
                type.color === 'emerald' ? 'text-brand-emerald' :
                type.color === 'yellow' ? 'text-brand-yellow' :
                'text-text-3'
              }`} />
              <div className="font-medium">{type.label}</div>
            </button>
          )
        })}
      </div>
      
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(0)}
          className="text-text-3 hover:text-text-2 transition-colors"
        >
          Back
        </button>
        <Button
          variant="primary"
          onClick={() => setStep(2)}
          disabled={!selectedDecision}
        >
          Continue
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
      
      <button
        onClick={skipToDashboard}
        className="block w-full text-center text-text-3 text-sm hover:text-text-2 transition-colors mt-4"
      >
        Skip to Dashboard
      </button>
    </div>,

    // Screen 3: Three Dimensions
    <div key="dimensions" className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-2">HōMI measures readiness across three dimensions.</h2>
      
      <div className="space-y-4 my-8">
        {dimensions.map((dim, index) => {
          const Icon = dim.icon
          const borderColors: Record<string, string> = {
            cyan: 'border-l-brand-cyan',
            emerald: 'border-l-brand-emerald',
            yellow: 'border-l-brand-yellow',
          }
          
          return (
            <div
              key={dim.title}
            >
              <Card 
                variant="default" 
                padding="md" 
                className={`border-l-4 ${borderColors[dim.color]}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    w-10 h-10 rounded-brand flex items-center justify-center flex-shrink-0
                    ${dim.color === 'cyan' ? 'bg-brand-cyan/10' :
                      dim.color === 'emerald' ? 'bg-brand-emerald/10' :
                      'bg-brand-yellow/10'
                    }
                  `}>
                    <Icon className={`w-5 h-5 ${
                      dim.color === 'cyan' ? 'text-brand-cyan' :
                      dim.color === 'emerald' ? 'text-brand-emerald' :
                      'text-brand-yellow'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{dim.title}</h3>
                      <span className="text-xs text-text-3">({dim.weight})</span>
                    </div>
                    <p className="text-text-2 text-sm">{dim.description}</p>
                  </div>
                </div>
              </Card>
            </div>
          )
        })}
      </div>
      
      <p
        className="text-center text-text-2 text-sm mb-8"
      >
        All three must align for a READY verdict.
      </p>
      
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(1)}
          className="text-text-3 hover:text-text-2 transition-colors"
        >
          Back
        </button>
        <Button variant="primary" onClick={() => setStep(3)}>
          I Understand
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
      
      <button
        onClick={skipToDashboard}
        className="block w-full text-center text-text-3 text-sm hover:text-text-2 transition-colors mt-4"
      >
        Skip to Dashboard
      </button>
    </div>,

    // Screen 4: Ready to Assess
    <div key="ready" className="text-center max-w-md mx-auto">
      <div
        className="mb-8"
      >
        <div className="relative inline-block">
          <div className="w-48 h-48 mx-auto">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Empty compass rings */}
              <circle cx="100" cy="100" r="85" fill="none" stroke="#22d3ee" strokeWidth="12" opacity="0.15" />
              <circle cx="100" cy="100" r="65" fill="none" stroke="#34d399" strokeWidth="12" opacity="0.15" />
              <circle cx="100" cy="100" r="45" fill="none" stroke="#facc15" strokeWidth="12" opacity="0.15" />
            </svg>
          </div>
        </div>
      </div>
      
      <h2
        className="text-2xl font-bold mb-2"
      >
        Your readiness compass is empty.
      </h2>
      
      <p
        className="text-text-2 mb-8"
      >
        Let&apos;s fill it in.
      </p>
      
      <div
        className="space-y-3"
      >
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={completeOnboarding}
          loading={isCompleting}
          className="bg-gradient-to-r from-brand-cyan to-brand-emerald hover:opacity-90 animate-pulse-glow"
        >
          Take My First Assessment
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <Button variant="ghost" fullWidth onClick={skipToDashboard}>
          Explore Dashboard First
        </Button>
      </div>
    </div>,
  ]

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col items-center justify-center px-4 py-12">
      {/* Progress dots */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === step ? 'bg-brand-cyan' : 'bg-surface-3'
            }`}
          />
        ))}
      </div>

      {/* Screen content */}
      
        <div
          key={step}
          className="w-full"
        >
          {screens[step]}
        </div>
      
    </div>
  )
}
