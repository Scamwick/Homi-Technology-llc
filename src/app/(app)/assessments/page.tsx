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
  XCircle,
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
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress'>('all')
  const supabase = createClient()

  useEffect(() => {
    async function fetchAssessments() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data } = await supabase
          .from('assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (data) {
          setAssessments(data)
        }
      }
      setIsLoading(false)
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
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-2 rounded w-1/3" />
          <div className="h-32 bg-surface-2 rounded" />
          <div className="h-64 bg-surface-2 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Your Assessments</h1>
          <p className="text-text-2">Track your decision readiness journey</p>
        </div>
        <Link href="/assessments/new">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            New Assessment
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total" value={stats.total} icon={ClipboardList} delay={0} />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle} delay={0.1} />
        <StatCard label="Ready" value={stats.ready} icon={CheckCircle} color="emerald" delay={0.2} />
        <StatCard label="Not Yet" value={stats.notYet} icon={Clock} color="yellow" delay={0.3} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-text-3" />
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
      </div>

      {/* Assessments List */}
      {filteredAssessments.length === 0 ? (
        <Card variant="elevated" padding="lg" className="text-center py-12">
          <ClipboardList className="w-12 h-12 text-text-3 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No assessments yet</h3>
          <p className="text-text-2 mb-6">Start your first assessment to discover your decision readiness</p>
          <Link href="/assessments/new">
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Start Assessment
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAssessments.map((assessment, index) => (
            <div
              key={assessment.id}
              className="animate-in fade-in slide-in-from-bottom"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Link href={`/assessments/${assessment.id}`}>
                <Card 
                  variant="interactive" 
                  padding="md"
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-12 h-12 rounded-brand flex items-center justify-center
                      ${assessment.status === 'completed'
                        ? assessment.verdict === 'ready'
                          ? 'bg-brand-emerald/10'
                          : 'bg-brand-yellow/10'
                        : 'bg-surface-2'
                      }
                    `}>
                      {assessment.status === 'completed' ? (
                        assessment.verdict === 'ready' ? (
                          <CheckCircle className="w-6 h-6 text-brand-emerald" />
                        ) : (
                          <Clock className="w-6 h-6 text-brand-yellow" />
                        )
                      ) : (
                        <ClipboardList className="w-6 h-6 text-text-3" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold capitalize">
                        {assessment.decision_type.replace('_', ' ')}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-text-3">
                        <Calendar className="w-3 h-3" />
                        {new Date(assessment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {assessment.status === 'completed' && assessment.verdict && (
                      <Badge 
                        variant={assessment.verdict === 'ready' ? 'emerald' : 'yellow'}
                      >
                        {assessment.verdict === 'ready' ? 'READY' : 'NOT YET'}
                      </Badge>
                    )}
                    {assessment.status === 'in_progress' && (
                      <Badge variant="default">In Progress</Badge>
                    )}
                    {assessment.overall_score !== null && (
                      <div className="text-right hidden sm:block">
                        <div className="text-2xl font-bold">{assessment.overall_score}</div>
                        <div className="text-xs text-text-3">/100</div>
                      </div>
                    )}
                    <ArrowRight className="w-5 h-5 text-text-3" />
                  </div>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color = 'cyan',
  delay
}: {
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
    <div
      className="animate-in fade-in slide-in-from-bottom"
      style={{ animationDelay: `${delay * 1000}ms` }}
    >
      <Card variant="elevated" padding="md">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-brand flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm text-text-3">{label}</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
