'use client';

import { type SVGProps } from 'react';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Spinner — Animated loading indicator
 * HōMI Design System
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const SIZES = {
  sm: 16,
  md: 24,
  lg: 40,
} as const;

export interface SpinnerProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** Visual size of the spinner */
  size?: keyof typeof SIZES;
  /** Override color (defaults to var(--cyan)) */
  color?: string;
}

export function Spinner({
  size = 'md',
  color = 'var(--cyan)',
  className = '',
  ...props
}: SpinnerProps) {
  const px = SIZES[size];
  const strokeWidth = size === 'sm' ? 3 : size === 'lg' ? 3.5 : 3;

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="Loading"
      className={className}
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="var(--slate-light)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity={0.25}
      />
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray="60 200"
        style={{
          animation: 'homi-spin 1s linear infinite',
          transformOrigin: 'center',
        }}
      />
      <style>{`
        @keyframes homi-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
  );
}
