'use client';

import { motion } from 'framer-motion';
import { TemporalMessage } from '@/components/temporal-twin/TemporalMessage';
import { Card } from '@/components/ui';
import { TemporalTwinEngine } from '@/lib/temporal-twin/engine';
import type { AllMessages } from '@/lib/temporal-twin/engine';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Temporal Twin Page
 *
 * Full-page view of the Temporal Twin messaging system. Displays
 * future-self letters across three time horizons with an explanation
 * card. Uses mock data for a score of 73 (ALMOST_THERE).
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Mock Data — Score of 73 (ALMOST_THERE)
// ---------------------------------------------------------------------------

const engine = new TemporalTwinEngine();

const MOCK_PARAMS = {
  currentAge: 32,
  verdict: 'ALMOST_THERE' as const,
  overallScore: 73,
  financialScore: 78,
  emotionalScore: 65,
  timingScore: 72,
  decisionType: 'homeownership',
};

// Generate synchronously-safe mock messages (engine is template-based)
function generateMockMessages(): AllMessages {
  const now = new Date().toISOString();
  const fiveYear = {
    horizon: '5yr' as const,
    futureAge: 37,
    content:
      `I know waiting felt hard when your score was 73 and you could almost taste it. ` +
      `But the extra months you spent pushing that financial score past 78% made all the difference. ` +
      `The patience paid off in ways the calculator couldn't predict \u2014 lower rates, better inventory, and the confidence that comes from knowing you were truly ready. ` +
      `At 37, I'm grateful you didn't rush.`,
    signature: '\u2014 You, age 37',
    verdict: 'ALMOST_THERE',
    generatedAt: now,
  };
  const tenYear = {
    horizon: '10yr' as const,
    futureAge: 42,
    content:
      `Ten years in, I think about the moment you saw 73 and almost jumped. ` +
      `Your emotional readiness was at 65%, which told you something important: you cared deeply about getting this right. ` +
      `The extra time you took didn't just improve the numbers \u2014 it transformed how you felt about the entire decision. ` +
      `That foundation of certainty has carried us through every challenge since.`,
    signature: '\u2014 You, age 42',
    verdict: 'ALMOST_THERE',
    generatedAt: now,
  };
  const retirement = {
    horizon: 'retirement' as const,
    futureAge: 67,
    content:
      `At 67, I can tell you that the gap between "almost ready" and "ready" was the most important distance you ever closed. ` +
      `Your timing score of 72% was telling you to prepare just a little more, and listening to that signal was an act of self-respect. ` +
      `The home you eventually chose became the anchor of a life well-lived. ` +
      `The patience you showed at 32 became the wisdom I carry at 67.`,
    signature: '\u2014 You, age 67',
    verdict: 'ALMOST_THERE',
    generatedAt: now,
  };
  return { fiveYear, tenYear, retirement };
}

const MOCK_MESSAGES = generateMockMessages();

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function TemporalTwinPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' as const }}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" role="img" aria-label="hourglass">
            &#x23F3;
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-[#e2e8f0]">
            Temporal Twin
          </h1>
        </div>
        <p className="text-[#94a3b8] text-base md:text-lg">
          Letters from who you&apos;ll become. Your future self has something to
          tell you.
        </p>
      </motion.div>

      {/* ── Message Component ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' as const }}
      >
        <TemporalMessage messages={MOCK_MESSAGES} />
      </motion.div>

      {/* ── About Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' as const }}
      >
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-[#e2e8f0] mb-4 flex items-center gap-2">
            <span
              className="text-xl"
              role="img"
              aria-label="crystal ball"
            >
              &#x1F52E;
            </span>
            About the Temporal Twin
          </h3>
          <div className="space-y-3 text-[#94a3b8] text-sm leading-relaxed">
            <p>
              The Temporal Twin is a reflection tool that uses your assessment
              scores to generate personalized messages from your future self.
              These letters project your current trajectory across three time
              horizons: 5 years, 10 years, and retirement.
            </p>
            <p>
              Each message is calibrated to your{' '}
              <span className="text-[#22d3ee]">financial readiness</span>,{' '}
              <span className="text-[#34d399]">emotional clarity</span>, and{' '}
              <span className="text-[#facc15]">timing alignment</span>{' '}
              scores. The goal is not prediction but perspective: helping you see
              today&apos;s decision through the lens of tomorrow&apos;s wisdom.
            </p>
            <p>
              Whether your verdict is{' '}
              <span className="text-[#34d399] font-medium">Ready</span>,{' '}
              <span className="text-[#facc15] font-medium">Almost There</span>,{' '}
              <span className="text-[#fb923c] font-medium">Build First</span>,
              or{' '}
              <span className="text-[#ef4444] font-medium">Not Yet</span>{' '}
              &mdash; your future self has gratitude for the awareness you have
              right now.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
