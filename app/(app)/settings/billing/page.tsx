'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Zap,
  TrendingUp,
  MessageSquare,
  Wrench,
  ClipboardCheck,
  ArrowUpRight,
  Check,
  Crown,
  Users,
  Sparkles,
} from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { SubscriptionBadge } from '@/components/shared';
import { useSubscription } from '@/hooks/useSubscription';
import type { SubscriptionTier } from '@/types/user';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Billing & Subscription Settings
 *
 * Shows current plan, usage stats, tier comparison cards, and upgrade CTA.
 * Integrates with useSubscription hook for tier state and Stripe checkout.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface PlanInfo {
  name: string;
  price: string;
  interval: string;
  renewalDate: string;
  isFree: boolean;
}

interface UsageStat {
  label: string;
  current: number;
  limit: number | null;
  Icon: typeof ClipboardCheck;
  color: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

/* ── Tier comparison data ──────────────────────────────────────────────── */

interface TierCard {
  tier: SubscriptionTier;
  label: string;
  price: string;
  description: string;
  features: string[];
  color: string;
  icon: typeof Crown;
  popular?: boolean;
}

const TIER_CARDS: TierCard[] = [
  {
    tier: 'free',
    label: 'Free',
    price: '$0',
    description: 'Get started with basic assessments',
    features: [
      '3 assessments per month',
      '10 advisor messages per day',
      'Basic readiness score',
      'Core financial tools',
    ],
    color: 'rgb(148, 163, 184)',
    icon: Zap,
  },
  {
    tier: 'plus',
    label: 'Plus',
    price: '$9.99',
    description: 'Deeper insights and unlimited assessments',
    features: [
      'Unlimited assessments',
      '50 advisor messages per day',
      'Transformation paths',
      'PDF reports',
      'Advanced tools',
    ],
    color: 'var(--cyan)',
    icon: Sparkles,
  },
  {
    tier: 'pro',
    label: 'Pro',
    price: '$24.99',
    description: 'Full power with couples mode and priority AI',
    features: [
      'Everything in Plus',
      'Unlimited advisor messages',
      'Couples assessment mode',
      'Behavioral genome analytics',
      'Priority AI responses',
    ],
    color: 'var(--emerald)',
    icon: Crown,
    popular: true,
  },
  {
    tier: 'family',
    label: 'Family',
    price: '$39.99',
    description: 'Multi-member household with shared insights',
    features: [
      'Everything in Pro',
      'Up to 6 household members',
      'Shared advisor access',
      'Family financial dashboard',
      'Advisor sharing',
    ],
    color: 'var(--yellow)',
    icon: Users,
  },
];

export default function BillingSection() {
  const { tier: currentTier, upgrade } = useSubscription();

  const [plan, setPlan] = useState<PlanInfo>({
    name: 'Free',
    price: '$0',
    interval: 'month',
    renewalDate: '',
    isFree: true,
  });

  const [usage, setUsage] = useState<UsageStat[]>([
    {
      label: 'Assessments this month',
      current: 0,
      limit: 3,
      Icon: ClipboardCheck,
      color: 'var(--cyan)',
    },
    {
      label: 'Tools accessed',
      current: 0,
      limit: null,
      Icon: Wrench,
      color: 'var(--emerald)',
    },
    {
      label: 'Agent messages sent',
      current: 0,
      limit: 10,
      Icon: MessageSquare,
      color: 'var(--yellow)',
    },
  ]);

  useEffect(() => {
    async function fetchBillingData() {
      try {
        const res = await fetch('/api/user/profile');
        const json = await res.json();
        const profile = json?.data;
        if (profile) {
          const tierName = (profile.tier ?? 'free').charAt(0).toUpperCase() + (profile.tier ?? 'free').slice(1);
          const tierPrices: Record<string, string> = { free: '$0', plus: '$9.99', pro: '$24.99', family: '$39.99' };
          setPlan({
            name: tierName,
            price: tierPrices[profile.tier ?? 'free'] ?? '$0',
            interval: 'month',
            renewalDate: profile.subscription_renewal_date ?? '',
            isFree: !profile.tier || profile.tier === 'free',
          });
        }
      } catch (err) {
        console.error('[Billing] Failed to fetch profile:', err);
      }
    }
    fetchBillingData();
  }, []);

  const [managingSubscription, setManagingSubscription] = useState(false);
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null);

  const handleManageSubscription = useCallback(async () => {
    setManagingSubscription(true);
    try {
      const response = await fetch('/api/payments/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (error) {
      console.error('[Billing] Portal error:', error);
    } finally {
      setManagingSubscription(false);
    }
  }, []);

  const handleUpgrade = useCallback(
    async (targetTier: SubscriptionTier) => {
      if (targetTier === 'free' || targetTier === currentTier) return;
      setUpgradingTier(targetTier);
      try {
        await upgrade(targetTier);
      } finally {
        setUpgradingTier(null);
      }
    },
    [currentTier, upgrade],
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
        <div className="flex items-center gap-3">
          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Billing & Subscription
          </h2>
          <SubscriptionBadge tier={currentTier} />
        </div>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Manage your plan and track usage
        </p>
      </motion.div>

      {/* ── Current Plan Card ── */}
      <motion.div variants={fadeUp}>
        <Card padding="lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className="flex size-12 items-center justify-center rounded-xl shrink-0"
                style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)' }}
              >
                <CreditCard size={24} style={{ color: 'var(--cyan)' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3
                    className="text-base font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {plan.name} Plan
                  </h3>
                  {plan.isFree && <Badge variant="info">Free Tier</Badge>}
                </div>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span
                    className="text-xl font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {plan.price}
                  </span>
                  <span className="ml-1">/{plan.interval}</span>
                </p>
                <p className="mt-1.5 text-xs" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
                  {plan.isFree ? 'No billing \u2014 upgrade anytime' : `Renews ${plan.renewalDate}`}
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              loading={managingSubscription}
              onClick={handleManageSubscription}
              icon={<ArrowUpRight size={14} />}
            >
              Manage Billing
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* ── Usage Stats ── */}
      <motion.div variants={fadeUp}>
        <h3
          className="text-sm font-semibold mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          Usage This Month
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {usage.map((stat) => {
            const percentage = stat.limit
              ? Math.round((stat.current / stat.limit) * 100)
              : null;
            const isNearLimit = percentage !== null && percentage >= 80;

            return (
              <Card key={stat.label} padding="md">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="flex size-9 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${stat.color} 10%, transparent)`,
                    }}
                  >
                    <stat.Icon size={18} style={{ color: stat.color }} />
                  </div>
                  {isNearLimit && (
                    <Badge variant="warning" dot>
                      {percentage}%
                    </Badge>
                  )}
                </div>
                <p
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {stat.current}
                  {stat.limit !== null && (
                    <span
                      className="text-sm font-normal ml-1"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      / {stat.limit}
                    </span>
                  )}
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {stat.label}
                </p>

                {/* Progress bar */}
                {stat.limit !== null && (
                  <div className="mt-3">
                    <div
                      className="h-1.5 w-full rounded-full overflow-hidden"
                      style={{ backgroundColor: 'rgba(51, 65, 85, 0.5)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: isNearLimit
                            ? 'var(--homi-amber)'
                            : stat.color,
                        }}
                      />
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* ── Change Plan — Tier Comparison ── */}
      <motion.div variants={fadeUp}>
        <h3
          className="text-sm font-semibold mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          Change Plan
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIER_CARDS.map((card) => {
            const isCurrent = card.tier === currentTier;
            const isUpgrade =
              !isCurrent &&
              card.tier !== 'free' &&
              TIER_CARDS.findIndex((c) => c.tier === card.tier) >
                TIER_CARDS.findIndex((c) => c.tier === currentTier);

            return (
              <Card key={card.tier} padding="md">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex size-8 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${card.color} 10%, transparent)`,
                        }}
                      >
                        <card.icon size={16} style={{ color: card.color }} />
                      </div>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {card.label}
                      </span>
                    </div>
                    {card.popular && (
                      <Badge variant="success" dot>
                        Popular
                      </Badge>
                    )}
                    {isCurrent && (
                      <Badge variant="info">Current</Badge>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-2">
                    <span
                      className="text-2xl font-bold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {card.price}
                    </span>
                    <span
                      className="text-xs ml-1"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      /mo
                    </span>
                  </div>

                  <p
                    className="text-xs mb-4"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {card.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-1.5 mb-5 flex-1">
                    {card.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-xs"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <Check
                          size={12}
                          className="shrink-0 mt-0.5"
                          style={{ color: card.color }}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {isCurrent ? (
                    <Button variant="ghost" size="sm" fullWidth disabled>
                      Current Plan
                    </Button>
                  ) : isUpgrade ? (
                    <Button
                      variant="cta"
                      size="sm"
                      fullWidth
                      loading={upgradingTier === card.tier}
                      onClick={() => handleUpgrade(card.tier)}
                      icon={<Zap size={14} />}
                    >
                      Upgrade
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" fullWidth disabled>
                      {card.tier === 'free' ? 'Free' : 'Downgrade'}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* ── Upgrade CTA (only for free users) ── */}
      {plan.isFree && (
        <motion.div variants={fadeUp}>
          <Card padding="lg">
            <div
              className="flex flex-col sm:flex-row items-start sm:items-center gap-5"
            >
              <div
                className="flex size-12 items-center justify-center rounded-xl shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(52, 211, 153, 0.15))',
                }}
              >
                <Crown size={24} style={{ color: 'var(--emerald)' }} />
              </div>

              <div className="flex-1">
                <h3
                  className="text-base font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Upgrade to Pro
                </h3>
                <p
                  className="mt-1 text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Unlock unlimited assessments, advanced analytics, and priority agent access.
                </p>
                <ul className="mt-3 space-y-1.5">
                  {[
                    'Unlimited assessments per month',
                    'Advanced behavioral genome analytics',
                    'Priority AI agent responses',
                    'Couple assessment sharing',
                  ].map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-xs"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <Check size={14} style={{ color: 'var(--emerald)' }} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col items-center gap-1 shrink-0">
                <p style={{ color: 'var(--text-primary)' }}>
                  <span className="text-2xl font-bold">$24.99</span>
                  <span
                    className="text-sm ml-1"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    /mo
                  </span>
                </p>
                <Button
                  variant="cta"
                  size="md"
                  icon={<Zap size={16} />}
                  loading={upgradingTier === 'pro'}
                  onClick={() => handleUpgrade('pro')}
                >
                  Upgrade Now
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
