'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Ring } from '@/components/ui/Ring'
import { Spinner } from '@/components/ui/Spinner'
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  BarChart2,
  Calendar,
} from 'lucide-react'
import Link from 'next/link'

interface Assessment {
  id: string
  decision_type: string
  overall_score: number
  financial_score: number
  emotional_score: number
  timing_score: number
  verdict: string
  created_at: string
}

interface TransformationPath {
  id: string
  status: string
  target_dimension: string | null
  target_score: number | null
  current_score: number | null
  created_at: string
}

function verdictColor(verdict: string): 'emerald' | 'yellow' | 'default' {
  if (verdict === 'ready') return 'emerald'
  if (verdict === 'not_yet') return 'yellow'
  return 'default'
}

function TrendIcon({ delta }: { delta: number }) {
  if (delta > 3) return <TrendingUp className="w-4 h-4 text-brand-emerald" />
  if (delta < -3) return <TrendingDown className="w-4 h-4 text-brand-crimson" />
  return <Minus className="w-4 h-4 text-text-3" />
}

export default function ReportsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [paths, setPaths] = useState<TransformationPath[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: aData }, { data: pData }] = await Promise.all([
        supabase
          .from('assessments')
          .select('id, decision_type, overall_score, financial_score, emotional_score, timing_score, verdict, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('transformation_paths')
          .select('id, status, target_dimension, target_score, current_score, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
      ])

      setAssessments(aData ?? [])
      setPaths(pData ?? [])
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const latest = assessments[0]
  const previous = assessments[1]
  const scoreDelta = latest && previous
    ? (latest.overall_score ?? 0) - (previous.overall_score ?? 0)
    : null

  const avgScore = assessments.length
    ? Math.round(assessments.reduce((s, a) => s + (a.overall_score ?? 0), 0) / assessments.length)
    : 0

  const readyCount = assessments.filter((a) => a.verdict === 'ready').length
  const activePaths = paths.filter((p) => p.status === 'active').length

  const dimAvg = (key: keyof Assessment) =>
    assessments.length
      ? Math.round(assessments.reduce((s, a) => s + ((a[key] as number) ?? 0), 0) / assessments.length)
      : 0

  if (assessments.length === 0) {
    return (
      <Card variant="elevated" className="text-center py-16 space-y-4">
        <BarChart2 className="w-10 h-10 text-text-3 mx-auto" />
        <p className="text-text-2">No assessment data yet. Complete your first assessment to see reports.</p>
        <Link href="/assessments/new">
          <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Start Assessment
          </Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-text-2 text-sm mt-0.5">
            {assessments.length} assessment{assessments.length !== 1 ? 's' : ''} · {paths.length} transformation path{paths.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href={`/assessments/${latest?.id}`}>
          <Button variant="outline" size="sm" rightIcon={<FileText className="w-4 h-4" />}>
            Latest Report
          </Button>
        </Link>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Avg Score',      value: avgScore,                      suffix: '/100',                      color: 'text-brand-cyan'    },
          { label: 'Ready Verdicts', value: readyCount,                    suffix: ` of ${assessments.length}`, color: 'text-brand-emerald' },
          { label: 'Active Paths',   value: activePaths,                   suffix: '',                          color: 'text-brand-yellow'  },
          { label: 'Latest Score',   value: latest?.overall_score ?? 0,   suffix: '/100',                      color: 'text-brand-cyan'    },
        ].map((kpi) => (
          <Card key={kpi.label} variant="elevated" className="p-4 text-center space-y-1">
            <p className={`text-2xl font-bold font-mono ${kpi.color}`}>
              {kpi.value}<span className="text-sm text-text-3">{kpi.suffix}</span>
            </p>
            <p className="text-xs text-text-3">{kpi.label}</p>
          </Card>
        ))}
      </div>

      {/* Score ring + dimension averages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated" className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-text-1">Latest Assessment</p>
            {scoreDelta !== null && (
              <div className="flex items-center gap-1 text-xs text-text-3">
                <TrendIcon delta={scoreDelta} />
                <span className={scoreDelta > 0 ? 'text-brand-emerald' : scoreDelta < 0 ? 'text-brand-crimson' : 'text-text-3'}>
                  {scoreDelta > 0 ? '+' : ''}{scoreDelta} from previous
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
            <Ring
              value={latest.overall_score ?? 0}
              size={88}
              color={(latest.overall_score ?? 0) >= 65 ? 'emerald' : 'cyan'}
              label="Score"
            />
            <div className="flex-1 space-y-3">
              {[
                { label: 'Financial', value: latest.financial_score, color: 'emerald' as const },
                { label: 'Emotional', value: latest.emotional_score, color: 'yellow'  as const },
                { label: 'Timing',    value: latest.timing_score,    color: 'cyan'    as const },
              ].map((d) => (
                <div key={d.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-2">{d.label}</span>
                    <span className="font-mono text-text-1">{d.value ?? 0}</span>
                  </div>
                  <ProgressBar value={d.value ?? 0} max={100} color={d.color} size="sm" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Badge variant={verdictColor(latest.verdict)} size="sm">
              {latest.verdict === 'ready' ? 'Ready' : 'Not Yet Ready'}
            </Badge>
            <span className="text-xs text-text-3 font-mono capitalize">
              {latest.decision_type?.replace(/_/g, ' ')}
            </span>
          </div>
        </Card>

        <Card variant="elevated" className="p-5 space-y-4">
          <p className="text-sm font-semibold text-text-1">All-Time Dimension Averages</p>
          <p className="text-xs text-text-3">Based on {assessments.length} assessment{assessments.length !== 1 ? 's' : ''}</p>
          <div className="space-y-4">
            {[
              { label: 'Financial Readiness', value: dimAvg('financial_score'), color: 'emerald' as const, weight: '35%' },
              { label: 'Emotional Readiness', value: dimAvg('emotional_score'), color: 'yellow'  as const, weight: '35%' },
              { label: 'Timing Readiness',    value: dimAvg('timing_score'),    color: 'cyan'    as const, weight: '30%' },
            ].map((d) => (
              <div key={d.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-text-1 font-medium">{d.label}</span>
                    <span className="text-text-4 font-mono">{d.weight} weight</span>
                  </div>
                  <span className="font-mono font-bold text-text-1">{d.value}/100</span>
                </div>
                <ProgressBar value={d.value} max={100} color={d.color} />
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-surface-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-2">Average Overall Score</span>
              <span className="font-mono font-bold text-brand-cyan">{avgScore}/100</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Assessment history */}
      <Card variant="elevated">
        <div className="px-5 pt-4 pb-3 border-b border-surface-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-cyan" />
          <p className="text-sm font-semibold text-text-1">Assessment History</p>
        </div>
        <div className="divide-y divide-surface-3">
          {assessments.map((a, i) => {
            const delta = i < assessments.length - 1
              ? (a.overall_score ?? 0) - (assessments[i + 1].overall_score ?? 0)
              : null
            return (
              <Link
                key={a.id}
                href={`/assessments/${a.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-surface-2 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center w-10">
                    <p className="text-lg font-bold font-mono text-brand-cyan">{a.overall_score ?? 0}</p>
                    <p className="text-xs text-text-4">score</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-1 capitalize">
                      {a.decision_type?.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-text-3 font-mono">
                      {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {delta !== null && (
                    <div className="flex items-center gap-1 text-xs">
                      <TrendIcon delta={delta} />
                      <span className={delta > 0 ? 'text-brand-emerald' : delta < 0 ? 'text-brand-crimson' : 'text-text-3'}>
                        {delta > 0 ? '+' : ''}{delta}
                      </span>
                    </div>
                  )}
                  <Badge variant={verdictColor(a.verdict)} size="sm">
                    {a.verdict === 'ready' ? 'Ready' : 'Not Yet'}
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-text-4 group-hover:text-text-2 transition-colors" />
                </div>
              </Link>
            )
          })}
        </div>
      </Card>

      {/* Transformation paths */}
      {paths.length > 0 && (
        <Card variant="elevated">
          <div className="px-5 pt-4 pb-3 border-b border-surface-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-emerald" />
            <p className="text-sm font-semibold text-text-1">Transformation Paths</p>
          </div>
          <div className="divide-y divide-surface-3">
            {paths.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-text-1 capitalize">
                    {p.target_dimension ?? 'Overall'} improvement
                  </p>
                  <p className="text-xs text-text-3 font-mono">
                    {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {p.current_score != null && p.target_score != null && (
                    <span className="text-xs font-mono text-text-2">
                      {p.current_score} → {p.target_score}
                    </span>
                  )}
                  <Badge
                    variant={p.status === 'active' ? 'cyan' : p.status === 'completed' ? 'emerald' : 'default'}
                    size="sm"
                  >
                    {p.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex justify-center">
        <Link href="/assessments/new">
          <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Take Another Assessment
          </Button>
        </Link>
      </div>
    </div>
  )
}
