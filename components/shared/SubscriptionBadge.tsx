'use client';

import type { SubscriptionTier } from '@/types/user';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SubscriptionBadge — Tier indicator pill
 *
 * Displays the current subscription tier as a compact pill badge.
 * Used in sidebar, settings, and dashboard.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export interface SubscriptionBadgeProps {
  /** Current subscription tier */
  tier: SubscriptionTier;
  /** Additional CSS classes */
  className?: string;
}

/* ── Tier color mapping ────────────────────────────────────────────────── */

const TIER_STYLES: Record<
  SubscriptionTier,
  { bg: string; text: string; label: string; dot: string }
> = {
  free: {
    bg: 'rgba(100, 116, 139, 0.15)',
    text: 'rgb(148, 163, 184)',
    dot: 'rgb(148, 163, 184)',
    label: 'Free',
  },
  plus: {
    bg: 'rgba(34, 211, 238, 0.1)',
    text: 'var(--cyan)',
    dot: 'var(--cyan)',
    label: 'Plus',
  },
  pro: {
    bg: 'rgba(52, 211, 153, 0.1)',
    text: 'var(--emerald)',
    dot: 'var(--emerald)',
    label: 'Pro',
  },
  family: {
    bg: 'rgba(250, 204, 21, 0.1)',
    text: 'var(--yellow)',
    dot: 'var(--yellow)',
    label: 'Family',
  },
  enterprise_free: {
    bg: 'rgba(168, 85, 247, 0.1)',
    text: 'rgb(168, 85, 247)',
    dot: 'rgb(168, 85, 247)',
    label: 'Enterprise',
  },
  enterprise_paid: {
    bg: 'rgba(168, 85, 247, 0.15)',
    text: 'rgb(192, 132, 252)',
    dot: 'rgb(192, 132, 252)',
    label: 'Enterprise Pro',
  },
};

export function SubscriptionBadge({
  tier,
  className = '',
}: SubscriptionBadgeProps) {
  const styles = TIER_STYLES[tier];

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5',
        'px-2.5 py-0.5 text-xs font-semibold leading-tight',
        'rounded-full select-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        backgroundColor: styles.bg,
        color: styles.text,
      }}
    >
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: styles.dot }}
        aria-hidden="true"
      />
      {styles.label}
    </span>
  );
}
