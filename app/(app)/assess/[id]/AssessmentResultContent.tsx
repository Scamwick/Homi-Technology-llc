'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  LayoutDashboard,
  Share2,
  Sparkles,
  MessageSquare,
  Scale,
} from 'lucide-react';
import { useAssessmentStore } from '@/stores/assessmentStore';
import { Button } from '@/components/ui';
import {
  ScoreOrb,
  VerdictBadge,
  DimensionCard,
  TemperatureBar,
} from '@/components/scoring';
import { ThresholdCompass } from '@/components/brand';
import type { Verdict } from '@/types/assessment';
import type { AssessmentWithDetails } from '@/lib/data/assessments';

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

interface ResultShape {
  id: string;
  overall: number;
  financial: { score: number; maxContribution: number; contribution: number };
  emotional: { score: number; maxContribution: number; contribution: number };
  timing: { score: number; maxContribution: number; contribution: number };
  verdict: Verdict;
  confidenceBand: string;
  monteCarlo: {
    successRate: number;
    scenariosRun: number;
    p10: number;
    p50: number;
    p90: number;
    crashSurvivalRate: number;
    gateApplied: boolean;
  } | null;
  crisisDetected: boolean;
  createdAt: string;
  version: string;
}

function mapAssessmentToResult(a: AssessmentWithDetails): ResultShape {
  return {
    id: a.id,
    overall: a.overall_score,
    financial: {
      score: a.financial_score,
      maxContribution: 35,
      contribution: (a.financial_score / 100) * 35,
    },
    emotional: {
      score: a.emotional_score,
      maxContribution: 35,
      contribution: (a.emotional_score / 100) * 35,
    },
    timing: {
      score: a.timing_score,
      maxContribution: 30,
      contribution: (a.timing_score / 100) * 30,
    },
    verdict: a.verdict,
    confidenceBand: a.confidence_band,
    monteCarlo: a.monte_carlo
      ? {
          successRate: a.monte_carlo.success_rate,
          scenariosRun: a.monte_carlo.scenarios_run,
          p10: a.monte_carlo.p10,
          p50: a.monte_carlo.p50,
          p90: a.monte_carlo.p90,
          crashSurvivalRate: a.monte_carlo.crash_survival_rate,
          gateApplied: a.monte_carlo.gate_applied,
        }
      : null,
    crisisDetected: a.crisis_detected,
    createdAt: a.created_at,
    version: a.version,
  };
}

// ---------------------------------------------------------------------------
// Verdict Guidance
// ---------------------------------------------------------------------------

const VERDICT_GUIDANCE: Record<Verdict, { title: string; paragraphs: string[] }> = {
  READY: {
    title: 'The door is open.',
    paragraphs: [
      "Your numbers, emotions, and timing all align. This doesn't mean rush — it means you have the foundation to move with confidence.",
      "Start taking the next concrete steps toward your goal. You've done the work to be ready — now move with clarity.",
    ],
  },
  ALMOST_THERE: {
    title: "You're closer than you think.",
    paragraphs: [
      'A few targeted improvements will move you from "almost" to "ready." Focus on the dimension with the lowest score — that\'s where small changes create the biggest impact.',
      'Consider retaking this assessment in 1-3 months after addressing the gaps the Skeptic identified.',
    ],
  },
  BUILD_FIRST: {
    title: 'Build your foundation first.',
    paragraphs: [
      "Your readiness has meaningful gaps that, if ignored, could turn this commitment from a milestone into a burden. This isn't failure — it's information.",
      'Focus on strengthening your financial position: reduce debt, grow your emergency fund, and keep saving. Come back in 6-12 months.',
    ],
  },
  NOT_YET: {
    title: "Not yet — and that's okay.",
    paragraphs: [
      "The most important step in any major decision is knowing where you honestly stand. You've done that today.",
      'Use the detailed breakdown above to create a concrete plan. Every month of preparation improves your position. This assessment will be here when you\'re ready to check in again.',
    ],
  },
};

// ---------------------------------------------------------------------------
// Trinity Card
// ---------------------------------------------------------------------------

const TRINITY_ICON_MAP = {
  advocate: Sparkles,
  skeptic: MessageSquare,
  arbiter: Scale,
} as const;

const TRINITY_COLOR_MAP = {
  advocate: { border: 'var(--emerald)', bg: 'rgba(52, 211, 153, 0.06)', text: 'var(--emerald)' },
  skeptic: { border: 'var(--yellow)', bg: 'rgba(250, 204, 21, 0.06)', text: 'var(--yellow)' },
  arbiter: { border: 'var(--cyan)', bg: 'rgba(34, 211, 238, 0.06)', text: 'var(--cyan)' },
} as const;

function TrinityCard({ perspective, index }: { perspective: TrinityPerspective; index: number }) {
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
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
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
          <div className="h-4 rounded w-24 mb-3" style={{ background: 'rgba(51, 65, 85, 0.5)' }} />
          <div className="space-y-2">
            <div className="h-3 rounded w-full" style={{ background: 'rgba(51, 65, 85, 0.4)' }} />
            <div className="h-3 rounded w-5/6" style={{ background: 'rgba(51, 65, 85, 0.4)' }} />
            <div className="h-3 rounded w-4/6" style={{ background: 'rgba(51, 65, 85, 0.4)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Score Reveal
// ---------------------------------------------------------------------------

function ScoreReveal({ result, onRevealComplete }: { result: ResultShape; onRevealComplete: () => void }) {
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
    const timers = schedule.map(({ delay, phase: p }) => setTimeout(() => setPhase(p), delay));
    timers.push(setTimeout(onRevealComplete, 6500));
    return () => timers.forEach(clearTimeout);
  }, [onRevealComplete]);

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto px-4">
      <AnimatePresence>
        {phase >= 1 && (
          <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }} className="mb-6">
            <ThresholdCompass size={200} financial={result.financial.score} emotional={result.emotional.score} timing={result.timing.score} animate />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {phase >= 2 && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} className="mb-4">
            <ScoreOrb score={result.overall} size="lg" animate showLabel />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
            <VerdictBadge verdict={result.verdict} size="lg" pulse showIcon />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {phase >= 4 && (
          <motion.div className="w-full flex flex-col gap-3 mb-6">
            {(['financial', 'emotional', 'timing'] as const).map((dim, i) => (
              <motion.div key={dim} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2, duration: 0.4 }}>
                <DimensionCard dimension={dim} score={result[dim].score} maxContribution={result[dim].maxContribution} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {phase >= 5 && (
          <motion.div className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <TemperatureBar score={result.overall} showMarker showLabels />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center" style={{ background: 'var(--navy, #0a1628)' }}>
      <ThresholdCompass size={120} animate className="mb-6 opacity-40" />
      <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Assessment Not Found</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        This assessment doesn&apos;t exist or you don&apos;t have access to it.
      </p>
      <Link href="/assess">
        <Button variant="cta">View All Assessments</Button>
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface Props {
  assessment: AssessmentWithDetails | null;
  assessmentId: string;
}

export function AssessmentResultContent({ assessment, assessmentId }: Props) {
  const router = useRouter();
  const currentResult = useAssessmentStore((s) => s.currentResult);
  const reset = useAssessmentStore((s) => s.reset);

  const [revealComplete, setRevealComplete] = useState(false);
  const [trinityData, setTrinityData] = useState<TrinityResponse | null>(null);
  const [trinityLoading, setTrinityLoading] = useState(true);
  const trinityFetched = useRef(false);

  // Build result from Supabase data or Zustand store (for just-completed assessments)
  const result: ResultShape | null = assessment
    ? mapAssessmentToResult(assessment)
    : currentResult
      ? {
          id: assessmentId,
          overall: currentResult.overall,
          financial: currentResult.financial,
          emotional: currentResult.emotional,
          timing: currentResult.timing,
          verdict: currentResult.verdict as Verdict,
          confidenceBand: currentResult.confidenceBand,
          monteCarlo: currentResult.monteCarlo,
          crisisDetected: currentResult.crisisDetected,
          createdAt: currentResult.createdAt,
          version: currentResult.version,
        }
      : null;

  // If assessment exists in DB, show Trinity from DB too
  useEffect(() => {
    if (assessment?.trinity) {
      setTrinityData({
        assessmentId: assessment.id,
        perspectives: [
          {
            role: 'advocate',
            displayName: 'Advocate',
            color: 'emerald',
            analysis: assessment.trinity.advocate_perspective,
          },
          {
            role: 'skeptic',
            displayName: 'Skeptic',
            color: 'yellow',
            analysis: assessment.trinity.skeptic_perspective,
          },
          {
            role: 'arbiter',
            displayName: 'Arbiter',
            color: 'cyan',
            analysis: assessment.trinity.arbiter_perspective,
          },
        ],
        generatedAt: assessment.trinity.created_at,
        model: assessment.trinity.model_version,
      });
      setTrinityLoading(false);
      return;
    }

    if (trinityFetched.current || !result) return;
    trinityFetched.current = true;

    async function fetchTrinity() {
      try {
        const response = await fetch('/api/trinity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assessmentId: result!.id,
            assessment: {
              overall: result!.overall,
              verdict: result!.verdict,
              financial: { score: result!.financial.score, contribution: result!.financial.contribution },
              emotional: { score: result!.emotional.score, contribution: result!.emotional.contribution },
              timing: { score: result!.timing.score, contribution: result!.timing.contribution },
              monteCarlo: result!.monteCarlo,
              confidenceBand: result!.confidenceBand,
            },
          }),
        });
        if (!response.ok) throw new Error('Trinity API failed');
        const data: TrinityResponse = await response.json();
        setTrinityData(data);
      } catch {
        setTrinityLoading(false);
      } finally {
        setTrinityLoading(false);
      }
    }

    fetchTrinity();
  }, [assessment, result]);

  const handleRevealComplete = useCallback(() => setRevealComplete(true), []);
  const handleRetake = useCallback(() => { reset(); router.push('/assess/new'); }, [reset, router]);

  if (!result) return <NotFound />;

  const verdict = result.verdict;
  const guidance = VERDICT_GUIDANCE[verdict];

  return (
    <div className="flex flex-col flex-1 w-full">
      <motion.div
        className="min-h-screen flex flex-col items-center pt-12 sm:pt-20 pb-20"
        style={{ background: 'var(--navy, #0a1628)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ScoreReveal result={result} onRevealComplete={handleRevealComplete} />

        <AnimatePresence>
          {revealComplete && (
            <motion.div
              className="w-full max-w-xl mx-auto px-4 mt-12 flex flex-col gap-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1 h-5 rounded-full" style={{ background: 'var(--cyan)' }} />
                  <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    Trinity Engine Analysis
                  </h3>
                </div>
                {trinityLoading ? (
                  <TrinitySkeletons />
                ) : trinityData ? (
                  <div className="flex flex-col gap-4">
                    {trinityData.perspectives.map((p, i) => (
                      <TrinityCard key={p.role} perspective={p} index={i} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Trinity analysis not available for this assessment.
                  </p>
                )}
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-1 h-5 rounded-full"
                    style={{
                      background: verdict === 'READY' ? 'var(--emerald)' : verdict === 'ALMOST_THERE' ? 'var(--yellow)' : 'var(--homi-crimson)',
                    }}
                  />
                  <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    What This Means
                  </h3>
                </div>
                <div className="rounded-xl p-5" style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.3)' }}>
                  <h4 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    {guidance.title}
                  </h4>
                  {guidance.paragraphs.map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed mb-2 last:mb-0" style={{ color: 'var(--text-secondary)' }}>
                      {p}
                    </p>
                  ))}
                </div>
              </section>

              <section className="flex flex-col sm:flex-row gap-3 pb-8">
                <Button variant="cta" fullWidth icon={<RotateCcw size={16} />} onClick={handleRetake}>
                  Retake Assessment
                </Button>
                <Link href="/dashboard" className="w-full">
                  <Button variant="primary" fullWidth icon={<LayoutDashboard size={16} />}>
                    View Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  fullWidth
                  icon={<Share2 size={16} />}
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `My HōMI-Score: ${result.overall}`,
                        text: `I scored ${result.overall}/100 on my decision readiness assessment.`,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
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
