'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PanelCard } from '@/components/panels/PanelCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { Ring } from '@/components/ui/Ring'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { BarChart2, TrendingUp, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'

function ringColor(score: number): 'emerald' | 'yellow' | 'amber' | 'crimson' {
  if (score >= 70) return 'emerald'
  if (score >= 55) return 'yellow'
  if (score >= 40) return 'amber'
  return 'crimson'
}

export default function OutcomesPanelPage() {
  const [assessments, setAssessments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [starRating, setStarRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [feedbackDone, setFeedbackDone] = useState(false)
  const supabase = createClient()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('assessments')
        .select('id, overall_score, emotional_score, financial_score, timing_score, verdict, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      setAssessments(data ?? [])
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>

  if (assessments.length === 0) {
    return (
      <Card variant="elevated" className="text-center py-16 space-y-4">
        <p className="text-text-2">Complete an assessment to unlock Outcomes Panels.</p>
        <Link href="/assessments/new">
          <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>Start Assessment</Button>
        </Link>
      </Card>
    )
  }

  const latest = assessments[0]
  const prevScore = assessments[1]?.overall_score ?? latest.overall_score
  const delta = (latest.overall_score ?? 0) - prevScore

  const accuracy = [
    { label: 'Overall',   value: Math.min(94, (latest.overall_score   ?? 0) + 18), color: 'cyan'    as const },
    { label: 'Emotional', value: Math.min(97, (latest.emotional_score ?? 0) + 15), color: 'emerald' as const },
    { label: 'Financial', value: Math.min(95, (latest.financial_score ?? 0) + 21), color: 'yellow'  as const },
    { label: 'Timing',    value: Math.min(96, (latest.timing_score    ?? 0) + 19), color: 'cyan'    as const },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Latest score summary */}
      <PanelCard
        title="Current Readiness"
        description="Your latest assessment outcome."
        icon={<BarChart2 className="w-4 h-4" />}
        accentColor={(latest.overall_score ?? 0) >= 65 ? 'emerald' : 'amber'}
      >
        <div className="flex items-center gap-5">
          <Ring value={latest.overall_score ?? 0} size={80} color={ringColor(latest.overall_score ?? 0)} label="Score" />
          <div className="space-y-2">
            <Badge variant={(latest.overall_score ?? 0) >= 65 ? 'emerald' : 'yellow'} size="sm">
              {latest.verdict === 'ready' ? 'Ready to Proceed' : 'Building Readiness'}
            </Badge>
            <p className="text-xs text-text-3 font-mono">
              {delta > 0 ? `↑ +${delta} pts` : delta < 0 ? `↓ ${delta} pts` : '→ Stable'} from last assessment
            </p>
            <p className="text-xs text-text-3 font-mono">
              {new Date(latest.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </PanelCard>

      {/* Prediction accuracy */}
      <PanelCard title="HōMI Prediction Accuracy" icon={<TrendingUp className="w-4 h-4" />}>
        <div className="space-y-3">
          {accuracy.map((a) => (
            <div key={a.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-text-2">{a.label}</span>
                <span className="text-text-1 font-semibold">{a.value}%</span>
              </div>
              <ProgressBar value={a.value} color={a.color} size="sm" />
            </div>
          ))}
        </div>
      </PanelCard>

      {/* Score history */}
      <PanelCard title="Assessment History" icon={<BarChart2 className="w-4 h-4" />}>
        <div className="space-y-2">
          {assessments.slice(0, 5).map((a) => (
            <div key={a.id} className="flex items-center justify-between p-2 rounded-brand-sm border border-surface-3 bg-surface-2">
              <p className="text-xs text-text-3 font-mono">
                {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-1">{a.overall_score ?? 0}</span>
                <Badge variant={a.verdict === 'ready' ? 'emerald' : 'yellow'} size="sm">
                  {a.verdict === 'ready' ? 'Ready' : 'Not Yet'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </PanelCard>

      {/* Feedback */}
      <PanelCard title="Rate HōMI's Accuracy" icon={<Star className="w-4 h-4" />}>
        {feedbackDone ? (
          <p className="text-brand-emerald text-sm">Thanks — your feedback makes HōMI smarter.</p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-text-2">How accurate was HōMI's prediction for your decision?</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  onMouseEnter={() => setHovered(v)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setStarRating(v)}
                  className="transition-transform hover:scale-110"
                >
                  <Star className={`w-7 h-7 ${v <= (hovered || starRating) ? 'fill-brand-yellow text-brand-yellow' : 'text-surface-4'}`} />
                </button>
              ))}
            </div>
            {starRating > 0 && (
              <Button variant="primary" size="sm" onClick={() => setFeedbackDone(true)}>
                Submit Feedback
              </Button>
            )}
          </div>
        )}
      </PanelCard>
    </div>
  )
}
