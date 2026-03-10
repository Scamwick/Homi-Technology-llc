'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PanelCard } from '@/components/panels/PanelCard'
import { Badge } from '@/components/ui/Badge'
import { Ring } from '@/components/ui/Ring'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { Users, Globe, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const LIVE_FEED = [
  { city: 'Austin, TX',    score: 81, outcome: 'Purchased',   variant: 'emerald' as const },
  { city: 'Denver, CO',    score: 68, outcome: 'Searching',   variant: 'default' as const },
  { city: 'Nashville, TN', score: 74, outcome: 'Offer made',  variant: 'yellow'  as const },
  { city: 'Phoenix, AZ',   score: 79, outcome: 'Purchased',   variant: 'emerald' as const },
]

const NETWORK_STATS = [
  { value: '50k+', label: 'Assessments completed', color: 'text-brand-cyan'    },
  { value: '127',  label: 'Markets tracked',        color: 'text-brand-emerald' },
  { value: '94%',  label: 'Prediction accuracy',    color: 'text-brand-yellow'  },
]

export default function NetworkPanelPage() {
  const [assessment, setAssessment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('assessments')
        .select('id, overall_score, verdict, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      setAssessment(data)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>

  if (!assessment) {
    return (
      <Card variant="elevated" className="text-center py-16 space-y-4">
        <p className="text-text-2">Complete an assessment to unlock Network Panels.</p>
        <Link href="/assessments/new">
          <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>Start Assessment</Button>
        </Link>
      </Card>
    )
  }

  // Percentile = estimated position within network
  const percentile = Math.min(99, Math.round((assessment.overall_score ?? 0) * 1.1))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Your network position */}
      <PanelCard
        title="Your Network Position"
        description="How you rank among HōMI buyers in your area."
        icon={<Users className="w-4 h-4" />}
        accentColor={(assessment.overall_score ?? 0) >= 65 ? 'emerald' : 'cyan'}
      >
        <div className="flex items-center gap-5">
          <Ring
            value={percentile}
            size={80}
            color={(assessment.overall_score ?? 0) >= 65 ? 'emerald' : 'cyan'}
            label="Percentile"
          />
          <div className="space-y-2">
            <p className="text-sm text-text-1">
              Top <span className="font-bold text-brand-cyan">{100 - percentile}%</span> of buyers
            </p>
            <Badge variant={(assessment.overall_score ?? 0) >= 65 ? 'emerald' : 'yellow'} size="sm">
              {(assessment.overall_score ?? 0) >= 65 ? 'Strong Position' : 'Building Position'}
            </Badge>
            <p className="text-xs text-text-3 font-mono">Score: {assessment.overall_score ?? 0}/100</p>
          </div>
        </div>
      </PanelCard>

      {/* Network stats */}
      <PanelCard title="Network Intelligence" icon={<Globe className="w-4 h-4" />}>
        <div className="space-y-3">
          {NETWORK_STATS.map((s) => (
            <div key={s.label} className="flex items-center justify-between p-2 rounded-brand-sm border border-surface-3 bg-surface-2">
              <span className="text-xs text-text-2">{s.label}</span>
              <span className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>
      </PanelCard>

      {/* Live feed */}
      <PanelCard
        title="Live Network Activity"
        description="Anonymous buyer outcomes across the HōMI network."
        icon={<TrendingUp className="w-4 h-4" />}
        className="lg:col-span-2"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {LIVE_FEED.map((f) => (
            <div key={f.city} className="p-3 rounded-brand-sm border border-surface-3 bg-surface-2 space-y-2">
              <p className="text-xs font-medium text-text-1">{f.city}</p>
              <p className="text-xs text-text-3 font-mono">Score: {f.score}</p>
              <Badge variant={f.variant} size="sm">{f.outcome}</Badge>
            </div>
          ))}
        </div>
      </PanelCard>
    </div>
  )
}
