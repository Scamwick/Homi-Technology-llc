'use client';

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Input — Text input with label, error, and icon support
 * HōMI Design System
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message displayed below the input */
  error?: string;
  /** Helper text displayed below the input (hidden when error is present) */
  hint?: string;
  /** Leading icon or element */
  leadingIcon?: ReactNode;
  /** Trailing icon or element */
  trailingIcon?: ReactNode;
  /** Full-width mode */
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leadingIcon,
      trailingIcon,
      fullWidth = false,
      className = '',
      id: externalId,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = externalId ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint && !error ? `${inputId}-hint` : undefined;
    const hasError = Boolean(error);

    return (
      <div className={[fullWidth ? 'w-full' : '', className].filter(Boolean).join(' ')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-1.5 text-sm font-medium text-[var(--text-secondary)]"
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Leading icon */}
          {leadingIcon && (
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none"
              aria-hidden="true"
            >
              {leadingIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              [errorId, hintId].filter(Boolean).join(' ') || undefined
            }
            className={[
              'w-full appearance-none',
              'bg-[var(--slate)] text-[var(--text-primary)]',
              'placeholder:text-[var(--text-secondary)]',
              'rounded-[var(--radius-md)]',
              'h-10 px-3 text-sm',
              /* padding adjustments for icons */
              leadingIcon ? 'pl-10' : '',
              trailingIcon ? 'pr-10' : '',
              /* border */
              'border outline-none',
              hasError
                ? 'border-[var(--homi-crimson)]'
                : 'border-[var(--slate-light)]',
              /* focus */
              hasError
                ? 'focus:border-[var(--homi-crimson)] focus:ring-2 focus:ring-[rgba(239,68,68,0.2)]'
                : 'focus:border-[var(--cyan)] focus:ring-2 focus:ring-[rgba(34,211,238,0.2)]',
              /* disabled */
              disabled ? 'opacity-50 cursor-not-allowed' : '',
              /* transition */
              'transition-all duration-[var(--duration-fast)] ease-[var(--ease)]',
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />

          {/* Trailing icon */}
          {trailingIcon && (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
              aria-hidden="true"
            >
              {trailingIcon}
            </span>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p
            id={errorId}
            role="alert"
            className="mt-1.5 text-xs text-[var(--homi-crimson)]"
          >
            {error}
          </p>
        )}

        {/* Hint text */}
        {hint && !error && (
          <p id={hintId} className="mt-1.5 text-xs text-[var(--text-secondary)]">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
