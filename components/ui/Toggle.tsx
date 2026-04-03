'use client';

import { useCallback, useId } from 'react';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Toggle — Accessible switch control
 * HōMI Design System
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export type ToggleSize = 'sm' | 'md';

export interface ToggleProps {
  /** Controlled checked state */
  checked: boolean;
  /** Change handler */
  onChange: (checked: boolean) => void;
  /** Disable interaction */
  disabled?: boolean;
  /** Accessible label text */
  label?: string;
  /** Size variant */
  size?: ToggleSize;
  /** Additional classes on the wrapper */
  className?: string;
}

const trackDimensions: Record<ToggleSize, { w: number; h: number; thumb: number; travel: number }> = {
  sm: { w: 32, h: 18, thumb: 14, travel: 14 },
  md: { w: 44, h: 24, thumb: 20, travel: 20 },
};

export function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
  size = 'md',
  className = '',
}: ToggleProps) {
  const id = useId();
  const dims = trackDimensions[size];

  const handleClick = useCallback(() => {
    if (!disabled) onChange(!checked);
  }, [checked, disabled, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onChange(!checked);
      }
    },
    [checked, disabled, onChange],
  );

  return (
    <div
      className={[
        'inline-flex items-center gap-2',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={handleClick}
    >
      {/* Track */}
      <span
        role="switch"
        aria-checked={checked}
        aria-labelledby={label ? id : undefined}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        className={[
          'relative inline-flex shrink-0 items-center rounded-full',
          'transition-colors duration-[var(--duration-fast)] ease-[var(--ease)]',
          'focus-visible:ring-2 focus-visible:ring-[var(--cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)]',
          'outline-none',
        ].join(' ')}
        style={{
          width: dims.w,
          height: dims.h,
          backgroundColor: checked ? 'var(--cyan)' : 'var(--slate)',
        }}
      >
        {/* Thumb */}
        <span
          aria-hidden="true"
          className="block rounded-full bg-white shadow-sm"
          style={{
            width: dims.thumb,
            height: dims.thumb,
            transform: `translateX(${checked ? dims.travel : 2}px)`,
            transition: 'transform 150ms cubic-bezier(0.25, 0.1, 0.25, 1)',
          }}
        />
      </span>

      {/* Label */}
      {label && (
        <span
          id={id}
          className="text-sm text-[var(--text-secondary)] select-none"
        >
          {label}
        </span>
      )}
    </div>
  );
}
