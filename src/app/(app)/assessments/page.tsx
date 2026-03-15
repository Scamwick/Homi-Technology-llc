'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Plus,
  Calendar,
  ArrowRight,
  Filter,
  ClipboardList,
  CheckCircle,
  Clock
} from 'lucide-react'

interface Assessment {
  id: string
  decision_type: string
  status: string
  financial_score: number | null
  emotional_score: number | null
  timing_score: number | null
  overall_score: number | null
  verdict: 'ready' | 'not_yet' | null
  created_at: string
  completed_at: string | null
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress'>('all')
  const supabase = createClient()

  useEffect(() => {
    async function fetchAssessments() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          console.error('Auth error:', userError)
          setError('Unable to authenticate. Please try logging in again.')
          return
        }

        const { data, error: fetchError } = await supabase
          .from('assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (fetchError) {
          console.error('Assessments fetch error:', fetchError)
          setError('Failed to load assessments.')
        } else if (data) {
          setAssessments(data)
        }
      } catch (err) {
        console.error('Assessments page error:', err)
        setError('Something went wrong loading your assessments.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssessments()
  }, [])

  const filteredAssessments = assessments.filter(a => {
    if (filter === 'all') return true
    return a.status === filter
  })

  const stats = {
    total: assessments.length,
    completed: assessments.filter(a => a.status === 'completed').length,
    ready: assessments.filter(a => a.verdict === 'ready').length,
    notYet: assessments.filter(a => a.verdict === 'not_yet').length,
  }

  if (isLoading) {
    return <AssessmentsSkeleton />
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 p-8">
        <Card>
          <div className="p-8 text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
            <p className="text-white/60 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Your Assessments</h1>
          <p className="text-white/60 mt-1">Track your decision readiness journey</p>
        </div>
        <Link href="/assessments/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Assessment
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.total} icon={ClipboardList} color="cyan" delay={0} />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle} color="emerald" delay={100} />
        <StatCard label="Ready" value={stats.ready} icon={CheckCircle} color="emerald" delay={200} />
        <StatCard label="Not Yet" value={stats.notYet} icon={Clock} color="yellow" delay={300} />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'completed', 'in_progress'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium transition-colors
              ${filter === f
                ? 'bg-brand-cyan text-surface-0'
                : 'bg-surface-2 text-text-2 hover:bg-surface-3'
              }
            `}
          >
            {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : 'Completed'}
          </button>
        ))}
      </div>

      {/* Assessments List */}
      {filteredAssessments.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <ClipboardList className="w-16 h-16 text-brand-cyan mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No assessments yet</h3>
            <p className="text-white/60 mb-6">Start your first assessment to discover your decision readiness</p>
            <Link href="/assessments/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Start Assessment
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAssessments.map((assessment, index) => (
            <Link key={assessment.id} href={`/assessments/${assessment.id}`}>
              <Card className="hover:border-brand-cyan/30 transition-colors cursor-pointer">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-2">
                      {assessment.status === 'completed' ? (
                        assessment.verdict === 'ready' ? (
                          <CheckCircle className="w-5 h-5 text-brand-emerald" />
                        ) : (
                          <Clock className="w-5 h-5 text-brand-yellow" />
                        )
                      ) : (
                        <Clock className="w-5 h-5 text-white/40" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {assessment.decision_type.replace('_', ' ')}
                      </h3>
                      <p className="text-white/40 text-sm">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(assessment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {assessment.status === 'completed' && assessment.verdict && (
                      <Badge variant={assessment.verdict === 'ready' ? 'success' : 'warning'}>
                        {assessment.verdict === 'ready' ? 'READY' : 'NOT YET'}
                      </Badge>
                    )}
                    {assessment.status === 'in_progress' && (
                      <Badge variant="default">In Progress</Badge>
                    )}
                    {assessment.overall_score !== null && (
                      <div className="text-right">
                        <span className="text-2xl font-bold text-white">{assessment.overall_score}</span>
                        <span className="text-white/40 text-sm">/100</span>
                      </div>
                    )}
                    <ArrowRight className="w-5 h-5 text-white/40" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color = 'cyan', delay }: {
  label: string
  value: number
  icon: React.ElementType
  color?: 'cyan' | 'emerald' | 'yellow'
  delay: number
}) {
  const colorClasses = {
    cyan: 'bg-brand-cyan/10 text-brand-cyan',
    emerald: 'bg-brand-emerald/10 text-brand-emerald',
    yellow: 'bg-brand-yellow/10 text-brand-yellow',
  }

  return (
    <Card>
      <div className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-white/60 text-sm">{label}</p>
        </div>
      </div>
    </Card>
  )
}

function AssessmentsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="h-8 w-48 bg-surface-2 rounded animate-pulse" />
      <div className="grid sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-surface-2 rounded-brand animate-pulse" />
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-surface-2 rounded-brand animate-pulse" />
        ))}
      </div>
    </div>
  )
}
