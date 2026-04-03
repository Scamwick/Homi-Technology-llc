'use client';

import { motion } from 'framer-motion';
import {
  CreditCard,
  Receipt,
  TrendingUp,
  Download,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Partner Billing
 *
 * Current plan, usage, invoice history, payment method.
 * All data is mock.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

interface Invoice {
  id: string;
  period: string;
  assessments: number;
  amount: string;
  status: 'paid' | 'pending' | 'overdue';
  date: string;
}

const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-2026-03', period: 'March 2026', assessments: 142, amount: '$2,130.00', status: 'paid', date: 'Apr 1, 2026' },
  { id: 'INV-2026-02', period: 'February 2026', assessments: 128, amount: '$1,920.00', status: 'paid', date: 'Mar 1, 2026' },
  { id: 'INV-2026-01', period: 'January 2026', assessments: 115, amount: '$1,725.00', status: 'paid', date: 'Feb 1, 2026' },
];

const INVOICE_STATUS_MAP: Record<string, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  paid: { variant: 'success', label: 'Paid' },
  pending: { variant: 'warning', label: 'Pending' },
  overdue: { variant: 'danger', label: 'Overdue' },
};

// ---------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PartnerBillingPage() {
  return (
    <motion.div
      className="mx-auto w-full max-w-6xl space-y-6"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Page header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
          Billing
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
          Manage your plan, usage, and payment details
        </p>
      </motion.div>

      {/* Current Plan + Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Plan */}
        <motion.div variants={fadeUp}>
          <Card
            padding="md"
            header={
              <div className="flex items-center gap-2">
                <Zap size={16} style={{ color: 'var(--yellow, #facc15)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                  Current Plan
                </span>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                  $15
                </span>
                <span className="text-sm" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  per assessment
                </span>
              </div>

              <div
                className="rounded-lg p-4 space-y-2"
                style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} style={{ color: 'var(--emerald, #34d399)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                    Unlimited clients
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} style={{ color: 'var(--emerald, #34d399)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                    White-label branding
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} style={{ color: 'var(--emerald, #34d399)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                    API &amp; webhook access
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} style={{ color: 'var(--emerald, #34d399)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                    Analytics dashboard
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} style={{ color: 'var(--emerald, #34d399)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                    Priority support
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="info" dot>Pro Plan</Badge>
                <span className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  Volume discounts available at 500+ assessments/month
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Usage This Month */}
        <motion.div variants={fadeUp}>
          <Card
            padding="md"
            header={
              <div className="flex items-center gap-2">
                <TrendingUp size={16} style={{ color: 'var(--cyan, #22d3ee)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                  Usage This Month
                </span>
              </div>
            }
          >
            <div className="space-y-6">
              {/* Assessments scored */}
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                    Assessments Scored
                  </span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                    156
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-2 rounded-full" style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: '31%',
                      background: 'linear-gradient(90deg, #22d3ee, #34d399)',
                    }}
                  />
                </div>
                <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  156 of ~500 capacity
                </p>
              </div>

              {/* Total cost */}
              <div className="flex items-baseline justify-between">
                <span className="text-sm" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  Estimated Cost
                </span>
                <span className="text-2xl font-bold" style={{ color: 'var(--cyan, #22d3ee)' }}>
                  $2,340
                </span>
              </div>

              {/* Per assessment breakdown */}
              <div
                className="rounded-lg p-3 flex items-center justify-between"
                style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
              >
                <span className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  156 assessments x $15/assessment
                </span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                  = $2,340.00
                </span>
              </div>

              <p className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                Billing period: April 1 - April 30, 2026
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Invoice History */}
      <motion.div variants={fadeUp}>
        <Card
          padding="sm"
          header={
            <div className="flex items-center gap-2 px-2">
              <Receipt size={16} style={{ color: 'var(--emerald, #34d399)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                Invoice History
              </span>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(34, 211, 238, 0.1)' }}>
                  {['Invoice', 'Period', 'Assessments', 'Amount', 'Status', ''].map((h) => (
                    <th
                      key={h || 'actions'}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary, #94a3b8)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_INVOICES.map((inv) => {
                  const statusStyle = INVOICE_STATUS_MAP[inv.status];
                  return (
                    <tr
                      key={inv.id}
                      className="border-b transition-colors"
                      style={{ borderColor: 'rgba(34, 211, 238, 0.06)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(34, 211, 238, 0.03)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono" style={{ color: 'var(--cyan, #22d3ee)' }}>
                          {inv.id}
                        </code>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                        {inv.period}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                        {inv.assessments}
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                        {inv.amount}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusStyle.variant} dot>{statusStyle.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" icon={<Download size={14} />}>
                          PDF
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Payment Method */}
      <motion.div variants={fadeUp}>
        <Card
          padding="md"
          header={
            <div className="flex items-center gap-2">
              <CreditCard size={16} style={{ color: 'var(--cyan, #22d3ee)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                Payment Method
              </span>
            </div>
          }
        >
          <div className="flex items-center gap-4">
            {/* Card visual */}
            <div
              className="relative w-64 h-40 rounded-xl p-5 flex flex-col justify-between overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(52,211,153,0.1))',
                border: '1px solid rgba(34, 211, 238, 0.2)',
              }}
            >
              {/* Decorative circles */}
              <div
                className="absolute -top-8 -right-8 size-24 rounded-full"
                style={{ backgroundColor: 'rgba(34, 211, 238, 0.06)' }}
              />
              <div
                className="absolute -bottom-6 -left-6 size-20 rounded-full"
                style={{ backgroundColor: 'rgba(52, 211, 153, 0.06)' }}
              />

              <div className="flex items-center justify-between relative z-10">
                <CreditCard size={24} style={{ color: 'var(--cyan, #22d3ee)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  VISA
                </span>
              </div>
              <div className="relative z-10">
                <p className="font-mono text-sm tracking-widest" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                  **** **** **** 4242
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                    Apex Financial Advisors
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                    12/28
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button variant="ghost" size="sm">
                Update Card
              </Button>
              <p className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                Next invoice: May 1, 2026
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
