'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SignalUI } from '@/components/panels/strategy/SignalUI'
import { MonteCarloChart } from '@/components/panels/strategy/MonteCarloChart'
import { TemporalTwin } from '@/components/panels/strategy/TemporalTwin'
import { TrinityEngine } from '@/components/panels/strategy/TrinityEngine'
import { Spinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Assessment {
  id: string
  decision_type: string
  financial_score: number
  emotional_score: number
  timing_score: number
  overall_score: number
  verdict: string
  created_at: string
}

export default function StrategyPanelPage() {
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get('assessmentId')

  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [simulation, setSimulation] = useState<any>(null)
  const [temporalMessages, setTemporalMessages] = useState<any[]>([])
  const [trinityHistory, setTrinityHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [assessmentId])

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get latest assessment if none specified
      const query = supabase
        .from('assessments')
        .select('id, decision_type, financial_score, emotional_score, timing_score, overall_score, verdict, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      const { data: assessmentData } = assessmentId
        ? await supabase
            .from('assessments')
            .select('id, decision_type, financial_score, emotional_score, timing_score, overall_score, verdict, created_at')
            .eq('id', assessmentId)
            .single()
        : await query.single()

      setAssessment(assessmentData)

      if (assessmentData) {
        // Fetch simulation + temporal + trinity in parallel
        const [simRes, tempRes, trinityRes] = await Promise.all([
          fetch(`/api/simulation/monte-carlo?assessmentId=${assessmentData.id}`),
          fetch('/api/temporal-twin'),
          fetch(`/api/trinity?assessmentId=${assessmentData.id}`),
        ])

        if (simRes.ok) {
          const d = await simRes.json()
          setSimulation(d.simulations?.[0] ?? null)
        }
        if (tempRes.ok) {
          const d = await tempRes.json()
          setTemporalMessages(d.messages ?? [])
        }
        if (trinityRes.ok) {
          const d = await trinityRes.json()
          setTrinityHistory(d.debates ?? [])
        }
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
        <p className="text-text-2 mb-6">Complete an assessment to unlock Strategy Panels.</p>
        <Link href="/assessments/new">
          <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Start Assessment
          </Button>
        </Link>
      </Card>
    )
  }

  // Build Signal data from assessment scores
  const signalData = {
    overallSignal: assessment.overall_score ?? 0,
    confidence: Math.min(99, Math.round((assessment.overall_score ?? 0) * 1.08)),
    signals: [
      { label: 'Market Timing',        value: assessment.timing_score ?? 0,    colorKey: 'cyan'    as const },
      { label: 'Financial Readiness',  value: assessment.financial_score ?? 0, colorKey: 'emerald' as const },
      { label: 'Emotional Readiness',  value: assessment.emotional_score ?? 0, colorKey: 'yellow'  as const },
    ],
    recommendation: assessment.verdict === 'ready'
      ? 'GO signal: All dimensions aligned. Conditions are favorable.'
      : assessment.verdict === 'not_yet'
      ? 'WAIT signal: One or more dimensions need strengthening before proceeding.'
      : 'Assessing your decision readiness across all dimensions.',
    lastUpdated: new Date(assessment.created_at).toLocaleDateString(),
  }

  // Build Monte Carlo data from simulation results or defaults
  const monteCarloData = simulation?.results
    ? {
        simulation: '10,000 market scenarios',
        outcomes: [
          { label: 'Best Case (95th %ile)',  value: simulation.results.bestCase  ?? 425000, colorKey: 'emerald' as const },
          { label: 'Expected (50th %ile)',   value: simulation.results.expected  ?? 380000, colorKey: 'cyan'    as const },
          { label: 'Worst Case (5th %ile)',  value: simulation.results.worstCase ?? 320000, colorKey: 'amber'   as const },
        ],
        equity5y: {
          best:     simulation.results.equity5yBest     ?? 125000,
          expected: simulation.results.equity5yExpected ?? 92000,
          worst:    simulation.results.equity5yWorst    ?? 58000,
        },
        description: 'Monte Carlo modeling shows your decision value distribution under different market conditions.',
        downside: simulation.results.riskLevel === 'low'
          ? 'Low risk profile. Even in worst case scenarios, your position remains positive.'
          : 'Review worst-case scenario carefully before proceeding.',
      }
    : null

  // Build Temporal Twin data from messages
  const temporalData = {
    currentScenario: `${assessment.decision_type?.replace(/_/g, ' ')} decision — ${assessment.verdict === 'ready' ? 'Ready to proceed' : 'Building readiness'}`,
    scenarios: temporalMessages.length > 0
      ? temporalMessages.slice(0, 3).map((m, i) => ({
          timeline: i === 0 ? '3 Months' : i === 1 ? '1 Year' : '5 Years',
          description: m.content.slice(0, 80) + '...',
          checkpoints: [m.content],
          sentiment: m.category === 'encouragement' ? '✨ Positive' : '😌 Neutral',
        }))
      : [
          { timeline: '3 Months',  description: 'Initial transition period.',       checkpoints: ['Complete your first milestone', 'Assess early results'],          sentiment: '✨ Excited'    },
          { timeline: '1 Year',    description: 'Settled and evaluating progress.',  checkpoints: ['Review decision outcomes', 'Measure against initial goals'],       sentiment: '😊 Content'    },
          { timeline: '5 Years',   description: 'Long-term outcome realization.',    checkpoints: ['Full impact of decision realized', 'Next decision horizon opens'],  sentiment: '💪 Confident'  },
        ],
  }

  // Build Trinity data from history or defaults
  const latestDebate = trinityHistory[0]
  const trinityData = {
    decision: latestDebate?.question ?? `${assessment.decision_type?.replace(/_/g, ' ')} — Score: ${assessment.overall_score}/100`,
    roles: latestDebate?.perspectives ?? [
      {
        id: 'advocate', title: 'The Advocate', icon: '✅',
        stance: 'This is the right move.',
        reasoning: [
          `Your overall readiness score is ${assessment.overall_score}/100.`,
          `Financial dimension: ${assessment.financial_score}% — ${assessment.financial_score >= 65 ? 'Strong foundation.' : 'Work to do here.'}`,
          `Emotional alignment: ${assessment.emotional_score}% — ${assessment.emotional_score >= 65 ? 'Mentally ready.' : 'Needs attention.'}`,
          `Timing score: ${assessment.timing_score}% — ${assessment.timing_score >= 65 ? 'Good window.' : 'Consider timing.'}`,
        ],
        recommendation: assessment.overall_score >= 65 ? 'Execute. The data supports moving forward.' : 'Build your score to 65+ before committing.',
      },
      {
        id: 'skeptic', title: 'The Skeptic', icon: '⚠️',
        stance: 'What are you missing?',
        reasoning: [
          assessment.financial_score < 65 ? `Financial score (${assessment.financial_score}%) needs improvement.` : 'Finances look solid.',
          assessment.emotional_score < 65 ? `Emotional readiness (${assessment.emotional_score}%) is a concern.` : 'Emotional state is healthy.',
          assessment.timing_score < 65 ? `Timing score (${assessment.timing_score}%) suggests suboptimal window.` : 'Timing appears reasonable.',
          'Have you fully stress-tested your assumptions?',
        ],
        recommendation: assessment.overall_score < 65 ? 'Address weak dimensions before proceeding.' : 'Validate one more time, then commit.',
      },
      {
        id: 'arbiter', title: 'The Arbiter', icon: '⚖️',
        stance: "Here's what the data says.",
        reasoning: [
          'Both arguments have merit.',
          `Overall score of ${assessment.overall_score} is ${assessment.overall_score >= 65 ? 'above' : 'below'} the readiness threshold.`,
          'Waiting has a cost: opportunity, timeline pressure, market risk.',
          'Proceeding has a cost: capital commitment, flexibility loss.',
        ],
        recommendation: assessment.verdict === 'ready'
          ? 'Data supports proceeding. Manage known risks with contingencies.'
          : 'Build your score. Set a concrete target date to reassess.',
      },
    ],
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Signal UI */}
      <div>
        <SignalUI {...signalData} />
      </div>

      {/* Monte Carlo */}
      <div>
        {monteCarloData ? (
          <MonteCarloChart {...monteCarloData} />
        ) : (
          <Card variant="elevated" className="text-center py-12">
            <p className="text-text-3 text-sm mb-4">Run a simulation to see Monte Carlo projections.</p>
            <Link href={`/simulation?assessmentId=${assessment.id}`}>
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Run Simulation
              </Button>
            </Link>
          </Card>
        )}
      </div>

      {/* Temporal Twin */}
      <div>
        <TemporalTwin {...temporalData} />
      </div>

      {/* Trinity Engine */}
      <div>
        <TrinityEngine {...trinityData} />
      </div>
    </div>
  )
}
