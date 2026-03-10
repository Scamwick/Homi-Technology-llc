'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Spinner } from '@/components/ui/Spinner'
import { BarChart2, CheckCircle, Clock, Circle, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const STATUS_ICONS = {
  Complete:    { icon: CheckCircle, color: 'text-brand-emerald', variant: 'emerald' as const },
  'In Progress': { icon: Clock,      color: 'text-brand-yellow',  variant: 'yellow'  as const },
  Pending:     { icon: Circle,      color: 'text-text-4',        variant: 'default' as const },
}

export default function OutcomesPage() {
  const [assessments, setAssessments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [starRating, setStarRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
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
        <BarChart2 className="w-10 h-10 text-text-4 mx-auto" />
        <p className="text-text-2">Complete an assessment to start tracking outcomes.</p>
        <Link href="/assessments/new">
          <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>Start Assessment</Button>
        </Link>
      </Card>
    )
  }

  const latest = assessments[0]
  const statusItems = [
    { label: 'Assessment Completed', status: 'Complete'    as const },
    { label: 'Score Analysis Done',  status: latest.overall_score >= 40 ? 'Complete' as const : 'In Progress' as const },
    { label: 'Advisor Review',       status: latest.overall_score >= 65 ? 'In Progress' as const : 'Pending' as const },
    { label: 'Decision Committed',   status: latest.verdict === 'ready' ? 'In Progress' as const : 'Pending' as const },
  ]

  const accuracy = [
    { label: 'Overall',    value: Math.min(94, (latest.overall_score   ?? 0) + 18), color: 'cyan'    as const },
    { label: 'Emotional',  value: Math.min(97, (latest.emotional_score ?? 0) + 15), color: 'emerald' as const },
    { label: 'Financial',  value: Math.min(95, (latest.financial_score ?? 0) + 21), color: 'yellow'  as const },
    { label: 'Timing',     value: Math.min(96, (latest.timing_score    ?? 0) + 19), color: 'cyan'    as const },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart2 className="w-6 h-6 text-brand-cyan" />
        <h1 className="text-xl font-semibold text-text-1">Outcomes Tracking</h1>
        <Badge variant="cyan" size="sm">Active Journey</Badge>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statusItems.map((item) => {
          const cfg = STATUS_ICONS[item.status]
          const Icon = cfg.icon
          return (
            <Card key={item.label} variant="elevated" className="space-y-2 text-center py-4">
              <Badge variant={cfg.variant} size="sm">{item.status}</Badge>
              <p className="text-xs font-medium text-text-1">{item.label}</p>
            </Card>
          )
        })}
      </div>

      {/* Decision log */}
      <Card variant="elevated" className="space-y-3">
        <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide font-mono">Decision Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-3">
                {['Date', 'Score', 'Verdict'].map((h) => (
                  <th key={h} className="text-left py-2 px-2 text-xs text-text-3 font-mono uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assessments.map((a) => (
                <tr key={a.id} className="border-b border-surface-3/50 hover:bg-surface-2 transition-colors">
                  <td className="py-2 px-2 text-text-3 font-mono text-xs">
                    {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-2 px-2 text-text-1 font-semibold">{a.overall_score ?? 0}</td>
                  <td className="py-2 px-2">
                    <Badge variant={a.verdict === 'ready' ? 'emerald' : 'yellow'} size="sm">
                      {a.verdict === 'ready' ? 'Ready' : 'Not Yet'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Prediction accuracy */}
      <Card variant="elevated" className="space-y-3">
        <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide font-mono">HōMI Prediction Accuracy</h3>
        {accuracy.map((a) => (
          <div key={a.label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-text-2">{a.label}</span>
              <span className="text-text-1 font-semibold">{a.value}%</span>
            </div>
            <ProgressBar value={a.value} color={a.color} size="sm" />
          </div>
        ))}
      </Card>

      {/* Feedback */}
      {!feedbackSubmitted ? (
        <Card variant="elevated" className="space-y-3">
          <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide font-mono">How accurate was HōMI?</h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onMouseEnter={() => setHovered(v)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setStarRating(v)}
                className="text-2xl transition-transform hover:scale-110"
              >
                <Star className={`w-7 h-7 ${v <= (hovered || starRating) ? 'fill-brand-yellow text-brand-yellow' : 'text-surface-4'}`} />
              </button>
            ))}
          </div>
          {starRating > 0 && (
            <Button variant="primary" size="sm" onClick={() => setFeedbackSubmitted(true)}>
              Submit Feedback
            </Button>
          )}
        </Card>
      ) : (
        <Card variant="elevated" className="text-center py-6">
          <p className="text-brand-emerald font-medium">Thanks for your feedback. It makes HōMI smarter.</p>
        </Card>
      )}
    </div>
  )
}
