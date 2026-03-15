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
  const [currentTier, setCurrentTier] = useState('free')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          console.error('Auth error:', userError)
          setError('Unable to authenticate.')
          return
        }

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
          aiMessagesToday: 0,
        })
      } catch (err) {
        console.error('Billing fetch error:', err)
        setError('Failed to load billing information.')
      } finally {
        setIsLoading(false)
      }
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-cyan" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <Card>
          <div className="p-8">
            <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
            <p className="text-white/60 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </Card>
      </div>
    )
  }

  const limits = TIER_LIMITS[currentTier as keyof typeof TIER_LIMITS]
  const assessmentLimit = limits?.assessments_per_month
  const assessmentProgress = assessmentLimit ? (usage.assessmentsThisMonth / assessmentLimit) * 100 : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Billing & Subscription</h1>
        <p className="text-white/60 mt-1">Manage your subscription and usage</p>
      </div>

      {success && (
        <Card className="border-brand-emerald/30 bg-brand-emerald/5">
          <div className="p-4 text-brand-emerald">Payment successful! Your subscription has been updated.</div>
        </Card>
      )}
      {canceled && (
        <Card className="border-brand-yellow/30 bg-brand-yellow/5">
          <div className="p-4 text-brand-yellow">Payment canceled. Your subscription remains unchanged.</div>
        </Card>
      )}

      {/* Current Plan */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Current Plan</h2>
          <p className="text-white/60 mb-4">You're on the {TIER_LABELS[currentTier as keyof typeof TIER_LABELS]} plan</p>
          <Badge variant="default">{TIER_LABELS[currentTier as keyof typeof TIER_LABELS]}</Badge>
          {assessmentLimit && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/60">Assessments this month</span>
                <span className="text-white">{usage.assessmentsThisMonth} / {assessmentLimit}</span>
              </div>
              <ProgressBar value={assessmentProgress} />
            </div>
          )}
          {limits?.advisor_messages_per_day && (
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/60">AI messages today</span>
                <span className="text-white">{usage.aiMessagesToday} / {limits.advisor_messages_per_day}</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Pricing Plans */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Choose Your Plan</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((tier) => {
            const isCurrent = currentTier === tier.id
            const isUpgradingTo = isUpgrading === tier.id
            return (
              <Card key={tier.id} className={`relative ${tier.popular ? 'border-brand-cyan' : ''}`}>
                <div className="p-6">
                  {tier.popular && (
                    <Badge variant="default" className="absolute top-3 right-3">Most Popular</Badge>
                  )}
                  {isCurrent && (
                    <Badge variant="success" className="absolute top-3 right-3">Current Plan</Badge>
                  )}
                  <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-white">${tier.price}</span>
                    {tier.price > 0 && <span className="text-white/40 text-sm"> /month</span>}
                  </div>
                  <p className="text-white/60 text-sm mt-2">{tier.description}</p>
                  <ul className="mt-4 space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-brand-emerald" />
                        ) : (
                          <X className="w-4 h-4 text-white/20" />
                        )}
                        <span className={feature.included ? 'text-white/80' : 'text-white/30'}>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-6"
                    variant={isCurrent ? 'outline' : 'primary'}
                    disabled={isCurrent}
                    onClick={() => upgrade(tier.id)}
                    loading={isUpgradingTo}
                  >
                    {isCurrent ? 'Current Plan' : tier.price === 0 ? 'Free' : 'Upgrade'}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Manage Subscription */}
      {currentTier !== 'free' && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Manage Subscription</h3>
            <p className="text-white/60 mb-4">Update payment method, view invoices, or cancel</p>
            <Button variant="outline" onClick={openPortal}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Manage Subscription
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
