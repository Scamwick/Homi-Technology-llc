'use client';

import {
  useCallback,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Slider — Custom range input for emotional/dimension questions
 * HōMI Design System
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export type SliderColor = 'cyan' | 'emerald' | 'yellow';

export interface SliderProps {
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Current value */
  value: number;
  /** Change handler */
  onChange: (value: number) => void;
  /** Dimension color theme */
  color?: SliderColor;
  /** Label text */
  label?: string;
  /** Show numeric value above thumb */
  showValue?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

const colorMap: Record<SliderColor, { fill: string; glow: string; rgb: string }> = {
  cyan: {
    fill: 'var(--cyan)',
    glow: 'var(--cyan-glow)',
    rgb: 'var(--cyan-rgb)',
  },
  emerald: {
    fill: 'var(--emerald)',
    glow: 'var(--emerald-glow)',
    rgb: 'var(--emerald-rgb)',
  },
  yellow: {
    fill: 'var(--yellow)',
    glow: 'var(--yellow-glow)',
    rgb: 'var(--yellow-rgb)',
  },
};

export function Slider({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  color = 'cyan',
  label,
  showValue = true,
  disabled = false,
  className = '',
}: SliderProps) {
  const id = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const theme = colorMap[color];

  const percent = ((value - min) / (max - min)) * 100;

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      let newVal = value;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        newVal = Math.min(max, value + step);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        newVal = Math.max(min, value - step);
      } else if (e.key === 'Home') {
        newVal = min;
      } else if (e.key === 'End') {
        newVal = max;
      } else {
        return;
      }
      e.preventDefault();
      onChange(newVal);
    },
    [value, min, max, step, onChange],
  );

  return (
    <div
      className={[
        'flex flex-col gap-2',
        disabled ? 'opacity-50 pointer-events-none' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Label row */}
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={id}
              className="text-sm font-medium text-[var(--text-secondary)]"
            >
              {label}
            </label>
          )}
          {showValue && (
            <span
              className="text-sm font-semibold tabular-nums"
              style={{ color: theme.fill }}
              aria-live="polite"
            >
              {value}
            </span>
          )}
        </div>
      )}

      {/* Track container — 44px touch area */}
      <div
        ref={trackRef}
        className="relative flex items-center"
        style={{ height: 44 }}
      >
        {/* Native range input — invisible but accessible */}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          onPointerCancel={() => setIsDragging(false)}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
          style={{ height: 44 }}
        />

        {/* Visual track */}
        <div
          className="absolute left-0 right-0 rounded-full"
          style={{
            height: 6,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'var(--slate)',
          }}
        >
          {/* Filled portion */}
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-[width] duration-75"
            style={{
              width: `${percent}%`,
              backgroundColor: theme.fill,
            }}
          />
        </div>

        {/* Visual thumb */}
        <div
          className="absolute pointer-events-none transition-transform duration-75"
          style={{
            left: `${percent}%`,
            top: '50%',
            transform: `translate(-50%, -50%) scale(${isDragging ? 1.15 : 1})`,
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: theme.fill,
            boxShadow: `0 0 ${isDragging ? 16 : 10}px ${theme.glow}`,
            border: '3px solid var(--navy)',
          }}
          aria-hidden="true"
        />
      </div>

      {/* Min/max labels */}
      <div className="flex justify-between text-xs text-[var(--text-secondary)]">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
