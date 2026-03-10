'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Ring } from '@/components/ui/Ring'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Brain, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

const QUESTIONS = [
  { id: 'anxiety',    label: 'How anxious do you feel about this decision?',    invert: true  },
  { id: 'confidence', label: 'How confident are you in your decision?',          invert: false },
  { id: 'alignment',  label: 'How aligned is this with your long-term goals?',   invert: false },
  { id: 'pressure',   label: 'How much external pressure are you feeling?',      invert: true  },
  { id: 'vision',     label: 'How clear is your vision for what you want?',      invert: false },
  { id: 'prepared',   label: 'How emotionally prepared are you for this process?', invert: false },
]

const SCALE = [1, 2, 3, 4, 5]
const SCALE_LABELS: Record<number, string> = { 1: 'Not at all', 3: 'Moderate', 5: 'Very much' }

function toScore(answers: Record<string, number>): number {
  const entries = Object.entries(answers)
  if (entries.length === 0) return 0
  const sum = entries.reduce((acc, [id, val]) => {
    const q = QUESTIONS.find((q) => q.id === id)
    return acc + (q?.invert ? 6 - val : val)
  }, 0)
  return Math.round((sum / (entries.length * 5)) * 100)
}

function insight(score: number) {
  if (score >= 75) return { label: 'High Readiness', variant: 'emerald' as const, text: 'Strong emotional alignment and clarity. Your mindset is well-prepared for this decision.' }
  if (score >= 50) return { label: 'Medium Readiness', variant: 'yellow' as const, text: 'Good foundation but some areas need attention. Consider addressing uncertainty before committing.' }
  return { label: 'Low Readiness', variant: 'red' as const, text: 'Significant emotional hesitation detected. Take time to reflect and seek support before proceeding.' }
}

function ringColor(score: number): 'emerald' | 'yellow' | 'amber' | 'crimson' {
  if (score >= 75) return 'emerald'
  if (score >= 50) return 'yellow'
  if (score >= 35) return 'amber'
  return 'crimson'
}

export default function EmotionalPage() {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const score        = useMemo(() => toScore(answers), [answers])
  const answeredCount = Object.keys(answers).length
  const complete      = answeredCount === QUESTIONS.length
  const ins           = insight(score)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="w-6 h-6 text-brand-cyan" />
        <h1 className="text-xl font-semibold text-text-1">Emotional Deep-Dive</h1>
        <Badge variant="default" size="sm">{answeredCount}/{QUESTIONS.length} answered</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Questions */}
        <div className="space-y-4">
          {QUESTIONS.map((q) => (
            <Card key={q.id} variant="elevated" className="space-y-3">
              <p className="text-sm font-medium text-text-1">{q.label}</p>
              <div className="flex gap-2">
                {SCALE.map((v) => (
                  <button
                    key={v}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: v }))}
                    className={cn(
                      'flex-1 py-2 rounded-brand-sm border text-sm font-semibold transition-all',
                      answers[q.id] === v
                        ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan'
                        : 'border-surface-3 bg-surface-2 text-text-3 hover:border-brand-cyan/40'
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-text-4">
                <span>{SCALE_LABELS[1]}</span>
                <span>{SCALE_LABELS[3]}</span>
                <span>{SCALE_LABELS[5]}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Live score */}
        <div className="space-y-4 lg:sticky lg:top-6">
          <Card variant="elevated" className="space-y-4 text-center">
            <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide font-mono">Live Score</h3>
            <Ring value={score} size={96} color={ringColor(score)} label="Emotional" className="mx-auto" />
            <Badge variant={ins.variant} size="sm">{ins.label}</Badge>
            {answeredCount > 0 && (
              <p className="text-sm text-text-2 text-left">{ins.text}</p>
            )}
          </Card>

          {/* Dimension bars */}
          {answeredCount > 0 && (
            <Card variant="elevated" className="space-y-3">
              <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide font-mono">Breakdown</h3>
              {QUESTIONS.map((q) => {
                const raw = answers[q.id]
                if (!raw) return null
                const val = Math.round(((q.invert ? 6 - raw : raw) / 5) * 100)
                return (
                  <div key={q.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-2">{q.id.charAt(0).toUpperCase() + q.id.slice(1)}</span>
                      <span className="text-text-1 font-semibold">{val}</span>
                    </div>
                    <ProgressBar value={val} color={val >= 70 ? 'emerald' : val >= 50 ? 'cyan' : 'yellow'} size="sm" />
                  </div>
                )
              })}
            </Card>
          )}

          {complete && !submitted && (
            <Button
              variant="primary"
              className="w-full"
              onClick={() => setSubmitted(true)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Save Emotional Profile
            </Button>
          )}

          {submitted && (
            <Card variant="elevated" className="text-center space-y-2">
              <p className="text-brand-emerald text-sm font-medium">Profile saved.</p>
              <Link href="/assessments/new">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Start Full Assessment
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
