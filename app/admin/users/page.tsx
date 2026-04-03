'use client';

import { useState } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, X } from 'lucide-react';

/* ── Mock Users ───────────────────────────────────────────────────────────── */

interface MockUser {
  id: string;
  name: string;
  email: string;
  tier: 'Free' | 'Pro' | 'Enterprise';
  lastAssessment: string;
  verdict: 'READY' | 'ALMOST_THERE' | 'BUILD_FIRST' | 'NOT_YET';
  joined: string;
  assessments: number;
  subscription: string;
  notes: string;
}

const MOCK_USERS: MockUser[] = [
  {
    id: 'u1',
    name: 'Sarah Chen',
    email: 'sarah.chen@gmail.com',
    tier: 'Pro',
    lastAssessment: '2026-04-01',
    verdict: 'READY',
    joined: '2025-11-15',
    assessments: 4,
    subscription: 'Pro Monthly — $19/mo',
    notes: 'Power user. Completed home-buying assessment twice.',
  },
  {
    id: 'u2',
    name: 'Marcus Williams',
    email: 'marcus.w@outlook.com',
    tier: 'Free',
    lastAssessment: '2026-03-28',
    verdict: 'BUILD_FIRST',
    joined: '2026-01-03',
    assessments: 1,
    subscription: 'Free tier',
    notes: 'Recently signed up. Low financial dimension score.',
  },
  {
    id: 'u3',
    name: 'Ana Rodriguez',
    email: 'ana.rodriguez@gmail.com',
    tier: 'Pro',
    lastAssessment: '2026-04-02',
    verdict: 'READY',
    joined: '2025-09-22',
    assessments: 7,
    subscription: 'Pro Annual — $149/yr',
    notes: 'Advocate. Referred 3 users.',
  },
  {
    id: 'u4',
    name: 'James Park',
    email: 'james.park@icloud.com',
    tier: 'Enterprise',
    lastAssessment: '2026-03-30',
    verdict: 'ALMOST_THERE',
    joined: '2025-08-10',
    assessments: 5,
    subscription: 'Enterprise via Meridian Financial',
    notes: 'Couples assessment in progress.',
  },
  {
    id: 'u5',
    name: 'Priya Sharma',
    email: 'priya.s@yahoo.com',
    tier: 'Free',
    lastAssessment: '2026-03-15',
    verdict: 'NOT_YET',
    joined: '2026-02-28',
    assessments: 1,
    subscription: 'Free tier',
    notes: 'Flagged crisis signal in emotional dimension.',
  },
  {
    id: 'u6',
    name: 'David Kim',
    email: 'dkim@protonmail.com',
    tier: 'Pro',
    lastAssessment: '2026-04-01',
    verdict: 'ALMOST_THERE',
    joined: '2025-12-05',
    assessments: 3,
    subscription: 'Pro Monthly — $19/mo',
    notes: 'Career-change assessment focus.',
  },
  {
    id: 'u7',
    name: 'Elena Vasquez',
    email: 'elena.v@gmail.com',
    tier: 'Pro',
    lastAssessment: '2026-03-25',
    verdict: 'BUILD_FIRST',
    joined: '2026-01-18',
    assessments: 2,
    subscription: 'Pro Monthly — $19/mo',
    notes: 'Needs improvement in timing dimension.',
  },
  {
    id: 'u8',
    name: 'Robert Taylor',
    email: 'rob.t@hotmail.com',
    tier: 'Free',
    lastAssessment: '2026-02-10',
    verdict: 'NOT_YET',
    joined: '2026-02-01',
    assessments: 1,
    subscription: 'Free tier — churned',
    notes: 'Has not returned since first assessment.',
  },
  {
    id: 'u9',
    name: 'Michelle Okafor',
    email: 'michelle.o@gmail.com',
    tier: 'Enterprise',
    lastAssessment: '2026-04-02',
    verdict: 'READY',
    joined: '2025-07-30',
    assessments: 9,
    subscription: 'Enterprise via Apex Advisors',
    notes: 'Top engagement. Uses couples + solo assessments.',
  },
  {
    id: 'u10',
    name: 'Tom Brennan',
    email: 'tom.b@workmail.com',
    tier: 'Pro',
    lastAssessment: '2026-03-29',
    verdict: 'ALMOST_THERE',
    joined: '2025-10-12',
    assessments: 4,
    subscription: 'Pro Annual — $149/yr',
    notes: 'Investment readiness assessment user.',
  },
];

const VERDICT_STYLES: Record<string, string> = {
  READY: 'bg-[rgba(52,211,153,0.1)] text-[#34d399] border-[#34d399]',
  ALMOST_THERE: 'bg-[rgba(250,204,21,0.1)] text-[#facc15] border-[#facc15]',
  BUILD_FIRST: 'bg-[rgba(251,146,60,0.1)] text-[#fb923c] border-[#fb923c]',
  NOT_YET: 'bg-[rgba(239,68,68,0.1)] text-[#ef4444] border-[#ef4444]',
};

const TIER_STYLES: Record<string, string> = {
  Free: 'bg-[rgba(148,163,184,0.1)] text-[#94a3b8]',
  Pro: 'bg-[rgba(34,211,238,0.1)] text-[#22d3ee]',
  Enterprise: 'bg-[rgba(52,211,153,0.1)] text-[#34d399]',
};

/* ── Page ──────────────────────────────────────────────────────────────────── */

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [verdictFilter, setVerdictFilter] = useState<string>('All');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const filtered = MOCK_USERS.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchTier = tierFilter === 'All' || u.tier === tierFilter;
    const matchVerdict = verdictFilter === 'All' || u.verdict === verdictFilter;
    return matchSearch && matchTier && matchVerdict;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#e2e8f0]">User Management</h1>
        <p className="mt-1 text-sm text-[#94a3b8]">
          {MOCK_USERS.length} total users
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
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

        {/* Tier Filter */}
        <div className="relative">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="appearance-none rounded-lg border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] px-4 py-2.5 pr-8 text-sm text-[#e2e8f0] outline-none backdrop-blur-xl transition-colors focus:border-[#22d3ee]"
          >
            <option value="All">All Tiers</option>
            <option value="Free">Free</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>
          <Filter className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94a3b8]" />
        </div>

        {/* Verdict Filter */}
        <div className="relative">
          <select
            value={verdictFilter}
            onChange={(e) => setVerdictFilter(e.target.value)}
            className="appearance-none rounded-lg border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] px-4 py-2.5 pr-8 text-sm text-[#e2e8f0] outline-none backdrop-blur-xl transition-colors focus:border-[#22d3ee]"
          >
            <option value="All">All Verdicts</option>
            <option value="READY">READY</option>
            <option value="ALMOST_THERE">ALMOST_THERE</option>
            <option value="BUILD_FIRST">BUILD_FIRST</option>
            <option value="NOT_YET">NOT_YET</option>
          </select>
          <Filter className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94a3b8]" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(34,211,238,0.1)]">
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                Name
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                Email
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                Tier
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                Last Assessment
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                Verdict
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                Joined
              </th>
              <th className="w-10 px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, idx) => (
              <>
                <tr
                  key={user.id}
                  onClick={() =>
                    setExpandedUser(
                      expandedUser === user.id ? null : user.id,
                    )
                  }
                  className={`cursor-pointer border-b border-[rgba(34,211,238,0.05)] transition-colors hover:bg-[rgba(34,211,238,0.03)] ${
                    idx % 2 === 0
                      ? 'bg-[rgba(10,22,40,0.3)]'
                      : 'bg-[rgba(15,23,42,0.3)]'
                  }`}
                >
                  <td className="px-5 py-3 font-medium text-[#e2e8f0]">
                    {user.name}
                  </td>
                  <td className="px-5 py-3 text-[#94a3b8]">{user.email}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${TIER_STYLES[user.tier]}`}
                    >
                      {user.tier}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#94a3b8]">
                    {user.lastAssessment}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${VERDICT_STYLES[user.verdict]}`}
                    >
                      {user.verdict.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#94a3b8]">{user.joined}</td>
                  <td className="px-5 py-3">
                    {expandedUser === user.id ? (
                      <ChevronUp className="h-4 w-4 text-[#94a3b8]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[#94a3b8]" />
                    )}
                  </td>
                </tr>

                {/* Expanded Detail Panel */}
                {expandedUser === user.id && (
                  <tr key={`${user.id}-detail`} className="bg-[rgba(10,22,40,0.6)]">
                    <td colSpan={7} className="px-5 py-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                            Total Assessments
                          </p>
                          <p className="mt-1 text-lg font-bold text-[#22d3ee]">
                            {user.assessments}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                            Subscription
                          </p>
                          <p className="mt-1 text-sm text-[#e2e8f0]">
                            {user.subscription}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                            Notes
                          </p>
                          <p className="mt-1 text-sm text-[#e2e8f0]">
                            {user.notes}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-[#94a3b8]">
            No users match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}
