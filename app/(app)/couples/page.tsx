'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Send,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Users,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react';
import { ScoreOrb, DimensionCard, VerdictBadge } from '@/components/scoring';
import { Card, Badge, Button, Input } from '@/components/ui';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Couples Mode — Alignment Assessment
 *
 * Two states: "no partner linked" and "partner linked" (mock).
 * Togglable for demo. Imports scoring components.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Dimension = 'financial' | 'emotional' | 'timing';

interface DimensionComparison {
  dimension: Dimension;
  label: string;
  userScore: number;
  partnerScore: number;
  gap: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface Step {
  number: number;
  title: string;
  description: string;
  Icon: LucideIcon;
  color: string;
}

interface ActionItem {
  id: string;
  text: string;
  icon: LucideIcon;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_USER_SCORE = 73;
const MOCK_PARTNER_SCORE = 68;

const DIMENSION_COMPARISONS: DimensionComparison[] = [
  {
    dimension: 'financial',
    label: 'Financial',
    userScore: 82,
    partnerScore: 71,
    gap: 11,
    color: 'var(--cyan, #22d3ee)',
    bgColor: 'rgba(34, 211, 238, 0.06)',
    borderColor: 'rgba(34, 211, 238, 0.12)',
  },
  {
    dimension: 'emotional',
    label: 'Emotional',
    userScore: 61,
    partnerScore: 74,
    gap: 13,
    color: 'var(--emerald, #34d399)',
    bgColor: 'rgba(52, 211, 153, 0.06)',
    borderColor: 'rgba(52, 211, 153, 0.12)',
  },
  {
    dimension: 'timing',
    label: 'Timing',
    userScore: 77,
    partnerScore: 58,
    gap: 19,
    color: 'var(--yellow, #facc15)',
    bgColor: 'rgba(250, 204, 21, 0.06)',
    borderColor: 'rgba(250, 204, 21, 0.12)',
  },
];

const HOW_IT_WORKS_STEPS: Step[] = [
  {
    number: 1,
    title: 'Invite',
    description: 'Send your partner an invite link via email',
    Icon: Mail,
    color: 'var(--cyan, #22d3ee)',
  },
  {
    number: 2,
    title: 'Assess independently',
    description: 'Each of you completes the assessment privately',
    Icon: Users,
    color: 'var(--emerald, #34d399)',
  },
  {
    number: 3,
    title: 'View alignment',
    description: 'See where you agree and where to have conversations',
    Icon: CheckCircle2,
    color: 'var(--yellow, #facc15)',
  },
];

const ACTION_ITEMS: ActionItem[] = [
  { id: 'act-1', text: 'Have the timeline conversation', icon: MessageCircle },
  { id: 'act-2', text: 'Align on financial strategy', icon: ArrowRight },
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

/** Overlapping compass rings illustration */
function CompassRingsIllustration() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
      {/* Ring 1 — User */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 140,
          height: 140,
          border: '3px solid var(--cyan, #22d3ee)',
          left: 10,
          opacity: 0.7,
          boxShadow: '0 0 30px rgba(34, 211, 238, 0.2)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
      {/* Ring 2 — Partner */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 140,
          height: 140,
          border: '3px solid var(--emerald, #34d399)',
          right: 10,
          opacity: 0.7,
          boxShadow: '0 0 30px rgba(52, 211, 153, 0.2)',
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
      {/* Center overlap glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 60,
          height: 60,
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.2), rgba(52, 211, 153, 0.2), transparent)',
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

/** Alignment bar for dimension comparison */
function AlignmentBar({
  comparison,
}: {
  comparison: DimensionComparison;
}) {
  const isHighGap = comparison.gap >= 15;

  return (
    <motion.div
      className="rounded-xl border p-5"
      style={{
        backgroundColor: comparison.bgColor,
        borderColor: isHighGap ? 'rgba(251, 146, 60, 0.3)' : comparison.borderColor,
      }}
      variants={fadeUp}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-sm font-semibold"
          style={{ color: comparison.color }}
        >
          {comparison.label}
        </span>
        {isHighGap && (
          <Badge variant="caution" dot>
            {comparison.gap}pt gap
          </Badge>
        )}
      </div>

      {/* Score bars */}
      <div className="space-y-2">
        {/* User */}
        <div className="flex items-center gap-3">
          <span
            className="text-xs w-10 text-right tabular-nums font-medium"
            style={{ color: 'var(--text-secondary, #94a3b8)' }}
          >
            You
          </span>
          <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(30, 41, 59, 0.6)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: comparison.color }}
              initial={{ width: 0 }}
              animate={{ width: `${comparison.userScore}%` }}
              transition={{ duration: 1, ease: 'easeInOut' as const, delay: 0.3 }}
            />
          </div>
          <span
            className="text-sm font-bold tabular-nums w-8"
            style={{ color: 'var(--text-primary, #e2e8f0)' }}
          >
            {comparison.userScore}
          </span>
        </div>

        {/* Partner */}
        <div className="flex items-center gap-3">
          <span
            className="text-xs w-10 text-right tabular-nums font-medium"
            style={{ color: 'var(--text-secondary, #94a3b8)' }}
          >
            Partner
          </span>
          <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(30, 41, 59, 0.6)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: comparison.color, opacity: 0.6 }}
              initial={{ width: 0 }}
              animate={{ width: `${comparison.partnerScore}%` }}
              transition={{ duration: 1, ease: 'easeInOut' as const, delay: 0.5 }}
            />
          </div>
          <span
            className="text-sm font-bold tabular-nums w-8"
            style={{ color: 'var(--text-primary, #e2e8f0)' }}
          >
            {comparison.partnerScore}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/** No partner linked view */
function NoPartnerView() {
  const [email, setEmail] = useState('');

  return (
    <motion.div
      className="space-y-8"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Illustration + invite form */}
      <motion.div variants={fadeUp}>
        <Card padding="lg">
          <div className="flex flex-col items-center gap-6 text-center">
            <CompassRingsIllustration />

            <div>
              <h2
                className="text-lg font-bold"
                style={{ color: 'var(--text-primary, #e2e8f0)' }}
              >
                Invite your partner
              </h2>
              <p
                className="mt-1.5 text-sm max-w-md mx-auto"
                style={{ color: 'var(--text-secondary, #94a3b8)' }}
              >
                Big decisions are better together. Invite your partner to take the
                assessment independently, then see how your readiness aligns.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-md">
              <Input
                type="email"
                placeholder="partner@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leadingIcon={<Mail size={16} />}
                fullWidth
              />
              <Button
                variant="cta"
                icon={<Send size={16} />}
                disabled={!email.includes('@')}
                className="shrink-0"
              >
                Send Invite
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* How it works */}
      <motion.div variants={fadeUp}>
        <h3
          className="text-sm font-semibold mb-4 uppercase tracking-wider"
          style={{ color: 'var(--text-secondary, #94a3b8)' }}
        >
          How it works
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <Card key={step.number} padding="md">
              <div className="flex flex-col items-center text-center gap-3">
                <div
                  className="flex size-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${step.color}15` }}
                >
                  <step.Icon size={20} style={{ color: step.color }} />
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className="flex size-5 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{
                        backgroundColor: step.color,
                        color: '#0a1628',
                      }}
                    >
                      {step.number}
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: 'var(--text-primary, #e2e8f0)' }}
                    >
                      {step.title}
                    </span>
                  </div>
                  <p
                    className="mt-1.5 text-xs leading-relaxed"
                    style={{ color: 'var(--text-secondary, #94a3b8)' }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Partner linked view (mock data) */
function PartnerLinkedView() {
  // Identify the biggest gap
  const biggestGap = DIMENSION_COMPARISONS.reduce((max, d) =>
    d.gap > max.gap ? d : max,
  );

  return (
    <motion.div
      className="space-y-8"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* ── Score Orbs side by side ── */}
      <motion.div variants={fadeUp}>
        <Card padding="lg">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-8 sm:gap-14 flex-wrap justify-center">
              {/* User orb */}
              <div className="flex flex-col items-center gap-2">
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--cyan, #22d3ee)' }}
                >
                  You
                </span>
                <ScoreOrb score={MOCK_USER_SCORE} size="md" showLabel />
              </div>

              {/* VS separator */}
              <div className="flex flex-col items-center gap-1">
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: 'var(--text-secondary, #94a3b8)' }}
                >
                  vs
                </span>
                <div
                  className="w-px h-16"
                  style={{ backgroundColor: 'rgba(148, 163, 184, 0.2)' }}
                />
              </div>

              {/* Partner orb */}
              <div className="flex flex-col items-center gap-2">
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--emerald, #34d399)' }}
                >
                  Partner
                </span>
                <ScoreOrb score={MOCK_PARTNER_SCORE} size="md" showLabel />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Dimension Comparison Cards ── */}
      <motion.div variants={fadeUp}>
        <h3
          className="text-sm font-semibold mb-4 uppercase tracking-wider"
          style={{ color: 'var(--text-secondary, #94a3b8)' }}
        >
          Alignment Comparison
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {DIMENSION_COMPARISONS.map((comp) => (
            <AlignmentBar key={comp.dimension} comparison={comp} />
          ))}
        </div>
      </motion.div>

      {/* ── Conflict highlight ── */}
      <motion.div variants={fadeUp}>
        <div
          className="flex items-start gap-3 rounded-xl border px-5 py-4"
          style={{
            backgroundColor: 'rgba(251, 146, 60, 0.06)',
            borderColor: 'rgba(251, 146, 60, 0.25)',
          }}
        >
          <AlertTriangle
            size={20}
            className="shrink-0 mt-0.5"
            style={{ color: 'var(--homi-amber, #fb923c)' }}
          />
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: 'var(--homi-amber, #fb923c)' }}
            >
              {biggestGap.label} is your biggest gap
            </p>
            <p
              className="text-sm mt-0.5"
              style={{ color: 'var(--text-secondary, #94a3b8)' }}
            >
              You&apos;re {biggestGap.gap} points apart. This dimension needs a
              dedicated conversation before moving forward together.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Joint Verdict ── */}
      <motion.div variants={fadeUp}>
        <Card padding="lg">
          <div className="flex flex-col items-center gap-4 text-center">
            <VerdictBadge verdict="ALMOST_THERE" size="lg" pulse />
            <div>
              <h3
                className="text-lg font-bold"
                style={{ color: 'var(--text-primary, #e2e8f0)' }}
              >
                Almost There (as a couple)
              </h3>
              <p
                className="text-sm mt-1.5 max-w-md mx-auto"
                style={{ color: 'var(--text-secondary, #94a3b8)' }}
              >
                You&apos;re aligned on most dimensions, but the timing gap is
                worth addressing before making a joint commitment.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Action Items ── */}
      <motion.div variants={fadeUp}>
        <h3
          className="text-sm font-semibold mb-4 uppercase tracking-wider"
          style={{ color: 'var(--text-secondary, #94a3b8)' }}
        >
          Recommended Next Steps
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ACTION_ITEMS.map((item) => (
            <Card key={item.id} interactive padding="md">
              <div className="flex items-center gap-3">
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)' }}
                >
                  <item.icon size={20} style={{ color: 'var(--cyan, #22d3ee)' }} />
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary, #e2e8f0)' }}
                >
                  {item.text}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function CouplesPage() {
  const [isPartnerLinked, setIsPartnerLinked] = useState(false);

  return (
    <motion.div
      className="mx-auto w-full max-w-6xl space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--text-primary, #e2e8f0)' }}
        >
          Couples Mode
        </h1>
        <p
          className="mt-1 text-sm max-w-lg"
          style={{ color: 'var(--text-secondary, #94a3b8)' }}
        >
          Align on your biggest decisions together
        </p>
      </motion.div>

      {/* ── Demo toggle ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div
          className="inline-flex rounded-full border p-1"
          style={{
            borderColor: 'rgba(148, 163, 184, 0.2)',
            background: 'rgba(30, 41, 59, 0.6)',
          }}
        >
          <button
            type="button"
            onClick={() => setIsPartnerLinked(false)}
            className="px-4 py-1.5 text-sm font-medium rounded-full transition-all cursor-pointer"
            style={{
              background: !isPartnerLinked ? 'rgba(34, 211, 238, 0.15)' : 'transparent',
              color: !isPartnerLinked ? 'var(--cyan, #22d3ee)' : 'var(--text-secondary, #94a3b8)',
            }}
          >
            No Partner
          </button>
          <button
            type="button"
            onClick={() => setIsPartnerLinked(true)}
            className="px-4 py-1.5 text-sm font-medium rounded-full transition-all cursor-pointer"
            style={{
              background: isPartnerLinked ? 'rgba(52, 211, 153, 0.15)' : 'transparent',
              color: isPartnerLinked ? 'var(--emerald, #34d399)' : 'var(--text-secondary, #94a3b8)',
            }}
          >
            Partner Linked
          </button>
        </div>
      </motion.div>

      {/* ── State views ── */}
      <AnimatePresence mode="wait">
        {isPartnerLinked ? (
          <motion.div
            key="linked"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PartnerLinkedView />
          </motion.div>
        ) : (
          <motion.div
            key="unlinked"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <NoPartnerView />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
