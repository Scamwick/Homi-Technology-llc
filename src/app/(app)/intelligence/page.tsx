import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Globe, TrendingUp, Users, Target } from 'lucide-react'

const STATS = [
  { value: '50k+', label: 'Assessments',         color: 'text-brand-cyan',    icon: Users    },
  { value: '94%',  label: 'Prediction Accuracy', color: 'text-brand-emerald', icon: Target   },
  { value: '127',  label: 'Markets Tracked',     color: 'text-brand-yellow',  icon: TrendingUp },
]

const STEPS = [
  { step: '01', title: 'Buyer Completes Assessment',  desc: 'Emotional, financial, and timing inputs recorded with verified outcomes.'             },
  { step: '02', title: 'Outcomes Feed the Model',     desc: 'Post-purchase results matched back to predictions, improving accuracy continuously.'   },
  { step: '03', title: 'Intelligence Compounds',      desc: 'Each new market and buyer type strengthens prediction for all future buyers.'          },
]

const LIVE_FEED = [
  { city: 'Austin, TX',    score: 81, outcome: 'Purchased' },
  { city: 'Denver, CO',    score: 68, outcome: 'Searching'  },
  { city: 'Nashville, TN', score: 74, outcome: 'Offer made' },
  { city: 'Phoenix, AZ',   score: 79, outcome: 'Purchased' },
]

export default function IntelligencePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Globe className="w-6 h-6 text-brand-cyan" />
        <h1 className="text-xl font-semibold text-text-1">Decision Intelligence Network</h1>
        <Badge variant="emerald" size="sm">Live Network</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STATS.map((s) => (
          <Card key={s.label} variant="elevated" className="text-center space-y-1 py-6">
            <p className={`text-3xl font-bold font-mono ${s.color}`}>{s.value}</p>
            <p className="text-sm text-text-3">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Flywheel */}
      <Card variant="elevated" className="space-y-4">
        <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide font-mono">The Intelligence Flywheel</h3>
        <div className="flex items-center justify-center py-4">
          <div className="relative w-56 h-56">
            {/* Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border border-brand-cyan/30 bg-brand-cyan/5 flex items-center justify-center">
                <span className="text-xs text-brand-cyan font-mono text-center leading-tight">HōMI<br/>Engine</span>
              </div>
            </div>
            {/* Nodes */}
            {[
              { label: 'Buyers',      top: '0%',   left: '50%',  transform: 'translate(-50%, 0)'    },
              { label: 'Data',        top: '50%',  left: '100%', transform: 'translate(-100%, -50%)' },
              { label: 'Intelligence',top: '100%', left: '50%',  transform: 'translate(-50%, -100%)' },
              { label: 'Accuracy',    top: '50%',  left: '0%',   transform: 'translate(0, -50%)'    },
            ].map((n) => (
              <div
                key={n.label}
                className="absolute text-center"
                style={{ top: n.top, left: n.left, transform: n.transform }}
              >
                <div className="px-3 py-1.5 rounded-brand-sm border border-brand-cyan/30 bg-surface-2 text-xs text-brand-cyan font-mono whitespace-nowrap">
                  {n.label}
                </div>
              </div>
            ))}
            {/* Dashed circle */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 224 224">
              <circle cx="112" cy="112" r="80" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="6,6" opacity="0.3" />
            </svg>
          </div>
        </div>
      </Card>

      {/* How it works */}
      <Card variant="elevated" className="space-y-4">
        <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide font-mono">How It Works</h3>
        <div className="space-y-3">
          {STEPS.map((s) => (
            <div key={s.step} className="flex gap-4">
              <span className="text-brand-cyan font-mono text-sm font-bold flex-shrink-0">{s.step}</span>
              <div>
                <p className="text-sm font-medium text-text-1">{s.title}</p>
                <p className="text-xs text-text-3 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Live feed */}
      <Card variant="elevated" className="space-y-3">
        <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide font-mono">Live Network Activity</h3>
        <div className="space-y-2">
          {LIVE_FEED.map((f) => (
            <div key={f.city} className="flex items-center justify-between p-3 rounded-brand-sm border border-surface-3 bg-surface-2">
              <div>
                <p className="text-sm text-text-1">{f.city}</p>
                <p className="text-xs text-text-3">Score: {f.score}/100</p>
              </div>
              <Badge variant={f.outcome === 'Purchased' ? 'emerald' : f.outcome === 'Offer made' ? 'yellow' : 'default'} size="sm">
                {f.outcome}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
