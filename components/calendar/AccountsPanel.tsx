'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Landmark,
  Wallet,
  PiggyBank,
  CreditCard,
  TrendingUp,
  Building2,
  Home,
  CircleDot,
  ChevronDown,
  RefreshCw,
  Unlink,
  Check,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { PlaidLinkButton } from './PlaidLinkButton';
import type { BankConnectionView, LinkedAccountView, BankAccountType, BankConnectionStatus } from '@/types/plaid';

// ---------------------------------------------------------------------------
// Icon mapping
// ---------------------------------------------------------------------------

const ACCOUNT_ICONS: Record<BankAccountType, typeof Wallet> = {
  checking: Wallet,
  savings: PiggyBank,
  credit: CreditCard,
  investment: TrendingUp,
  loan: Building2,
  mortgage: Home,
  other: CircleDot,
};

const ACCOUNT_COLORS: Record<BankAccountType, string> = {
  checking: '#34d399',
  savings: '#22d3ee',
  credit: '#f87171',
  investment: '#60a5fa',
  loan: '#fb923c',
  mortgage: '#a78bfa',
  other: '#94a3b8',
};

const STATUS_DISPLAY: Record<BankConnectionStatus, { label: string; color: string; Icon: typeof Check }> = {
  active: { label: 'Connected', color: '#34d399', Icon: Check },
  degraded: { label: 'Needs Attention', color: '#facc15', Icon: AlertTriangle },
  disconnected: { label: 'Disconnected', color: '#f87171', Icon: Unlink },
  revoked: { label: 'Removed', color: '#94a3b8', Icon: Unlink },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AccountsPanelProps {
  connections: BankConnectionView[];
  onAccountsLinked: (accounts: LinkedAccountView[]) => void;
  onDisconnect?: (connectionId: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AccountsPanel({ connections, onAccountsLinked, onDisconnect }: AccountsPanelProps) {
  const [expandedConnection, setExpandedConnection] = useState<string | null>(null);

  const totalAccounts = connections.reduce((sum, c) => sum + c.accounts.length, 0);
  const totalBalance = connections
    .flatMap((c) => c.accounts)
    .reduce((sum, a) => sum + (a.balance_current ?? 0), 0);

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
          <Landmark size={16} style={{ color: 'var(--cyan, #22d3ee)' }} />
          <h3
            className="text-sm font-semibold"
            style={{ color: 'var(--text-primary, #e2e8f0)' }}
          >
            Connected Accounts
          </h3>
          {totalAccounts > 0 && (
            <span
              className="text-xs rounded-full px-1.5 py-0.5"
              style={{ background: 'rgba(34, 211, 238, 0.1)', color: '#22d3ee' }}
            >
              {totalAccounts}
            </span>
          )}
        </div>
        <PlaidLinkButton onSuccess={onAccountsLinked} variant="compact" />
      </div>

      {/* Connection list */}
      <div className="px-4 py-3 space-y-2">
        {connections.length === 0 ? (
          <div className="flex flex-col items-center py-6 gap-3">
            <div
              className="flex size-12 items-center justify-center rounded-full"
              style={{ background: 'rgba(34, 211, 238, 0.1)' }}
            >
              <Landmark size={24} style={{ color: '#22d3ee', opacity: 0.5 }} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs font-medium" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                No accounts connected
              </p>
              <p className="text-[11px] max-w-48" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
                Connect your bank to auto-import transactions and verify your HōMI-Score.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Total balance summary */}
            <div
              className="rounded-lg px-3 py-2 mb-2"
              style={{ background: 'rgba(34, 211, 238, 0.05)' }}
            >
              <p className="text-[10px] font-medium" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                TOTAL BALANCE
              </p>
              <p className="text-lg font-bold" style={{ color: '#22d3ee' }}>
                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Per-connection */}
            {connections.map((conn) => {
              const isExpanded = expandedConnection === conn.id;
              const statusConf = STATUS_DISPLAY[conn.status];
              const StatusIcon = statusConf.Icon;

              return (
                <div key={conn.id}>
                  {/* Connection header */}
                  <button
                    type="button"
                    onClick={() => setExpandedConnection(isExpanded ? null : conn.id)}
                    className="flex items-center gap-3 w-full rounded-lg px-3 py-2 transition-colors cursor-pointer"
                    style={{ background: isExpanded ? 'rgba(15, 23, 42, 0.6)' : 'rgba(15, 23, 42, 0.3)' }}
                  >
                    {/* Institution icon */}
                    <div
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                      style={{
                        background: conn.institution_color ? `${conn.institution_color}20` : 'rgba(34, 211, 238, 0.1)',
                        color: conn.institution_color ?? '#22d3ee',
                      }}
                    >
                      {conn.institution_name[0]}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                        {conn.institution_name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <StatusIcon size={10} style={{ color: statusConf.color }} />
                        <span className="text-[10px]" style={{ color: statusConf.color }}>
                          {statusConf.label}
                        </span>
                        {conn.last_synced_at && (
                          <>
                            <span className="text-[10px]" style={{ color: 'rgba(148, 163, 184, 0.4)' }}>·</span>
                            <Clock size={9} style={{ color: 'rgba(148, 163, 184, 0.4)' }} />
                            <span className="text-[10px]" style={{ color: 'rgba(148, 163, 184, 0.4)' }}>
                              Just now
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Expand icon */}
                    <ChevronDown
                      size={14}
                      className="shrink-0 transition-transform"
                      style={{
                        color: 'var(--text-secondary, #94a3b8)',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    />
                  </button>

                  {/* Expanded accounts */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-6 pr-3 py-2 space-y-1.5">
                          {conn.accounts.map((account) => {
                            const AcctIcon = ACCOUNT_ICONS[account.account_type];
                            const acctColor = ACCOUNT_COLORS[account.account_type];

                            return (
                              <div
                                key={account.id}
                                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2"
                                style={{ background: 'rgba(15, 23, 42, 0.4)' }}
                              >
                                <AcctIcon size={14} style={{ color: acctColor }} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                                    {account.display_name}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span
                                      className="text-[10px] rounded px-1 py-0.5"
                                      style={{ background: `${acctColor}15`, color: acctColor }}
                                    >
                                      {account.account_type}
                                    </span>
                                    {account.mask && (
                                      <span className="text-[10px]" style={{ color: 'rgba(148, 163, 184, 0.5)' }}>
                                        ****{account.mask}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm font-semibold tabular-nums" style={{ color: acctColor }}>
                                  {account.balance_current !== null
                                    ? `$${account.balance_current.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                                    : '—'}
                                </p>
                              </div>
                            );
                          })}

                          {/* Connection actions */}
                          <div className="flex justify-end gap-2 pt-1">
                            {conn.status === 'degraded' && (
                              <button
                                type="button"
                                className="flex items-center gap-1 text-[10px] font-medium rounded px-2 py-1 cursor-pointer"
                                style={{ background: 'rgba(250, 204, 21, 0.1)', color: '#facc15' }}
                              >
                                <RefreshCw size={10} />
                                Re-authenticate
                              </button>
                            )}
                            {onDisconnect && (
                              <button
                                type="button"
                                onClick={() => onDisconnect(conn.id)}
                                className="flex items-center gap-1 text-[10px] font-medium rounded px-2 py-1 cursor-pointer"
                                style={{ color: 'rgba(148, 163, 184, 0.5)' }}
                              >
                                <Unlink size={10} />
                                Disconnect
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
