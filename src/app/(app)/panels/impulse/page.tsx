'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealTimeProtection } from '@/components/panels/impulse/RealTimeProtection'
import { RebellionDefuser } from '@/components/panels/impulse/RebellionDefuser'
import { SafetyMargin } from '@/components/panels/impulse/SafetyMargin'
import { Spinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function ImpulsePanelPage() {
  const [assessment, setAssessment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('assessments')
        .select('id, overall_score, financial_score, emotional_score, timing_score, verdict, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      setAssessment(data)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!assessment) {
    return (
      <Card variant="elevated" className="text-center py-16">
        <p className="text-text-2 mb-6">Complete an assessment to unlock Impulse Panels.</p>
        <Link href="/assessments/new">
          <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Start Assessment
          </Button>
        </Link>
      </Card>
    )
  }

  const emotionalScore = assessment.emotional_score ?? 0
  const financialScore = assessment.financial_score ?? 0
  const overallScore   = assessment.overall_score   ?? 0

  // Derive protection level from emotional + overall
  const protectionLevel: 'active' | 'warning' | 'breach' =
    emotionalScore >= 65 && overallScore >= 65 ? 'active'
    : emotionalScore < 40 || overallScore < 40  ? 'breach'
    : 'warning'

  // Rebellion index = inverse of emotional readiness
  const rebellionIndex = Math.max(0, Math.min(100, 100 - emotionalScore))

  // Estimated safety margin from financial score
  const estimatedBudget   = Math.round((financialScore / 100) * 500000)
  const emergencyTarget   = Math.round(estimatedBudget * 0.1)
  const emergencyActual   = Math.round(emergencyTarget * (financialScore / 100))
  const spendingBuffer    = Math.round(estimatedBudget * 0.05 * (financialScore / 100))
  const spendingTarget    = Math.round(estimatedBudget * 0.05)
  const safetyScore       = Math.round((financialScore * 0.6) + (overallScore * 0.4))

  const alerts = emotionalScore < 65
    ? [
        {
          id: 'a1',
          type: 'emotional' as const,
          message: 'Elevated emotional state detected. Delay high-stakes decisions by 24–48 hours.',
          severity: emotionalScore < 40 ? 'high' as const : 'medium' as const,
          timestamp: 'Just now',
        },
      ]
    : []

  if (overallScore < 50) {
    alerts.push({
      id: 'a2',
      type: 'timing' as const,
      message: 'Overall readiness score is below threshold. Consider strengthening weak dimensions.',
      severity: 'medium' as const,
      timestamp: 'Latest assessment',
    })
  }

  const rebellions = emotionalScore < 65
    ? [
        {
          id: 'r1',
          trigger: 'High emotional volatility in latest assessment',
          impulse: `Urge to override score and proceed anyway (score: ${overallScore}/100)`,
          defuse: 'Write down your three biggest concerns. Sleep on them. Reassess tomorrow with a clear head.',
          urgency: emotionalScore < 40 ? 'critical' as const : 'high' as const,
          resolved: false,
        },
      ]
    : []

  if (assessment.verdict === 'not_yet' && overallScore < 65) {
    rebellions.push({
      id: 'r2',
      trigger: 'Score below proceed threshold',
      impulse: 'Temptation to act on urgency rather than readiness',
      defuse: 'Set a 30-day target score of 65+. Build your financial and emotional dimensions systematically.',
      urgency: 'moderate' as const,
      resolved: false,
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Real-Time Protection */}
      <div>
        <RealTimeProtection
          protectionLevel={protectionLevel}
          alerts={alerts}
          alertsBlocked={Math.round(rebellionIndex / 10)}
        />
      </div>

      {/* Rebellion Defuser */}
      <div>
        <RebellionDefuser
          rebellionIndex={rebellionIndex}
          rebellions={rebellions}
        />
      </div>

      {/* Safety Margin (full width) */}
      <div className="lg:col-span-2">
        <SafetyMargin
          safetyScore={safetyScore}
          totalMargin={emergencyActual + spendingBuffer}
          absorbedThisMonth={Math.round(spendingBuffer * 0.7)}
          margins={[
            {
              id: 'emergency',
              label: 'Emergency Fund',
              amount: emergencyActual,
              target: emergencyTarget,
              health: emergencyActual >= emergencyTarget * 0.8 ? 'healthy' : emergencyActual >= emergencyTarget * 0.5 ? 'watch' : 'critical',
              absorbed: 0,
            },
            {
              id: 'spending',
              label: 'Spending Buffer',
              amount: spendingBuffer,
              target: spendingTarget,
              health: spendingBuffer >= spendingTarget * 0.8 ? 'healthy' : spendingBuffer >= spendingTarget * 0.5 ? 'watch' : 'critical',
              absorbed: Math.round(spendingBuffer * 0.7),
            },
          ]}
        />
      </div>
    </div>
  )
}
