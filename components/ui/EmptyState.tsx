'use client';

import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';
import type { ButtonVariant } from './Button';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * EmptyState — Placeholder for empty lists / screens
 * HōMI Design System
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
}

export interface EmptyStateProps {
  /** Lucide icon component */
  icon: LucideIcon;
  /** Heading text */
  title: string;
  /** Supporting description */
  description: string;
  /** Optional CTA button */
  action?: EmptyStateAction;
  /** Additional classes */
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center',
        'py-12 px-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Icon */}
      <div className="mb-4">
        <Icon
          size={48}
          className="text-[var(--text-secondary)]"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-[var(--text-secondary)] max-w-xs mb-6">
        {description}
      </p>

      {/* Action */}
      {action && (
        <Button
          variant={action.variant ?? 'primary'}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
