'use client';

import { useState } from 'react';
import { Plus, X, Building2, Activity } from 'lucide-react';

/* ── Mock Data ────────────────────────────────────────────────────────────── */

interface MockPartner {
  id: string;
  company: string;
  status: 'Active' | 'Onboarding' | 'Paused';
  clients: number;
  revenue: string;
  apiCalls: string;
  contact: string;
  since: string;
}

const MOCK_PARTNERS: MockPartner[] = [
  {
    id: 'p1',
    company: 'Meridian Financial',
    status: 'Active',
    clients: 342,
    revenue: '$4,800/mo',
    apiCalls: '12,340',
    contact: 'broker@meridianfinancial.com',
    since: '2025-06-15',
  },
  {
    id: 'p2',
    company: 'Apex Advisors',
    status: 'Active',
    clients: 187,
    revenue: '$2,600/mo',
    apiCalls: '6,780',
    contact: 'partnerships@apexadvisors.io',
    since: '2025-09-01',
  },
  {
    id: 'p3',
    company: 'NovaCrest Wealth',
    status: 'Onboarding',
    clients: 0,
    revenue: '$0',
    apiCalls: '45',
    contact: 'tech@novacreastwealth.com',
    since: '2026-03-20',
  },
];

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-[rgba(52,211,153,0.1)] text-[#34d399]',
  Onboarding: 'bg-[rgba(250,204,21,0.1)] text-[#facc15]',
  Paused: 'bg-[rgba(148,163,184,0.1)] text-[#94a3b8]',
};

/* ── Page ──────────────────────────────────────────────────────────────────── */

export default function AdminPartners() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e8f0]">
            Partner Management
          </h1>
          <p className="mt-1 text-sm text-[#94a3b8]">
            {MOCK_PARTNERS.length} partners
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#22d3ee] to-[#34d399] px-5 py-2.5 text-sm font-semibold text-[#0a1628] transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Partner
        </button>
      </div>

      {/* Partner Cards */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {MOCK_PARTNERS.map((partner) => (
          <div
            key={partner.id}
            className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-5 backdrop-blur-xl transition-all hover:border-[rgba(34,211,238,0.2)]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(34,211,238,0.1)]">
                  <Building2 className="h-5 w-5 text-[#22d3ee]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#e2e8f0]">
                    {partner.company}
                  </h3>
                  <p className="text-xs text-[#94a3b8]">
                    Since {partner.since}
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[partner.status]}`}
              >
                {partner.status}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                  Clients
                </p>
                <p className="mt-1 text-lg font-bold text-[#e2e8f0]">
                  {partner.clients.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                  Revenue
                </p>
                <p className="mt-1 text-lg font-bold text-[#34d399]">
                  {partner.revenue}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                  API Calls
                </p>
                <p className="mt-1 text-lg font-bold text-[#22d3ee]">
                  {partner.apiCalls}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-[rgba(10,22,40,0.5)] px-3 py-2">
              <p className="text-xs text-[#94a3b8]">
                Contact: {partner.contact}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Partner Table */}
      <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
        <div className="border-b border-[rgba(34,211,238,0.1)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#e2e8f0]">
            Partner Details
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(34,211,238,0.1)]">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                Company
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                Status
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                Clients
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                Revenue
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                API Calls
              </th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PARTNERS.map((p, idx) => (
              <tr
                key={p.id}
                className={`border-b border-[rgba(34,211,238,0.05)] ${
                  idx % 2 === 0
                    ? 'bg-[rgba(10,22,40,0.3)]'
                    : 'bg-[rgba(15,23,42,0.3)]'
                }`}
              >
                <td className="px-5 py-3 font-medium text-[#e2e8f0]">
                  {p.company}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[p.status]}`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-[#94a3b8]">
                  {p.clients.toLocaleString()}
                </td>
                <td className="px-5 py-3 font-medium text-[#34d399]">
                  {p.revenue}
                </td>
                <td className="px-5 py-3 text-[#94a3b8]">{p.apiCalls}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Partner Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[rgba(34,211,238,0.15)] bg-[#0f172a] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#e2e8f0]">
                Add Partner
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-[#94a3b8] transition-colors hover:bg-[rgba(30,41,59,0.5)] hover:text-[#e2e8f0]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#94a3b8]">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="Enter company name"
                  className="w-full rounded-lg border border-[rgba(34,211,238,0.1)] bg-[rgba(10,22,40,0.5)] px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#94a3b8] outline-none focus:border-[#22d3ee]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#94a3b8]">
                  Contact Email
                </label>
                <input
                  type="email"
                  placeholder="partner@company.com"
                  className="w-full rounded-lg border border-[rgba(34,211,238,0.1)] bg-[rgba(10,22,40,0.5)] px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#94a3b8] outline-none focus:border-[#22d3ee]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#94a3b8]">
                  Tier
                </label>
                <select className="w-full rounded-lg border border-[rgba(34,211,238,0.1)] bg-[rgba(10,22,40,0.5)] px-3 py-2.5 text-sm text-[#e2e8f0] outline-none focus:border-[#22d3ee]">
                  <option>Standard</option>
                  <option>Premium</option>
                  <option>Enterprise</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full border border-[#334155] px-4 py-2 text-sm font-medium text-[#e2e8f0] transition-colors hover:border-[#22d3ee]"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full bg-gradient-to-r from-[#22d3ee] to-[#34d399] px-5 py-2 text-sm font-semibold text-[#0a1628] transition-opacity hover:opacity-90"
              >
                Create Partner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
