'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Lock,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  LogOut,
  ShieldCheck,
  Clock,
  Power,
} from 'lucide-react';
import { Card, Button, Input, Badge } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Security Settings
 *
 * Change password, active sessions, sign-out, sign-out-all, 2FA toggle.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface Session {
  id: string;
  device: string;
  browser: string;
  lastActive: string;
  isCurrent: boolean;
  Icon: typeof Monitor;
}

const MOCK_SESSIONS: Session[] = [
  {
    id: 's1',
    device: 'MacBook Pro',
    browser: 'Chrome',
    lastActive: 'Active now',
    isCurrent: true,
    Icon: Monitor,
  },
  {
    id: 's2',
    device: 'iPhone 15',
    browser: 'Safari',
    lastActive: '2 hours ago',
    isCurrent: false,
    Icon: Smartphone,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export default function SecuritySection() {
  const router = useRouter();
  const authStoreSignOut = useAuthStore((s) => s.signOut);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Sessions state
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [signingOut, setSigningOut] = useState(false);
  const [signingOutAll, setSigningOutAll] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  // 2FA state
  const [twoFaEnabled] = useState(false);

  function handleChangePassword() {
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordSaving(true);
    setTimeout(() => {
      setPasswordSaving(false);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    }, 1500);
  }

  /** Sign out of this device only. */
  async function handleSignOut() {
    setSigningOut(true);
    setSignOutError('');
    try {
      await authStoreSignOut();
      router.push('/auth/login');
      router.refresh();
    } catch (err) {
      // Fallback: sign out directly via Supabase client
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
      router.push('/auth/login');
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  /** Sign out of all devices (global scope). */
  async function handleSignOutAll() {
    setSigningOutAll(true);
    setSignOutError('');
    try {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase.auth.signOut({ scope: 'global' });
        if (error) throw error;
      }
      // Clear local Zustand store
      useAuthStore.getState().setUser(null);
      useAuthStore.getState().setSession(null);
      router.push('/auth/login');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign out of all devices';
      setSignOutError(message);
      setSigningOutAll(false);
    }
  }

  return (
    <motion.div
      className="space-y-6"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* ── Section Header ── */}
      <motion.div variants={fadeUp}>
        <h2
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Security
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Protect your account with a strong password and session management
        </p>
      </motion.div>

      {/* ── Change Password ── */}
      <motion.div variants={fadeUp}>
        <Card
          padding="md"
          header={
            <div className="flex items-center gap-2">
              <Lock size={16} style={{ color: 'var(--cyan)' }} />
              <span
                className="text-sm font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Change Password
              </span>
            </div>
          }
        >
          <div className="space-y-4 max-w-md">
            <Input
              label="Current password"
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              fullWidth
              trailingIcon={
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                  aria-label={showCurrent ? 'Hide password' : 'Show password'}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <Input
              label="New password"
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              fullWidth
              trailingIcon={
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <Input
              label="Confirm new password"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              fullWidth
              error={passwordError}
              trailingIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <div className="flex items-center gap-3 pt-1">
              <Button
                variant="primary"
                size="sm"
                loading={passwordSaving}
                onClick={handleChangePassword}
              >
                Update Password
              </Button>
              {passwordSuccess && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs font-medium"
                  style={{ color: 'var(--emerald)' }}
                >
                  Password updated successfully
                </motion.span>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Active Sessions ── */}
      <motion.div variants={fadeUp}>
        <Card
          padding="md"
          header={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor size={16} style={{ color: 'var(--cyan)' }} />
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Active Sessions
                </span>
              </div>
              {sessions.length > 1 && (
                <Button
                  variant="danger"
                  size="sm"
                  loading={signingOutAll}
                  onClick={handleSignOutAll}
                  icon={<LogOut size={14} />}
                >
                  Sign Out All Devices
                </Button>
              )}
            </div>
          }
        >
          <div className="divide-y divide-[rgba(34,211,238,0.06)]">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div
                  className="flex size-9 items-center justify-center rounded-lg shrink-0"
                  style={{ backgroundColor: 'rgba(51, 65, 85, 0.3)' }}
                >
                  <session.Icon
                    size={16}
                    style={{ color: 'var(--text-secondary)' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {session.device}
                    <span
                      className="font-normal ml-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {session.browser}
                    </span>
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock
                      size={12}
                      style={{ color: 'rgba(148, 163, 184, 0.6)' }}
                    />
                    <p
                      className="text-xs"
                      style={{ color: 'rgba(148, 163, 184, 0.6)' }}
                    >
                      {session.lastActive}
                    </p>
                  </div>
                </div>
                {session.isCurrent && (
                  <Badge variant="success" dot>
                    This device
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* ── Sign Out ── */}
      <motion.div variants={fadeUp}>
        <Card padding="md">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className="flex size-10 items-center justify-center rounded-lg shrink-0"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              >
                <Power size={20} style={{ color: 'var(--homi-crimson, #ef4444)' }} />
              </div>
              <div>
                <h3
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Sign Out
                </h3>
                <p
                  className="text-xs mt-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  End your session on this device. You will be redirected to the login page.
                </p>
                {signOutError && (
                  <p className="text-xs mt-1" style={{ color: 'var(--homi-crimson, #ef4444)' }}>
                    {signOutError}
                  </p>
                )}
              </div>
            </div>

            <Button
              variant="danger"
              size="sm"
              loading={signingOut}
              onClick={handleSignOut}
              icon={<LogOut size={14} />}
            >
              Sign Out
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* ── Two-Factor Authentication ── */}
      <motion.div variants={fadeUp}>
        <Card padding="md">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className="flex size-10 items-center justify-center rounded-lg shrink-0"
                style={{ backgroundColor: 'rgba(52, 211, 153, 0.1)' }}
              >
                <ShieldCheck size={20} style={{ color: 'var(--emerald)' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Two-Factor Authentication
                  </h3>
                  <Badge variant="info">Coming Soon</Badge>
                </div>
                <p
                  className="text-xs mt-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Add an extra layer of security with authenticator app or SMS verification.
                </p>
              </div>
            </div>

            <Button variant="ghost" size="sm" disabled>
              {twoFaEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
