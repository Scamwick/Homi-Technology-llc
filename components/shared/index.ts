/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Shared Components — Barrel Export
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export { PaywallModal } from './PaywallModal';
export type { PaywallModalProps } from './PaywallModal';

export { SubscriptionBadge } from './SubscriptionBadge';
export type { SubscriptionBadgeProps } from './SubscriptionBadge';

export { ErrorBoundary } from './ErrorBoundary';
export type { ErrorBoundaryProps } from './ErrorBoundary';

export { PageHeader } from './PageHeader';
export type { PageHeaderProps } from './PageHeader';

// Re-export EmptyState from ui for convenience
export { EmptyState } from '@/components/ui';
export type { EmptyStateProps, EmptyStateAction } from '@/components/ui';
