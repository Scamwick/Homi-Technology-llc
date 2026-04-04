'use client';

import Link from 'next/link';
import { Home, TrendingDown, Sparkles } from 'lucide-react';
import { Card, Badge } from '@/components/ui';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * CalculatorCard — Structured calculator result card for agent chat
 *
 * Renders formatted calculator output inline in the chat stream.
 * Supports PITI, debt payoff, and score impact result types.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

type CalculatorType = 'piti' | 'debt' | 'score';

interface PITIData {
  type: 'piti';
  totalMonthly: number;
  principalAndInterest: number;
  propertyTax: number;
  insurance: number;
  pmi: number;
  housingRatio: number | null;
  exceedsGuideline: boolean;
}

interface DebtData {
  type: 'debt';
  strategy: 'avalanche' | 'snowball';
  totalMonths: number;
  totalInterest: number;
  interestSaved: number;
}

interface ScoreData {
  type: 'score';
  currentScore: number;
  projectedScore: number;
  delta: number;
  currentVerdict: string;
  projectedVerdict: string;
}

export type CalculatorData = PITIData | DebtData | ScoreData;

export interface CalculatorCardProps {
  data: CalculatorData;
}

const fmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const TYPE_CONFIG: Record<CalculatorType, { icon: typeof Home; label: string; href: string; color: string }> = {
  piti: { icon: Home, label: 'PITI Breakdown', href: '/tools/piti', color: 'var(--emerald)' },
  debt: { icon: TrendingDown, label: 'Debt Payoff Plan', href: '/tools/debt-payoff', color: 'var(--cyan)' },
  score: { icon: Sparkles, label: 'Score Impact', href: '/dashboard', color: 'var(--yellow)' },
};

function PITICard({ data }: { data: PITIData }) {
  const ratioColor = data.exceedsGuideline ? 'var(--homi-crimson)' : 'var(--emerald)';

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <span className="text-[var(--text-secondary)]">P&I</span>
        <span className="text-right tabular-nums text-[var(--text-primary)]">{fmt.format(data.principalAndInterest)}</span>
        <span className="text-[var(--text-secondary)]">Property Tax</span>
        <span className="text-right tabular-nums text-[var(--text-primary)]">{fmt.format(data.propertyTax)}</span>
        <span className="text-[var(--text-secondary)]">Insurance</span>
        <span className="text-right tabular-nums text-[var(--text-primary)]">{fmt.format(data.insurance)}</span>
        {data.pmi > 0 && (
          <>
            <span className="text-[var(--text-secondary)]">PMI</span>
            <span className="text-right tabular-nums text-[var(--text-primary)]">{fmt.format(data.pmi)}</span>
          </>
        )}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[rgba(34,211,238,0.1)]">
        <span className="text-sm font-bold text-[var(--text-primary)]">
          Total: {fmt.format(data.totalMonthly)}/mo
        </span>
        {data.housingRatio !== null && (
          <Badge variant={data.exceedsGuideline ? 'danger' : 'success'} dot>
            <span style={{ color: ratioColor }}>
              {Math.round(data.housingRatio * 100)}% of income
            </span>
          </Badge>
        )}
      </div>
    </div>
  );
}

function DebtCard({ data }: { data: DebtData }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <span className="text-[var(--text-secondary)]">Strategy</span>
        <span className="text-right font-medium text-[var(--text-primary)] capitalize">{data.strategy}</span>
        <span className="text-[var(--text-secondary)]">Payoff Time</span>
        <span className="text-right tabular-nums text-[var(--text-primary)]">{data.totalMonths} months</span>
        <span className="text-[var(--text-secondary)]">Total Interest</span>
        <span className="text-right tabular-nums text-[var(--text-primary)]">{fmt.format(data.totalInterest)}</span>
      </div>
      {data.interestSaved > 0 && (
        <div
          className="rounded-md px-2 py-1 text-xs text-center"
          style={{ background: 'rgba(52,211,153,0.1)', color: 'var(--emerald)' }}
        >
          Saves {fmt.format(data.interestSaved)} vs other strategy
        </div>
      )}
    </div>
  );
}

function ScoreCard({ data }: { data: ScoreData }) {
  const deltaColor = data.delta > 0 ? 'var(--emerald)' : data.delta < 0 ? 'var(--homi-crimson)' : 'var(--text-primary)';
  const verdictChanged = data.currentVerdict !== data.projectedVerdict;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-[var(--text-primary)]">{data.currentScore}</p>
          <p className="text-xs text-[var(--text-secondary)]">Current</p>
        </div>
        <span className="text-lg" style={{ color: deltaColor }}>&rarr;</span>
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: deltaColor }}>{data.projectedScore}</p>
          <p className="text-xs text-[var(--text-secondary)]">Projected</p>
        </div>
        <Badge variant={data.delta > 0 ? 'success' : data.delta < 0 ? 'danger' : 'info'}>
          {data.delta > 0 ? '+' : ''}{data.delta}
        </Badge>
      </div>
      {verdictChanged && (
        <div
          className="rounded-md px-2 py-1 text-xs text-center font-medium"
          style={{ background: 'rgba(52,211,153,0.1)', color: 'var(--emerald)' }}
        >
          {data.currentVerdict} &rarr; {data.projectedVerdict}
        </div>
      )}
    </div>
  );
}

export function CalculatorCard({ data }: CalculatorCardProps) {
  const config = TYPE_CONFIG[data.type];
  const Icon = config.icon;

  return (
    <Card padding="sm">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} style={{ color: config.color }} />
        <span className="text-xs font-semibold" style={{ color: config.color }}>
          {config.label}
        </span>
      </div>

      {data.type === 'piti' && <PITICard data={data} />}
      {data.type === 'debt' && <DebtCard data={data} />}
      {data.type === 'score' && <ScoreCard data={data} />}

      <div className="mt-3 pt-2 border-t border-[rgba(34,211,238,0.1)]">
        <Link
          href={config.href}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--cyan)] transition-colors"
        >
          Open full calculator &rarr;
        </Link>
      </div>
    </Card>
  );
}
