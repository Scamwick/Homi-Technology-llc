import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Globe, TrendingUp, Users, Target } from 'lucide-react'

const STEPS = [
  { step: '01', title: 'Buyer Completes Assessment',  desc: 'Emotional, financial, and timing inputs recorded with verified outcomes.'             },
  { step: '02', title: 'Outcomes Feed the Model',     desc: 'Post-purchase results matched back to predictions, improving accuracy continuously.'   },
  { step: '03', title: 'Intelligence Compounds',      desc: 'Each new market and buyer type strengthens prediction for all future buyers.'          },
]

export default function IntelligencePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Globe className="w-6 h-6 text-brand-cyan" />
        <h1 className="text-xl font-semibold text-text-1">Decision Intelligence Network</h1>
        <Badge variant="default" size="sm">Building</Badge>
      </div>

      {/* Community intelligence notice */}
      <Card variant="elevated" className="space-y-2 py-6 text-center">
        <p className="text-sm font-semibold text-text-1">Community insights are building</p>
        <p className="text-xs text-text-3 max-w-md mx-auto">
          As more buyers complete assessments and report outcomes, the HōMI Intelligence Network will surface real patterns — market trends, score accuracy, and decision timing data — from verified community data. Check back as the network grows.
        </p>
      </Card>

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

      {/* What this will show */}
      <Card variant="elevated" className="space-y-3">
        <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide font-mono">What Community Intelligence Will Show</h3>
        <div className="space-y-2">
          {[
            { icon: Users, label: 'Assessment volume by market and decision type' },
            { icon: Target, label: 'Prediction accuracy validated against real outcomes' },
            { icon: TrendingUp, label: 'Score trend data by city and timing window' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 p-3 rounded-brand-sm border border-surface-3 bg-surface-2 opacity-60">
              <Icon className="w-4 h-4 text-brand-cyan flex-shrink-0" />
              <p className="text-sm text-text-2">{label}</p>
              <Badge variant="default" size="sm" className="ml-auto">Coming soon</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
