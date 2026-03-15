'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ThresholdCompass } from '@/components/brand/ThresholdCompass'
import {
  ClipboardList,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Target
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
}

interface TransformationPath {
  id: string
  status: string
  action_items: Array<{
    id: string
    title: string
    completed: boolean
  }>
  milestones: Array<{
    id: string
    title: string
    achieved: boolean
  }>
}

export default function DashboardPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [latestAssessment, setLatestAssessment] = useState<Assessment | null>(null)
  const [transformationPath, setTransformationPath] = useState<TransformationPath | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          console.error('Auth error:', userError)
          setError('Unable to authenticate. Please try logging in again.')
          return
        }

        // Fetch assessments
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (assessmentError) {
          console.error('Assessment fetch error:', assessmentError)
        } else if (assessmentData) {
          setAssessments(assessmentData)
          setLatestAssessment(assessmentData[0] || null)
        }

        // Fetch active transformation path
        const { data: pathData, error: pathError } = await supabase
          .from('transformation_paths')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single()

        if (pathError) {
          console.error('Path fetch error:', pathError)
        } else if (pathData) {
          setTransformationPath(pathData)
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
        setError('Something went wrong loading your dashboard.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return <DashboardSkeleton />
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

  // Empty state - no assessments
  if (!latestAssessment) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 p-8">
        <Card>
          <div className="p-12 text-center">
            <ClipboardList className="w-16 h-16 text-brand-cyan mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to HoMI</h1>
            <p className="text-white/60 mb-6">You haven't taken any assessments yet. Start your first assessment to discover your decision readiness.</p>
            <Link href="/assessments/new">
              <Button size="lg">
                <ClipboardList className="w-5 h-5 mr-2" />
                Take Your First Assessment
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const hasVerdict = latestAssessment.verdict !== null
  const isReady = latestAssessment.verdict === 'ready'

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-white/60 mt-1">
            {hasVerdict
              ? `Your latest assessment: ${latestAssessment.verdict === 'ready' ? 'READY' : 'NOT YET'}`
              : 'Complete your assessment to see results'
            }
          </p>
        </div>
        <Link href="/assessments/new">
          <Button>
            <ClipboardList className="w-4 h-4 mr-2" />
            New Assessment
          </Button>
        </Link>
      </div>

      {/* Score cards */}
      {hasVerdict && (
        <div className="grid sm:grid-cols-3 gap-4">
          <ScoreCard label="Financial" score={latestAssessment.financial_score || 0} color="cyan" delay={0} />
          <ScoreCard label="Emotional" score={latestAssessment.emotional_score || 0} color="emerald" delay={100} />
          <ScoreCard label="Timing" score={latestAssessment.timing_score || 0} color="yellow" delay={200} />
        </div>
      )}

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left column - Compass & Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Threshold Compass */}
          {hasVerdict && (
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Your Readiness Compass</h2>
                <div className="flex items-center justify-center mb-4">
                  <ThresholdCompass score={latestAssessment.overall_score || 0} />
                </div>
                <div className="text-center">
                  <Badge variant={isReady ? 'success' : 'warning'}>
                    {isReady ? 'READY' : 'NOT YET'}
                  </Badge>
                  <p className="text-white/60 mt-2">
                    Overall Score: <span className="text-white font-semibold">{latestAssessment.overall_score}/100</span>
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Conditional content based on verdict */}
          {isReady ? (
            <ReadyContent />
          ) : (
            <NotYetContent transformationPath={transformationPath} latestAssessment={latestAssessment} />
          )}
        </div>

        {/* Right column - Activity & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/assessments/new" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <ClipboardList className="w-4 h-4 mr-2" />
                    New Assessment
                  </Button>
                </Link>
                <Link href="/advisor" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Ask AI Advisor
                  </Button>
                </Link>
                <Link href="/transformation" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Transformation
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {assessments.slice(0, 3).map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between p-3 bg-surface-2 rounded-brand">
                    <div>
                      <p className="text-white text-sm font-medium">
                        {assessment.decision_type.replace('_', ' ')}
                      </p>
                      <p className="text-white/40 text-xs">
                        {new Date(assessment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      {assessment.verdict ? (
                        <Badge variant={assessment.verdict === 'ready' ? 'success' : 'warning'}>
                          {assessment.verdict === 'ready' ? 'READY' : 'NOT YET'}
                        </Badge>
                      ) : (
                        <Badge variant="default">In Progress</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {assessments.length > 3 && (
                <Link href="/assessments" className="block mt-4">
                  <Button variant="ghost" className="w-full">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ScoreCard({ label, score, color, delay }: {
  label: string
  score: number
  color: 'cyan' | 'emerald' | 'yellow'
  delay: number
}) {
  const colors = {
    cyan: 'border-l-brand-cyan',
    emerald: 'border-l-brand-emerald',
    yellow: 'border-l-brand-yellow',
  }

  return (
    <Card className={`border-l-4 ${colors[color]}`}>
      <div className="p-4">
        <p className="text-white/60 text-sm">{label}</p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-bold text-white">{Math.round(score)}</span>
          <span className="text-white/40 text-sm">/100</span>
        </div>
        <ProgressBar value={score} className="mt-2" />
      </div>
    </Card>
  )
}

function ReadyContent() {
  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-brand-cyan" />
          <h3 className="text-lg font-semibold text-white">You're Ready!</h3>
        </div>
        <p className="text-white/60 mb-4">Congratulations! Your assessment shows you're ready to proceed with confidence. Here are your next steps:</p>
        <ul className="space-y-2 text-white/80">
          <li className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-brand-cyan" />
            Review your detailed results for specific recommendations
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-brand-cyan" />
            Chat with our AI Advisor for personalized guidance
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-brand-cyan" />
            Download your PDF report to share with partners
          </li>
        </ul>
      </div>
    </Card>
  )
}

function NotYetContent({ transformationPath, latestAssessment }: {
  transformationPath: TransformationPath | null
  latestAssessment: Assessment
}) {
  const completedActions = transformationPath?.action_items.filter(a => a.completed).length || 0
  const totalActions = transformationPath?.action_items.length || 0
  const progress = totalActions > 0 ? (completedActions / totalActions) * 100 : 0

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-brand-yellow" />
          <h3 className="text-lg font-semibold text-white">Not Yet Ready — And That's Okay</h3>
        </div>
        <p className="text-white/60 mb-4">Your assessment shows areas that need attention before you're ready to proceed. Follow your transformation path to build readiness.</p>
        {transformationPath && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Transformation Progress</span>
              <span className="text-white text-sm font-medium">{completedActions}/{totalActions} actions</span>
            </div>
            <ProgressBar value={progress} />
            <div className="flex gap-3 mt-4">
              <Link href="/transformation">
                <Button size="sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Continue Path
                </Button>
              </Link>
              <Link href="/assessments">
                <Button variant="outline" size="sm">View Results</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="h-8 w-48 bg-surface-2 rounded animate-pulse" />
      <div className="grid sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-surface-2 rounded-brand animate-pulse" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-96 bg-surface-2 rounded-brand animate-pulse" />
        <div className="space-y-4">
          <div className="h-48 bg-surface-2 rounded-brand animate-pulse" />
          <div className="h-48 bg-surface-2 rounded-brand animate-pulse" />
        </div>
      </div>
    </div>
  )
}
