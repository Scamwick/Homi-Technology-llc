'use client';

import { useState } from 'react';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import type { ProfileRow } from '@/types/database';

/* ── Types ────────────────────────────────────────────────────────────────── */

interface EnrichedUser extends ProfileRow {
  assessment_count?: number;
  last_verdict?: string;
  last_assessment_date?: string;
}

const VERDICT_STYLES: Record<string, string> = {
  READY: 'bg-[rgba(52,211,153,0.1)] text-[#34d399] border-[#34d399]',
  ALMOST_THERE: 'bg-[rgba(250,204,21,0.1)] text-[#facc15] border-[#facc15]',
  BUILD_FIRST: 'bg-[rgba(251,146,60,0.1)] text-[#fb923c] border-[#fb923c]',
  NOT_YET: 'bg-[rgba(239,68,68,0.1)] text-[#ef4444] border-[#ef4444]',
};

const TIER_STYLES: Record<string, string> = {
  free: 'bg-[rgba(148,163,184,0.1)] text-[#94a3b8]',
  plus: 'bg-[rgba(34,211,238,0.1)] text-[#22d3ee]',
  pro: 'bg-[rgba(52,211,153,0.1)] text-[#34d399]',
  family: 'bg-[rgba(250,204,21,0.1)] text-[#facc15]',
};

/* ── Component ────────────────────────────────────────────────────────────── */

interface Props {
  users: EnrichedUser[];
  total: number;
}

export default function AdminUsersContent({ users, total }: Props) {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [verdictFilter, setVerdictFilter] = useState<string>('All');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchTier = tierFilter === 'All' || u.tier === tierFilter;
    const matchVerdict = verdictFilter === 'All' || u.last_verdict === verdictFilter;
    return matchSearch && matchTier && matchVerdict;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#e2e8f0]">User Management</h1>
        <p className="mt-1 text-sm text-[#94a3b8]">{total} total users</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] py-2.5 pl-10 pr-4 text-sm text-[#e2e8f0] placeholder-[#94a3b8] outline-none backdrop-blur-xl transition-colors focus:border-[#22d3ee]"
          />
        </div>

        <div className="relative">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="appearance-none rounded-lg border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] px-4 py-2.5 pr-8 text-sm text-[#e2e8f0] outline-none backdrop-blur-xl transition-colors focus:border-[#22d3ee]"
          >
            <option value="All">All Tiers</option>
            <option value="free">Free</option>
            <option value="plus">Plus</option>
            <option value="pro">Pro</option>
            <option value="family">Family</option>
          </select>
          <Filter className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94a3b8]" />
        </div>

        <div className="relative">
          <select
            value={verdictFilter}
            onChange={(e) => setVerdictFilter(e.target.value)}
            className="appearance-none rounded-lg border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] px-4 py-2.5 pr-8 text-sm text-[#e2e8f0] outline-none backdrop-blur-xl transition-colors focus:border-[#22d3ee]"
          >
            <option value="All">All Verdicts</option>
            <option value="READY">READY</option>
            <option value="ALMOST_THERE">ALMOST THERE</option>
            <option value="BUILD_FIRST">BUILD FIRST</option>
            <option value="NOT_YET">NOT YET</option>
          </select>
          <Filter className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94a3b8]" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(34,211,238,0.1)]">
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Name</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Email</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Tier</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Last Verdict</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Joined</th>
              <th className="w-10 px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, idx) => (
              <tr key={user.id}>
                <td colSpan={6} className="p-0">
                  <div
                    onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                    className={`flex cursor-pointer items-center border-b border-[rgba(34,211,238,0.05)] transition-colors hover:bg-[rgba(34,211,238,0.03)] ${
                      idx % 2 === 0 ? 'bg-[rgba(10,22,40,0.3)]' : 'bg-[rgba(15,23,42,0.3)]'
                    }`}
                  >
                    <span className="flex-1 px-5 py-3 font-medium text-[#e2e8f0]">{user.name}</span>
                    <span className="flex-1 px-5 py-3 text-[#94a3b8]">{user.email}</span>
                    <span className="flex-1 px-5 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${TIER_STYLES[user.tier] ?? ''}`}>
                        {user.tier}
                      </span>
                    </span>
                    <span className="flex-1 px-5 py-3">
                      {user.last_verdict ? (
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${VERDICT_STYLES[user.last_verdict] ?? ''}`}>
                          {user.last_verdict.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-xs text-[#94a3b8]">No assessment</span>
                      )}
                    </span>
                    <span className="flex-1 px-5 py-3 text-[#94a3b8]">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                    <span className="px-5 py-3">
                      {expandedUser === user.id ? (
                        <ChevronUp className="h-4 w-4 text-[#94a3b8]" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-[#94a3b8]" />
                      )}
                    </span>
                  </div>

                  {expandedUser === user.id && (
                    <div className="bg-[rgba(10,22,40,0.6)] px-5 py-4 border-b border-[rgba(34,211,238,0.05)]">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">Assessments</p>
                          <p className="mt-1 text-lg font-bold text-[#22d3ee]">{user.assessment_count ?? 0}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">Last Assessment</p>
                          <p className="mt-1 text-sm text-[#e2e8f0]">
                            {user.last_assessment_date
                              ? new Date(user.last_assessment_date).toLocaleDateString()
                              : 'Never'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">Onboarding</p>
                          <p className="mt-1 text-sm text-[#e2e8f0]">
                            {user.onboarding_complete ? 'Complete' : 'Incomplete'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-[#94a3b8]">
            {users.length === 0
              ? 'No users yet. Connect Supabase to view platform users.'
              : 'No users match the current filters.'}
          </div>
        )}
      </div>
    </div>
  );
}
