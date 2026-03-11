'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { TIER_LIMITS, TIER_LABELS } from '@/types/payments'
import { Check, X, Loader2, CreditCard, ExternalLink } from 'lucide-react'

const tiers = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Get started with basic assessments',
    features: [
      { text: '3 assessments per month', included: true },
      { text: '10 AI advisor messages/day', included: true },
      { text: 'Basic reports', included: true },
      { text: 'Couples mode', included: false },
      { text: 'PDF reports', included: false },
      { text: 'Transformation paths', included: false },
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 9.99,
    description: 'For serious decision-makers',
    features: [
      { text: 'Unlimited assessments', included: true },
      { text: '50 AI advisor messages/day', included: true },
      { text: 'Basic reports', included: true },
      { text: 'PDF reports', included: true },
      { text: 'Full transformation paths', included: true },
      { text: 'Couples mode', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    description: 'Complete decision intelligence',
    popular: true,
    features: [
      { text: 'Everything in Plus', included: true },
      { text: 'Unlimited AI advisor', included: true },
      { text: 'Couples mode', included: true },
      { text: 'Priority support', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'API access', included: true },
    ],
  },
  {
    id: 'family',
    name: 'Family',
    price: 29.99,
    description: 'For households',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Up to 5 family members', included: true },
      { text: 'Shared assessments', included: true },
      { text: 'Family insights', included: true },
      { text: 'Household dashboard', included: true },
      { text: 'Member management', included: true },
    ],
  },
]

export default function BillingPage() {
  const [currentTier, setCurrentTier] = useState<string>('free')
  const [isLoading, setIsLoading] = useState(true)
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null)
  const [usage, setUsage] = useState({
    assessmentsThisMonth: 0,
    aiMessagesToday: 0,
  })
  const searchParams = useSearchParams()
  const supabase = createClient()

  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Fetch profile
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single()

        if (profile) {
          setCurrentTier((profile as any).subscription_tier)
        }

        // Fetch usage
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { count: assessmentCount } = await supabase
          .from('assessments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth.toISOString())

        setUsage({
          assessmentsThisMonth: assessmentCount || 0,
          aiMessagesToday: 0, // Would need to track this separately
        })
      }

      setIsLoading(false)
    }

    fetchData()
  }, [])

  async function openPortal() {
    try {
      const response = await fetch('/api/payments/portal', { method: 'POST' })
      const data = await response.json()
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error opening portal:', error)
    }
  }

  async function upgrade(tier: string) {
    if (tier === currentTier) return

    setIsUpgrading(tier)

    try {
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })

      const { data } = await response.json()

      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error upgrading:', error)
      setIsUpgrading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-cyan" />
      </div>
    )
  }

  const limits = TIER_LIMITS[currentTier as keyof typeof TIER_LIMITS]
  const assessmentLimit = limits?.assessments_per_month
  const assessmentProgress = assessmentLimit 
    ? (usage.assessmentsThisMonth / assessmentLimit) * 100 
    : 0

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Billing & Subscription</h1>
      <p className="text-text-2 mb-8">Manage your subscription and usage</p>

      {/* Success/Error messages */}
      {success && (
        <div className="mb-6 p-4 bg-brand-emerald/10 border border-brand-emerald/30 rounded-brand text-brand-emerald">
          Payment successful! Your subscription has been updated.
        </div>
      )}
      {canceled && (
        <div className="mb-6 p-4 bg-brand-yellow/10 border border-brand-yellow/30 rounded-brand text-brand-yellow">
          Payment canceled. Your subscription remains unchanged.
        </div>
      )}

      {/* Current Plan */}
      <Card variant="elevated" padding="lg" className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-1">Current Plan</h2>
            <p className="text-text-2">You&apos;re on the {TIER_LABELS[currentTier as keyof typeof TIER_LABELS]} plan</p>
          </div>
          <Badge variant="cyan" size="md">
            {TIER_LABELS[currentTier as keyof typeof TIER_LABELS]}
          </Badge>
        </div>

        {assessmentLimit && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-2">Assessments this month</span>
              <span>{usage.assessmentsThisMonth} / {assessmentLimit}</span>
            </div>
            <ProgressBar value={assessmentProgress} color="cyan" />
          </div>
        )}

        {limits?.advisor_messages_per_day && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-2">AI messages today</span>
              <span>{usage.aiMessagesToday} / {limits.advisor_messages_per_day}</span>
            </div>
            <ProgressBar 
              value={(usage.aiMessagesToday / limits.advisor_messages_per_day) * 100} 
              color="emerald" 
            />
          </div>
        )}
      </Card>

      {/* Pricing Plans */}
      <h2 className="text-lg font-semibold mb-4">Choose Your Plan</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier) => {
          const isCurrent = currentTier === tier.id
          const isUpgradingTo = isUpgrading === tier.id

          return (
            <Card
              key={tier.id}
              variant={tier.popular ? 'glow' : 'elevated'}
              glowColor="#22d3ee"
              padding="lg"
              className={`
                ${tier.popular ? 'border-brand-cyan/50' : ''}
                ${isCurrent ? 'border-brand-emerald' : ''}
              `}
            >
              {tier.popular && (
                <div className="mb-4 px-3 py-1 bg-brand-cyan/10 border border-brand-cyan/30 rounded-full text-brand-cyan text-xs font-medium text-center">
                  Most Popular
                </div>
              )}
              {isCurrent && (
                <div className="mb-4 px-3 py-1 bg-brand-emerald/10 border border-brand-emerald/30 rounded-full text-brand-emerald text-xs font-medium text-center">
                  Current Plan
                </div>
              )}

              <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold">${tier.price}</span>
                {tier.price > 0 && <span className="text-text-3">/month</span>}
              </div>
              <p className="text-text-2 text-sm mb-4">{tier.description}</p>

              <ul className="space-y-2 mb-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-brand-emerald flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-text-3 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-text-1' : 'text-text-3'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={isCurrent ? 'secondary' : tier.popular ? 'primary' : 'outline'}
                fullWidth
                disabled={isCurrent || !!isUpgrading}
                onClick={() => upgrade(tier.id)}
                loading={isUpgradingTo}
              >
                {isCurrent ? 'Current Plan' : tier.price === 0 ? 'Free' : 'Upgrade'}
              </Button>
            </Card>
          )
        })}
      </div>

      {/* Payment Method */}
      {currentTier !== 'free' && (
        <Card variant="elevated" padding="lg" className="mt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-2 rounded-brand flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-text-2" />
              </div>
              <div>
                <h3 className="font-semibold">Manage Subscription</h3>
                <p className="text-text-2 text-sm">Update payment method, view invoices, or cancel</p>
              </div>
            </div>
            <Button variant="outline" onClick={openPortal}>
              Manage Subscription
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
