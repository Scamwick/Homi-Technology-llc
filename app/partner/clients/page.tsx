'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  UserPlus,
  Filter,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { Card, Badge, Button, Input, Modal } from '@/components/ui';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Partner Clients — Client management table
 *
 * 8 mock clients, search + filter, invite modal.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

type Verdict = 'READY' | 'ALMOST_THERE' | 'NOT_YET' | 'STOP';

interface Client {
  id: string;
  name: string;
  email: string;
  externalId: string;
  lastAssessment: string;
  verdict: Verdict;
  joined: string;
}

const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'Sarah Mitchell', email: 'sarah@example.com', externalId: 'EXT-001', lastAssessment: 'Apr 1, 2026', verdict: 'READY', joined: 'Jan 15, 2026' },
  { id: 'c2', name: 'James Rodriguez', email: 'james.r@example.com', externalId: 'EXT-002', lastAssessment: 'Mar 28, 2026', verdict: 'ALMOST_THERE', joined: 'Feb 3, 2026' },
  { id: 'c3', name: 'Emily Chen', email: 'emily.chen@example.com', externalId: 'EXT-003', lastAssessment: 'Mar 25, 2026', verdict: 'NOT_YET', joined: 'Dec 10, 2025' },
  { id: 'c4', name: 'Michael Davis', email: 'mdavis@example.com', externalId: 'EXT-004', lastAssessment: 'Apr 2, 2026', verdict: 'READY', joined: 'Mar 1, 2026' },
  { id: 'c5', name: 'Olivia Thompson', email: 'olivia.t@example.com', externalId: 'EXT-005', lastAssessment: 'Mar 20, 2026', verdict: 'STOP', joined: 'Nov 22, 2025' },
  { id: 'c6', name: 'David Kim', email: 'dkim@example.com', externalId: 'EXT-006', lastAssessment: 'Mar 30, 2026', verdict: 'ALMOST_THERE', joined: 'Jan 8, 2026' },
  { id: 'c7', name: 'Jessica Park', email: 'jpark@example.com', externalId: 'EXT-007', lastAssessment: 'Apr 1, 2026', verdict: 'READY', joined: 'Feb 14, 2026' },
  { id: 'c8', name: 'Andrew Wilson', email: 'awilson@example.com', externalId: 'EXT-008', lastAssessment: 'Mar 15, 2026', verdict: 'NOT_YET', joined: 'Mar 20, 2026' },
];

const VERDICT_STYLES: Record<Verdict, { color: string; bg: string; label: string; badgeVariant: 'success' | 'warning' | 'caution' | 'danger' }> = {
  READY: { color: 'var(--emerald)', bg: 'rgba(52,211,153,0.1)', label: 'READY', badgeVariant: 'success' },
  ALMOST_THERE: { color: 'var(--yellow)', bg: 'rgba(250,204,21,0.1)', label: 'ALMOST', badgeVariant: 'warning' },
  NOT_YET: { color: 'var(--homi-amber)', bg: 'rgba(251,146,60,0.1)', label: 'NOT YET', badgeVariant: 'caution' },
  STOP: { color: 'var(--homi-crimson)', bg: 'rgba(239,68,68,0.1)', label: 'STOP', badgeVariant: 'danger' },
};

type VerdictFilter = 'all' | Verdict;

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export default function PartnerClientsPage() {
  const [search, setSearch] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<VerdictFilter>('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const filteredClients = useMemo(() => {
    return MOCK_CLIENTS.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.externalId.toLowerCase().includes(search.toLowerCase());
      const matchesVerdict = verdictFilter === 'all' || c.verdict === verdictFilter;
      return matchesSearch && matchesVerdict;
    });
  }, [search, verdictFilter]);

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
            placeholder="Search by name, email, or external ID..."
            leadingIcon={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: 'var(--text-secondary, #94a3b8)' }} />
          {(['all', 'READY', 'ALMOST_THERE', 'NOT_YET', 'STOP'] as const).map((v) => (
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
              {v === 'all' ? 'All' : VERDICT_STYLES[v].label}
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
                  {['Client', 'Email', 'External ID', 'Last Assessment', 'Verdict', 'Joined'].map((h) => (
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
                  const vs = VERDICT_STYLES[client.verdict];
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
                          {client.name}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                        {client.email}
                      </td>
                      <td className="px-4 py-3">
                        <code
                          className="rounded px-1.5 py-0.5 text-xs font-mono"
                          style={{
                            backgroundColor: 'rgba(30, 41, 59, 0.8)',
                            color: 'var(--cyan, #22d3ee)',
                          }}
                        >
                          {client.externalId}
                        </code>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                        {client.lastAssessment}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={vs.badgeVariant}>{vs.label}</Badge>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                        {client.joined}
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
