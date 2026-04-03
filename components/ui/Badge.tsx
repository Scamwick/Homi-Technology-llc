'use client';

import { type HTMLAttributes } from 'react';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Badge — Small status indicator pill
 * HōMI Design System
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export type BadgeVariant = 'info' | 'success' | 'warning' | 'caution' | 'danger';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Color variant */
  variant?: BadgeVariant;
  /** Optional leading dot indicator */
  dot?: boolean;
}

const variantStyles: Record<
  BadgeVariant,
  { bg: string; text: string; dot: string }
> = {
  info: {
    bg: 'rgba(34, 211, 238, 0.1)',
    text: 'var(--cyan)',
    dot: 'var(--cyan)',
  },
  success: {
    bg: 'rgba(52, 211, 153, 0.1)',
    text: 'var(--emerald)',
    dot: 'var(--emerald)',
  },
  warning: {
    bg: 'rgba(250, 204, 21, 0.1)',
    text: 'var(--yellow)',
    dot: 'var(--yellow)',
  },
  caution: {
    bg: 'rgba(251, 146, 60, 0.1)',
    text: 'var(--homi-amber)',
    dot: 'var(--homi-amber)',
  },
  danger: {
    bg: 'rgba(239, 68, 68, 0.1)',
    text: 'var(--homi-crimson)',
    dot: 'var(--homi-crimson)',
  },
};

export function Badge({
  variant = 'info',
  dot = false,
  className = '',
  children,
  ...props
}: BadgeProps) {
  const styles = variantStyles[variant];

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5',
        'px-2 py-0.5 text-xs font-semibold leading-tight',
        'rounded-full select-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        backgroundColor: styles.bg,
        color: styles.text,
      }}
      {...props}
    >
      {dot && (
        <span
          className="size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: styles.dot }}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
