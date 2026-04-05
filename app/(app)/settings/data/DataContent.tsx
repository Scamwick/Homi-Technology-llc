'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Trash2,
  BarChart3,
  Fingerprint,
  Database,
  AlertTriangle,
  Clock,
  Shield,
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input } from '@/components/ui';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * DataContent — Client Component
 *
 * Export data, delete account, data retention info, privacy toggles.
 * Wired to /api/user/export and /api/user/delete endpoints.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export interface DataContentProps {
  email: string;
  name: string;
  preferences: Record<string, unknown> | null;
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
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full',
        'transition-colors duration-200 ease-in-out cursor-pointer',
        'focus-visible:ring-2 focus-visible:ring-[var(--cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)]',
      ].join(' ')}
      style={{
        backgroundColor: checked ? 'var(--cyan)' : 'var(--slate-light)',
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

export default function DataContent({ email, name, preferences }: DataContentProps) {
  const privacyPrefs = (preferences?.privacy ?? {}) as Record<string, unknown>;

  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportError, setExportError] = useState('');

  // Delete account modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Privacy toggles — initialized from server preferences
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(
    (privacyPrefs.analyticsOptIn as boolean) ?? true,
  );
  const [behavioralTrackingEnabled, setBehavioralTrackingEnabled] = useState<boolean>(
    (privacyPrefs.retainInputs as boolean) ?? true,
  );

  const handleExportData = useCallback(async () => {
    setExporting(true);
    setExportComplete(false);
    setExportError('');

    try {
      const response = await fetch('/api/user/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const result = await response.json();
        setExportError(result.error || 'Export failed');
        return;
      }

      // Download the export file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `homi-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 4000);
    } catch (error) {
      console.error('[Data] Export error:', error);
      setExportError('An unexpected error occurred');
    } finally {
      setExporting(false);
    }
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleting(true);
    setDeleteError('');

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const result = await response.json();
        setDeleteError(result.error || 'Deletion failed');
        return;
      }

      // Redirect to landing page after successful deletion
      window.location.href = '/';
    } catch (error) {
      console.error('[Data] Delete error:', error);
      setDeleteError('An unexpected error occurred');
    } finally {
      setDeleting(false);
    }
  }, [deleteConfirmText]);

  const handlePrivacyToggle = useCallback(
    async (key: string, value: boolean) => {
      try {
        await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preferences: {
              privacy: { [key]: value },
            },
          }),
        });
      } catch (error) {
        console.error('[Data] Privacy toggle error:', error);
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
          Data & Privacy
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Control your data, export records, and manage privacy preferences
        </p>
      </motion.div>

      {/* ── Export Data ── */}
      <motion.div variants={fadeUp}>
        <Card padding="md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className="flex size-10 items-center justify-center rounded-lg shrink-0"
                style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)' }}
              >
                <Download size={20} style={{ color: 'var(--cyan)' }} />
              </div>
              <div>
                <h3
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Export My Data
                </h3>
                <p
                  className="text-xs mt-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Download a JSON file containing all of your account data, assessments,
                  and behavioral genome results. GDPR compliant.
                </p>
                {name && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: 'rgba(148, 163, 184, 0.6)' }}
                  >
                    Account: {name} ({email})
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {exportComplete && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs font-medium"
                  style={{ color: 'var(--emerald)' }}
                >
                  Export downloaded
                </motion.span>
              )}
              {exportError && (
                <span
                  className="text-xs font-medium"
                  style={{ color: 'var(--homi-crimson)' }}
                >
                  {exportError}
                </span>
              )}
              <Button
                variant="primary"
                size="sm"
                loading={exporting}
                onClick={handleExportData}
                icon={<Download size={14} />}
              >
                Export Data
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Privacy Preferences ── */}
      <motion.div variants={fadeUp}>
        <Card
          padding="md"
          header={
            <div className="flex items-center gap-2">
              <Shield size={16} style={{ color: 'var(--cyan)' }} />
              <span
                className="text-sm font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Privacy Preferences
              </span>
            </div>
          }
        >
          <div className="divide-y divide-[rgba(34,211,238,0.06)]">
            {/* Analytics toggle */}
            <div className="flex items-center justify-between gap-4 py-4 first:pt-0">
              <div className="flex items-start gap-3">
                <div
                  className="flex size-9 items-center justify-center rounded-lg shrink-0"
                  style={{ backgroundColor: 'rgba(51, 65, 85, 0.3)' }}
                >
                  <BarChart3 size={16} style={{ color: 'var(--text-secondary)' }} />
                </div>
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Usage Analytics
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Help us improve by sharing anonymous usage patterns and feature interactions
                  </p>
                </div>
              </div>
              <Toggle
                checked={analyticsEnabled}
                onChange={(v) => {
                  setAnalyticsEnabled(v);
                  handlePrivacyToggle('analyticsOptIn', v);
                }}
                label="Usage analytics"
              />
            </div>

            {/* Behavioral tracking toggle */}
            <div className="flex items-center justify-between gap-4 py-4 last:pb-0">
              <div className="flex items-start gap-3">
                <div
                  className="flex size-9 items-center justify-center rounded-lg shrink-0"
                  style={{ backgroundColor: 'rgba(51, 65, 85, 0.3)' }}
                >
                  <Fingerprint size={16} style={{ color: 'var(--text-secondary)' }} />
                </div>
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Behavioral Tracking
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Allow HōMI to track behavioral data for personalized readiness insights
                  </p>
                </div>
              </div>
              <Toggle
                checked={behavioralTrackingEnabled}
                onChange={(v) => {
                  setBehavioralTrackingEnabled(v);
                  handlePrivacyToggle('retainInputs', v);
                }}
                label="Behavioral tracking"
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Data Retention Info ── */}
      <motion.div variants={fadeUp}>
        <Card padding="md">
          <div className="flex items-start gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-lg shrink-0"
              style={{ backgroundColor: 'rgba(52, 211, 153, 0.1)' }}
            >
              <Database size={20} style={{ color: 'var(--emerald)' }} />
            </div>
            <div>
              <h3
                className="text-sm font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Data Retention
              </h3>
              <div className="mt-2 space-y-2">
                <div className="flex items-start gap-2">
                  <Clock
                    size={14}
                    className="shrink-0 mt-0.5"
                    style={{ color: 'var(--text-secondary)' }}
                  />
                  <p
                    className="text-xs"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Behavioral genome data is automatically purged after 90 days of inactivity.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Clock
                    size={14}
                    className="shrink-0 mt-0.5"
                    style={{ color: 'var(--text-secondary)' }}
                  />
                  <p
                    className="text-xs"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Assessment history is retained for 12 months unless manually deleted.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Clock
                    size={14}
                    className="shrink-0 mt-0.5"
                    style={{ color: 'var(--text-secondary)' }}
                  />
                  <p
                    className="text-xs"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Agent conversation logs are purged after 30 days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Danger Zone — Delete Account ── */}
      <motion.div variants={fadeUp}>
        <Card padding="md">
          <div
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="flex size-10 items-center justify-center rounded-lg shrink-0"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              >
                <Trash2 size={20} style={{ color: 'var(--homi-crimson)' }} />
              </div>
              <div>
                <h3
                  className="text-sm font-semibold"
                  style={{ color: 'var(--homi-crimson)' }}
                >
                  Delete Account
                </h3>
                <p
                  className="text-xs mt-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Permanently delete your account and all associated data. This action
                  cannot be undone.
                </p>
              </div>
            </div>

            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
              icon={<Trash2 size={14} />}
            >
              Delete Account
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* ── Delete Account Confirmation Modal ── */}
      <Modal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteConfirmText('');
          setDeleteError('');
        }}
        title="Delete Your Account?"
        description="This will permanently delete your account, all assessments, behavioral genome data, and agent conversations. This action is irreversible."
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDeleteModalOpen(false);
                setDeleteConfirmText('');
                setDeleteError('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deleting}
              disabled={deleteConfirmText !== 'DELETE'}
              onClick={handleDeleteAccount}
              icon={<Trash2 size={14} />}
            >
              Permanently Delete
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div
            className="flex items-start gap-3 p-3 rounded-lg"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
            }}
          >
            <AlertTriangle
              size={18}
              className="shrink-0 mt-0.5"
              style={{ color: 'var(--homi-crimson)' }}
            />
            <div className="space-y-1.5">
              <p className="text-xs font-medium" style={{ color: 'var(--homi-crimson)' }}>
                You will lose the following permanently:
              </p>
              <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                <li>All assessment history and scores</li>
                <li>Behavioral genome data and insights</li>
                <li>Agent conversation logs</li>
                <li>Couple shared assessments</li>
              </ul>
            </div>
          </div>

          {deleteError && (
            <p className="text-xs font-medium" style={{ color: 'var(--homi-crimson)' }}>
              {deleteError}
            </p>
          )}

          <Input
            label={'Type "DELETE" to confirm'}
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE"
            fullWidth
          />
        </div>
      </Modal>
    </motion.div>
  );
}
