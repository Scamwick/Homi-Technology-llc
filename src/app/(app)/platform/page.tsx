import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Ring } from '@/components/ui/Ring'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Brain, DollarSign, TrendingUp, ArrowRight, Layers } from 'lucide-react'
import Link from 'next/link'

const FEATURES = [
  { icon: Brain,      title: 'Emotional Readiness', desc: 'Understand how your emotional state impacts decision-making before you sign.',          color: 'text-brand-cyan',    bg: 'bg-brand-cyan/10 border-brand-cyan/20'    },
  { icon: DollarSign, title: 'Financial Health',     desc: 'Real-time analysis of your financial position, debt-to-income, and savings runway.',    color: 'text-brand-emerald', bg: 'bg-brand-emerald/10 border-brand-emerald/20' },
  { icon: TrendingUp, title: 'Market Timing',        desc: 'Data-driven market signals tell you when conditions favor buyers like you.',            color: 'text-brand-yellow',  bg: 'bg-brand-yellow/10 border-brand-yellow/20'  },
]

const STATS = [
  { value: '50k+', label: 'Buyers Assessed'     },
  { value: '95%',  label: 'Prediction Accuracy' },
  { value: '$2.3B', label: 'Decisions Analyzed' },
]

const PILLARS = [
  { label: 'Emotional', pct: 35, color: 'cyan'    as const },
  { label: 'Financial', pct: 35, color: 'emerald' as const },
  { label: 'Timing',    pct: 30, color: 'yellow'  as const },
]

const DEMO_SCORE = 78

export default function PlatformPage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center py-12 space-y-4">
        <Badge variant="default" size="sm">Decision Intelligence Platform</Badge>
        <h1 className="text-4xl font-bold text-text-1 leading-tight">
          Buy with Clarity.<br />
          <span className="text-brand-cyan">Not Anxiety.</span>
        </h1>
        <p className="text-text-2 max-w-md mx-auto">
          HōMI analyzes your emotional, financial, and market readiness to tell you exactly when you're ready to make the most important decisions of your life.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link href="/assessments/new">
            <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Start Assessment
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">View Dashboard</Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {STATS.map((s) => (
          <Card key={s.label} variant="elevated" className="text-center py-5 space-y-1">
            <p className="text-2xl font-bold text-brand-cyan font-mono">{s.value}</p>
            <p className="text-xs text-text-3">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <Card key={f.title} variant="elevated" className="space-y-3">
            <div className={`w-10 h-10 rounded-brand-sm border flex items-center justify-center ${f.bg}`}>
              <f.icon className={`w-5 h-5 ${f.color}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-1">{f.title}</p>
              <p className="text-xs text-text-3 mt-1">{f.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Score demo */}
      <Card variant="elevated" className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-cyan" />
          <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide font-mono">The HōMI Score</h3>
        </div>
        <div className="flex items-center gap-6">
          <Ring value={DEMO_SCORE} size={88} color="emerald" label="Score" />
          <div className="flex-1 space-y-3">
            {PILLARS.map((p) => (
              <div key={p.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-text-2">{p.label}</span>
                  <span className="text-text-3">{p.pct}% weight</span>
                </div>
                <ProgressBar value={p.pct * 2} color={p.color} size="sm" />
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-text-3">
          Your HōMI Score is a composite of three equally weighted dimensions. A score of 65+ signals readiness to proceed.
        </p>
      </Card>
    </div>
  )
}
