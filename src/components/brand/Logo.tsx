import { cn } from '@/lib/utils/cn'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showTagline?: boolean
}

export function Logo({ size = 'md', className, showTagline = false }: LogoProps) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-5xl',
  }

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <span className={cn('font-bold tracking-tight', sizes[size])}>
        <span style={{ color: '#22d3ee' }}>H</span>
        <span style={{ color: '#34d399' }}>ō</span>
        <span style={{ color: '#facc15' }}>M</span>
        <span style={{ color: '#22d3ee' }}>I</span>
      </span>
      {showTagline && (
        <span className="text-xs text-text-3 mt-1 tracking-widest uppercase">
          Decision Readiness Intelligence
        </span>
      )}
    </div>
  )
}
