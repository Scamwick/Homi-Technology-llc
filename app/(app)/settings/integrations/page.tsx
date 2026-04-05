'use client';

import { useState, useEffect } from 'react';
import {
  Landmark,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { AccountsPanel } from '@/components/calendar/AccountsPanel';
import type { BankConnectionView, LinkedAccountView } from '@/types/plaid';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Settings > Connected Accounts — Bank & financial connections management.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function IntegrationsSection() {
  const [connections, setConnections] = useState<BankConnectionView[]>([]);

  // Fetch connected accounts from API
  useEffect(() => {
    fetch('/api/plaid/accounts')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setConnections(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const totalAccounts = connections.reduce((sum, c) => sum + c.accounts.length, 0);
  const totalBalance = connections
    .flatMap((c) => c.accounts)
    .reduce((sum, a) => sum + (a.balance_current ?? 0), 0);

  const handleAccountsLinked = (_accounts: LinkedAccountView[]) => {
    // Refresh connections from API after linking
    fetch('/api/plaid/accounts')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setConnections(data.data);
        }
      })
      .catch(() => {});
  };

  const handleDisconnect = (connectionId: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== connectionId));
    // TODO: Call DELETE /api/plaid/connections/:id
  };

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <div className="flex items-center gap-2">
          <Landmark size={20} style={{ color: 'var(--cyan, #22d3ee)' }} />
          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--text-primary, #e2e8f0)' }}
          >
            Connected Accounts
          </h2>
        </div>
        <p
          className="mt-1 text-sm"
          style={{ color: 'var(--text-secondary, #94a3b8)' }}
        >
          Link your bank accounts to verify your financial data and improve your HoMI Score accuracy.
        </p>
      </div>

      {/* Summary stats */}
      {connections.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Connected Institutions"
            value={String(connections.length)}
            icon={<Landmark size={16} />}
            color="#22d3ee"
          />
          <StatCard
            label="Linked Accounts"
            value={String(totalAccounts)}
            icon={<Shield size={16} />}
            color="#34d399"
          />
          <StatCard
            label="Total Balance"
            value={`$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            icon={<TrendingUp size={16} />}
            color="#60a5fa"
          />
        </div>
      )}

      {/* Accounts panel (reused from calendar) */}
      <AccountsPanel
        connections={connections}
        onAccountsLinked={handleAccountsLinked}
        onDisconnect={handleDisconnect}
      />

      {/* Data usage explainer */}
      <div
        className="rounded-xl p-4 flex items-start gap-3"
        style={{
          background: 'rgba(34, 211, 238, 0.04)',
          border: '1px solid rgba(34, 211, 238, 0.1)',
        }}
      >
        <Shield size={16} className="mt-0.5 shrink-0" style={{ color: '#22d3ee' }} />
        <div>
          <p className="text-xs font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
            How your data is used
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
            Your verified financial data improves the accuracy of your HoMI Score across the Financial Reality ring.
            Actual income patterns replace estimates. Real debt obligations sharpen your DTI calculation.
            Transaction history powers cash flow projections and anomaly detection.
            We never share your data with third parties or use it for advertising.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat card helper
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'rgba(30, 41, 59, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.08)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div style={{ color }}>{icon}</div>
        <p className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>{label}</p>
      </div>
      <p className="text-lg font-bold" style={{ color }}>{value}</p>
    </div>
  );
}
