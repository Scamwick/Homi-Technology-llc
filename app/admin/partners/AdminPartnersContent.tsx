'use client';

import { Building2 } from 'lucide-react';
import type { OrganizationRow } from '@/types/database';

interface EnrichedOrg extends OrganizationRow {
  member_count?: number;
}

interface Props {
  organizations: EnrichedOrg[];
}

export default function AdminPartnersContent({ organizations }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#e2e8f0]">Partner Management</h1>
        <p className="mt-1 text-sm text-[#94a3b8]">{organizations.length} partners</p>
      </div>

      {organizations.length > 0 ? (
        <>
          {/* Partner Cards */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {organizations.map((org) => (
              <div key={org.id} className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-5 backdrop-blur-xl transition-all hover:border-[rgba(34,211,238,0.2)]">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(34,211,238,0.1)]">
                    <Building2 className="h-5 w-5 text-[#22d3ee]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#e2e8f0]">{org.name}</h3>
                    <p className="text-xs text-[#94a3b8]">
                      Since {new Date(org.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">Members</p>
                    <p className="mt-1 text-lg font-bold text-[#e2e8f0]">{org.member_count ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">Tier</p>
                    <p className="mt-1 text-sm font-medium capitalize text-[#22d3ee]">{org.tier}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">Max</p>
                    <p className="mt-1 text-lg font-bold text-[#34d399]">{org.max_members}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Partner Table */}
          <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
            <div className="border-b border-[rgba(34,211,238,0.1)] px-5 py-4">
              <h2 className="text-sm font-semibold text-[#e2e8f0]">Partner Details</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(34,211,238,0.1)]">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Organization</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Tier</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Members</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Created</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org, idx) => (
                  <tr key={org.id} className={`border-b border-[rgba(34,211,238,0.05)] ${idx % 2 === 0 ? 'bg-[rgba(10,22,40,0.3)]' : 'bg-[rgba(15,23,42,0.3)]'}`}>
                    <td className="px-5 py-3 font-medium text-[#e2e8f0]">{org.name}</td>
                    <td className="px-5 py-3 capitalize text-[#22d3ee]">{org.tier}</td>
                    <td className="px-5 py-3 text-[#94a3b8]">{org.member_count ?? 0}</td>
                    <td className="px-5 py-3 text-[#94a3b8]">{new Date(org.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] py-16 text-center backdrop-blur-xl">
          <Building2 className="mx-auto h-10 w-10 text-[#94a3b8]" />
          <p className="mt-3 text-sm font-medium text-[#e2e8f0]">No partners yet</p>
          <p className="mt-1 text-xs text-[#94a3b8]">Partner organizations will appear here once created.</p>
        </div>
      )}
    </div>
  );
}
