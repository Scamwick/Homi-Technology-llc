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
  Target,
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
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Fetch assessments
        const { data: assessmentData } = await supabase
          .from('assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (assessmentData) {
          setAssessments(assessmentData)
          setLatestAssessment(assessmentData[0] || null)
        }

        // Fetch active transformation path
        const { data: pathData } = await supabase
          .from('transformation_paths')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single()

        if (pathData) {
          setTransformationPath(pathData)
        }
      }

      setIsLoading(false)
    }

    fetchData()
  }, [])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  // Empty state - no assessments
  if (!latestAssessment) {
    return (
      <div className="max-w-4xl mx-auto">
        <div
          className="text-center py-20 animate-in fade-in slide-in-from-bottom duration-500"
        >
          <div className="w-20 h-20 bg-brand-cyan/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ClipboardList className="w-10 h-10 text-brand-cyan" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Welcome to HōMI</h1>
          <p className="text-text-2 mb-8 max-w-md mx-auto">
            You haven&apos;t taken any assessments yet. Start your first assessment 
            to discover your decision readiness.
          </p>
          <Link href="/assessments/new">
            <Button variant="primary" size="lg">
              Take Your First Assessment
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
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
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-text-2">
            {hasVerdict 
              ? `Your latest assessment: ${latestAssessment.verdict === 'ready' ? 'READY' : 'NOT YET'}`
              : 'Complete your assessment to see results'
            }
          </p>
        </div>
        <Link href="/assessments/new">
          <Button variant="primary">
            <ClipboardList className="w-4 h-4 mr-2" />
            New Assessment
          </Button>
        </Link>
      </div>

      {/* Score cards */}
      {hasVerdict && (
        <div className="grid sm:grid-cols-3 gap-4">
          <ScoreCard
            label="Financial Reality"
            score={latestAssessment.financial_score || 0}
            color="cyan"
            delay={0}
          />
          <ScoreCard
            label="Emotional Truth"
            score={latestAssessment.emotional_score || 0}
            color="emerald"
            delay={0.1}
          />
          <ScoreCard
            label="Perfect Timing"
            score={latestAssessment.timing_score || 0}
            color="yellow"
            delay={0.2}
          />
        </div>
      )}

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left column - Compass & Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Threshold Compass */}
          {hasVerdict && (
            <Card variant="elevated" padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Your Readiness Compass</h2>
                <Badge variant={isReady ? 'emerald' : 'yellow'}>
                  {isReady ? 'READY' : 'NOT YET'}
                </Badge>
              </div>
              <div className="flex justify-center py-4">
                <ThresholdCompass
                  financial={latestAssessment.financial_score || 0}
                  emotional={latestAssessment.emotional_score || 0}
                  timing={latestAssessment.timing_score || 0}
                  verdict={latestAssessment.verdict || undefined}
                  size="lg"
                  showLabels
                />
              </div>
              <div className="mt-6 text-center">
                <p className="text-text-2 text-sm">
                  Overall Score: <span className="text-text-1 font-bold">{latestAssessment.overall_score}/100</span>
                </p>
              </div>
            </Card>
          )}

          {/* Conditional content based on verdict */}
          {isReady ? (
            <ReadyContent />
          ) : (
            <NotYetContent 
              transformationPath={transformationPath}
              latestAssessment={latestAssessment}
            />
          )}
        </div>

        {/* Right column - Activity & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card variant="elevated" padding="lg">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/assessments/new">
                <Button variant="outline" fullWidth className="justify-start">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  New Assessment
                </Button>
              </Link>
              <Link href="/advisor">
                <Button variant="outline" fullWidth className="justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Ask AI Advisor
                </Button>
              </Link>
              <Link href="/transformation">
                <Button variant="outline" fullWidth className="justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Transformation
                </Button>
              </Link>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card variant="elevated" padding="lg">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {assessments.slice(0, 3).map((assessment) => (
                <Link
                  key={assessment.id}
                  href={`/assessments/${assessment.id}`}
                  className="flex items-center justify-between p-3 bg-surface-2 rounded-brand-sm hover:bg-surface-3 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm capitalize">
                      {assessment.decision_type.replace('_', ' ')}
                    </p>
                    <p className="text-text-3 text-xs">
                      {new Date(assessment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {assessment.verdict ? (
                    <Badge variant={assessment.verdict === 'ready' ? 'emerald' : 'yellow'} size="sm">
                      {assessment.verdict === 'ready' ? 'READY' : 'NOT YET'}
                    </Badge>
                  ) : (
                    <Badge variant="default" size="sm">In Progress</Badge>
                  )}
                </Link>
              ))}
            </div>
            {assessments.length > 3 && (
              <Link href="/assessments">
                <Button variant="ghost" fullWidth className="mt-3">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function ScoreCard({
  label,
  score,
  color,
  delay
}: {
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
    <div
      className="animate-in fade-in slide-in-from-bottom"
      style={{ animationDelay: `${delay * 1000}ms` }}
    >
      <Card 
        variant="elevated" 
        padding="md" 
        className={`border-l-4 ${colors[color]}`}
      >
        <p className="text-text-2 text-sm mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{Math.round(score)}</span>
          <span className="text-text-3 text-sm">/100</span>
        </div>
      </Card>
    </div>
  )
}

function ReadyContent() {
  return (
    <Card variant="glow" glowColor="#34d399" padding="lg">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-brand-emerald/10 rounded-brand flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-brand-emerald" />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">You&apos;re Ready!</h3>
          <p className="text-text-2 mb-4">
            Congratulations! Your assessment shows you&apos;re ready to proceed with confidence. 
            Here are your next steps:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Target className="w-4 h-4 text-brand-emerald" />
              Review your detailed results for specific recommendations
            </li>
            <li className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-emerald" />
              Chat with our AI Advisor for personalized guidance
            </li>
            <li className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-brand-emerald" />
              Download your PDF report to share with partners
            </li>
          </ul>
        </div>
      </div>
    </Card>
  )
}

function NotYetContent({ 
  transformationPath,
  latestAssessment 
}: { 
  transformationPath: TransformationPath | null
  latestAssessment: Assessment
}) {
  const completedActions = transformationPath?.action_items.filter(a => a.completed).length || 0
  const totalActions = transformationPath?.action_items.length || 0
  const progress = totalActions > 0 ? (completedActions / totalActions) * 100 : 0

  return (
    <Card variant="glow" glowColor="#facc15" padding="lg">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-brand-yellow/10 rounded-brand flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-6 h-6 text-brand-yellow" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Not Yet Ready — And That&apos;s Okay</h3>
          <p className="text-text-2 mb-4">
            Your assessment shows areas that need attention before you&apos;re ready to proceed. 
            Follow your transformation path to build readiness.
          </p>
          
          {transformationPath && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-2">Transformation Progress</span>
                <span className="font-medium">{completedActions}/{totalActions} actions</span>
              </div>
              <ProgressBar value={progress} color="yellow" />
              
              <div className="flex items-center gap-4 pt-2">
                <Link href="/transformation">
                  <Button variant="primary" size="sm">
                    Continue Path
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href={`/assessments/${latestAssessment.id}`}>
                  <Button variant="ghost" size="sm">
                    View Results
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
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
