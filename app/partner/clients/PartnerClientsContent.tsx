'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  UserPlus,
  Filter,
  Mail,
} from 'lucide-react';
import { Card, Badge, Button, Input, Modal } from '@/components/ui';
import type { PartnerClient } from '@/lib/data/partner';
import type { Verdict } from '@/types/assessment';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Partner Clients Content (Client Component)
 *
 * Client management table with search, filter, invite modal.
 * Data comes from server via props.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const VERDICT_STYLES: Record<string, { color: string; bg: string; label: string; badgeVariant: 'success' | 'warning' | 'caution' | 'danger' }> = {
  READY: { color: 'var(--emerald)', bg: 'rgba(52,211,153,0.1)', label: 'READY', badgeVariant: 'success' },
  ALMOST_THERE: { color: 'var(--yellow)', bg: 'rgba(250,204,21,0.1)', label: 'ALMOST', badgeVariant: 'warning' },
  BUILD_FIRST: { color: 'var(--homi-amber)', bg: 'rgba(251,146,60,0.1)', label: 'BUILD FIRST', badgeVariant: 'caution' },
  NOT_YET: { color: 'var(--homi-crimson)', bg: 'rgba(239,68,68,0.1)', label: 'NOT YET', badgeVariant: 'danger' },
};

type VerdictFilter = 'all' | Verdict;

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface PartnerClientsContentProps {
  clients: PartnerClient[];
}

export default function PartnerClientsContent({ clients }: PartnerClientsContentProps) {
  const [search, setSearch] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<VerdictFilter>('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const name = c.profile?.name ?? '';
      const email = c.profile?.email ?? '';
      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase()) ||
        c.user_id.toLowerCase().includes(search.toLowerCase());
      const verdict = c.latest_assessment?.verdict;
      const matchesVerdict = verdictFilter === 'all' || verdict === verdictFilter;
      return matchesSearch && matchesVerdict;
    });
  }, [clients, search, verdictFilter]);

  return (
    <motion.div
      className="mx-auto w-full max-w-6xl space-y-6"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Page header */}
      <motion.div variants={fadeUp} className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
            Clients
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
            Manage your client portfolio and assessments
          </p>
        </div>
        <Button
          variant="cta"
          size="md"
          icon={<UserPlus size={16} />}
          onClick={() => setInviteOpen(true)}
        >
          Invite Client
        </Button>
      </motion.div>

      {/* Search + Filter */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px]">
          <Input
            placeholder="Search by name, email, or user ID..."
            leadingIcon={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: 'var(--text-secondary, #94a3b8)' }} />
          {(['all', 'READY', 'ALMOST_THERE', 'BUILD_FIRST', 'NOT_YET'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVerdictFilter(v)}
              className="rounded-full px-3 py-1.5 text-xs font-medium transition-all cursor-pointer"
              style={{
                backgroundColor: verdictFilter === v ? 'rgba(34, 211, 238, 0.15)' : 'rgba(30, 41, 59, 0.5)',
                color: verdictFilter === v ? 'var(--cyan, #22d3ee)' : 'var(--text-secondary, #94a3b8)',
                border: `1px solid ${verdictFilter === v ? 'rgba(34, 211, 238, 0.3)' : 'rgba(51, 65, 85, 0.5)'}`,
              }}
            >
              {v === 'all' ? 'All' : (VERDICT_STYLES[v]?.label ?? v)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Client Table */}
      <motion.div variants={fadeUp}>
        <Card padding="sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="border-b"
                  style={{ borderColor: 'rgba(34, 211, 238, 0.1)' }}
                >
                  {['Client', 'Email', 'Assessments', 'Last Assessment', 'Verdict', 'Joined'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary, #94a3b8)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => {
                  const verdict = client.latest_assessment?.verdict;
                  const vs = verdict ? VERDICT_STYLES[verdict] : null;
                  return (
                    <tr
                      key={client.id}
                      className="border-b transition-colors"
                      style={{ borderColor: 'rgba(34, 211, 238, 0.06)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(34, 211, 238, 0.03)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                          {client.profile?.name ?? 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                        {client.profile?.email ?? '-'}
                      </td>
                      <td className="px-4 py-3">
                        <code
                          className="rounded px-1.5 py-0.5 text-xs font-mono"
                          style={{
                            backgroundColor: 'rgba(30, 41, 59, 0.8)',
                            color: 'var(--cyan, #22d3ee)',
                          }}
                        >
                          {client.assessment_count}
                        </code>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                        {formatDate(client.latest_assessment?.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {vs ? (
                          <Badge variant={vs.badgeVariant}>{vs.label}</Badge>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>-</span>
                        )}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                        {formatDate(client.created_at)}
                      </td>
                    </tr>
                  );
                })}
                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                      No clients match your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Invite Client Modal */}
      <Modal
        open={inviteOpen}
        onClose={() => { setInviteOpen(false); setInviteEmail(''); }}
        title="Invite Client"
        description="Send an assessment invitation to a new client."
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => { setInviteOpen(false); setInviteEmail(''); }}>
              Cancel
            </Button>
            <Button variant="cta" size="sm" icon={<Mail size={14} />} disabled={!inviteEmail.includes('@')}>
              Send Invitation
            </Button>
          </>
        }
      >
        <Input
          label="Client Email"
          placeholder="client@company.com"
          type="email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          fullWidth
        />
      </Modal>
    </motion.div>
  );
}
