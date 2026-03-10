import { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils/cn'

interface PanelCardProps {
  title: string
  description?: string
  icon?: ReactNode
  children: ReactNode
  loading?: boolean
  empty?: boolean
  emptyMessage?: string
  className?: string
  headerRight?: ReactNode
  accentColor?: 'cyan' | 'emerald' | 'yellow' | 'amber'
}

const accentMap = {
  cyan:    'border-brand-cyan/30 bg-brand-cyan/5',
  emerald: 'border-brand-emerald/30 bg-brand-emerald/5',
  yellow:  'border-brand-yellow/30 bg-brand-yellow/5',
  amber:   'border-brand-amber/30 bg-brand-amber/5',
}

const accentTextMap = {
  cyan:    'text-brand-cyan',
  emerald: 'text-brand-emerald',
  yellow:  'text-brand-yellow',
  amber:   'text-brand-amber',
}

export function PanelCard({
  title,
  description,
  icon,
  children,
  loading = false,
  empty = false,
  emptyMessage = 'No data available yet.',
  className,
  headerRight,
  accentColor,
}: PanelCardProps) {
  return (
    <Card
      variant="elevated"
      className={cn(
        accentColor && accentMap[accentColor],
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          {icon && (
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center bg-surface-3',
              accentColor && accentTextMap[accentColor]
            )}>
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-text-1 uppercase tracking-wider">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-text-3 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {headerRight && (
          <div className="flex-shrink-0">{headerRight}</div>
        )}
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner size="md" />
        </div>
      ) : empty ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-sm text-text-3 text-center max-w-xs">{emptyMessage}</p>
        </div>
      ) : (
        children
      )}
    </Card>
  )
}
