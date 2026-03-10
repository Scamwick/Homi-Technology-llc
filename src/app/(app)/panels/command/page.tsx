'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BlindBudgetToggle } from '@/components/panels/command/BlindBudgetToggle'
import { CertaintyBreaker } from '@/components/panels/command/CertaintyBreaker'
import { PermissionSystem } from '@/components/panels/command/PermissionSystem'
import { ReputationScore } from '@/components/panels/command/ReputationScore'
import { Spinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function CommandPanelPage() {
  const [assessment, setAssessment] = useState<any>(null)
  const [genome, setGenome] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [blindEnabled, setBlindEnabled] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: assessmentData }, genomeRes] = await Promise.all([
        supabase
          .from('assessments')
          .select('id, overall_score, financial_score, emotional_score, timing_score, verdict, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single(),
        fetch('/api/behavioral-genome'),
      ])

      setAssessment(assessmentData)
      if (genomeRes.ok) {
        const d = await genomeRes.json()
        setGenome(d.genome)
      }
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
        <p className="text-text-2 mb-6">Complete an assessment to unlock Command Panels.</p>
        <Link href="/assessments/new">
          <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Start Assessment
          </Button>
        </Link>
      </Card>
    )
  }

  // Certainty data from assessment scores
  const certaintyScore = Math.round(
    (assessment.financial_score ?? 0) * 0.35 +
    (assessment.emotional_score ?? 0) * 0.35 +
    (assessment.timing_score ?? 0) * 0.30
  )

  const certaintyBreakdown = [
    { label: 'Financial Clarity',   value: assessment.financial_score ?? 0, colorKey: 'emerald' as const },
    { label: 'Emotional Alignment', value: assessment.emotional_score ?? 0, colorKey: 'cyan'    as const },
    { label: 'Timing Confidence',   value: assessment.timing_score ?? 0,    colorKey: 'amber'   as const },
  ]

  // Reputation from genome or defaults
  const repScore = genome?.traits
    ? Math.round(genome.traits.reduce((sum: number, t: any) => sum + (t.score ?? t.value ?? 0), 0) / genome.traits.length)
    : Math.round(assessment.overall_score ?? 0)

  const repTier: 'bronze' | 'silver' | 'gold' | 'platinum' =
    repScore >= 85 ? 'platinum' : repScore >= 70 ? 'gold' : repScore >= 55 ? 'silver' : 'bronze'

  const repCategories = [
    { label: 'Decision Quality',  value: assessment.overall_score ?? 0,    colorKey: 'emerald' as const },
    { label: 'Consistency',       value: Math.min(99, (assessment.overall_score ?? 0) + 5),  colorKey: 'cyan'    as const },
    { label: 'Timing Awareness',  value: assessment.timing_score ?? 0,      colorKey: 'yellow'  as const },
    { label: 'Financial Clarity', value: assessment.financial_score ?? 0,   colorKey: 'amber'   as const },
  ]

  const achievements = [
    { id: 'first_assessment', label: 'First Assessment', earned: true },
    { id: 'streak_7',  label: '7-Day Streak',    earned: (assessment.overall_score ?? 0) >= 50 },
    { id: 'score_70',  label: 'Score 70+',        earned: (assessment.overall_score ?? 0) >= 70 },
    { id: 'platinum',  label: 'Platinum Status',  earned: repScore >= 85 },
  ]

  // Estimated budget from financial score
  const estimatedBudget = Math.round(((assessment.financial_score ?? 50) / 100) * 500000)
  const budgetRange = `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(estimatedBudget * 0.9)} – ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(estimatedBudget * 1.1)}`

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Blind Budget Toggle */}
      <div>
        <BlindBudgetToggle
          enabled={blindEnabled}
          actualBudget={estimatedBudget}
          blindBudgetRange={budgetRange}
          onToggle={setBlindEnabled}
        />
      </div>

      {/* Certainty Breaker */}
      <div>
        <CertaintyBreaker
          certaintyScore={certaintyScore}
          breakdown={certaintyBreakdown}
          doubts={[
            {
              id: 'd1',
              doubt: 'Is my financial position strong enough?',
              reasoning: `Financial score is ${assessment.financial_score ?? 0}/100`,
              resolution: (assessment.financial_score ?? 0) >= 65
                ? 'Your financial score is above the readiness threshold. You have a solid foundation.'
                : 'Consider building your emergency fund and reducing outstanding debt before proceeding.',
              priority: (assessment.financial_score ?? 0) >= 65 ? 'low' : 'high',
            },
            {
              id: 'd2',
              doubt: 'Am I emotionally ready for this decision?',
              reasoning: `Emotional score is ${assessment.emotional_score ?? 0}/100`,
              resolution: (assessment.emotional_score ?? 0) >= 65
                ? 'Your emotional alignment is strong. You are making this decision with clarity.'
                : 'High emotional volatility can distort decisions. Take 48 hours and reassess.',
              priority: (assessment.emotional_score ?? 0) >= 65 ? 'low' : 'medium',
            },
            {
              id: 'd3',
              doubt: 'Is the timing right for this move?',
              reasoning: `Timing score is ${assessment.timing_score ?? 0}/100`,
              resolution: (assessment.timing_score ?? 0) >= 65
                ? 'Market conditions and your readiness align. The window is open.'
                : 'Timing indicators suggest waiting for a stronger window.',
              priority: (assessment.timing_score ?? 0) >= 65 ? 'low' : 'medium',
            },
          ]}
          assessmentId={assessment.id}
        />
      </div>

      {/* Permission System */}
      <div>
        <PermissionSystem
          permissions={[]}
          financialScore={assessment.financial_score ?? 0}
          onCheck={async (item, amount) => {
            // Future: POST to /api/permission-check
            console.log('Permission check:', item, amount)
          }}
        />
      </div>

      {/* Reputation Score */}
      <div>
        <ReputationScore
          score={repScore}
          tier={repTier}
          categories={repCategories}
          achievements={achievements}
          percentile={repScore}
        />
      </div>
    </div>
  )
}
