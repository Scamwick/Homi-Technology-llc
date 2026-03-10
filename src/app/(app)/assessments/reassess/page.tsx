'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Ring } from '@/components/ui/Ring'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Spinner } from '@/components/ui/Spinner'
import { TrendingUp, ArrowRight, RotateCcw, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ReassessPage() {
  const [assessments, setAssessments] = useState<any[]>([])
  const [activePath, setActivePath] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

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
          .limit(5),
        supabase
          .from('transformation_paths')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single(),
      ])

      setAssessments(aData ?? [])
      setActivePath(pData)
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

  const daysSince = latest
    ? Math.floor((Date.now() - new Date(latest.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const shouldReassess = !latest
    || daysSince === null
    || daysSince >= 30
    || (activePath && (latest.overall_score ?? 0) < (activePath.target_score ?? 65))

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <RotateCcw className="w-6 h-6 text-brand-cyan" />
          Reassess
        </h1>
        <p className="text-text-2 text-sm mt-0.5">Track your progress by taking an updated assessment.</p>
      </div>

      {/* Current standing */}
      {latest && (
        <Card variant="elevated" className="p-5">
          <p className="text-xs font-mono text-text-4 uppercase tracking-wider mb-4">Last Assessment</p>
          <div className="flex items-center gap-6">
            <Ring
              value={latest.overall_score ?? 0}
              size={80}
              color={(latest.overall_score ?? 0) >= 65 ? 'emerald' : 'cyan'}
              label="Score"
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={(latest.overall_score ?? 0) >= 65 ? 'emerald' : 'yellow'} size="sm">
                  {latest.verdict === 'ready' ? 'Ready' : 'Not Yet Ready'}
                </Badge>
                <span className="text-xs text-text-3 font-mono capitalize">
                  {latest.decision_type?.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-text-3">
                {daysSince === 0 ? 'Today' : `${daysSince} day${daysSince !== 1 ? 's' : ''} ago`}
                {scoreDelta !== null && (
                  <span className={`ml-2 font-mono ${scoreDelta > 0 ? 'text-brand-emerald' : scoreDelta < 0 ? 'text-brand-crimson' : 'text-text-3'}`}>
                    {scoreDelta > 0 ? '+' : ''}{scoreDelta} from previous
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Dimension bars */}
          <div className="mt-4 space-y-2">
            {[
              { label: 'Financial', value: latest.financial_score, color: 'emerald' as const },
              { label: 'Emotional', value: latest.emotional_score, color: 'yellow'  as const },
              { label: 'Timing',    value: latest.timing_score,    color: 'cyan'    as const },
            ].map((d) => (
              <div key={d.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-3">{d.label}</span>
                  <span className="font-mono text-text-2">{d.value ?? 0}</span>
                </div>
                <ProgressBar value={d.value ?? 0} max={100} color={d.color} size="sm" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Transformation path target */}
      {activePath && (
        <Card variant="elevated" className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-emerald" />
            <p className="text-sm font-semibold text-text-1">Active Transformation Target</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-2 capitalize">
                {activePath.target_dimension ?? 'Overall'} — target score {activePath.target_score ?? 65}
              </p>
              <p className="text-xs text-text-3 mt-0.5">
                Current: {activePath.current_score ?? latest?.overall_score ?? 0} ·{' '}
                Gap: {(activePath.target_score ?? 65) - (activePath.current_score ?? latest?.overall_score ?? 0)} points
              </p>
            </div>
            <Badge
              variant={(latest?.overall_score ?? 0) >= (activePath.target_score ?? 65) ? 'emerald' : 'yellow'}
              size="sm"
            >
              {(latest?.overall_score ?? 0) >= (activePath.target_score ?? 65) ? 'Target Hit' : 'In Progress'}
            </Badge>
          </div>
          <ProgressBar
            value={latest?.overall_score ?? 0}
            max={activePath.target_score ?? 65}
            color={(latest?.overall_score ?? 0) >= (activePath.target_score ?? 65) ? 'emerald' : 'cyan'}
          />
        </Card>
      )}

      {/* Readiness recommendation */}
      <Card variant="elevated" className={`p-5 border ${shouldReassess ? 'border-brand-cyan/30 bg-brand-cyan/5' : 'border-brand-emerald/30 bg-brand-emerald/5'}`}>
        <div className="flex items-start gap-3">
          {shouldReassess
            ? <RotateCcw className="w-5 h-5 text-brand-cyan mt-0.5" />
            : <CheckCircle2 className="w-5 h-5 text-brand-emerald mt-0.5" />
          }
          <div>
            <p className="text-sm font-semibold text-text-1">
              {shouldReassess ? 'Time to reassess' : 'Recent assessment on file'}
            </p>
            <p className="text-sm text-text-2 mt-0.5">
              {!latest
                ? "You haven't completed an assessment yet. Start one to establish your baseline."
                : shouldReassess && daysSince !== null && daysSince >= 30
                ? `It's been ${daysSince} days since your last assessment. A lot can change — reassess to see your current readiness.`
                : shouldReassess && activePath
                ? 'You have an active transformation path. Reassess to measure your progress toward your target score.'
                : `Your last assessment was ${daysSince} day${daysSince !== 1 ? 's' : ''} ago. You're up to date.`
              }
            </p>
          </div>
        </div>
      </Card>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/assessments/new" className="flex-1">
          <Button variant="primary" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
            {latest ? `Reassess: ${latest.decision_type?.replace(/_/g, ' ')}` : 'Start First Assessment'}
          </Button>
        </Link>
        {assessments.length > 0 && (
          <Link href="/reports">
            <Button variant="outline" rightIcon={<TrendingUp className="w-4 h-4" />}>
              View History
            </Button>
          </Link>
        )}
      </div>

      {/* Past assessments */}
      {assessments.length > 1 && (
        <Card variant="elevated">
          <div className="px-5 pt-4 pb-2 border-b border-surface-3">
            <p className="text-xs font-mono text-text-4 uppercase tracking-wider">Score History</p>
          </div>
          <div className="divide-y divide-surface-3">
            {assessments.map((a, i) => (
              <Link key={a.id} href={`/assessments/${a.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-surface-2 transition-colors group">
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold font-mono ${i === 0 ? 'text-brand-cyan' : 'text-text-2'}`}>
                    {a.overall_score ?? 0}
                  </span>
                  <div>
                    <p className="text-sm text-text-1 capitalize">{a.decision_type?.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-text-3 font-mono">
                      {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {i === 0 && <Badge variant="cyan" size="sm">Latest</Badge>}
                  <Badge variant={a.verdict === 'ready' ? 'emerald' : 'yellow'} size="sm">
                    {a.verdict === 'ready' ? 'Ready' : 'Not Yet'}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
