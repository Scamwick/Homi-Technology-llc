'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Spinner } from '@/components/ui/Spinner'
import { Fingerprint, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Snapshot {
  date: string
  score: number
  label: string
}

export default function FingerprintPage() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [dimensions, setDimensions] = useState<{ label: string; value: number; color: 'cyan' | 'emerald' | 'yellow' }[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('assessments')
        .select('overall_score, emotional_score, financial_score, timing_score, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(8)
      if (data && data.length > 0) {
        setSnapshots(data.map((a, i) => ({
          date: new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          score: a.overall_score ?? 0,
          label: i === data.length - 1 ? 'Current' : `Assessment ${i + 1}`,
        })))
        const latest = data[data.length - 1]
        setDimensions([
          { label: 'Emotional',  value: latest.emotional_score  ?? 0, color: 'cyan'    },
          { label: 'Financial',  value: latest.financial_score  ?? 0, color: 'emerald' },
          { label: 'Timing',     value: latest.timing_score     ?? 0, color: 'yellow'  },
          { label: 'Overall',    value: latest.overall_score    ?? 0, color: 'cyan'    },
        ])
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>

  if (snapshots.length === 0) {
    return (
      <Card variant="elevated" className="text-center py-16 space-y-4">
        <Fingerprint className="w-10 h-10 text-text-4 mx-auto" />
        <p className="text-text-2">Complete assessments to build your Decision Fingerprint.</p>
        <Link href="/assessments/new">
          <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>Start Assessment</Button>
        </Link>
      </Card>
    )
  }

  const scores  = snapshots.map((s) => s.score)
  const latest  = scores[scores.length - 1]
  const prev    = scores.length > 1 ? scores[scores.length - 2] : latest
  const delta   = latest - prev
  const trend   = delta > 2 ? 'up' : delta < -2 ? 'down' : 'stable'
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  // SVG sparkline
  const W = 500; const H = 120
  const min = Math.min(...scores); const max = Math.max(...scores)
  const range = max - min || 1
  const points = scores.map((s, i) => {
    const x = (i / Math.max(scores.length - 1, 1)) * (W - 40) + 20
    const y = H - 20 - ((s - min) / range) * (H - 40)
    return `${x},${y}`
  }).join(' ')

  const patterns = []
  if (trend === 'up')   patterns.push('Steady upward trend — your decisions are getting clearer over time.')
  if (trend === 'down') patterns.push('Recent dip detected — emotional or timing factors may be at play.')
  if (snapshots.length >= 3) patterns.push(`Tracked ${snapshots.length} assessments — ${latest >= 65 ? 'above readiness threshold' : 'building toward readiness'}.`)
  if (latest >= 70) patterns.push('Current score is in the strong readiness zone (70+).')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Fingerprint className="w-6 h-6 text-brand-cyan" />
          <h1 className="text-xl font-semibold text-text-1">Decision Fingerprint</h1>
        </div>
        <div className="flex items-center gap-2">
          <TrendIcon className={`w-4 h-4 ${trend === 'up' ? 'text-brand-emerald' : trend === 'down' ? 'text-brand-crimson' : 'text-brand-yellow'}`} />
          <Badge variant={trend === 'up' ? 'emerald' : trend === 'down' ? 'red' : 'yellow'} size="sm">
            {trend === 'up' ? `+${delta} pts` : trend === 'down' ? `${delta} pts` : 'Stable'}
          </Badge>
        </div>
      </div>

      {/* Score chart */}
      <Card variant="elevated" className="space-y-3">
        <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide font-mono">Score History</h3>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 120 }}>
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline points={points} fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {scores.map((s, i) => {
            const x = (i / Math.max(scores.length - 1, 1)) * (W - 40) + 20
            const y = H - 20 - ((s - min) / range) * (H - 40)
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="4" fill="#22d3ee" />
                <text x={x} y={H - 2} textAnchor="middle" fontSize="9" fill="#64748b">{snapshots[i].date}</text>
                <text x={x} y={y - 8} textAnchor="middle" fontSize="10" fill="#e2e8f0" fontWeight="600">{s}</text>
              </g>
            )
          })}
        </svg>
      </Card>

      {/* Dimensions */}
      <Card variant="elevated" className="space-y-3">
        <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide font-mono">Current Dimensions</h3>
        {dimensions.map((d) => (
          <div key={d.label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-text-2">{d.label}</span>
              <span className="text-text-1 font-semibold">{d.value}</span>
            </div>
            <ProgressBar value={d.value} color={d.color} size="sm" />
          </div>
        ))}
      </Card>

      {/* Patterns */}
      {patterns.length > 0 && (
        <Card variant="elevated" className="space-y-2">
          <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide font-mono">Patterns Detected</h3>
          {patterns.map((p, i) => (
            <div key={i} className="flex gap-2 text-sm text-text-2">
              <span className="text-brand-cyan flex-shrink-0">›</span>
              {p}
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
