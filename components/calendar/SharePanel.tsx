'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Building2,
  Mail,
  Shield,
  Eye,
  Pencil,
  Crown,
  Check,
  Clock,
  X,
  ChevronDown,
} from 'lucide-react';
import type { CalendarShareRole, CalendarShareStatus } from '@/types/calendar';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Share {
  id: string;
  shared_with_name: string | null;
  shared_with_email: string | null;
  role: CalendarShareRole;
  status: CalendarShareStatus;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface SharePanelProps {
  shares: Share[];
  onInvite: (email: string, role: CalendarShareRole) => void;
}

const ROLE_CONFIG: Record<CalendarShareRole, { label: string; Icon: typeof Eye; color: string }> = {
  viewer: { label: 'Viewer', Icon: Eye, color: '#60a5fa' },
  editor: { label: 'Editor', Icon: Pencil, color: '#34d399' },
  admin: { label: 'Admin', Icon: Crown, color: '#facc15' },
};

const STATUS_CONFIG: Record<CalendarShareStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: '#facc15' },
  accepted: { label: 'Active', color: '#34d399' },
  declined: { label: 'Declined', color: '#f87171' },
  revoked: { label: 'Revoked', color: '#94a3b8' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SharePanel({ shares, onInvite }: SharePanelProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CalendarShareRole>('viewer');

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    onInvite(email, role);
    setEmail('');
    setRole('viewer');
    setIsInviteOpen(false);
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(30, 41, 59, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.08)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}
      >
        <div className="flex items-center gap-2">
          <Users size={16} style={{ color: 'var(--cyan, #22d3ee)' }} />
          <h3
            className="text-sm font-semibold"
            style={{ color: 'var(--text-primary, #e2e8f0)' }}
          >
            Shared With
          </h3>
          <span
            className="text-xs rounded-full px-1.5 py-0.5"
            style={{ background: 'rgba(34, 211, 238, 0.1)', color: '#22d3ee' }}
          >
            {shares.filter((s) => s.status === 'accepted').length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsInviteOpen((prev) => !prev)}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer"
          style={{
            background: 'rgba(34, 211, 238, 0.1)',
            color: '#22d3ee',
          }}
        >
          <UserPlus size={14} />
          Invite
        </button>
      </div>

      {/* Invite form */}
      <AnimatePresence>
        {isInviteOpen && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleInvite}
            className="overflow-hidden"
          >
            <div
              className="px-4 py-3 space-y-3"
              style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}
            >
              {/* Email */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-secondary, #94a3b8)' }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    className="w-full rounded-lg pl-8 pr-3 py-2 text-sm outline-none"
                    style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(148, 163, 184, 0.12)',
                      color: 'var(--text-primary, #e2e8f0)',
                    }}
                  />
                </div>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as CalendarShareRole)}
                    className="rounded-lg px-3 py-2 text-sm outline-none appearance-none cursor-pointer pr-7"
                    style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(148, 163, 184, 0.12)',
                      color: 'var(--text-primary, #e2e8f0)',
                    }}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--text-secondary, #94a3b8)' }}
                  />
                </div>
              </div>

              {/* Sharing info */}
              <div className="flex items-start gap-2">
                <Shield size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--text-secondary, #94a3b8)' }} />
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  Family and enterprise sharing lets members view financial events on a shared calendar.
                  Viewers can see events. Editors can add and modify. Admins have full control.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                  style={{ color: 'var(--text-secondary, #94a3b8)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                  style={{
                    background: 'rgba(34, 211, 238, 0.15)',
                    color: '#22d3ee',
                  }}
                >
                  Send Invite
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Share list */}
      <div className="px-4 py-3 space-y-2">
        {shares.length === 0 ? (
          <div className="flex flex-col items-center py-6 gap-2">
            <Building2 size={24} style={{ color: 'var(--text-secondary, #94a3b8)', opacity: 0.4 }} />
            <p className="text-xs text-center" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
              Share your financial calendar with family members or your team.
            </p>
          </div>
        ) : (
          shares.map((share) => {
            const roleConf = ROLE_CONFIG[share.role];
            const statusConf = STATUS_CONFIG[share.status];
            const RoleIcon = roleConf.Icon;

            return (
              <div
                key={share.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2"
                style={{ background: 'rgba(15, 23, 42, 0.5)' }}
              >
                {/* Avatar placeholder */}
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: `${roleConf.color}20`, color: roleConf.color }}
                >
                  {(share.shared_with_name?.[0] ?? share.shared_with_email?.[0] ?? '?').toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: 'var(--text-primary, #e2e8f0)' }}
                  >
                    {share.shared_with_name ?? share.shared_with_email ?? 'Unknown'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <RoleIcon size={10} style={{ color: roleConf.color }} />
                    <span className="text-[10px]" style={{ color: roleConf.color }}>
                      {roleConf.label}
                    </span>
                  </div>
                </div>

                {/* Status badge */}
                <div
                  className="flex items-center gap-1 rounded-full px-2 py-0.5"
                  style={{ background: `${statusConf.color}15` }}
                >
                  {share.status === 'accepted' ? (
                    <Check size={10} style={{ color: statusConf.color }} />
                  ) : share.status === 'pending' ? (
                    <Clock size={10} style={{ color: statusConf.color }} />
                  ) : (
                    <X size={10} style={{ color: statusConf.color }} />
                  )}
                  <span className="text-[10px] font-medium" style={{ color: statusConf.color }}>
                    {statusConf.label}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
