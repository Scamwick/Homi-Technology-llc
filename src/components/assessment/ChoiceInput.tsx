'use client'

import { cn } from '@/lib/utils/cn'
import { Check } from 'lucide-react'

interface Option {
  value: string
  label: string
  score?: number
}

interface ChoiceInputProps {
  options: Option[]
  value: string | string[]
  onChange: (value: string | string[]) => void
  type: 'single' | 'multi'
}

export function ChoiceInput({ options, value, onChange, type }: ChoiceInputProps) {
  const isSelected = (optionValue: string) => {
    if (type === 'single') {
      return value === optionValue
    }
    return Array.isArray(value) && value.includes(optionValue)
  }

  const handleSelect = (optionValue: string) => {
    if (type === 'single') {
      onChange(optionValue)
    } else {
      const currentValues = Array.isArray(value) ? value : []
      if (currentValues.includes(optionValue)) {
        onChange(currentValues.filter(v => v !== optionValue))
      } else {
        onChange([...currentValues, optionValue])
      }
    }
  }

  return (
    <div className="space-y-2">
      {options.map((option) => {
        const selected = isSelected(option.value)

        return (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={cn(
              'w-full p-4 rounded-brand border text-left transition-all flex items-center gap-3',
              selected
                ? 'border-brand-cyan bg-brand-cyan/10'
                : 'border-surface-3 bg-surface-2 hover:border-surface-4 hover:bg-surface-3'
            )}
          >
            <div
              className={cn(
                'w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors',
                selected
                  ? 'bg-brand-cyan border-brand-cyan'
                  : 'border-surface-4 bg-surface-1'
              )}
            >
              {selected && <Check className="w-3 h-3 text-surface-0" />}
            </div>
            <span className="flex-1">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
