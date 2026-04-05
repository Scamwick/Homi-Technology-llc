'use client';

import { motion } from 'framer-motion';
import {
  CreditCard,
  TrendingUp,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import type { PartnerBillingData } from '@/lib/data/partner';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Partner Billing Content (Client Component)
 *
 * Current plan, usage this month.
 * Data comes from server via props.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getCurrentMonthName(): string {
  return new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function getBillingPeriod(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return `${fmt(start)} - ${fmt(end)}`;
}

interface PartnerBillingContentProps {
  data: PartnerBillingData;
}

export default function PartnerBillingContent({ data }: PartnerBillingContentProps) {
  const companyName = data.organization?.company_name ?? 'Your Organization';
  const pricing = data.pricingPerAssessment;
  const assessments = data.currentMonthAssessments;
  const estimated = data.estimatedCost;

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
                  {formatCurrency(pricing)}
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
                <Badge variant="info" dot>
                  {data.organization?.status === 'active' ? 'Active' : 'Pro Plan'}
                </Badge>
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
                    {assessments}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-2 rounded-full" style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min((assessments / 500) * 100, 100)}%`,
                      background: 'linear-gradient(90deg, #22d3ee, #34d399)',
                    }}
                  />
                </div>
                <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  {assessments} of ~500 capacity
                </p>
              </div>

              {/* Total cost */}
              <div className="flex items-baseline justify-between">
                <span className="text-sm" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  Estimated Cost
                </span>
                <span className="text-2xl font-bold" style={{ color: 'var(--cyan, #22d3ee)' }}>
                  {formatCurrency(estimated)}
                </span>
              </div>

              {/* Per assessment breakdown */}
              <div
                className="rounded-lg p-3 flex items-center justify-between"
                style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
              >
                <span className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  {assessments} assessments x {formatCurrency(pricing)}/assessment
                </span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                  = {formatCurrency(estimated)}
                </span>
              </div>

              <p className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                Billing period: {getBillingPeriod()}
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

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
              </div>
              <div className="relative z-10">
                <p className="font-mono text-sm tracking-widest" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                  **** **** **** ****
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                    {companyName}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                Contact support to update your payment method.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
