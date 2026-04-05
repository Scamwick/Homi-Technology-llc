'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  Eye,
  EyeOff,
  Monitor,
  LogOut,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { Card, Button, Input, Badge } from '@/components/ui';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SecurityContent — Client Component
 *
 * Change password, current session info, sign-out-all, 2FA toggle.
 * Receives session metadata from the server component.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export interface SecurityContentProps {
  lastSignIn: string | null;
  email: string;
  provider: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export default function SecurityContent({
  lastSignIn,
  email,
  provider,
}: SecurityContentProps) {
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

  // Sign-out state
  const [signingOutAll, setSigningOutAll] = useState(false);
  const [signedOut, setSignedOut] = useState(false);

  // 2FA state
  const [twoFaEnabled] = useState(false);

  const handleChangePassword = useCallback(async () => {
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
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) {
        const result = await response.json();
        setPasswordError(result.error || 'Failed to update password');
        return;
      }

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error) {
      console.error('[Security] Password update error:', error);
      setPasswordError('An unexpected error occurred');
    } finally {
      setPasswordSaving(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  const handleSignOutAll = useCallback(async () => {
    setSigningOutAll(true);
    try {
      // Call Supabase sign-out via our API, which invalidates all sessions
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: 'global' }),
      });

      if (response.ok) {
        setSignedOut(true);
        // Redirect to login after a brief delay
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 1500);
      }
    } catch (error) {
      console.error('[Security] Sign-out error:', error);
    } finally {
      setSigningOutAll(false);
    }
  }, []);

  const formattedLastSignIn = lastSignIn
    ? new Date(lastSignIn).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Unknown';

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

      {/* ── Current Session ── */}
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
                  Current Session
                </span>
              </div>
              <Button
                variant="danger"
                size="sm"
                loading={signingOutAll}
                onClick={handleSignOutAll}
                icon={<LogOut size={14} />}
              >
                Sign Out All Devices
              </Button>
            </div>
          }
        >
          <div className="divide-y divide-[rgba(34,211,238,0.06)]">
            {/* Current session */}
            <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div
                className="flex size-9 items-center justify-center rounded-lg shrink-0"
                style={{ backgroundColor: 'rgba(51, 65, 85, 0.3)' }}
              >
                <Monitor
                  size={16}
                  style={{ color: 'var(--text-secondary)' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {email}
                  <span
                    className="font-normal ml-2 capitalize"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {provider}
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
                    Last sign-in: {formattedLastSignIn}
                  </p>
                </div>
              </div>
              {signedOut ? (
                <Badge variant="warning" dot>
                  Signing out...
                </Badge>
              ) : (
                <Badge variant="success" dot>
                  Active now
                </Badge>
              )}
            </div>
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
