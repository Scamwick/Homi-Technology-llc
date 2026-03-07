'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { ProgressBar } from '@/components/ui/ProgressBar'
import {
  Users,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Heart,
  TrendingUp,
  Target,
  AlertCircle,
} from 'lucide-react'

interface DimensionAlignment {
  scoreA: number
  scoreB: number
  gap: number
  alignmentLevel: 'strong' | 'moderate' | 'divergent'
}

interface AlignmentData {
  financial: DimensionAlignment
  emotional: DimensionAlignment
  timing: DimensionAlignment
}

interface CoupleAssessment {
  id: string
  couple_id: string
  partner_a_assessment_id: string | null
  partner_b_assessment_id: string | null
  combined_score: number | null
  alignment_data: AlignmentData | null
  joint_verdict: 'both_ready' | 'one_not_yet' | 'both_not_yet' | null
  discussion_prompts: string[]
  created_at: string
  partner_a_assessment: {
    id: string
    decision_type: string
    overall_score: number | null
    financial_score: number | null
    emotional_score: number | null
    timing_score: number | null
    verdict: 'ready' | 'not_yet' | null
  } | null
  partner_b_assessment: {
    id: string
    decision_type: string
    overall_score: number | null
    financial_score: number | null
    emotional_score: number | null
    timing_score: number | null
    verdict: 'ready' | 'not_yet' | null
  } | null
}

export default function CouplesResultsPage() {
  const [assessments, setAssessments] = useState<CoupleAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<CoupleAssessment | null>(null)

  useEffect(() => {
    fetchAssessments()
  }, [])

  const fetchAssessments = async () => {
    try {
      const response = await fetch('/api/couples/assessments')
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to load results')
      }
      const data = await response.json()
      const list: CoupleAssessment[] = data.assessments || []
      setAssessments(list)
      if (list.length > 0) setSelected(list[0])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Card className="text-center py-16">
          <AlertCircle className="w-16 h-16 text-brand-crimson mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-3">Could Not Load Results</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link href="/couples">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Couples
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (assessments.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Card className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-crimson/20 to-brand-cyan/20 flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-brand-cyan" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">No Joint Assessments Yet</h1>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Take a joint assessment with your partner to see your alignment results and
            discussion prompts here.
          </p>
          <Link href="/assessments/new?mode=couple">
            <Button variant="primary">
              Start Joint Assessment
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/couples">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-crimson/50 to-brand-cyan/50 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Couple Alignment</h1>
        </div>
        <p className="text-slate-400">
          See how you and your partner align across assessments.
        </p>
      </div>

      {/* Assessment selector */}
      {assessments.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {assessments.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelected(a)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selected?.id === a.id
                  ? 'bg-brand-cyan text-white'
                  : 'bg-surface-800 text-slate-400 hover:text-white hover:bg-surface-700'
              }`}
            >
              {(a.partner_a_assessment?.decision_type || 'Assessment').replace('_', ' ')}
              {' '}— {new Date(a.created_at).toLocaleDateString()}
            </button>
          ))}
        </div>
      )}

      {selected && <AssessmentResults assessment={selected} />}
    </div>
  )
}

function AssessmentResults({ assessment }: { assessment: CoupleAssessment }) {
  const { joint_verdict, alignment_data, discussion_prompts, combined_score } = assessment
  const aAssessment = assessment.partner_a_assessment
  const bAssessment = assessment.partner_b_assessment

  const verdictConfig = {
    both_ready: {
      label: 'Both Ready',
      color: 'bg-brand-emerald text-surface-0',
      icon: CheckCircle2,
      description: 'You and your partner are both ready to move forward together!',
    },
    one_not_yet: {
      label: 'One Not Yet Ready',
      color: 'bg-brand-yellow text-surface-0',
      icon: AlertCircle,
      description: 'You are close, but one partner still has areas to work on.',
    },
    both_not_yet: {
      label: 'Both Not Yet Ready',
      color: 'bg-brand-crimson text-surface-0',
      icon: XCircle,
      description: 'Both partners need more preparation before proceeding.',
    },
  }

  const config = joint_verdict ? verdictConfig[joint_verdict] : null

  return (
    <div className="space-y-6">
      {/* Joint Verdict */}
      {config && joint_verdict && (
        <Card className="text-center py-8">
          <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-lg font-bold mb-4 ${config.color}`}>
            <config.icon className="w-5 h-5" />
            {config.label}
          </div>
          <p className="text-slate-400 max-w-md mx-auto">{config.description}</p>
          {combined_score !== null && (
            <p className="text-slate-300 mt-3 font-semibold">
              Combined Score: <span className="text-white text-2xl font-bold">{combined_score}</span>/100
            </p>
          )}
        </Card>
      )}

      {/* Partners scores */}
      {(aAssessment || bAssessment) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PartnerScoreCard
            label="Partner A"
            assessment={aAssessment}
          />
          <PartnerScoreCard
            label="Partner B"
            assessment={bAssessment}
          />
        </div>
      )}

      {/* Dimension alignment */}
      {alignment_data && (
        <Card>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-brand-cyan" />
              <h3 className="text-lg font-semibold text-white">Dimension Alignment</h3>
            </div>
            <div className="space-y-4">
              <DimensionRow
                label="Financial"
                color="cyan"
                dimension={alignment_data.financial}
              />
              <DimensionRow
                label="Emotional"
                color="emerald"
                dimension={alignment_data.emotional}
              />
              <DimensionRow
                label="Timing"
                color="yellow"
                dimension={alignment_data.timing}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Discussion Prompts */}
      {discussion_prompts && discussion_prompts.length > 0 && (
        <Card>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-brand-yellow" />
              <h3 className="text-lg font-semibold text-white">Discussion Prompts</h3>
            </div>
            <ul className="space-y-3">
              {discussion_prompts.map((prompt, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-yellow/20 text-brand-yellow flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-slate-300 text-sm">{prompt}</p>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* CTA */}
      <div className="flex flex-wrap gap-3 justify-center pt-2">
        <Link href="/assessments/new?mode=couple">
          <Button variant="primary">
            <Target className="w-4 h-4 mr-2" />
            Take Another Assessment
          </Button>
        </Link>
        <Link href="/advisor">
          <Button variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            Ask AI Advisor
          </Button>
        </Link>
      </div>
    </div>
  )
}

function PartnerScoreCard({
  label,
  assessment,
}: {
  label: string
  assessment: CoupleAssessment['partner_a_assessment']
}) {
  if (!assessment) {
    return (
      <Card className="bg-surface-800/50 border-surface-700">
        <div className="p-5 text-center text-slate-400">
          <p className="font-medium text-white mb-1">{label}</p>
          <p className="text-sm">Assessment not completed yet</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-surface-800/50 border-surface-700">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-medium text-white">{label}</p>
          {assessment.verdict && (
            <Badge variant={assessment.verdict === 'ready' ? 'emerald' : 'yellow'}>
              {assessment.verdict === 'ready' ? 'READY' : 'NOT YET'}
            </Badge>
          )}
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-brand-cyan">Financial</span>
              <span className="text-white font-medium">{assessment.financial_score ?? '—'}</span>
            </div>
            <ProgressBar value={assessment.financial_score ?? 0} color="cyan" size="sm" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-brand-emerald">Emotional</span>
              <span className="text-white font-medium">{assessment.emotional_score ?? '—'}</span>
            </div>
            <ProgressBar value={assessment.emotional_score ?? 0} color="emerald" size="sm" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-brand-yellow">Timing</span>
              <span className="text-white font-medium">{assessment.timing_score ?? '—'}</span>
            </div>
            <ProgressBar value={assessment.timing_score ?? 0} color="yellow" size="sm" />
          </div>
        </div>
      </div>
    </Card>
  )
}

function DimensionRow({
  label,
  color,
  dimension,
}: {
  label: string
  color: 'cyan' | 'emerald' | 'yellow'
  dimension: DimensionAlignment
}) {
  const alignmentBadge = {
    strong: { label: 'Strong', variant: 'emerald' as const },
    moderate: { label: 'Moderate', variant: 'yellow' as const },
    divergent: { label: 'Divergent', variant: 'red' as const },
  }

  const badge = alignmentBadge[dimension.alignmentLevel]
  const colorClass = {
    cyan: 'text-brand-cyan',
    emerald: 'text-brand-emerald',
    yellow: 'text-brand-yellow',
  }[color]

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className={`font-medium ${colorClass}`}>{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm">Gap: {dimension.gap} pts</span>
          <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Partner A</span>
            <span>{dimension.scoreA}</span>
          </div>
          <ProgressBar value={dimension.scoreA} color={color} size="sm" />
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Partner B</span>
            <span>{dimension.scoreB}</span>
          </div>
          <ProgressBar value={dimension.scoreB} color={color} size="sm" />
        </div>
      </div>
    </div>
  )
}
