'use client'

import { useState } from 'react'
import { PanelCard } from '@/components/panels/PanelCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Shield, ShieldAlert, X, AlertTriangle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Alert {
  id: string
  type: 'impulse' | 'overspend' | 'timing' | 'emotional'
  message: string
  severity: 'high' | 'medium' | 'low'
  timestamp: string
  dismissed?: boolean
}

interface RealTimeProtectionProps {
  protectionLevel: 'active' | 'warning' | 'breach'
  alerts: Alert[]
  alertsBlocked: number
  onDismiss?: (id: string) => void
}

const severityConfig = {
  high:   { variant: 'red'     as const, border: 'border-brand-crimson/30 bg-brand-crimson/5' },
  medium: { variant: 'yellow'  as const, border: 'border-brand-yellow/30 bg-brand-yellow/5'   },
  low:    { variant: 'emerald' as const, border: 'border-brand-emerald/30 bg-brand-emerald/5' },
}

const typeLabel: Record<Alert['type'], string> = {
  impulse: 'Impulse Risk',
  overspend: 'Overspend',
  timing: 'Bad Timing',
  emotional: 'Emotional State',
}

const levelConfig = {
  active:  { color: 'emerald' as const, label: 'Protected',      variant: 'emerald' as const, Icon: Shield      },
  warning: { color: 'yellow'  as const, label: 'Warning',        variant: 'yellow'  as const, Icon: ShieldAlert },
  breach:  { color: 'amber'   as const, label: 'Breach Detected',variant: 'red'     as const, Icon: AlertTriangle },
}

export function RealTimeProtection({
  protectionLevel, alerts, alertsBlocked, onDismiss,
}: RealTimeProtectionProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const cfg = levelConfig[protectionLevel]
  const Icon = cfg.Icon

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id))
    onDismiss?.(id)
  }

  const activeAlerts = alerts.filter((a) => !dismissed.has(a.id))

  return (
    <div className="space-y-4">
      {/* Shield status */}
      <PanelCard
        title="Real-Time Protection"
        description="HōMI monitors your decisions as they happen."
        icon={<Icon className="w-4 h-4" />}
        accentColor={protectionLevel === 'active' ? 'emerald' : 'amber'}
      >
        <div className={cn(
          'flex items-center gap-4 p-4 rounded-brand-sm border',
          protectionLevel === 'active'
            ? 'border-brand-emerald/30 bg-brand-emerald/5'
            : protectionLevel === 'warning'
            ? 'border-brand-yellow/30 bg-brand-yellow/5'
            : 'border-brand-crimson/30 bg-brand-crimson/5'
        )}>
          <Icon className={cn(
            'w-10 h-10 flex-shrink-0',
            protectionLevel === 'active' ? 'text-brand-emerald' : protectionLevel === 'warning' ? 'text-brand-yellow' : 'text-brand-crimson'
          )} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-text-1">{cfg.label}</p>
              <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
            </div>
            <p className="text-xs text-text-3 font-mono">{alertsBlocked} impulse risks blocked this month</p>
          </div>
        </div>
      </PanelCard>

      {/* Active alerts */}
      <PanelCard
        title="Active Alerts"
        icon={<ShieldAlert className="w-4 h-4" />}
        empty={activeAlerts.length === 0}
        emptyMessage="No active alerts. Your decisions are clear."
      >
        <div className="space-y-2">
          {activeAlerts.map((alert) => {
            const scfg = severityConfig[alert.severity]
            return (
              <div
                key={alert.id}
                className={cn('flex items-start gap-3 p-3 rounded-brand-sm border', scfg.border)}
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-70" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge variant={scfg.variant} size="sm">{typeLabel[alert.type]}</Badge>
                    <span className="text-xs text-text-4 font-mono">{alert.timestamp}</span>
                  </div>
                  <p className="text-sm text-text-2">{alert.message}</p>
                </div>
                <button
                  onClick={() => handleDismiss(alert.id)}
                  className="flex-shrink-0 p-1 rounded text-text-3 hover:text-text-1 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )
          })}
        </div>
      </PanelCard>
    </div>
  )
}
