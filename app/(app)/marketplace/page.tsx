'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Ban,
  BadgeCheck,
  Lock,
  Star,
  Clock,
  TrendingUp,
  MessageSquare,
  Video,
  ChevronDown,
  Send,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { Card, Badge, Button, Input } from '@/components/ui';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Advisor Marketplace
 *
 * Connect with vetted, fee-transparent advisors who understand the three
 * dimensions. Mock data — no API calls.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Specialty =
  | 'Home Purchase'
  | 'Investment'
  | 'Retirement'
  | 'Debt Strategy'
  | 'Tax Planning'
  | 'Estate Planning';

interface Advisor {
  id: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  name: string;
  credentials: string;
  firm: string;
  location: string;
  rating: number;
  reviewCount: number;
  specialties: Specialty[];
  bio: string;
  responseTime: string;
  successRate: string;
  feeInfo: string;
  virtualAvailable: boolean;
}

interface TrustStat {
  Icon: LucideIcon;
  label: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const TRUST_STATS: TrustStat[] = [
  { Icon: ShieldCheck, label: '100% Fee-transparent', color: 'var(--emerald, #34d399)' },
  { Icon: Ban, label: '0 Kickbacks', color: 'var(--cyan, #22d3ee)' },
  { Icon: BadgeCheck, label: 'Verified Credentials', color: 'var(--yellow, #facc15)' },
  { Icon: Lock, label: 'Your data stays yours', color: 'var(--emerald, #34d399)' },
];

const SPECIALTIES: Specialty[] = [
  'Home Purchase',
  'Investment',
  'Retirement',
  'Debt Strategy',
  'Tax Planning',
  'Estate Planning',
];

const ADVISORS: Advisor[] = [
  {
    id: 'adv-1',
    initials: 'SC',
    gradientFrom: '#22d3ee',
    gradientTo: '#34d399',
    name: 'Sarah Chen',
    credentials: 'CFP\u00ae',
    firm: 'Northstar Financial',
    location: 'San Francisco, CA',
    rating: 4.9,
    reviewCount: 127,
    specialties: ['Home Purchase', 'Investment', 'Tax Planning'],
    bio: 'Specializes in helping first-time buyers navigate the Bay Area market. 12 years guiding clients through high-cost-of-living decisions.',
    responseTime: '< 2 hours',
    successRate: '94%',
    feeInfo: 'Flat fee: $1,500 per engagement',
    virtualAvailable: true,
  },
  {
    id: 'adv-2',
    initials: 'MJ',
    gradientFrom: '#facc15',
    gradientTo: '#f97316',
    name: 'Marcus Johnson',
    credentials: 'CFA, CFP\u00ae',
    firm: 'Meridian Wealth',
    location: 'Austin, TX',
    rating: 4.8,
    reviewCount: 89,
    specialties: ['Investment', 'Retirement', 'Estate Planning'],
    bio: 'Former institutional portfolio manager turned personal advisor. Deep expertise in retirement income strategies and tax-efficient investing.',
    responseTime: '< 4 hours',
    successRate: '91%',
    feeInfo: 'AUM: 0.65% (no minimums)',
    virtualAvailable: true,
  },
  {
    id: 'adv-3',
    initials: 'RP',
    gradientFrom: '#a78bfa',
    gradientTo: '#6366f1',
    name: 'Rachel Park',
    credentials: 'CFP\u00ae, CPA',
    firm: 'Clarity Financial Planning',
    location: 'Chicago, IL',
    rating: 4.7,
    reviewCount: 64,
    specialties: ['Debt Strategy', 'Tax Planning', 'Home Purchase'],
    bio: 'CPA-turned-planner who helps clients crush debt and build toward homeownership. Believers in the power of a clean financial foundation.',
    responseTime: '< 6 hours',
    successRate: '88%',
    feeInfo: 'Monthly retainer: $250/mo',
    virtualAvailable: true,
  },
  {
    id: 'adv-4',
    initials: 'DW',
    gradientFrom: '#34d399',
    gradientTo: '#06b6d4',
    name: 'David Williams',
    credentials: 'CFP\u00ae, RICP\u00ae',
    firm: 'Evergreen Advisors',
    location: 'Denver, CO',
    rating: 4.8,
    reviewCount: 103,
    specialties: ['Retirement', 'Estate Planning', 'Investment'],
    bio: 'Retirement income specialist helping pre-retirees and retirees make confident transitions. Integrates estate planning into every engagement.',
    responseTime: '< 3 hours',
    successRate: '93%',
    feeInfo: 'Flat fee: $2,000 per plan',
    virtualAvailable: true,
  },
];

// ---------------------------------------------------------------------------
// Animation config
// ---------------------------------------------------------------------------

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeInOut' as const } },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star size={14} fill="var(--yellow, #facc15)" style={{ color: 'var(--yellow, #facc15)' }} />
      <span
        className="text-sm font-semibold tabular-nums"
        style={{ color: 'var(--text-primary, #e2e8f0)' }}
      >
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function AdvisorCard({ advisor }: { advisor: Advisor }) {
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <motion.div variants={fadeUp}>
      <Card padding="md">
        <div className="flex flex-col gap-4">
          {/* ── Top section: Avatar + Info ── */}
          <div className="flex gap-4">
            {/* Avatar */}
            <div
              className="flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-bold"
              style={{
                background: `linear-gradient(135deg, ${advisor.gradientFrom}, ${advisor.gradientTo})`,
                color: '#ffffff',
              }}
            >
              {advisor.initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  className="text-base font-semibold"
                  style={{ color: 'var(--text-primary, #e2e8f0)' }}
                >
                  {advisor.name}, {advisor.credentials}
                </h3>
                <StarRating rating={advisor.rating} />
              </div>
              <p
                className="text-sm mt-0.5"
                style={{ color: 'var(--text-secondary, #94a3b8)' }}
              >
                {advisor.firm} &middot; {advisor.location}
              </p>
            </div>
          </div>

          {/* ── Specialties ── */}
          <div className="flex flex-wrap gap-1.5">
            {advisor.specialties.map((s) => (
              <Badge key={s} variant="info">
                {s}
              </Badge>
            ))}
          </div>

          {/* ── Bio ── */}
          <p
            className="text-sm leading-relaxed line-clamp-2"
            style={{ color: 'var(--text-secondary, #94a3b8)' }}
          >
            {advisor.bio}
          </p>

          {/* ── Stats row ── */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1" style={{ color: 'var(--cyan, #22d3ee)' }}>
              <Clock size={13} />
              {advisor.responseTime}
            </span>
            <span className="inline-flex items-center gap-1" style={{ color: 'var(--emerald, #34d399)' }}>
              <TrendingUp size={13} />
              {advisor.successRate} success
            </span>
            <span className="inline-flex items-center gap-1" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
              <MessageSquare size={13} />
              {advisor.reviewCount} reviews
            </span>
          </div>

          {/* ── Fee + Virtual ── */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--text-primary, #e2e8f0)' }}
            >
              {advisor.feeInfo}
            </span>
            {advisor.virtualAvailable && (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: 'var(--emerald, #34d399)' }}
              >
                <Video size={14} />
                Virtual Available
              </span>
            )}
          </div>

          {/* ── Expand toggle ── */}
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="flex items-center gap-1.5 text-sm font-medium cursor-pointer transition-colors"
            style={{ color: 'var(--cyan, #22d3ee)' }}
          >
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="inline-flex"
            >
              <ChevronDown size={16} />
            </motion.span>
            {expanded ? 'Hide contact form' : 'Send a message'}
          </button>

          {/* ── Contact form (expandable) ── */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' as const }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-3 pt-2 border-t border-[rgba(34,211,238,0.1)]">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Hi ${advisor.name.split(' ')[0]}, I'm exploring homeownership and would love your perspective on...`}
                    rows={3}
                    className="w-full resize-none rounded-[var(--radius-md,8px)] border border-[var(--slate-light,#334155)] bg-[var(--slate,#1e293b)] px-3 py-2.5 text-sm text-[var(--text-primary,#e2e8f0)] placeholder:text-[var(--text-secondary,#94a3b8)] outline-none focus:border-[var(--cyan,#22d3ee)] focus:ring-2 focus:ring-[rgba(34,211,238,0.2)] transition-all"
                  />
                  <Button
                    variant="cta"
                    size="md"
                    icon={<Send size={16} />}
                    disabled={!message.trim()}
                  >
                    Connect
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function MarketplacePage() {
  const [activeFilter, setActiveFilter] = useState<Specialty | null>(null);

  const filtered = activeFilter
    ? ADVISORS.filter((a) => a.specialties.includes(activeFilter))
    : ADVISORS;

  return (
    <motion.div
      className="mx-auto w-full max-w-6xl space-y-8"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* ── Page header ── */}
      <motion.div variants={fadeUp}>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--text-primary, #e2e8f0)' }}
        >
          Advisor Marketplace
        </h1>
        <p
          className="mt-1 text-sm max-w-lg"
          style={{ color: 'var(--text-secondary, #94a3b8)' }}
        >
          Connect with vetted advisors who understand the three dimensions.
        </p>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════
         TRUST BAR
         ════════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp}>
        <div
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border px-6 py-4"
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            borderColor: 'rgba(34, 211, 238, 0.12)',
          }}
        >
          {TRUST_STATS.map((stat) => (
            <div key={stat.label} className="flex items-center gap-2">
              <stat.Icon size={18} style={{ color: stat.color }} />
              <span
                className="text-sm font-semibold"
                style={{ color: 'var(--text-primary, #e2e8f0)' }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════
         FILTER BAR
         ════════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp}>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter(null)}
            className="px-4 py-2 text-sm font-medium rounded-full border transition-all cursor-pointer"
            style={{
              background: !activeFilter ? 'rgba(34, 211, 238, 0.15)' : 'transparent',
              borderColor: !activeFilter ? 'var(--cyan, #22d3ee)' : 'rgba(148, 163, 184, 0.2)',
              color: !activeFilter ? 'var(--cyan, #22d3ee)' : 'var(--text-secondary, #94a3b8)',
            }}
          >
            All
          </button>
          {SPECIALTIES.map((spec) => {
            const isActive = activeFilter === spec;
            return (
              <button
                key={spec}
                type="button"
                onClick={() => setActiveFilter(isActive ? null : spec)}
                className="px-4 py-2 text-sm font-medium rounded-full border transition-all cursor-pointer"
                style={{
                  background: isActive ? 'rgba(34, 211, 238, 0.15)' : 'transparent',
                  borderColor: isActive ? 'var(--cyan, #22d3ee)' : 'rgba(148, 163, 184, 0.2)',
                  color: isActive ? 'var(--cyan, #22d3ee)' : 'var(--text-secondary, #94a3b8)',
                }}
              >
                {spec}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════
         ADVISOR GRID
         ════════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={stagger}
        initial="hidden"
        animate="show"
        key={activeFilter ?? 'all'}
      >
        {filtered.map((advisor) => (
          <AdvisorCard key={advisor.id} advisor={advisor} />
        ))}
      </motion.div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <motion.div
          className="flex flex-col items-center justify-center py-16 gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--text-secondary, #94a3b8)' }}
          >
            No advisors match this filter yet.
          </p>
          <Button variant="ghost" size="sm" onClick={() => setActiveFilter(null)}>
            Clear filter
          </Button>
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
         ADVISOR CTA
         ════════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp}>
        <div
          className="relative overflow-hidden rounded-xl border p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.06) 0%, rgba(52, 211, 153, 0.06) 100%)',
            borderColor: 'rgba(34, 211, 238, 0.15)',
          }}
        >
          {/* Decorative gradient blur */}
          <div
            className="absolute -top-20 -right-20 size-40 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #22d3ee, transparent)' }}
          />
          <h3
            className="text-lg font-bold"
            style={{ color: 'var(--text-primary, #e2e8f0)' }}
          >
            Are you an advisor?
          </h3>
          <p
            className="mt-2 text-sm max-w-md mx-auto"
            style={{ color: 'var(--text-secondary, #94a3b8)' }}
          >
            Join a marketplace built on transparency, not commissions. Help
            clients make confident homeownership decisions.
          </p>
          <div className="mt-5">
            <Button variant="primary" icon={<ArrowRight size={16} />}>
              Apply to Join
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
