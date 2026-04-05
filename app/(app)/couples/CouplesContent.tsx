'use client';

import { useState, useMemo } from 'react';
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
import { ScoreOrb, VerdictBadge } from '@/components/scoring';
import { Card, Badge, Button, Input } from '@/components/ui';
import type { CouplesData } from '@/lib/data/features';
import type { Verdict } from '@/types/assessment';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * CouplesContent — Client component with animations & interactivity.
 * Receives all data as props from the server component page.
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

interface CouplesContentProps {
  data: CouplesData | null;
}

// ---------------------------------------------------------------------------
// Constants (static UI data, NOT mock scores)
// ---------------------------------------------------------------------------

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

const DIMENSION_COLORS: Record<Dimension, { color: string; bgColor: string; borderColor: string }> = {
  financial: {
    color: 'var(--cyan, #22d3ee)',
    bgColor: 'rgba(34, 211, 238, 0.06)',
    borderColor: 'rgba(34, 211, 238, 0.12)',
  },
  emotional: {
    color: 'var(--emerald, #34d399)',
    bgColor: 'rgba(52, 211, 153, 0.06)',
    borderColor: 'rgba(52, 211, 153, 0.12)',
  },
  timing: {
    color: 'var(--yellow, #facc15)',
    bgColor: 'rgba(250, 204, 21, 0.06)',
    borderColor: 'rgba(250, 204, 21, 0.12)',
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Derive dimension comparisons from real assessment data */
function buildDimensionComparisons(
  userAssessment: { financial_score: number; emotional_score: number; timing_score: number },
  partnerAssessment: { financial_score: number; emotional_score: number; timing_score: number },
): DimensionComparison[] {
  const dimensions: { dimension: Dimension; label: string }[] = [
    { dimension: 'financial', label: 'Financial' },
    { dimension: 'emotional', label: 'Emotional' },
    { dimension: 'timing', label: 'Timing' },
  ];

  return dimensions.map(({ dimension, label }) => {
    const userScore = userAssessment[`${dimension}_score` as keyof typeof userAssessment];
    const partnerScore = partnerAssessment[`${dimension}_score` as keyof typeof partnerAssessment];
    return {
      dimension,
      label,
      userScore,
      partnerScore,
      gap: Math.abs(userScore - partnerScore),
      ...DIMENSION_COLORS[dimension],
    };
  });
}

/** Compute alignment percentage from two overall scores */
function computeAlignmentPercentage(userScore: number, partnerScore: number): number {
  const gap = Math.abs(userScore - partnerScore);
  // 0 gap = 100% alignment, 100 gap = 0% alignment
  return Math.max(0, Math.round(100 - gap));
}

/** Derive a couple verdict from the average score */
function deriveJointVerdict(userScore: number, partnerScore: number): Verdict {
  const avg = (userScore + partnerScore) / 2;
  if (avg >= 80) return 'READY';
  if (avg >= 60) return 'ALMOST_THERE';
  if (avg >= 40) return 'BUILD_FIRST';
  return 'NOT_YET';
}

/** Get human-readable verdict label */
function getVerdictLabel(verdict: Verdict): string {
  switch (verdict) {
    case 'READY':
      return 'Ready (as a couple)';
    case 'ALMOST_THERE':
      return 'Almost There (as a couple)';
    case 'BUILD_FIRST':
      return 'Build First (as a couple)';
    case 'NOT_YET':
      return 'Not Yet (as a couple)';
  }
}

/** Get verdict description */
function getVerdictDescription(verdict: Verdict, biggestGapLabel: string): string {
  switch (verdict) {
    case 'READY':
      return 'You\'re well aligned across all dimensions. You\'re in a strong position to make joint decisions.';
    case 'ALMOST_THERE':
      return `You're aligned on most dimensions, but the ${biggestGapLabel.toLowerCase()} gap is worth addressing before making a joint commitment.`;
    case 'BUILD_FIRST':
      return `There are meaningful gaps to work through together, especially in ${biggestGapLabel.toLowerCase()}. Have focused conversations before committing.`;
    case 'NOT_YET':
      return 'There are significant differences to address. Consider individual growth and open conversations before joint commitments.';
  }
}

/** Build action items from the biggest gaps */
function buildActionItems(comparisons: DimensionComparison[]): ActionItem[] {
  const sorted = [...comparisons].sort((a, b) => b.gap - a.gap);
  const items: ActionItem[] = [];

  for (const comp of sorted) {
    if (comp.gap >= 10) {
      if (comp.dimension === 'timing') {
        items.push({ id: `act-${comp.dimension}`, text: 'Have the timeline conversation', icon: MessageCircle });
      } else if (comp.dimension === 'financial') {
        items.push({ id: `act-${comp.dimension}`, text: 'Align on financial strategy', icon: ArrowRight });
      } else if (comp.dimension === 'emotional') {
        items.push({ id: `act-${comp.dimension}`, text: 'Discuss emotional readiness together', icon: MessageCircle });
      }
    }
  }

  return items;
}

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

/** Partner linked view — real data */
function PartnerLinkedView({
  data,
}: {
  data: CouplesData;
}) {
  const { userLatestAssessment, partnerLatestAssessment, partnerProfile } = data;

  const bothHaveAssessments = userLatestAssessment && partnerLatestAssessment;

  const comparisons = useMemo(() => {
    if (!bothHaveAssessments) return [];
    return buildDimensionComparisons(userLatestAssessment, partnerLatestAssessment);
  }, [userLatestAssessment, partnerLatestAssessment, bothHaveAssessments]);

  const biggestGap = useMemo(() => {
    if (comparisons.length === 0) return null;
    return comparisons.reduce((max, d) => (d.gap > max.gap ? d : max));
  }, [comparisons]);

  const alignmentPct = useMemo(() => {
    if (!bothHaveAssessments) return 0;
    return computeAlignmentPercentage(userLatestAssessment.overall_score, partnerLatestAssessment.overall_score);
  }, [userLatestAssessment, partnerLatestAssessment, bothHaveAssessments]);

  const jointVerdict = useMemo(() => {
    if (!bothHaveAssessments) return null;
    return deriveJointVerdict(userLatestAssessment.overall_score, partnerLatestAssessment.overall_score);
  }, [userLatestAssessment, partnerLatestAssessment, bothHaveAssessments]);

  const actionItems = useMemo(() => buildActionItems(comparisons), [comparisons]);

  const partnerName = partnerProfile?.name ?? 'Partner';

  // If one or both assessments are missing, show a waiting state
  if (!bothHaveAssessments) {
    return (
      <motion.div
        className="space-y-8"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp}>
          <Card padding="lg">
            <div className="flex flex-col items-center gap-6 text-center">
              <CompassRingsIllustration />
              <div>
                <h2
                  className="text-lg font-bold"
                  style={{ color: 'var(--text-primary, #e2e8f0)' }}
                >
                  Waiting for assessments
                </h2>
                <p
                  className="mt-1.5 text-sm max-w-md mx-auto"
                  style={{ color: 'var(--text-secondary, #94a3b8)' }}
                >
                  {!userLatestAssessment && !partnerLatestAssessment
                    ? 'Both you and your partner need to complete the assessment before alignment results appear.'
                    : !userLatestAssessment
                      ? 'Complete your assessment to see how you align with your partner.'
                      : `${partnerName} hasn't completed their assessment yet. Results will appear once they do.`}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

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
                <ScoreOrb score={userLatestAssessment.overall_score} size="md" showLabel />
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
                  {partnerName}
                </span>
                <ScoreOrb score={partnerLatestAssessment.overall_score} size="md" showLabel />
              </div>
            </div>

            {/* Alignment percentage */}
            <div className="flex flex-col items-center gap-1">
              <span
                className="text-3xl font-bold tabular-nums"
                style={{ color: 'var(--cyan, #22d3ee)' }}
              >
                {alignmentPct}%
              </span>
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: 'var(--text-secondary, #94a3b8)' }}
              >
                Alignment
              </span>
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
          {comparisons.map((comp) => (
            <AlignmentBar key={comp.dimension} comparison={comp} />
          ))}
        </div>
      </motion.div>

      {/* ── Conflict highlight ── */}
      {biggestGap && biggestGap.gap >= 10 && (
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
      )}

      {/* ── Joint Verdict ── */}
      {jointVerdict && (
        <motion.div variants={fadeUp}>
          <Card padding="lg">
            <div className="flex flex-col items-center gap-4 text-center">
              <VerdictBadge verdict={jointVerdict} size="lg" pulse />
              <div>
                <h3
                  className="text-lg font-bold"
                  style={{ color: 'var(--text-primary, #e2e8f0)' }}
                >
                  {getVerdictLabel(jointVerdict)}
                </h3>
                <p
                  className="text-sm mt-1.5 max-w-md mx-auto"
                  style={{ color: 'var(--text-secondary, #94a3b8)' }}
                >
                  {getVerdictDescription(jointVerdict, biggestGap?.label ?? 'overall')}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── Action Items ── */}
      {actionItems.length > 0 && (
        <motion.div variants={fadeUp}>
          <h3
            className="text-sm font-semibold mb-4 uppercase tracking-wider"
            style={{ color: 'var(--text-secondary, #94a3b8)' }}
          >
            Recommended Next Steps
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {actionItems.map((item) => (
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
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function CouplesContent({ data }: CouplesContentProps) {
  const hasCouple = data?.couple != null;

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

      {/* ── State views ── */}
      <AnimatePresence mode="wait">
        {hasCouple && data ? (
          <motion.div
            key="linked"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PartnerLinkedView data={data} />
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
