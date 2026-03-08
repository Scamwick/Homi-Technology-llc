'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  placeholder?: string
  min?: number
  max?: number
  prefix?: string
  suffix?: string
}

export function NumberInput({
  value,
  onChange,
  placeholder = 'Enter a value',
  min,
  max,
  prefix,
  suffix,
}: NumberInputProps) {
  const [localValue, setLocalValue] = useState(value.toString())

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setLocalValue(inputValue)

    const numValue = parseFloat(inputValue)
    if (!isNaN(numValue)) {
      let clampedValue = numValue
      if (min !== undefined) clampedValue = Math.max(min, clampedValue)
      if (max !== undefined) clampedValue = Math.min(max, clampedValue)
      onChange(clampedValue)
    }
  }

  const handleBlur = () => {
    // Ensure valid number on blur
    const numValue = parseFloat(localValue)
    if (isNaN(numValue)) {
      setLocalValue(value.toString())
    } else {
      setLocalValue(numValue.toString())
    }
  }

  return (
    <div className="relative">
      {prefix && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3">
          {prefix}
        </div>
      )}
      <input
        type="number"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        min={min}
        max={max}
        className={cn(
          'w-full h-14 bg-surface-2 border border-surface-3 rounded-brand text-lg text-center',
          'focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20',
          'transition-all',
          prefix && 'pl-10',
          suffix && 'pr-10'
        )}
      />
      {suffix && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-3">
          {suffix}
        </div>
      )}
    </div>
  )
}
