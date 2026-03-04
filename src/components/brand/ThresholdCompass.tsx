'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { VerdictType } from '@/types/scoring'

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
  size = 'lg',
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
    sm: { width: 160, scale: 0.6 },
    md: { width: 240, scale: 0.8 },
    lg: { width: 320, scale: 1 },
    xl: { width: 480, scale: 1.5 },
  }

  const { width, scale } = sizes[size]
  const isUnlocked = verdict === 'ready'

  if (!mounted) {
    return (
      <div
        className={cn('bg-surface-2 rounded-full animate-pulse', className)}
        style={{ width, height: width }}
      />
    )
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={width} height={width} viewBox={`0 0 200 200`} className="drop-shadow-xl">
        <defs>
          <filter id="compass-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Ring (Cyan) — 20s clockwise */}
        <g
          filter="url(#compass-glow)"
          opacity="0.6"
          className={animated ? 'animate-spin-slow' : undefined}
          style={{ transformOrigin: '100px 100px' }}
        >
          <circle cx="100" cy="100" r="85" fill="none" stroke="#22d3ee" strokeWidth="2" />
          {/* Cardinal dots per animated master */}
          <circle cx="100" cy="15" r="3" fill="#22d3ee" />
          <circle cx="185" cy="100" r="3" fill="#22d3ee" />
          <circle cx="100" cy="185" r="3" fill="#22d3ee" />
          <circle cx="15" cy="100" r="3" fill="#22d3ee" />
        </g>

        {/* Middle Ring (Emerald) — 15s counter-clockwise */}
        <g
          filter="url(#compass-glow)"
          opacity="0.7"
          className={animated ? 'animate-spin-medium' : undefined}
          style={{ transformOrigin: '100px 100px' }}
        >
          <circle cx="100" cy="100" r="60" fill="none" stroke="#34d399" strokeWidth="2" />
          <circle cx="100" cy="40" r="2.5" fill="#34d399" />
          <circle cx="160" cy="100" r="2.5" fill="#34d399" />
          <circle cx="100" cy="160" r="2.5" fill="#34d399" />
          <circle cx="40" cy="100" r="2.5" fill="#34d399" />
        </g>

        {/* Inner Ring (Yellow) — 10s clockwise */}
        <g
          filter="url(#compass-glow)"
          opacity="0.8"
          className={animated ? 'animate-spin-fast' : undefined}
          style={{ transformOrigin: '100px 100px' }}
        >
          <circle cx="100" cy="100" r="35" fill="none" stroke="#facc15" strokeWidth="2" />
        </g>

        {/* Center Keyhole (Locked/Unlocked indicator) */}
        <g className="keyhole">
          <circle cx="100" cy="96" r="12" fill="none" stroke={isUnlocked ? '#34d399' : '#facc15'} strokeWidth="2" />
          <rect x="94" y="104" width="12" height="16" rx="2" fill="none" stroke={isUnlocked ? '#34d399' : '#facc15'} strokeWidth="2" />
          {isUnlocked ? (
            <circle cx="100" cy="96" r="5" fill="none" stroke="#34d399" strokeWidth="2" />
          ) : (
            <>
              <circle cx="100" cy="96" r="5" fill="#facc15" />
              <rect x="97" y="96" width="6" height="12" fill="#facc15" />
            </>
          )}
        </g>

        {/* Outer decorative ring (faint) */}
        <circle cx="100" cy="100" r="95" fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.2" />
      </svg>

      {/* Verdict badge */}
      {showVerdict && verdict && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={cn(
              'px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm',
              verdict === 'ready'
                ? 'bg-brand-emerald/20 border border-brand-emerald text-brand-emerald'
                : verdict === 'almost'
                  ? 'bg-brand-yellow/20 border border-brand-yellow text-brand-yellow'
                  : verdict === 'build'
                    ? 'bg-brand-amber/20 border border-brand-amber text-brand-amber'
                    : 'bg-brand-crimson/20 border border-brand-crimson text-brand-crimson'
            )}
          >
            {verdict === 'ready' && '🔑 READY'}
            {verdict === 'almost' && '🔓 ALMOST'}
            {verdict === 'build' && '🔒 BUILD'}
            {verdict === 'stop' && '🚫 STOP'}
          </div>
        </div>
      )}

      {/* Score labels */}
      {showLabels && (
        <div className="absolute -bottom-12 left-0 right-0 flex flex-col gap-2 text-xs text-center">
          <div className="flex justify-center gap-6">
            <span className="flex flex-col items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-brand-cyan" />
              <span className="text-text-2">Financial</span>
              <span className="font-bold text-brand-cyan">{Math.round(financial)}%</span>
            </span>
            <span className="flex flex-col items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-brand-emerald" />
              <span className="text-text-2">Emotional</span>
              <span className="font-bold text-brand-emerald">{Math.round(emotional)}%</span>
            </span>
            <span className="flex flex-col items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-brand-yellow" />
              <span className="text-text-2">Timing</span>
              <span className="font-bold text-brand-yellow">{Math.round(timing)}%</span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Dimension badge component
interface DimensionBadgeProps {
  dimension: 'financial' | 'emotional' | 'timing'
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
    financial: 'Financial Reality',
    emotional: 'Emotional Truth',
    timing: 'Perfect Timing',
  }

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <div className={cn('inline-flex items-center gap-2 rounded-brand-sm border', colors[dimension], sizes[size])}>
      <span className="font-medium">{labels[dimension]}</span>
      <span className="font-bold">{Math.round(score)}</span>
    </div>
  )
}
