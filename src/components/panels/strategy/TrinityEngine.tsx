'use client'

import { useState } from 'react'
import { PanelCard } from '@/components/panels/PanelCard'
import { Badge } from '@/components/ui/Badge'
import { Scale, Info } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface TrinityRole {
  id: string
  title: string
  icon: string
  stance: string
  reasoning: string[]
  recommendation: string
}

interface TrinityEngineProps {
  decision: string
  roles: TrinityRole[]
}

const roleAccent: Record<string, { border: string; bg: string; badge: 'emerald' | 'yellow' | 'cyan' }> = {
  advocate: { border: 'border-brand-emerald/40', bg: 'bg-brand-emerald/5',  badge: 'emerald' },
  skeptic:  { border: 'border-brand-yellow/40',  bg: 'bg-brand-yellow/5',   badge: 'yellow'  },
  arbiter:  { border: 'border-brand-cyan/40',    bg: 'bg-brand-cyan/5',     badge: 'cyan'    },
}

export function TrinityEngine({ decision, roles }: TrinityEngineProps) {
  const [selected, setSelected] = useState(roles[0]?.id ?? '')
  const current = roles.find((r) => r.id === selected)
  const accent = roleAccent[selected] ?? roleAccent.arbiter

  return (
    <div className="space-y-4">
      {/* Decision context */}
      <PanelCard title="Trinity Engine" icon={<Scale className="w-4 h-4" />} accentColor="cyan">
        <p className="text-sm font-medium text-text-1">{decision}</p>
        <p className="text-xs text-text-3 mt-1">Three perspectives debate every angle of your decision.</p>
      </PanelCard>

      {/* Role selector */}
      <div className="grid grid-cols-3 gap-3">
        {roles.map((role) => {
          const a = roleAccent[role.id] ?? roleAccent.arbiter
          const isActive = selected === role.id
          return (
            <button
              key={role.id}
              onClick={() => setSelected(role.id)}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-brand-sm border transition-all text-center',
                isActive ? `${a.border} ${a.bg}` : 'border-surface-3 hover:border-surface-4 bg-surface-2'
              )}
            >
              <span className="text-2xl">{role.icon}</span>
              <span className="text-xs font-semibold text-text-1 leading-tight">{role.title}</span>
            </button>
          )
        })}
      </div>

      {/* Current role detail */}
      {current && (
        <div className={cn('rounded-brand border p-5 space-y-4', accent.border, accent.bg)}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{current.icon}</span>
              <h4 className="text-base font-semibold text-text-1">{current.title}</h4>
              <Badge variant={accent.badge} size="sm">Perspective</Badge>
            </div>
            <p className="text-sm text-text-2 italic">"{current.stance}"</p>
          </div>

          <div className="border-t border-surface-3 pt-4">
            <p className="text-xs font-mono text-text-3 uppercase mb-2">Reasoning</p>
            <ul className="space-y-1.5">
              {current.reasoning.map((point, i) => (
                <li key={i} className="text-sm text-text-2 flex gap-2">
                  <span className="text-text-3 flex-shrink-0">›</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-brand-sm border border-brand-emerald/30 bg-brand-emerald/5 p-3">
            <p className="text-xs font-mono text-brand-emerald uppercase mb-1">Recommendation</p>
            <p className="text-sm text-text-2">{current.recommendation}</p>
          </div>
        </div>
      )}

      {/* Explainer */}
      <PanelCard title="How Trinity Engine Works" icon={<Info className="w-4 h-4" />}>
        <p className="text-sm text-text-2 leading-relaxed">
          The Advocate pushes you forward. The Skeptic questions everything. The Arbiter decides based on data. Together, they ensure you've considered every angle before committing.
        </p>
      </PanelCard>
    </div>
  )
}
