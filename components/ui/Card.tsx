'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Card — Glass-morphism container
 * Variants: default, verdict (colored left border), interactive (hover lift)
 * HōMI Design System
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export type CardPadding = 'sm' | 'md' | 'lg';
export type VerdictState = 'ready' | 'almost' | 'build' | 'stop';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Padding preset */
  padding?: CardPadding;
  /** Verdict variant — adds 4px left border colored by state */
  verdict?: VerdictState;
  /** Interactive variant — cursor pointer, hover lift */
  interactive?: boolean;
  /** Optional header content */
  header?: ReactNode;
  /** Optional footer content */
  footer?: ReactNode;
}

const paddingMap: Record<CardPadding, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-10',
};

const verdictColorMap: Record<VerdictState, string> = {
  ready: 'var(--verdict-ready)',
  almost: 'var(--verdict-almost)',
  build: 'var(--verdict-build)',
  stop: 'var(--verdict-stop)',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      padding = 'md',
      verdict,
      interactive = false,
      header,
      footer,
      className = '',
      children,
      style,
      ...props
    },
    ref,
  ) => {
    const isVerdict = verdict !== undefined;

    return (
      <div
        ref={ref}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        className={[
          /* layout */
          'relative flex flex-col',
          paddingMap[padding],
          /* glass-morphism */
          'rounded-[var(--radius-lg)]',
          'backdrop-blur-[10px]',
          /* transitions */
          'transition-all duration-[var(--duration-base)] ease-[var(--ease)]',
          /* interactive lift */
          interactive
            ? 'cursor-pointer hover:-translate-y-px active:translate-y-0'
            : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          background: 'rgba(30, 41, 59, 0.8)',
          border: '1px solid rgba(34, 211, 238, 0.2)',
          ...(isVerdict
            ? { borderLeft: `4px solid ${verdictColorMap[verdict]}` }
            : {}),
          ...style,
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.borderColor = 'rgba(34, 211, 238, 0.5)';
          el.style.background = 'rgba(30, 41, 59, 0.95)';
          if (isVerdict) {
            el.style.borderLeftColor = verdictColorMap[verdict];
          }
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.borderColor = 'rgba(34, 211, 238, 0.2)';
          el.style.background = 'rgba(30, 41, 59, 0.8)';
          if (isVerdict) {
            el.style.borderLeftColor = verdictColorMap[verdict];
          }
        }}
        onKeyDown={(e) => {
          if (interactive && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            e.currentTarget.click();
          }
        }}
        {...props}
      >
        {header && (
          <div className="mb-4 pb-4 border-b border-[rgba(34,211,238,0.1)]">
            {header}
          </div>
        )}

        <div className="flex-1">{children}</div>

        {footer && (
          <div className="mt-4 pt-4 border-t border-[rgba(34,211,238,0.1)]">
            {footer}
          </div>
        )}
      </div>
    );
  },
);

Card.displayName = 'Card';
