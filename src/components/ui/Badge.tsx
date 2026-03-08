import { cn } from '@/lib/utils/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'cyan' | 'emerald' | 'yellow' | 'red'
  size?: 'sm' | 'md'
  dot?: boolean
  className?: string
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
}: BadgeProps) {
  const variants = {
    default: 'bg-surface-3 text-text-1',
    cyan: 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30',
    emerald: 'bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30',
    yellow: 'bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30',
    red: 'bg-brand-crimson/20 text-brand-crimson border border-brand-crimson/30',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse',
            variant === 'default' && 'bg-text-2',
            variant === 'cyan' && 'bg-brand-cyan',
            variant === 'emerald' && 'bg-brand-emerald',
            variant === 'yellow' && 'bg-brand-yellow',
            variant === 'red' && 'bg-brand-crimson'
          )}
        />
      )}
      {children}
    </span>
  )
}
