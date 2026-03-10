'use client'

import { useState } from 'react'
import { PanelCard } from '@/components/panels/PanelCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ShieldCheck, ShieldAlert, Clock, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Permission {
  id: string
  item: string
  amount: number
  status: 'approved' | 'pending' | 'denied'
  reason: string
  date: string
}

interface PermissionSystemProps {
  permissions: Permission[]
  onCheck?: (item: string, amount: number) => void
  financialScore?: number
}

const statusConfig = {
  approved: { variant: 'emerald' as const, icon: CheckCircle, border: 'border-brand-emerald/30 bg-brand-emerald/5', label: 'Approved' },
  pending:  { variant: 'yellow'  as const, icon: Clock,        border: 'border-brand-yellow/30 bg-brand-yellow/5',   label: 'Pending'  },
  denied:   { variant: 'red'     as const, icon: XCircle,      border: 'border-brand-crimson/30 bg-brand-crimson/5', label: 'Denied'   },
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export function PermissionSystem({ permissions, onCheck, financialScore = 0 }: PermissionSystemProps) {
  const [item, setItem] = useState('')
  const [amount, setAmount] = useState('')
  const [checking, setChecking] = useState(false)

  const handleCheck = async () => {
    if (!item.trim() || !amount) return
    setChecking(true)
    await onCheck?.(item, parseFloat(amount))
    setChecking(false)
    setItem('')
    setAmount('')
  }

  return (
    <div className="space-y-4">
      {/* Permission check */}
      <PanelCard
        title="Permission System"
        description="Can you say yes to this purchase?"
        icon={<ShieldCheck className="w-4 h-4" />}
        accentColor={financialScore >= 65 ? 'emerald' : 'amber'}
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-text-3 font-mono uppercase tracking-wide">What do you want?</label>
            <Input
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="e.g., New MacBook Pro"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-text-3 font-mono uppercase tracking-wide">How much?</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="2500"
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={handleCheck}
            disabled={!item.trim() || !amount || checking}
          >
            {checking ? 'Checking…' : 'Can I say yes to this?'}
          </Button>
        </div>
      </PanelCard>

      {/* Recent permissions */}
      {permissions.length > 0 && (
        <PanelCard title="Recent Checks" icon={<ShieldAlert className="w-4 h-4" />}>
          <div className="space-y-2">
            {permissions.map((p) => {
              const cfg = statusConfig[p.status]
              const Icon = cfg.icon
              return (
                <div
                  key={p.id}
                  className={cn('flex items-start gap-3 p-3 rounded-brand-sm border', cfg.border)}
                >
                  <Icon className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-70" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-text-1 truncate">{p.item}</p>
                      <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
                    </div>
                    <p className="text-xs text-text-3 mt-0.5">{fmt(p.amount)} · {p.reason}</p>
                    <p className="text-xs text-text-4 mt-0.5 font-mono">{p.date}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </PanelCard>
      )}
    </div>
  )
}
