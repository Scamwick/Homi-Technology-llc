'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Users,
  UserPlus,
  Crown,
  Shield,
  Eye,
  Send,
  Loader2,
  Settings,
  CalendarDays,
  Trash2,
  CheckCircle2,
  Clock,
  Building2,
} from 'lucide-react';
import { Card, Badge, Button, Input } from '@/components/ui';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Family Hub — Organization Management
 *
 * Create/manage family households or enterprise teams.
 * Invite members, manage roles, and share financial calendars.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrgMember {
  id: string;
  user_id: string | null;
  invite_email: string | null;
  role: string;
  accepted: boolean;
  created_at: string;
}

interface Organization {
  id: string;
  name: string;
  owner_id: string;
  org_type: 'family' | 'enterprise';
  max_members: number;
  tier: string;
  userRole: string;
  organization_members: OrgMember[];
  created_at: string;
}

// ---------------------------------------------------------------------------
// Role config
// ---------------------------------------------------------------------------

const ROLE_CONFIG: Record<string, { label: string; Icon: typeof Crown; color: string }> = {
  owner: { label: 'Owner', Icon: Crown, color: '#facc15' },
  admin: { label: 'Admin', Icon: Shield, color: '#22d3ee' },
  member: { label: 'Member', Icon: Users, color: '#34d399' },
  viewer: { label: 'Viewer', Icon: Eye, color: '#94a3b8' },
};

// ---------------------------------------------------------------------------
// Animation config
// ---------------------------------------------------------------------------

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } } };

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function CreateOrgForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('');
  const [orgType, setOrgType] = useState<'family' | 'enterprise'>('family');
  const [creating, setCreating] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, org_type: orgType }),
      });
      if (res.ok) {
        setName('');
        onCreated();
      }
    } catch {
      // Handle error
    } finally {
      setCreating(false);
    }
  }, [name, orgType, onCreated]);

  return (
    <Card padding="lg">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)' }}>
          <Home size={28} style={{ color: '#22d3ee' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>Create your household or team</h2>
          <p className="mt-1.5 text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
            Set up a shared space for your family or enterprise team to align on financial readiness together.
          </p>
        </div>

        {/* Org type toggle */}
        <div
          className="inline-flex rounded-full border p-1"
          style={{ borderColor: 'rgba(148, 163, 184, 0.2)', background: 'rgba(30, 41, 59, 0.6)' }}
        >
          {[
            { value: 'family' as const, label: 'Family', Icon: Home },
            { value: 'enterprise' as const, label: 'Enterprise', Icon: Building2 },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setOrgType(opt.value)}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full transition-all cursor-pointer"
              style={{
                background: orgType === opt.value ? 'rgba(34, 211, 238, 0.15)' : 'transparent',
                color: orgType === opt.value ? '#22d3ee' : 'var(--text-secondary, #94a3b8)',
              }}
            >
              <opt.Icon size={14} />
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-md">
          <Input
            placeholder={orgType === 'family' ? 'e.g. The Smith Household' : 'e.g. Acme Corp Team'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            leadingIcon={orgType === 'family' ? <Home size={16} /> : <Building2 size={16} />}
            fullWidth
          />
          <Button
            variant="cta"
            icon={creating ? <Loader2 size={16} className="animate-spin" /> : <Users size={16} />}
            disabled={!name.trim() || creating}
            className="shrink-0"
            onClick={handleCreate}
          >
            Create
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md text-left">
          {[
            { label: orgType === 'family' ? 'Up to 6 members' : 'Up to 50 members', icon: Users },
            { label: 'Shared calendar', icon: CalendarDays },
            { label: 'Role-based access', icon: Shield },
            { label: 'Shared advisor access', icon: Settings },
          ].map((feat) => (
            <div key={feat.label} className="flex items-center gap-2">
              <feat.icon size={14} style={{ color: '#34d399' }} />
              <span className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>{feat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function OrgCard({ org, onRefresh }: { org: Organization; onRefresh: () => void }) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [inviting, setInviting] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const members = org.organization_members ?? [];
  const activeMembers = members.filter((m) => m.accepted);
  const pendingMembers = members.filter((m) => !m.accepted);
  const isOwner = org.userRole === 'owner';
  const isAdmin = org.userRole === 'admin' || isOwner;

  const handleInvite = useCallback(async () => {
    if (!inviteEmail.includes('@')) return;
    setInviting(true);
    try {
      const res = await fetch('/api/organizations/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organization_id: org.id, email: inviteEmail, role: inviteRole }),
      });
      if (res.ok) {
        setInviteEmail('');
        setShowInvite(false);
        onRefresh();
      }
    } catch {
      // Handle error
    } finally {
      setInviting(false);
    }
  }, [inviteEmail, inviteRole, org.id, onRefresh]);

  const handleRemove = useCallback(async (memberId: string) => {
    try {
      await fetch('/api/organizations/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organization_id: org.id, member_id: memberId }),
      });
      onRefresh();
    } catch {
      // Handle error
    }
  }, [org.id, onRefresh]);

  return (
    <Card padding="md">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: org.org_type === 'family' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(34, 211, 238, 0.1)' }}
            >
              {org.org_type === 'family' ? <Home size={20} style={{ color: '#34d399' }} /> : <Building2 size={20} style={{ color: '#22d3ee' }} />}
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>{org.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant={org.org_type === 'family' ? 'success' : 'info'}>{org.org_type === 'family' ? 'Family' : 'Enterprise'}</Badge>
                <span className="text-[10px]" style={{ color: 'var(--text-secondary, #94a3b8)' }}>{activeMembers.length}/{org.max_members} members</span>
              </div>
            </div>
          </div>
          {isAdmin && (
            <Button variant="ghost" size="sm" icon={<UserPlus size={14} />} onClick={() => setShowInvite(!showInvite)}>
              Invite
            </Button>
          )}
        </div>

        {/* Invite form */}
        {showInvite && (
          <div className="flex flex-col sm:flex-row gap-2 p-3 rounded-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
            <Input
              type="email"
              placeholder="member@email.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              leadingIcon={<Send size={14} />}
              fullWidth
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member' | 'viewer')}
              className="rounded-lg px-3 py-2 text-xs"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', color: 'var(--text-primary, #e2e8f0)' }}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
            <Button variant="cta" size="sm" icon={inviting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} disabled={!inviteEmail.includes('@') || inviting} onClick={handleInvite}>
              Send
            </Button>
          </div>
        )}

        {/* Members list */}
        <div className="space-y-1">
          {members.map((member) => {
            const roleConfig = ROLE_CONFIG[member.role] ?? ROLE_CONFIG.member;
            return (
              <div key={member.id} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.3)' }}>
                <div className="flex items-center gap-2">
                  <roleConfig.Icon size={14} style={{ color: roleConfig.color }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                    {member.invite_email ?? member.user_id?.slice(0, 8) ?? 'Unknown'}
                  </span>
                  {!member.accepted && (
                    <span className="flex items-center gap-1 text-[10px]" style={{ color: '#facc15' }}>
                      <Clock size={10} /> Pending
                    </span>
                  )}
                  {member.accepted && (
                    <CheckCircle2 size={12} style={{ color: '#34d399' }} />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${roleConfig.color}15`, color: roleConfig.color }}>
                    {roleConfig.label}
                  </span>
                  {isOwner && member.role !== 'owner' && (
                    <button
                      type="button"
                      onClick={() => handleRemove(member.id)}
                      className="p-1 rounded cursor-pointer transition-colors"
                      style={{ color: 'var(--text-secondary, #94a3b8)' }}
                      title="Remove member"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {members.length === 0 && (
            <p className="text-xs text-center py-3" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
              No members yet. Invite your first member above.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function FamilyPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrgs = useCallback(async () => {
    try {
      const res = await fetch('/api/organizations');
      if (res.ok) {
        const json = await res.json();
        setOrgs(json.data ?? []);
      }
    } catch {
      // Fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrgs(); }, [fetchOrgs]);

  return (
    <motion.div
      className="mx-auto w-full max-w-6xl space-y-8"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(52, 211, 153, 0.12)' }}>
            <Users size={20} style={{ color: '#34d399' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary, #e2e8f0)' }}>Family & Teams</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
              Manage your household or enterprise team for shared readiness.
            </p>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin" style={{ color: 'var(--text-secondary, #94a3b8)' }} />
        </div>
      ) : orgs.length === 0 ? (
        <motion.div variants={fadeUp}>
          <CreateOrgForm onCreated={fetchOrgs} />
        </motion.div>
      ) : (
        <>
          {/* Existing orgs */}
          <motion.div variants={fadeUp} className="space-y-4">
            {orgs.map((org) => (
              <OrgCard key={org.id} org={org} onRefresh={fetchOrgs} />
            ))}
          </motion.div>

          {/* Create another */}
          <motion.div variants={fadeUp}>
            <Card padding="md">
              <CreateOrgForm onCreated={fetchOrgs} />
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
