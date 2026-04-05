'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Mail,
  Smartphone,
  ClipboardCheck,
  Scale,
  Users,
  Bot,
  Megaphone,
} from 'lucide-react';
import { Card } from '@/components/ui';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * NotificationsContent — Client Component
 *
 * Toggle grid for email and in-app notification channels.
 * Receives initial preferences from server, persists via API.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface NotificationPref {
  id: string;
  label: string;
  description: string;
  Icon: typeof Bell;
  email: boolean;
  inApp: boolean;
  emailOnly?: boolean;
}

interface NotificationsContentProps {
  preferences: Record<string, unknown> | null;
}

/** Map server preferences JSONB to toggle state */
function buildPrefs(prefs: Record<string, unknown> | null): NotificationPref[] {
  const notifications = (prefs?.notifications ?? {}) as Record<string, unknown>;

  return [
    {
      id: 'assessment_reminders',
      label: 'Assessment reminders',
      description: 'Periodic nudges to retake your readiness assessment',
      Icon: ClipboardCheck,
      email: (notifications.assessment_reminders_email as boolean) ?? true,
      inApp: (notifications.assessment_reminders_inapp as boolean) ?? true,
    },
    {
      id: 'verdict_updates',
      label: 'Verdict updates',
      description: 'When your readiness verdict changes based on new data',
      Icon: Scale,
      email: (notifications.verdict_updates_email as boolean) ?? true,
      inApp: (notifications.verdict_updates_inapp as boolean) ?? true,
    },
    {
      id: 'couple_invitations',
      label: 'Couple invitations',
      description: 'When a partner invites you to a shared assessment',
      Icon: Users,
      email: (notifications.couple_invitations_email as boolean) ?? true,
      inApp: (notifications.couple_invitations_inapp as boolean) ?? true,
    },
    {
      id: 'agent_digest',
      label: 'Agent activity digest',
      description: 'Daily or weekly summary of agent actions and insights',
      Icon: Bot,
      email: (notifications.agent_digest_email as boolean) ?? false,
      inApp: (notifications.agent_digest_inapp as boolean) ?? true,
    },
    {
      id: 'product_updates',
      label: 'Product updates',
      description: 'New features, improvements, and platform announcements',
      Icon: Megaphone,
      email: (notifications.product_updates_email as boolean) ?? true,
      inApp: false,
      emailOnly: true,
    },
  ];
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

/* ── Toggle Switch Component ── */

function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full',
        'transition-colors duration-200 ease-in-out cursor-pointer',
        'focus-visible:ring-2 focus-visible:ring-[var(--cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)]',
        disabled ? 'opacity-30 cursor-not-allowed' : '',
      ].join(' ')}
      style={{
        backgroundColor: checked
          ? 'var(--cyan)'
          : 'var(--slate-light)',
      }}
    >
      <span
        className={[
          'inline-block size-4 rounded-full bg-white shadow-sm',
          'transition-transform duration-200 ease-in-out',
          checked ? 'translate-x-[22px]' : 'translate-x-[3px]',
        ].join(' ')}
      />
    </button>
  );
}

export default function NotificationsContent({ preferences }: NotificationsContentProps) {
  const [prefs, setPrefs] = useState<NotificationPref[]>(() => buildPrefs(preferences));
  const [saving, setSaving] = useState(false);

  const updatePref = useCallback(
    async (id: string, channel: 'email' | 'inApp', value: boolean) => {
      // Optimistic update
      setPrefs((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [channel]: value } : p)),
      );

      // Build the preferences payload
      const key = `${id}_${channel === 'email' ? 'email' : 'inapp'}`;
      setSaving(true);
      try {
        await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preferences: {
              notifications: { [key]: value },
            },
          }),
        });
      } catch (error) {
        // Revert on failure
        console.error('[Notifications] Save failed:', error);
        setPrefs((prev) =>
          prev.map((p) => (p.id === id ? { ...p, [channel]: !value } : p)),
        );
      } finally {
        setSaving(false);
      }
    },
    [],
  );

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
          Notification Preferences
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Choose how and when you want to be notified
          {saving && (
            <span className="ml-2 text-xs" style={{ color: 'var(--cyan)' }}>
              Saving...
            </span>
          )}
        </p>
      </motion.div>

      {/* ── Notification Grid ── */}
      <motion.div variants={fadeUp}>
        <Card padding="sm">
          {/* Column headers */}
          <div className="flex items-center px-4 py-3 border-b border-[rgba(34,211,238,0.1)]">
            <div className="flex-1" />
            <div className="flex items-center gap-8 sm:gap-12">
              <div className="flex items-center gap-1.5 w-16 justify-center">
                <Mail size={14} style={{ color: 'var(--text-secondary)' }} />
                <span
                  className="text-xs font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Email
                </span>
              </div>
              <div className="flex items-center gap-1.5 w-16 justify-center">
                <Smartphone size={14} style={{ color: 'var(--text-secondary)' }} />
                <span
                  className="text-xs font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  In-App
                </span>
              </div>
            </div>
          </div>

          {/* Preference rows */}
          <div className="divide-y divide-[rgba(34,211,238,0.06)]">
            {prefs.map((pref) => (
              <div
                key={pref.id}
                className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-[rgba(30,41,59,0.3)]"
              >
                {/* Icon + text */}
                <div
                  className="flex size-9 items-center justify-center rounded-lg shrink-0"
                  style={{ backgroundColor: 'rgba(51, 65, 85, 0.3)' }}
                >
                  <pref.Icon
                    size={16}
                    style={{ color: 'var(--text-secondary)' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {pref.label}
                  </p>
                  <p
                    className="text-xs mt-0.5 line-clamp-1"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {pref.description}
                  </p>
                </div>

                {/* Toggle switches */}
                <div className="flex items-center gap-8 sm:gap-12 shrink-0">
                  <div className="w-16 flex justify-center">
                    <Toggle
                      checked={pref.email}
                      onChange={(v) => updatePref(pref.id, 'email', v)}
                      label={`${pref.label} email notifications`}
                    />
                  </div>
                  <div className="w-16 flex justify-center">
                    <Toggle
                      checked={pref.inApp}
                      onChange={(v) => updatePref(pref.id, 'inApp', v)}
                      disabled={pref.emailOnly}
                      label={`${pref.label} in-app notifications`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* ── Quiet Hours Note ── */}
      <motion.div variants={fadeUp}>
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-lg"
          style={{
            backgroundColor: 'rgba(34, 211, 238, 0.05)',
            border: '1px solid rgba(34, 211, 238, 0.1)',
          }}
        >
          <Bell
            size={16}
            className="shrink-0 mt-0.5"
            style={{ color: 'var(--cyan)' }}
          />
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Email digests are sent at 9:00 AM in your local timezone.
            In-app notifications appear in real time within the dashboard.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
