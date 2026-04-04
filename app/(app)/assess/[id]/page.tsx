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
// Mock Data — used when API is unavailable during development
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
// Verdict Guidance
// ---------------------------------------------------------------------------

const VERDICT_GUIDANCE: Record<
  Verdict,
  { title: string; paragraphs: string[] }
> = {
  READY: {
    title: 'The door is open.',
    paragraphs: [
      'Your numbers, emotions, and timing all align. This doesn\'t mean rush — it means you have the foundation to move with confidence.',
      'Start taking the next concrete steps toward your goal. You\'ve done the work to be ready — now move with clarity.',
    ],
  },
  ALMOST_THERE: {
    title: 'You\'re closer than you think.',
    paragraphs: [
      'A few targeted improvements will move you from "almost" to "ready." Focus on the dimension with the lowest score — that\'s where small changes create the biggest impact.',
      'Consider retaking this assessment in 1-3 months after addressing the gaps the Skeptic identified.',
    ],
  },
  BUILD_FIRST: {
    title: 'Build your foundation first.',
    paragraphs: [
      'Your readiness has meaningful gaps that, if ignored, could turn this commitment from a milestone into a burden. This isn\'t failure — it\'s information.',
      'Focus on strengthening your financial position: reduce debt, grow your emergency fund, and keep saving. Come back in 6-12 months.',
    ],
  },
  NOT_YET: {
    title: 'Not yet — and that\'s okay.',
    paragraphs: [
      'The most important step in any major decision is knowing where you honestly stand. You\'ve done that today.',
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
// Score Reveal Sequence
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
    // Phase 0: dark screen (500ms)
    // Phase 1: compass appears (already visible from start, rings animate)
    // Phase 2: score orb count-up (1500ms after compass)
    // Phase 3: verdict badge (500ms delay)
    // Phase 4: dimension cards (staggered)
    // Phase 5: temperature bar + reveal complete

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

    // Signal reveal complete at the end
    const finalTimer = setTimeout(onRevealComplete, 6500);
    timers.push(finalTimer);

    return () => timers.forEach(clearTimeout);
  }, [onRevealComplete]);

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto px-4">
      {/* Phase 1: ThresholdCompass with score-driven ring arcs */}
      <AnimatePresence>
        {phase >= 1 && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeInOut' as const }}
            className="mb-6"
          >
            <ThresholdCompass
              size={200}
              financial={phase >= 1 ? result.financial.score : 0}
              emotional={phase >= 1 ? result.emotional.score : 0}
              timing={phase >= 1 ? result.timing.score : 0}
              animate
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

      {/* Phase 3: VerdictBadge */}
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

      {/* Phase 4: Dimension Cards */}
      <AnimatePresence>
        {phase >= 4 && (
          <motion.div className="w-full flex flex-col gap-3 mb-6">
            {(['financial', 'emotional', 'timing'] as const).map(
              (dim, i) => (
                <motion.div
                  key={dim}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.2,
                    duration: 0.4,
                    ease: 'easeInOut' as const,
                  }}
                >
                  <DimensionCard
                    dimension={dim}
                    score={result[dim].score}
                    maxContribution={result[dim].maxContribution}
                  />
                </motion.div>
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
  const trinityFetched = useRef(false);

  // Use current result from store, or generate mock data for development
  const result = currentResult ?? generateMockResult(assessmentId);
  const verdict = result.verdict as Verdict;
  const guidance = VERDICT_GUIDANCE[verdict];

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

  return (
    <div className="flex flex-col flex-1 w-full">
      {/* Dark reveal backdrop */}
      <motion.div
        className="min-h-screen flex flex-col items-center pt-12 sm:pt-20 pb-20"
        style={{ background: 'var(--navy, #0a1628)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Cinematic score reveal sequence */}
        <ScoreReveal
                      result={result as ReturnType<typeof generateMockResult>}
          onRevealComplete={handleRevealComplete}
        />

        {/* Content below the reveal — fades in after sequence */}
        <AnimatePresence>
          {revealComplete && (
            <motion.div
              className="w-full max-w-xl mx-auto px-4 mt-12 flex flex-col gap-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* ─── Trinity Engine Section ─── */}
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <div
                    className="w-1 h-5 rounded-full"
                    style={{ background: 'var(--cyan)' }}
                  />
                  <h3
                    className="text-lg font-bold tracking-tight"
                    style={{ color: 'var(--text-primary)' }}
                  >
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
                ) : null}
              </section>

              {/* ─── What This Means Section ─── */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-1 h-5 rounded-full"
                    style={{
                      background:
                        verdict === 'READY'
                          ? 'var(--emerald)'
                          : verdict === 'ALMOST_THERE'
                            ? 'var(--yellow)'
                            : 'var(--homi-crimson)',
                    }}
                  />
                  <h3
                    className="text-lg font-bold tracking-tight"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    What This Means
                  </h3>
                </div>

                <div
                  className="rounded-xl p-5"
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(51, 65, 85, 0.3)',
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
