'use client'

import { useState } from 'react'
import { PanelCard } from '@/components/panels/PanelCard'
import { Badge } from '@/components/ui/Badge'
import { EyeOff, Eye, Lock, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface BlindBudgetToggleProps {
  enabled: boolean
  actualBudget: number
  blindBudgetRange: string
  onToggle: (enabled: boolean) => void
}

const benefits = [
  'Prevents seller anchoring to your exact number',
  'Reduces psychological pressure during negotiation',
  'Focuses decisions on true value fit, not budget limits',
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-14 h-7 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1',
        checked ? 'bg-brand-emerald' : 'bg-surface-4'
      )}
    >
      <span
        className={cn(
          'absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all duration-200',
          checked ? 'left-8' : 'left-1'
        )}
      />
    </button>
  )
}

export function BlindBudgetToggle({ enabled, actualBudget, blindBudgetRange, onToggle }: BlindBudgetToggleProps) {
  const [isEnabled, setIsEnabled] = useState(enabled)

  const handleToggle = (val: boolean) => {
    setIsEnabled(val)
    onToggle(val)
  }

  const formattedBudget = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(actualBudget)

  return (
    <div className="space-y-4">
      {/* Toggle card */}
      <PanelCard
        title="Blind Budget Mode"
        description="Hide your exact budget to prevent anchoring bias."
        icon={isEnabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        accentColor={isEnabled ? 'emerald' : 'amber'}
        headerRight={
          <div className="flex items-center gap-3">
            <Badge variant={isEnabled ? 'emerald' : 'yellow'} size="sm">
              {isEnabled ? 'ON' : 'OFF'}
            </Badge>
            <Toggle checked={isEnabled} onChange={handleToggle} />
          </div>
        }
      >
        {/* Status block */}
        <div className={cn(
          'flex items-start gap-3 p-3 rounded-brand-sm border',
          isEnabled
            ? 'border-brand-emerald/30 bg-brand-emerald/5'
            : 'border-brand-amber/30 bg-brand-amber/5'
        )}>
          {isEnabled
            ? <Lock className="w-5 h-5 text-brand-emerald flex-shrink-0 mt-0.5" />
            : <Eye className="w-5 h-5 text-brand-amber flex-shrink-0 mt-0.5" />
          }
          <div>
            <p className={cn('text-sm font-semibold mb-0.5', isEnabled ? 'text-brand-emerald' : 'text-brand-amber')}>
              {isEnabled ? 'Budget Hidden' : 'Budget Visible'}
            </p>
            <p className="text-sm text-text-2">
              {isEnabled
                ? `Your exact budget (${formattedBudget}) is masked. You'll evaluate options within: ${blindBudgetRange}`
                : 'Turn on Blind Budget Mode to prevent anchoring bias during your decision process.'}
            </p>
          </div>
        </div>
      </PanelCard>

      {/* Benefits */}
      <PanelCard title="Why It Works" icon={<ShieldCheck className="w-4 h-4" />}>
        <ul className="space-y-2">
          {benefits.map((b, i) => (
            <li key={i} className="flex gap-2 text-sm text-text-2">
              <span className="text-brand-emerald flex-shrink-0 mt-0.5">›</span>
              {b}
            </li>
          ))}
        </ul>
      </PanelCard>
    </div>
  )
}
