'use client';

import { Badge } from '@/components/ui';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * DataSourceLabel — Tiny indicator showing where calculator data comes from
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export type DataSource = 'plaid' | 'assessment' | 'manual' | 'estimate';

interface DataSourceLabelProps {
  source: DataSource;
  className?: string;
}

const sourceConfig: Record<DataSource, { label: string; variant: 'success' | 'info' | 'warning' | 'caution' }> = {
  plaid: { label: 'Verified via Plaid', variant: 'success' },
  assessment: { label: 'From your assessment', variant: 'info' },
  manual: { label: 'Your input', variant: 'info' },
  estimate: { label: 'Estimate', variant: 'caution' },
};

export function DataSourceLabel({ source, className }: DataSourceLabelProps) {
  const config = sourceConfig[source];
  return (
    <Badge variant={config.variant} dot className={className}>
      {config.label}
    </Badge>
  );
}
