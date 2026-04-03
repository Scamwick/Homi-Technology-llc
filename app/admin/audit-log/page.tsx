'use client';

import { useState } from 'react';
import { Filter, Shield, UserCog, Settings, Key, FileEdit, Trash2, Eye } from 'lucide-react';

/* ── Mock Data ────────────────────────────────────────────────────────────── */

interface AuditEntry {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
  actionType: 'user' | 'content' | 'settings' | 'partner' | 'security';
  target: string;
  details: string;
}

const MOCK_AUDIT: AuditEntry[] = [
  {
    id: 'al1',
    timestamp: '2026-04-03 09:42:18',
    admin: 'admin@homitechnology.com',
    action: 'Deactivated question',
    actionType: 'content',
    target: 'Q008',
    details: 'Disabled timing question about deadlines from assessment pool.',
  },
  {
    id: 'al2',
    timestamp: '2026-04-03 08:15:03',
    admin: 'admin@homitechnology.com',
    action: 'Updated user tier',
    actionType: 'user',
    target: 'james.park@icloud.com',
    details: 'Changed tier from Pro to Enterprise (Meridian Financial).',
  },
  {
    id: 'al3',
    timestamp: '2026-04-02 17:30:45',
    admin: 'ops@homitechnology.com',
    action: 'Generated API key',
    actionType: 'partner',
    target: 'NovaCrest Wealth',
    details: 'Created sandbox API key for partner onboarding.',
  },
  {
    id: 'al4',
    timestamp: '2026-04-02 14:22:10',
    admin: 'admin@homitechnology.com',
    action: 'Modified scoring weight',
    actionType: 'content',
    target: 'Q001',
    details: 'Updated weight from 1.0 to 1.2 for emergency fund question.',
  },
  {
    id: 'al5',
    timestamp: '2026-04-01 11:05:33',
    admin: 'admin@homitechnology.com',
    action: 'Viewed user data',
    actionType: 'user',
    target: 'priya.s@yahoo.com',
    details: 'Reviewed flagged crisis signal in emotional dimension.',
  },
  {
    id: 'al6',
    timestamp: '2026-04-01 09:18:22',
    admin: 'ops@homitechnology.com',
    action: 'Updated email template',
    actionType: 'content',
    target: 'Welcome Email',
    details: 'Revised subject line and CTA for improved open rate.',
  },
  {
    id: 'al7',
    timestamp: '2026-03-31 16:40:11',
    admin: 'admin@homitechnology.com',
    action: 'Changed system setting',
    actionType: 'settings',
    target: 'Assessment timeout',
    details: 'Increased assessment session timeout from 30 to 45 minutes.',
  },
  {
    id: 'al8',
    timestamp: '2026-03-31 10:55:08',
    admin: 'admin@homitechnology.com',
    action: 'Deleted test user',
    actionType: 'user',
    target: 'test-user-042@test.com',
    details: 'Removed staging test account from production database.',
  },
  {
    id: 'al9',
    timestamp: '2026-03-30 14:12:55',
    admin: 'ops@homitechnology.com',
    action: 'Rotated API secret',
    actionType: 'security',
    target: 'Meridian Financial',
    details: 'Rotated production API secret per quarterly security policy.',
  },
  {
    id: 'al10',
    timestamp: '2026-03-30 09:30:17',
    admin: 'admin@homitechnology.com',
    action: 'Added partner',
    actionType: 'partner',
    target: 'NovaCrest Wealth',
    details: 'Created partner account with onboarding status.',
  },
];

const ACTION_TYPE_STYLES: Record<string, { bg: string; text: string; icon: typeof Shield }> = {
  user: { bg: 'bg-[rgba(34,211,238,0.1)]', text: 'text-[#22d3ee]', icon: UserCog },
  content: { bg: 'bg-[rgba(250,204,21,0.1)]', text: 'text-[#facc15]', icon: FileEdit },
  settings: { bg: 'bg-[rgba(148,163,184,0.1)]', text: 'text-[#94a3b8]', icon: Settings },
  partner: { bg: 'bg-[rgba(52,211,153,0.1)]', text: 'text-[#34d399]', icon: Key },
  security: { bg: 'bg-[rgba(239,68,68,0.1)]', text: 'text-[#ef4444]', icon: Shield },
};

/* ── Page ──────────────────────────────────────────────────────────────────── */

export default function AdminAuditLog() {
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [adminFilter, setAdminFilter] = useState<string>('All');

  const admins = ['All', ...Array.from(new Set(MOCK_AUDIT.map((e) => e.admin)))];

  const filtered = MOCK_AUDIT.filter((entry) => {
    const matchType =
      typeFilter === 'All' || entry.actionType === typeFilter;
    const matchAdmin =
      adminFilter === 'All' || entry.admin === adminFilter;
    return matchType && matchAdmin;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#e2e8f0]">Audit Log</h1>
        <p className="mt-1 text-sm text-[#94a3b8]">
          Chronological record of all admin actions
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Action Type Filter */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="appearance-none rounded-lg border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] px-4 py-2.5 pr-8 text-sm text-[#e2e8f0] outline-none backdrop-blur-xl transition-colors focus:border-[#22d3ee]"
          >
            <option value="All">All Types</option>
            <option value="user">User</option>
            <option value="content">Content</option>
            <option value="settings">Settings</option>
            <option value="partner">Partner</option>
            <option value="security">Security</option>
          </select>
          <Filter className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94a3b8]" />
        </div>

        {/* Admin User Filter */}
        <div className="relative">
          <select
            value={adminFilter}
            onChange={(e) => setAdminFilter(e.target.value)}
            className="appearance-none rounded-lg border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] px-4 py-2.5 pr-8 text-sm text-[#e2e8f0] outline-none backdrop-blur-xl transition-colors focus:border-[#22d3ee]"
          >
            {admins.map((a) => (
              <option key={a} value={a}>
                {a === 'All' ? 'All Admins' : a}
              </option>
            ))}
          </select>
          <Filter className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94a3b8]" />
        </div>

        <span className="text-xs text-[#94a3b8]">
          {filtered.length} entries
        </span>
      </div>

      {/* Audit Timeline */}
      <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
        <div className="divide-y divide-[rgba(34,211,238,0.05)]">
          {filtered.map((entry, idx) => {
            const style = ACTION_TYPE_STYLES[entry.actionType];
            const IconComponent = style.icon;

            return (
              <div
                key={entry.id}
                className={`flex items-start gap-4 px-5 py-4 ${
                  idx % 2 === 0
                    ? 'bg-[rgba(10,22,40,0.3)]'
                    : 'bg-[rgba(15,23,42,0.3)]'
                }`}
              >
                {/* Icon */}
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.bg}`}
                >
                  <IconComponent className={`h-4.5 w-4.5 ${style.text}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[#e2e8f0]">
                        {entry.action}
                      </p>
                      <p className="mt-0.5 text-xs text-[#94a3b8]">
                        Target: <span className="text-[#22d3ee]">{entry.target}</span>
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-medium text-[#94a3b8]">
                        {entry.timestamp}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#94a3b8]">
                        {entry.admin}
                      </p>
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs text-[#94a3b8]">
                    {entry.details}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-[#94a3b8]">
            No audit entries match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}
