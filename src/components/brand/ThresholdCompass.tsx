'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils/cn'
import { DimensionType, VerdictType, DIMENSION_COLORS } from '@/types/scoring'

interface ThresholdCompassProps {
  financial?: number
  emotional?: number
  timing?: number
  verdict?: VerdictType
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  interactive?: boolean
  showLabels?: boolean
  showVerdict?: boolean
  className?: string
}

export function ThresholdCompass({
  financial = 0,
  emotional = 0,
  timing = 0,
  verdict,
  size = 'md',
  animated = true,
  interactive = false,
  showLabels = false,
  showVerdict = true,
  className,
}: ThresholdCompassProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const sizes = {
    sm: { width: 120, stroke: 8 },
    md: { width: 200, stroke: 12 },
    lg: { width: 320, stroke: 16 },
    xl: { width: 480, stroke: 24 },
  }

  const { width, stroke } = sizes[size]
  const center = width / 2
  const outerRadius = (width - stroke) / 2 - 4
  const middleRadius = outerRadius - stroke - 4
  const innerRadius = middleRadius - stroke - 4

  const circumference = (r: number) => 2 * Math.PI * r

  const getStrokeDasharray = (score: number, radius: number) => {
    const circ = circumference(radius)
    const filled = (score / 100) * circ
    return `${filled} ${circ}`
  }

  const ringVariants = {
    hidden: { strokeDashoffset: circumference(outerRadius) },
    visible: (score: number) => ({
      strokeDashoffset: circumference(outerRadius) - (score / 100) * circumference(outerRadius),
      transition: {
        duration: animated ? 1.5 : 0,
        ease: [0.4, 0, 0.2, 1],
        delay: 0.2,
      },
    }),
  }

  if (!mounted) {
    return <div className={cn('bg-surface-2 rounded-full animate-pulse', className)} style={{ width, height: width }} />
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={width}
        height={width}
        viewBox={`0 0 ${width} ${width}`}
        className="transform -rotate-90"
      >
        {/* Background rings */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke={DIMENSION_COLORS.financial}
          strokeWidth={stroke}
          opacity={0.1}
        />
        <circle
          cx={center}
          cy={center}
          r={middleRadius}
          fill="none"
          stroke={DIMENSION_COLORS.emotional}
          strokeWidth={stroke}
          opacity={0.1}
        />
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke={DIMENSION_COLORS.timing}
          strokeWidth={stroke}
          opacity={0.1}
        />

        {/* Animated score rings */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke={DIMENSION_COLORS.financial}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={getStrokeDasharray(financial, outerRadius)}
          style={{
            animation: interactive ? 'spin 120s linear infinite' : undefined,
          }}
        />
        <circle
          cx={center}
          cy={center}
          r={middleRadius}
          fill="none"
          stroke={DIMENSION_COLORS.emotional}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={getStrokeDasharray(emotional, middleRadius)}
          style={{
            animation: interactive ? 'spin 90s linear infinite reverse' : undefined,
          }}
        />
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke={DIMENSION_COLORS.timing}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={getStrokeDasharray(timing, innerRadius)}
          style={{
            animation: interactive ? 'spin 60s linear infinite' : undefined,
          }}
        />
      </svg>

      {/* Center verdict badge */}
      {showVerdict && verdict && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-bold shadow-lg',
              verdict === 'ready'
                ? 'bg-brand-emerald text-surface-0 shadow-brand-emerald/30'
                : 'bg-brand-yellow text-surface-0 shadow-brand-yellow/30'
            )}
          >
            {verdict === 'ready' ? 'READY' : 'NOT YET'}
          </div>
        </div>
      )}

      {/* Labels */}
      {showLabels && (
        <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DIMENSION_COLORS.financial }} />
            Financial
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DIMENSION_COLORS.emotional }} />
            Emotional
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DIMENSION_COLORS.timing }} />
            Timing
          </span>
        </div>
      )}
    </div>
  )
}

// Dimension badge component
interface DimensionBadgeProps {
  dimension: DimensionType
  score: number
  size?: 'sm' | 'md' | 'lg'
}

export function DimensionBadge({ dimension, score, size = 'md' }: DimensionBadgeProps) {
  const colors = {
    financial: 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/30',
    emotional: 'text-brand-emerald bg-brand-emerald/10 border-brand-emerald/30',
    timing: 'text-brand-yellow bg-brand-yellow/10 border-brand-yellow/30',
  }

  const labels = {
    financial: 'Financial',
    emotional: 'Emotional',
    timing: 'Timing',
  }

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-brand-sm border',
        colors[dimension],
        sizes[size]
      )}
    >
      <span className="font-medium">{labels[dimension]}</span>
      <span className="font-bold">{Math.round(score)}</span>
    </div>
  )
}
