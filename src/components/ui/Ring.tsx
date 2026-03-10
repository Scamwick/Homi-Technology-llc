import { cn } from '@/lib/utils/cn'

interface RingProps {
  value: number        // 0–100
  size?: number        // px, default 96
  strokeWidth?: number // default 8
  color?: 'cyan' | 'emerald' | 'yellow' | 'amber' | 'crimson'
  label?: string
  sublabel?: string
  className?: string
}

const colorMap = {
  cyan:    { stroke: '#22d3ee', text: 'text-brand-cyan',    glow: 'rgba(34,211,238,0.3)'  },
  emerald: { stroke: '#34d399', text: 'text-brand-emerald', glow: 'rgba(52,211,153,0.3)'  },
  yellow:  { stroke: '#facc15', text: 'text-brand-yellow',  glow: 'rgba(250,204,21,0.3)'  },
  amber:   { stroke: '#fab633', text: 'text-brand-amber',   glow: 'rgba(250,182,51,0.3)'  },
  crimson: { stroke: '#f24822', text: 'text-brand-crimson', glow: 'rgba(242,72,34,0.3)'   },
}

export function Ring({
  value,
  size = 96,
  strokeWidth = 8,
  color = 'cyan',
  label,
  sublabel,
  className,
}: RingProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference
  const { stroke, text, glow } = colorMap[color]

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1a2a44"
            strokeWidth={strokeWidth}
          />
          {/* Fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 0.6s ease-out',
              filter: `drop-shadow(0 0 6px ${glow})`,
            }}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold leading-none', text, size >= 96 ? 'text-xl' : 'text-sm')}>
            {clamped}
          </span>
          {sublabel && (
            <span className="text-xs text-text-3 mt-0.5">{sublabel}</span>
          )}
        </div>
      </div>
      {label && (
        <span className="text-xs text-text-2 text-center leading-tight max-w-[80px]">{label}</span>
      )}
    </div>
  )
}
