'use client';

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { Spinner } from './Spinner';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Button — 4 variants, 3 sizes, loading & disabled states
 * HōMI Design System
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export type ButtonVariant = 'primary' | 'cta' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Show loading spinner (replaces text, preserves width) */
  loading?: boolean;
  /** Leading icon element */
  icon?: ReactNode;
  /** Full-width mode */
  fullWidth?: boolean;
}

/* ── Style maps ─────────────────────────────────────────────────────────── */

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'border border-[var(--cyan)] bg-transparent text-[var(--cyan)]',
    'hover:bg-[rgba(34,211,238,0.1)]',
    'active:bg-[rgba(34,211,238,0.15)]',
    'focus-visible:ring-2 focus-visible:ring-[var(--cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)]',
  ].join(' '),
  cta: [
    'border border-transparent bg-[var(--emerald)] text-white font-semibold',
    'hover:bg-[#2bc48a]',
    'active:bg-[#25b57e]',
    'focus-visible:ring-2 focus-visible:ring-[var(--emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)]',
  ].join(' '),
  ghost: [
    'border border-[var(--slate-light)] text-[var(--text-secondary)]',
    'hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)]',
    'active:bg-[rgba(51,65,85,0.3)]',
    'focus-visible:ring-2 focus-visible:ring-[var(--slate-light)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)]',
  ].join(' '),
  danger: [
    'border border-[var(--homi-crimson)] text-[var(--homi-crimson)]',
    'hover:bg-[rgba(239,68,68,0.1)]',
    'active:bg-[rgba(239,68,68,0.15)]',
    'focus-visible:ring-2 focus-visible:ring-[var(--homi-crimson)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)]',
  ].join(' '),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 min-h-[44px] sm:min-h-8 px-3 text-xs gap-1.5 rounded-[var(--radius-sm)]',
  md: 'h-10 min-h-[44px] sm:min-h-10 px-4 text-sm gap-2 rounded-[var(--radius-md)]',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-[var(--radius-md)]',
};

const spinnerSizeMap: Record<ButtonSize, 'sm' | 'md'> = {
  sm: 'sm',
  md: 'sm',
  lg: 'md',
};

/* ── Component ──────────────────────────────────────────────────────────── */

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      fullWidth = false,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        aria-disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center font-medium',
          'select-none whitespace-nowrap',
          'transition-all duration-[var(--duration-fast)] ease-[var(--ease)]',
          'cursor-pointer',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? 'w-full' : '',
          isDisabled ? 'opacity-50 pointer-events-none' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {loading ? (
          <Spinner
            size={spinnerSizeMap[size]}
            color={variant === 'cta' ? '#ffffff' : 'currentColor'}
          />
        ) : (
          <>
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
