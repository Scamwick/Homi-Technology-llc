'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  LayoutDashboard,
  Share2,
  Sparkles,
  MessageSquare,
  Scale,
  Download,
  Copy,
  Check,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAssessmentStore } from '@/stores/assessmentStore';
import { Button, Modal, Badge } from '@/components/ui';
import {
  ScoreOrb,
  VerdictBadge,
  DimensionCard,
  TemperatureBar,
} from '@/components/scoring';
import { ThresholdCompass, BrandedName } from '@/components/brand';
import type { Verdict } from '@/types/assessment';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TrinityPerspective {
  role: 'advocate' | 'skeptic' | 'arbiter';
  displayName: string;
  color: string;
  analysis: string;
}

interface TrinityResponse {
  assessmentId: string;
  perspectives: TrinityPerspective[];
  generatedAt: string;
  model: string;
}

// ---------------------------------------------------------------------------
// Mock Data -- used when API is unavailable during development
// ---------------------------------------------------------------------------

function generateMockResult(id: string) {
  return {
    id,
    userId: 'mock-user',
    overall: 72,
    financial: {
      score: 68,
      maxContribution: 35,
      contribution: 23.8,
      breakdown: {
        dti: { value: 0.28, maxPoints: 10, points: 7 },
        downPayment: { value: 0.15, maxPoints: 10, points: 6 },
        emergencyFund: { value: 4.5, maxPoints: 8, points: 6 },
        creditScore: { value: 720, maxPoints: 7, points: 4.8 },
      },
    },
    emotional: {
      score: 78,
      maxContribution: 35,
      contribution: 27.3,
      breakdown: {
        lifeStability: { value: 7, maxPoints: 9, points: 7 },
        confidence: { value: 8, maxPoints: 9, points: 8 },
        partnerAlignment: { value: 6, maxPoints: 9, points: 5.5 },
        fomoCheck: { value: 4, maxPoints: 8, points: 6.8 },
      },
    },
    timing: {
      score: 70,
      maxContribution: 30,
      contribution: 21,
      breakdown: {
        timeHorizon: { value: 6, maxPoints: 10, points: 7 },
        savingsRate: { value: 0.15, maxPoints: 10, points: 7 },
        downPaymentProgress: { value: 0.6, maxPoints: 10, points: 7 },
      },
    },
    verdict: 'ALMOST_THERE' as Verdict,
    confidenceBand: 'high' as const,
    monteCarlo: {
      successRate: 0.72,
      scenariosRun: 1000,
      p10: -45000,
      p50: 28000,
      p90: 120000,
      crashSurvivalRate: 0.65,
      gateApplied: false,
    },
    crisisDetected: false,
    createdAt: new Date().toISOString(),
    version: '1.0.0',
  };
}

function generateMockTrinity(id: string): TrinityResponse {
  return {
    assessmentId: id,
    perspectives: [
      {
        role: 'advocate',
        displayName: 'Advocate',
        color: 'emerald',
        analysis:
          'Your 72/100 score reflects genuine progress toward your goal. A 78% emotional readiness score tells me you\'ve thought deeply about this decision, and that self-awareness puts you ahead of most people facing a commitment this size. Your savings discipline and credit health show a pattern of responsibility that will serve you well.',
      },
      {
        role: 'skeptic',
        displayName: 'Skeptic',
        color: 'yellow',
        analysis:
          'The gap between your emotional confidence and financial position deserves attention. Your savings at 15% of the target means you\'re absorbing more risk than necessary, and a 65% stress-scenario survival rate leaves meaningful exposure to the unexpected. The 28% DTI is manageable now, but adding a major financial commitment pushes into uncomfortable territory.',
      },
      {
        role: 'arbiter',
        displayName: 'Arbiter',
        color: 'cyan',
        analysis:
          'You\'re close but not quite there. I\'d recommend 3-6 more months of focused preparation: push your savings past 20% of the target to strengthen your position, and build your emergency fund to 6 months. The difference between committing at 72 and committing at 80+ could save you significant stress and money over time.',
      },
    ],
    generatedAt: new Date().toISOString(),
    model: 'mock-development',
  };
}

// ---------------------------------------------------------------------------
// Verdict Config
// ---------------------------------------------------------------------------

const VERDICT_COLORS: Record<Verdict, { color: string; glow: string }> = {
  READY: { color: 'var(--emerald, #34d399)', glow: 'rgba(52, 211, 153, 0.4)' },
  ALMOST_THERE: { color: 'var(--yellow, #facc15)', glow: 'rgba(250, 204, 21, 0.35)' },
  BUILD_FIRST: { color: 'var(--homi-amber, #fb923c)', glow: 'rgba(251, 146, 60, 0.35)' },
  NOT_YET: { color: 'var(--homi-crimson, #ef4444)', glow: 'rgba(239, 68, 68, 0.35)' },
};

const VERDICT_GUIDANCE: Record<
  Verdict,
  { title: string; paragraphs: string[] }
> = {
  READY: {
    title: 'The door is open.',
    paragraphs: [
      'Your numbers, emotions, and timing all align. This doesn\'t mean rush. It means you have the foundation to move with confidence.',
      'Start taking the next concrete steps toward your goal. You\'ve done the work to be ready. Now move with clarity.',
    ],
  },
  ALMOST_THERE: {
    title: 'You\'re closer than you think.',
    paragraphs: [
      'A few targeted improvements will move you from "almost" to "ready." Focus on the dimension with the lowest score. That\'s where small changes create the biggest impact.',
      'Consider retaking this assessment in 1-3 months after addressing the gaps the Skeptic identified.',
    ],
  },
  BUILD_FIRST: {
    title: 'Build your foundation first.',
    paragraphs: [
      'Your readiness has meaningful gaps that, if ignored, could turn this commitment from a milestone into a burden. This isn\'t failure. It\'s information.',
      'Focus on strengthening your financial position: reduce debt, grow your emergency fund, and keep saving. Come back in 6-12 months.',
    ],
  },
  NOT_YET: {
    title: 'Not yet, and that\'s okay.',
    paragraphs: [
      'The most important step in any major decision is knowing where you honestly stand. You\'ve done that today.',
      'Use the detailed breakdown above to create a concrete plan. Every month of preparation improves your position. This assessment will be here when you\'re ready to check in again.',
    ],
  },
};

// ---------------------------------------------------------------------------
// Recommendations by verdict
// ---------------------------------------------------------------------------

interface Recommendation {
  text: string;
  priority: 'High' | 'Medium' | 'Low';
}

function getRecommendations(
  verdict: Verdict,
  financial: number,
  emotional: number,
  timing: number,
): Recommendation[] {
  const items: Recommendation[] = [];

  if (verdict === 'READY') {
    items.push(
      { text: 'Get pre-approved with at least two lenders to compare rates', priority: 'High' },
      { text: 'Research neighborhoods that fit your budget and lifestyle', priority: 'High' },
      { text: 'Connect with a buyer\'s agent who knows your target market', priority: 'Medium' },
      { text: 'Set up automatic alerts for new listings in your price range', priority: 'Medium' },
      { text: 'Review your homeowner\'s insurance options early', priority: 'Low' },
    );
  } else if (verdict === 'ALMOST_THERE') {
    if (financial < emotional && financial < timing) {
      items.push(
        { text: 'Increase your monthly savings rate by at least 5% to close the financial gap', priority: 'High' },
        { text: 'Pay down high-interest debt to improve your DTI ratio', priority: 'High' },
        { text: 'Build your emergency fund to cover 6 months of expenses', priority: 'Medium' },
      );
    } else if (emotional < financial && emotional < timing) {
      items.push(
        { text: 'Have an honest conversation with your partner about timeline and budget', priority: 'High' },
        { text: 'List your non-negotiables vs. nice-to-haves to reduce decision anxiety', priority: 'High' },
        { text: 'Talk to recent homebuyers in your circle about their experience', priority: 'Medium' },
      );
    } else {
      items.push(
        { text: 'Accelerate your down payment savings with a dedicated high-yield account', priority: 'High' },
        { text: 'Lock in a realistic 3-6 month timeline and work backward from it', priority: 'High' },
        { text: 'Monitor interest rate trends so you can act when conditions are favorable', priority: 'Medium' },
      );
    }
    items.push(
      { text: 'Retake this assessment in 1-3 months to track your progress', priority: 'Medium' },
      { text: 'Avoid taking on any new debt or large purchases before you\'re ready', priority: 'Low' },
    );
  } else if (verdict === 'BUILD_FIRST') {
    items.push(
      { text: 'Create a strict monthly budget and automate your savings', priority: 'High' },
      { text: 'Target reducing your debt-to-income ratio below 36%', priority: 'High' },
      { text: 'Build an emergency fund covering at least 3 months of expenses', priority: 'High' },
      { text: 'Review and dispute any errors on your credit report', priority: 'Medium' },
      { text: 'Set a 6-12 month milestone to reassess your readiness', priority: 'Medium' },
    );
  } else {
    items.push(
      { text: 'Focus on income growth: seek a raise, side income, or a career move', priority: 'High' },
      { text: 'Eliminate high-interest consumer debt as your first priority', priority: 'High' },
      { text: 'Open a dedicated savings account and automate weekly deposits', priority: 'High' },
      { text: 'Educate yourself on the homebuying process so you\'re prepared when the time comes', priority: 'Medium' },
      { text: 'Check back with this assessment in 12 months to measure your progress', priority: 'Low' },
    );
  }

  return items;
}

// ---------------------------------------------------------------------------
// Dimension insights
// ---------------------------------------------------------------------------

function getDimensionInsight(dimension: 'financial' | 'emotional' | 'timing', score: number): string {
  if (dimension === 'financial') {
    if (score >= 80) return 'Strong financial foundation. Your numbers support confident action.';
    if (score >= 65) return 'Solid base with room to strengthen. A few months of focused saving could close the gap.';
    if (score >= 50) return 'Your finances need attention before committing. Focus on debt reduction and savings.';
    return 'Significant financial preparation needed. Build an emergency fund and reduce debt first.';
  }
  if (dimension === 'emotional') {
    if (score >= 80) return 'High emotional readiness. You\'ve thought this through with clarity and confidence.';
    if (score >= 65) return 'Good emotional foundation. Address any lingering doubts or partner alignment gaps.';
    if (score >= 50) return 'Mixed signals on emotional readiness. Take time to separate desire from pressure.';
    return 'Emotional readiness is low. Make sure this decision is yours, not driven by external pressure.';
  }
  // timing
  if (score >= 80) return 'Excellent timing alignment. Your trajectory and timeline support action now.';
  if (score >= 65) return 'Timing is reasonable. Accelerating savings could improve your position significantly.';
  if (score >= 50) return 'Timeline may be premature. A few more months of preparation would reduce risk.';
  return 'Timing is challenging. Extend your horizon and focus on building momentum first.';
}

// ---------------------------------------------------------------------------
// Share Modal
// ---------------------------------------------------------------------------

function ShareModal({
  open,
  onClose,
  assessmentId,
  score,
}: {
  open: boolean;
  onClose: () => void;
  assessmentId: string;
  score: number;
}) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `I scored ${score}/100 on my H\u014dMI decision readiness assessment.`;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select + copy
    }
  }, [shareUrl]);

  const handleShareX = useCallback(() => {
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [shareText, shareUrl]);

  const handleDownloadPDF = useCallback(async () => {
    try {
      const res = await fetch(`/api/reports/${assessmentId}`);
      if (!res.ok) throw new Error('Report generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `homi-report-${assessmentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Silently handle — report endpoint may not exist yet
    }
  }, [assessmentId]);

  return (
    <Modal open={open} onClose={onClose} title="Share Your Results" size="sm">
      <div className="flex flex-col gap-3">
        {/* Copy Link */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex items-center gap-3 w-full rounded-xl p-4 text-left transition-colors"
          style={{
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(34, 211, 238, 0.15)',
          }}
        >
          <div
            className="flex items-center justify-center size-10 rounded-lg shrink-0"
            style={{ background: 'rgba(34, 211, 238, 0.1)' }}
          >
            {copied ? (
              <Check size={18} style={{ color: 'var(--emerald)' }} />
            ) : (
              <Copy size={18} style={{ color: 'var(--cyan)' }} />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {copied ? 'Link Copied!' : 'Copy Link'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Share a direct link to your results
            </p>
          </div>
        </button>

        {/* Share to X */}
        <button
          type="button"
          onClick={handleShareX}
          className="flex items-center gap-3 w-full rounded-xl p-4 text-left transition-colors"
          style={{
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(34, 211, 238, 0.15)',
          }}
        >
          <div
            className="flex items-center justify-center size-10 rounded-lg shrink-0"
            style={{ background: 'rgba(34, 211, 238, 0.1)' }}
          >
            <X size={18} style={{ color: 'var(--cyan)' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Share on X
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Post your score to your timeline
            </p>
          </div>
        </button>

        {/* Download PDF Report */}
        <button
          type="button"
          onClick={handleDownloadPDF}
          className="flex items-center gap-3 w-full rounded-xl p-4 text-left transition-colors"
          style={{
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(34, 211, 238, 0.15)',
          }}
        >
          <div
            className="flex items-center justify-center size-10 rounded-lg shrink-0"
            style={{ background: 'rgba(34, 211, 238, 0.1)' }}
          >
            <Download size={18} style={{ color: 'var(--cyan)' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Download Report
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Get a detailed PDF of your assessment
            </p>
          </div>
        </button>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Trinity Card
// ---------------------------------------------------------------------------

const TRINITY_ICON_MAP = {
  advocate: Sparkles,
  skeptic: MessageSquare,
  arbiter: Scale,
} as const;

const TRINITY_COLOR_MAP = {
  advocate: {
    border: 'var(--emerald)',
    bg: 'rgba(52, 211, 153, 0.06)',
    text: 'var(--emerald)',
  },
  skeptic: {
    border: 'var(--yellow)',
    bg: 'rgba(250, 204, 21, 0.06)',
    text: 'var(--yellow)',
  },
  arbiter: {
    border: 'var(--cyan)',
    bg: 'rgba(34, 211, 238, 0.06)',
    text: 'var(--cyan)',
  },
} as const;

function TrinityCard({
  perspective,
  index,
}: {
  perspective: TrinityPerspective;
  index: number;
}) {
  const role = perspective.role as keyof typeof TRINITY_ICON_MAP;
  const Icon = TRINITY_ICON_MAP[role];
  const colors = TRINITY_COLOR_MAP[role];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 * index, duration: 0.5 }}
    >
      <div
        className="rounded-xl p-5 border-l-4"
        style={{
          background: colors.bg,
          borderLeftColor: colors.border,
          borderTop: '1px solid rgba(51, 65, 85, 0.3)',
          borderRight: '1px solid rgba(51, 65, 85, 0.3)',
          borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Icon size={16} style={{ color: colors.text }} />
          <span
            className="text-sm font-semibold tracking-wide uppercase"
            style={{ color: colors.text, letterSpacing: '0.05em' }}
          >
            {perspective.displayName}
          </span>
        </div>
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--text-primary)' }}
        >
          {perspective.analysis}
        </p>
      </div>
    </motion.div>
  );
}

function TrinitySkeletons() {
  return (
    <div className="flex flex-col gap-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-xl p-5 border-l-4 animate-pulse"
          style={{
            background: 'rgba(30, 41, 59, 0.4)',
            borderLeftColor: 'rgba(51, 65, 85, 0.5)',
            borderTop: '1px solid rgba(51, 65, 85, 0.2)',
            borderRight: '1px solid rgba(51, 65, 85, 0.2)',
            borderBottom: '1px solid rgba(51, 65, 85, 0.2)',
          }}
        >
          <div
            className="h-4 rounded w-24 mb-3"
            style={{ background: 'rgba(51, 65, 85, 0.5)' }}
          />
          <div className="space-y-2">
            <div
              className="h-3 rounded w-full"
              style={{ background: 'rgba(51, 65, 85, 0.4)' }}
            />
            <div
              className="h-3 rounded w-5/6"
              style={{ background: 'rgba(51, 65, 85, 0.4)' }}
            />
            <div
              className="h-3 rounded w-4/6"
              style={{ background: 'rgba(51, 65, 85, 0.4)' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Enhanced Dimension Card with status badge + progress bar + insight
// ---------------------------------------------------------------------------

const DIMENSION_COLORS: Record<string, { color: string; fill: string; barBg: string }> = {
  financial: {
    color: 'var(--cyan, #22d3ee)',
    fill: '#22d3ee',
    barBg: 'rgba(34, 211, 238, 0.15)',
  },
  emotional: {
    color: 'var(--emerald, #34d399)',
    fill: '#34d399',
    barBg: 'rgba(52, 211, 153, 0.15)',
  },
  timing: {
    color: 'var(--yellow, #facc15)',
    fill: '#facc15',
    barBg: 'rgba(250, 204, 21, 0.15)',
  },
};

function EnhancedDimensionCard({
  dimension,
  score,
  maxContribution,
  index,
}: {
  dimension: 'financial' | 'emotional' | 'timing';
  score: number;
  maxContribution: number;
  index: number;
}) {
  const colors = DIMENSION_COLORS[dimension];
  const passing = score >= 70;
  const insight = getDimensionInsight(dimension, score);
  const labels: Record<string, string> = {
    financial: 'Financial Reality',
    emotional: 'Emotional Truth',
    timing: 'Perfect Timing',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2, duration: 0.4 }}
    >
      <div
        className="rounded-xl p-5"
        style={{
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(34, 211, 238, 0.2)',
        }}
      >
        {/* Header: label + status badge */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-sm font-semibold tracking-wide uppercase"
            style={{ color: colors.color, letterSpacing: '0.04em' }}
          >
            {labels[dimension]}
          </span>
          <Badge variant={passing ? 'success' : score >= 50 ? 'caution' : 'danger'} dot>
            {passing ? 'Passing' : 'Needs Work'}
          </Badge>
        </div>

        {/* Score large number + weighted contribution */}
        <div className="flex items-baseline gap-2 mb-3">
          <span
            className="text-4xl font-bold tabular-nums"
            style={{ color: colors.color }}
          >
            {Math.round(score)}
          </span>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            / 100
          </span>
          <span className="ml-auto text-xs" style={{ color: 'var(--text-secondary)' }}>
            {((score / 100) * maxContribution).toFixed(1)} / {maxContribution} weighted
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative mb-3">
          <div
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ background: colors.barBg }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: colors.fill }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, score)}%` }}
              transition={{ duration: 1.2, ease: 'easeInOut' as const }}
            />
          </div>
          {/* 70 threshold marker */}
          <div
            className="absolute top-0 h-2"
            style={{ left: '70%', width: '1px', background: 'rgba(226, 232, 240, 0.3)' }}
          />
        </div>

        {/* Insight text */}
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {insight}
        </p>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Compass with center score
// ---------------------------------------------------------------------------

function CompassWithScore({
  financial,
  emotional,
  timing,
  overall,
}: {
  financial: number;
  emotional: number;
  timing: number;
  overall: number;
}) {
  return (
    <div className="relative inline-flex items-center justify-center">
      <ThresholdCompass
        size={220}
        financial={financial}
        emotional={emotional}
        timing={timing}
        animate
        showKeyhole={false}
      />
      {/* Center score overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-5xl font-bold tabular-nums"
          style={{
            background: 'linear-gradient(135deg, #22d3ee, #34d399, #facc15)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 20px rgba(34, 211, 238, 0.3))',
          }}
        >
          {overall}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Score Reveal Sequence (enhanced, kept cinematic)
// ---------------------------------------------------------------------------

function ScoreReveal({
  result,
  onRevealComplete,
}: {
  result: ReturnType<typeof generateMockResult>;
  onRevealComplete: () => void;
}) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const schedule = [
      { delay: 500, phase: 1 },
      { delay: 2000, phase: 2 },
      { delay: 4000, phase: 3 },
      { delay: 4500, phase: 4 },
      { delay: 5300, phase: 5 },
      { delay: 6000, phase: 6 },
    ];

    const timers: ReturnType<typeof setTimeout>[] = [];

    schedule.forEach(({ delay, phase: p }) => {
      const t = setTimeout(() => setPhase(p), delay);
      timers.push(t);
    });

    const finalTimer = setTimeout(onRevealComplete, 6500);
    timers.push(finalTimer);

    return () => timers.forEach(clearTimeout);
  }, [onRevealComplete]);

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto px-4">
      {/* Phase 1: Compass with center score */}
      <AnimatePresence>
        {phase >= 1 && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeInOut' as const }}
            className="mb-6"
          >
            <CompassWithScore
              financial={phase >= 1 ? result.financial.score : 0}
              emotional={phase >= 1 ? result.emotional.score : 0}
              timing={phase >= 1 ? result.timing.score : 0}
              overall={result.overall}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2: ScoreOrb with count-up */}
      <AnimatePresence>
        {phase >= 2 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeInOut' as const }}
            className="mb-4"
          >
            <ScoreOrb
              score={result.overall}
              size="lg"
              animate
              showLabel
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 3: Enhanced VerdictBadge */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <VerdictBadge
              verdict={result.verdict}
              size="lg"
              pulse
              showIcon
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 4: Enhanced Dimension Cards */}
      <AnimatePresence>
        {phase >= 4 && (
          <motion.div className="w-full flex flex-col gap-4 mb-6">
            {(['financial', 'emotional', 'timing'] as const).map(
              (dim, i) => (
                <EnhancedDimensionCard
                  key={dim}
                  dimension={dim}
                  score={result[dim].score}
                  maxContribution={result[dim].maxContribution}
                  index={i}
                />
              ),
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 5: TemperatureBar */}
      <AnimatePresence>
        {phase >= 5 && (
          <motion.div
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <TemperatureBar
              score={result.overall}
              showMarker
              showLabels
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Recommendation Item
// ---------------------------------------------------------------------------

const PRIORITY_STYLES: Record<string, { variant: 'danger' | 'caution' | 'info' }> = {
  High: { variant: 'danger' },
  Medium: { variant: 'caution' },
  Low: { variant: 'info' },
};

function RecommendationItem({
  rec,
  index,
}: {
  rec: Recommendation;
  index: number;
}) {
  const pStyle = PRIORITY_STYLES[rec.priority];

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.35 }}
      className="flex items-start gap-3 rounded-xl p-4"
      style={{
        background: 'rgba(30, 41, 59, 0.6)',
        border: '1px solid rgba(51, 65, 85, 0.3)',
      }}
    >
      <div className="mt-0.5 shrink-0">
        <ChevronRight size={16} style={{ color: 'var(--cyan)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {rec.text}
        </p>
      </div>
      <div className="shrink-0 mt-0.5">
        <Badge variant={pStyle.variant}>
          {rec.priority}
        </Badge>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Section Header
// ---------------------------------------------------------------------------

function SectionHeader({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <div
        className="w-1 h-5 rounded-full"
        style={{ background: color }}
      />
      <h3
        className="text-lg font-bold tracking-tight"
        style={{ color: 'var(--text-primary)' }}
      >
        {children}
      </h3>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function AssessmentResultPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const assessmentId = params.id;

  const currentResult = useAssessmentStore((s) => s.currentResult);
  const reset = useAssessmentStore((s) => s.reset);

  const [revealComplete, setRevealComplete] = useState(false);
  const [trinityData, setTrinityData] = useState<TrinityResponse | null>(null);
  const [trinityLoading, setTrinityLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const trinityFetched = useRef(false);

  // Use current result from store, or generate mock data for development
  const result = currentResult ?? generateMockResult(assessmentId);
  const verdict = result.verdict as Verdict;
  const guidance = VERDICT_GUIDANCE[verdict];
  const verdictColors = VERDICT_COLORS[verdict];
  const recommendations = getRecommendations(
    verdict,
    result.financial.score,
    result.emotional.score,
    result.timing.score,
  );

  // Fetch Trinity analysis
  useEffect(() => {
    if (trinityFetched.current) return;
    trinityFetched.current = true;

    async function fetchTrinity() {
      try {
        const response = await fetch('/api/trinity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assessmentId: result.id,
            assessment: {
              overall: result.overall,
              verdict: result.verdict,
              financial: {
                score: result.financial.score,
                contribution: result.financial.contribution,
              },
              emotional: {
                score: result.emotional.score,
                contribution: result.emotional.contribution,
              },
              timing: {
                score: result.timing.score,
                contribution: result.timing.contribution,
              },
              monteCarlo: result.monteCarlo,
              confidenceBand: result.confidenceBand,
            },
          }),
        });

        if (!response.ok) throw new Error('Trinity API failed');

        const data: TrinityResponse = await response.json();
        setTrinityData(data);
      } catch {
        // Fall back to mock data
        setTrinityData(generateMockTrinity(result.id));
      } finally {
        setTrinityLoading(false);
      }
    }

    fetchTrinity();
  }, [result]);

  const handleRevealComplete = useCallback(() => {
    setRevealComplete(true);
  }, []);

  const handleRetake = useCallback(() => {
    reset();
    router.push('/assess/new');
  }, [reset, router]);

  const handleShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `My H\u014dMI-Score: ${result.overall}`,
          text: `I scored ${result.overall}/100 on my decision readiness assessment.`,
          url: window.location.href,
        });
        return;
      } catch {
        // User cancelled or not supported, fall through to modal
      }
    }
    setShareOpen(true);
  }, [result.overall]);

  return (
    <div className="flex flex-col flex-1 w-full">
      {/* Share Modal */}
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        assessmentId={assessmentId}
        score={result.overall}
      />

      {/* Dark reveal backdrop */}
      <motion.div
        className="min-h-screen flex flex-col items-center pt-12 sm:pt-20 pb-20"
        style={{ background: 'var(--navy, #0a1628)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* ─── Header Actions Bar ─── */}
        <AnimatePresence>
          {revealComplete && (
            <motion.div
              className="w-full max-w-2xl mx-auto px-4 mb-8"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Your <BrandedName className="font-black" /> Results
                </h1>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Share2 size={14} />}
                    onClick={handleShare}
                  >
                    Share
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<RotateCcw size={14} />}
                    onClick={handleRetake}
                  >
                    Retake
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Download size={14} />}
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/reports/${assessmentId}`);
                        if (!res.ok) return;
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `homi-report-${assessmentId}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      } catch {
                        // Silently handle
                      }
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cinematic score reveal sequence */}
        <ScoreReveal
          result={result as ReturnType<typeof generateMockResult>}
          onRevealComplete={handleRevealComplete}
        />

        {/* Content below the reveal -- fades in after sequence */}
        <AnimatePresence>
          {revealComplete && (
            <motion.div
              className="w-full max-w-2xl mx-auto px-4 mt-12 flex flex-col gap-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* ─── Trinity Engine Section ─── */}
              <section>
                <SectionHeader color="var(--cyan)">
                  Trinity Engine Analysis
                </SectionHeader>

                {trinityLoading ? (
                  <TrinitySkeletons />
                ) : trinityData ? (
                  <div className="flex flex-col gap-4">
                    {trinityData.perspectives.map((p, i) => (
                      <TrinityCard key={p.role} perspective={p} index={i} />
                    ))}
                  </div>
                ) : null}
              </section>

              {/* ─── Recommendations Section ─── */}
              <section>
                <SectionHeader color={verdictColors.color}>
                  What To Do Next
                </SectionHeader>

                <div className="flex flex-col gap-3">
                  {recommendations.map((rec, i) => (
                    <RecommendationItem key={i} rec={rec} index={i} />
                  ))}
                </div>
              </section>

              {/* ─── What This Means Section ─── */}
              <section>
                <SectionHeader
                  color={
                    verdict === 'READY'
                      ? 'var(--emerald)'
                      : verdict === 'ALMOST_THERE'
                        ? 'var(--yellow)'
                        : 'var(--homi-crimson)'
                  }
                >
                  What This Means
                </SectionHeader>

                <div
                  className="rounded-xl p-5"
                  style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(34, 211, 238, 0.2)',
                  }}
                >
                  <h4
                    className="text-base font-semibold mb-3"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {guidance.title}
                  </h4>
                  {guidance.paragraphs.map((p, i) => (
                    <p
                      key={i}
                      className="text-sm leading-relaxed mb-2 last:mb-0"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </section>

              {/* ─── Action Buttons ─── */}
              <section className="flex flex-col sm:flex-row gap-3 pb-8">
                <Button
                  variant="cta"
                  fullWidth
                  icon={<RotateCcw size={16} />}
                  onClick={handleRetake}
                >
                  Retake Assessment
                </Button>
                <Link href="/dashboard" className="w-full">
                  <Button
                    variant="primary"
                    fullWidth
                    icon={<LayoutDashboard size={16} />}
                  >
                    View Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  fullWidth
                  icon={<Share2 size={16} />}
                  onClick={handleShare}
                >
                  Share Results
                </Button>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
