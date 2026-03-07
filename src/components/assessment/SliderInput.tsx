'use client'

import { useState } from 'react'

interface SliderInputProps {
  value: number
  onChange: (value: number) => void
  color?: 'financial' | 'emotional' | 'timing' | string
  min?: number
  max?: number
  step?: number
  showValue?: boolean
  labels?: { min: string; max: string }
}

export function SliderInput({
  value,
  onChange,
  color = 'cyan',
  min = 0,
  max = 100,
  step = 1,
  showValue = true,
  labels,
}: SliderInputProps) {
  const [, setIsDragging] = useState(false)

  const colorMap: Record<string, string> = {
    financial: '#22d3ee',
    emotional: '#34d399',
    timing: '#facc15',
    cyan: '#22d3ee',
    emerald: '#34d399',
    yellow: '#facc15',
  }

  const trackColor = colorMap[color] || color
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="w-full">
      {showValue && (
        <div className="flex justify-center mb-4">
          <div
            key={value}
            className="text-3xl font-bold"
            style={{ color: trackColor }}
          >
            {Math.round(value)}
          </div>
        </div>
      )}

      <div className="relative h-12 flex items-center">
        {/* Track background */}
        <div className="absolute w-full h-2 bg-surface-3 rounded-full" />

        {/* Filled track */}
        <div
          className="absolute h-2 rounded-full transition-all"
          style={{
            width: `${percentage}%`,
            backgroundColor: trackColor,
          }}
        />

        {/* Thumb */}
        <div
          className="absolute w-6 h-6 bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing transition-transform hover:scale-110"
          style={{
            left: `calc(${percentage}% - 12px)`,
            boxShadow: `0 2px 8px ${trackColor}40`,
          }}
        />

        {/* Invisible input for accessibility */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute w-full h-full opacity-0 cursor-pointer"
          aria-label="Slider input"
        />
      </div>

      {labels && (
        <div className="flex justify-between mt-2 text-sm text-text-3">
          <span>{labels.min}</span>
          <span>{labels.max}</span>
        </div>
      )}
    </div>
  )
}
