'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ThresholdCompass } from '@/components/brand/ThresholdCompass'
import { 
  ArrowLeft, 
  Download, 
  MessageSquare, 
  TrendingUp,
  RefreshCw,
  Share2,
  CheckCircle,
  AlertCircle,
  Target
} from 'lucide-react'
import { DIMENSION_COLORS, DIMENSION_LABELS, DimensionType } from '@/types/scoring'

export default function AssessmentResultsPage() {
  const params = useParams()
  const assessmentId = params.id as string
  const supabase = createClient()

  const [assessment, setAssessment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAssessment() {
      const { data } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single()

      if (data) {
        setAssessment(data)
      }
      setIsLoading(false)
    }

    fetchAssessment()
  }, [assessmentId])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-2 rounded w-1/3" />
          <div className="h-64 bg-surface-2 rounded" />
        </div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-text-2">Assessment not found.</p>
        <Link href="/assessments">
          <Button variant="primary" className="mt-4">
            Back to Assessments
          </Button>
        </Link>
      </div>
    )
  }

  const isReady = assessment.verdict === 'ready'
  const financialScore = assessment.financial_score || 0
  const emotionalScore = assessment.emotional_score || 0
  const timingScore = assessment.timing_score || 0
  const overallScore = assessment.overall_score || 0

  const insights = assessment.insights || {}

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/assessments">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assessments
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Verdict Banner */}
      <div
        className={`
          p-6 rounded-brand-lg mb-8 text-center animate-in fade-in duration-500
          ${isReady
            ? 'bg-brand-emerald/10 border border-brand-emerald/30'
            : 'bg-brand-yellow/10 border border-brand-yellow/30'
          }
        `}
      >
        <div className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-bold mb-4
          ${isReady 
            ? 'bg-brand-emerald text-surface-0' 
            : 'bg-brand-yellow text-surface-0'
          }
        `}>
          {isReady ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {isReady ? 'READY' : 'NOT YET'}
        </div>
        <p className="text-text-2 max-w-xl mx-auto">
          {insights.executive_summary || 
            `Your assessment shows you're ${isReady ? 'ready' : 'not yet ready'} to proceed.`}
        </p>
      </div>

      {/* Compass and Scores */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <Card variant="elevated" padding="lg">
          <h2 className="text-lg font-semibold mb-6 text-center">Your Readiness Compass</h2>
          <div className="flex justify-center">
            <ThresholdCompass
              financial={financialScore}
              emotional={emotionalScore}
              timing={timingScore}
              verdict={assessment.verdict}
              size="md"
              showLabels
            />
          </div>
          <div className="mt-6 text-center">
            <p className="text-text-2">
              Overall Score: <span className="text-text-1 font-bold text-2xl">{overallScore}</span>/100
            </p>
          </div>
        </Card>

        <div className="space-y-4">
          <ScoreBreakdown
            dimension="financial"
            score={financialScore}
            insight={insights.financial_insight}
          />
          <ScoreBreakdown
            dimension="emotional"
            score={emotionalScore}
            insight={insights.emotional_insight}
          />
          <ScoreBreakdown
            dimension="timing"
            score={timingScore}
            insight={insights.timing_insight}
          />
        </div>
      </div>

      {/* Recommendations */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <Card variant="elevated" padding="lg" className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-brand-cyan" />
            <h2 className="text-lg font-semibold">Recommendations</h2>
          </div>
          <ul className="space-y-3">
            {insights.recommendations.map((rec: string, index: number) => (
              <li
                key={index}
                className="flex items-start gap-3 animate-in fade-in slide-in-from-left"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="w-6 h-6 bg-brand-cyan/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-brand-cyan text-sm font-medium">{index + 1}</span>
                </span>
                <span className="text-text-2">{rec}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {isReady ? (
          <>
            <Link href="/advisor">
              <Button variant="primary" size="lg">
                <MessageSquare className="w-5 h-5 mr-2" />
                Talk to AI Advisor
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              <Download className="w-5 h-5 mr-2" />
              Download Report
            </Button>
          </>
        ) : (
          <>
            <Link href="/transformation">
              <Button variant="primary" size="lg">
                <TrendingUp className="w-5 h-5 mr-2" />
                Start Transformation Path
              </Button>
            </Link>
            <Link href="/assessments/new">
              <Button variant="outline" size="lg">
                <RefreshCw className="w-5 h-5 mr-2" />
                Retake Assessment
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

function ScoreBreakdown({
  dimension,
  score,
  insight,
}: {
  dimension: DimensionType
  score: number
  insight?: string
}) {
  const color = DIMENSION_COLORS[dimension]
  const label = DIMENSION_LABELS[dimension]

  let status = 'Needs Work'
  let badgeVariant: 'default' | 'cyan' | 'red' | 'yellow' | 'emerald' = 'default'

  if (score >= 80) {
    status = 'Excellent'
    badgeVariant = 'emerald'
  } else if (score >= 65) {
    status = 'Very Good'
    badgeVariant = 'emerald'
  } else if (score >= 50) {
    status = 'Fair'
    badgeVariant = 'yellow'
  } else {
    status = 'Needs Work'
    badgeVariant = 'red'
  }

  return (
    <Card variant="default" padding="md" className="border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold" style={{ color }}>{score}</span>
          <Badge variant={badgeVariant} size="sm">
            {status}
          </Badge>
        </div>
      </div>
      <ProgressBar value={score} color={color} size="sm" />
      {insight && (
        <p className="text-text-2 text-sm mt-3">{insight}</p>
      )}
    </Card>
  )
}
