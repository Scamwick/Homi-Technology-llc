'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BehavioralGenome } from '@/components/panels/mindful/BehavioralGenome'
import { EmotionalHistory } from '@/components/panels/mindful/EmotionalHistory'
import { Spinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function MindfulPanelPage() {
  const [genome, setGenome] = useState<any>(null)
  const [assessments, setAssessments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch genome + assessment history in parallel
      const [genomeRes, { data: assessmentHistory }] = await Promise.all([
        fetch('/api/behavioral-genome'),
        supabase
          .from('assessments')
          .select('id, emotional_score, overall_score, verdict, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
      ])

      if (genomeRes.ok) {
        const d = await genomeRes.json()
        setGenome(d.genome)
      }

      setAssessments(assessmentHistory ?? [])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  // Build emotional history from assessment records
  const latestEmotional = assessments[0]?.emotional_score ?? 0
  const prevEmotional = assessments[1]?.emotional_score ?? latestEmotional
  const trend: 'rising' | 'stable' | 'falling' =
    latestEmotional > prevEmotional + 5 ? 'rising'
    : latestEmotional < prevEmotional - 5 ? 'falling'
    : 'stable'

  const checkIns = assessments.slice(0, 5).map((a) => ({
    id: a.id,
    date: new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    mood: a.emotional_score >= 70 ? 'hopeful' as const
      : a.emotional_score >= 55 ? 'determined' as const
      : a.emotional_score >= 40 ? 'cautious' as const
      : 'anxious' as const,
    confidence: a.emotional_score ?? 0,
    notes: `Assessment score: ${a.overall_score ?? 0}/100. Verdict: ${a.verdict ?? 'pending'}.`,
    trends: trend === 'rising' ? '↑ Confidence rising' : trend === 'falling' ? '↓ Confidence dipping' : '→ Stable',
  }))

  // Build genome display data
  const genomeData = genome
    ? {
        profile: genome.archetype ?? 'Decision Profile',
        description: genome.archetypeDescription ?? 'Your behavioral profile based on your decision history.',
        traits: genome.traits?.slice(0, 6).map((t: any) => ({
          label: t.name ?? t.label,
          value: t.score ?? t.value,
          colorKey: t.score >= 70 ? 'emerald' : t.score >= 50 ? 'cyan' : 'amber',
        })) ?? [],
        insights: genome.insights?.slice(0, 3) ?? [],
      }
    : {
        profile: 'Building Your Profile',
        description: 'Complete more assessments to develop your behavioral genome.',
        traits: [
          { label: 'Rationality',        value: 0,  colorKey: 'cyan'    as const },
          { label: 'Risk Tolerance',     value: 0,  colorKey: 'amber'   as const },
          { label: 'Patience',           value: 0,  colorKey: 'emerald' as const },
          { label: 'Impulsivity',        value: 0,  colorKey: 'yellow'  as const },
          { label: 'Adaptability',       value: 0,  colorKey: 'cyan'    as const },
          { label: 'Conviction Strength',value: 0,  colorKey: 'amber'   as const },
        ],
        insights: [],
      }

  if (assessments.length === 0 && !genome) {
    return (
      <Card variant="elevated" className="text-center py-16">
        <p className="text-text-2 mb-6">Complete an assessment to unlock Mindful Panels.</p>
        <Link href="/assessments/new">
          <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Start Assessment
          </Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <BehavioralGenome {...genomeData} />
      </div>
      <div>
        <EmotionalHistory
          moodScore={latestEmotional}
          trend={trend}
          recentCheckIns={checkIns}
          onStartCheckIn={() => window.location.href = '/assessments/new'}
        />
      </div>
    </div>
  )
}
