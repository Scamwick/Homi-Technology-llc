'use client';

import { useState } from 'react';
import { Filter, Shield, UserCog, Settings, Key, FileEdit } from 'lucide-react';
import type { AuditLogRow } from '@/types/database';

/* ── Types ────────────────────────────────────────────────────────────────── */

interface EnrichedAuditEntry extends AuditLogRow {
  admin_email?: string;
}

const ACTION_TYPE_MAP: Record<string, { bg: string; text: string; icon: typeof Shield }> = {
  user: { bg: 'bg-[rgba(34,211,238,0.1)]', text: 'text-[#22d3ee]', icon: UserCog },
  assessment: { bg: 'bg-[rgba(52,211,153,0.1)]', text: 'text-[#34d399]', icon: FileEdit },
  subscription: { bg: 'bg-[rgba(250,204,21,0.1)]', text: 'text-[#facc15]', icon: Key },
  crisis: { bg: 'bg-[rgba(239,68,68,0.1)]', text: 'text-[#ef4444]', icon: Shield },
  agent: { bg: 'bg-[rgba(148,163,184,0.1)]', text: 'text-[#94a3b8]', icon: Settings },
  org: { bg: 'bg-[rgba(52,211,153,0.1)]', text: 'text-[#34d399]', icon: Key },
  couple: { bg: 'bg-[rgba(250,204,21,0.1)]', text: 'text-[#facc15]', icon: UserCog },
  advisor: { bg: 'bg-[rgba(34,211,238,0.1)]', text: 'text-[#22d3ee]', icon: Shield },
  monte_carlo: { bg: 'bg-[rgba(34,211,238,0.1)]', text: 'text-[#22d3ee]', icon: Settings },
  trinity: { bg: 'bg-[rgba(52,211,153,0.1)]', text: 'text-[#34d399]', icon: Settings },
};

function getActionCategory(action: string): string {
  return action.split('.')[0] ?? 'user';
}

/* ── Component ────────────────────────────────────────────────────────────── */

interface Props {
  entries: EnrichedAuditEntry[];
  total: number;
}

export default function AdminAuditContent({ entries, total }: Props) {
  const [typeFilter, setTypeFilter] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(entries.map((e) => getActionCategory(e.action))))];

  const filtered = typeFilter === 'All'
    ? entries
    : entries.filter((e) => getActionCategory(e.action) === typeFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#e2e8f0]">Audit Log</h1>
        <p className="mt-1 text-sm text-[#94a3b8]">{total} total entries</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="appearance-none rounded-lg border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] px-4 py-2.5 pr-8 text-sm text-[#e2e8f0] outline-none backdrop-blur-xl transition-colors focus:border-[#22d3ee]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Types' : cat}
              </option>
            ))}
          </select>
          <Filter className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94a3b8]" />
        </div>
        <span className="text-xs text-[#94a3b8]">{filtered.length} entries</span>
      </div>

      {/* Timeline */}
      <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
        {filtered.length > 0 ? (
          <div className="divide-y divide-[rgba(34,211,238,0.05)]">
            {filtered.map((entry, idx) => {
              const category = getActionCategory(entry.action);
              const style = ACTION_TYPE_MAP[category] ?? ACTION_TYPE_MAP.user;
              const IconComponent = style.icon;

              return (
                <div
                  key={entry.id}
                  className={`flex items-start gap-4 px-5 py-4 ${
                    idx % 2 === 0 ? 'bg-[rgba(10,22,40,0.3)]' : 'bg-[rgba(15,23,42,0.3)]'
                  }`}
                >
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.bg}`}>
                    <IconComponent className={`h-4.5 w-4.5 ${style.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#e2e8f0]">
                          {entry.action.replace(/\./g, ' — ')}
                        </p>
                        <p className="mt-0.5 text-xs text-[#94a3b8]">
                          {entry.resource_type}: <span className="text-[#22d3ee]">{entry.resource_id.slice(0, 12)}</span>
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-medium text-[#94a3b8]">
                          {new Date(entry.created_at).toLocaleString()}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#94a3b8]">
                          {entry.admin_email ?? 'system'}
                        </p>
                      </div>
                    </div>
                    {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                      <p className="mt-1.5 text-xs text-[#94a3b8]">
                        {JSON.stringify(entry.metadata).slice(0, 120)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-[#94a3b8]">
            {entries.length === 0
              ? 'No audit entries yet. Actions will be logged here once the platform is active.'
              : 'No entries match the current filter.'}
          </div>
        )}
      </div>
    </div>
  );
}
