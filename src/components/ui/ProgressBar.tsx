import { cn } from '@/lib/utils/cn'

interface ProgressBarProps {
  value: number
  color?: 'cyan' | 'emerald' | 'yellow' | string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
  className?: string
}

export function ProgressBar({
  value,
  color = 'cyan',
  size = 'md',
  showLabel = false,
  animated = true,
  className,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }

  const colorMap = {
    cyan: 'bg-brand-cyan',
    emerald: 'bg-brand-emerald',
    yellow: 'bg-brand-yellow',
  }

  const fillColor = colorMap[color as keyof typeof colorMap] || color

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-text-2">Progress</span>
          <span className="text-text-1 font-medium">{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-surface-3 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            fillColor,
            animated && 'transition-all'
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  )
}
