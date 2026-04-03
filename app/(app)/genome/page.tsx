'use client';

import { motion } from 'framer-motion';
import { Brain, ShieldCheck, Eye, Fingerprint } from 'lucide-react';
import { BrandedName } from '@/components/brand';
import { Card } from '@/components/ui';
import { BehavioralGenome } from '@/components/genome';
import {
  generateMockProfile,
  getFrictionAdjustments,
  type FrictionAdjustment,
} from '@/lib/behavioral-genome';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Genome Page — Full behavioral genome visualization and explanation
 *
 * Displays:
 * - 9-dimension behavioral genome visualization
 * - "How it works" — trust inversion principle
 * - Active friction adjustments
 * - Privacy assurance
 *
 * Uses mock data since behavioral tracking is not yet wired.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_PROFILE = generateMockProfile();
const MOCK_ADJUSTMENTS = getFrictionAdjustments(MOCK_PROFILE);

// ---------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeInOut' as const },
  },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const FRICTION_TYPE_LABELS: Record<string, string> = {
  confirmation: 'Confirmation',
  emphasis: 'Emphasis',
  framing: 'Framing',
  pacing: 'Pacing',
  anchoring: 'Anchoring',
};

function FrictionCard({ adjustment }: { adjustment: FrictionAdjustment }) {
  const intensityPercent = Math.round(adjustment.intensity * 100);

  return (
    <div
      className="p-4 rounded-lg"
      style={{
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(34, 211, 238, 0.1)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{
            color: '#22d3ee',
            background: 'rgba(34, 211, 238, 0.1)',
          }}
        >
          {FRICTION_TYPE_LABELS[adjustment.type] ?? adjustment.type}
        </span>
        <span
          className="text-xs tabular-nums"
          style={{ color: 'rgba(148, 163, 184, 0.6)' }}
        >
          {intensityPercent}% intensity
        </span>
      </div>
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--text-primary, #e2e8f0)' }}
      >
        {adjustment.description}
      </p>
      <p
        className="text-xs mt-1.5"
        style={{ color: 'rgba(148, 163, 184, 0.5)' }}
      >
        Triggered by:{' '}
        <span style={{ color: 'var(--text-secondary, #94a3b8)' }}>
          {adjustment.triggeredBy.replace(/_/g, ' ')}
        </span>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function GenomePage() {
  return (
    <motion.div
      className="mx-auto w-full max-w-4xl space-y-8"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* ── Page header ── */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-3 mb-1">
          <Fingerprint
            size={28}
            style={{ color: '#22d3ee' }}
          />
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--text-primary, #e2e8f0)' }}
          >
            Your Behavioral Genome
          </h1>
        </div>
        <p
          className="text-sm ml-[40px]"
          style={{ color: 'var(--text-secondary, #94a3b8)' }}
        >
          How <BrandedName className="font-semibold" /> personalizes your
          experience based on your decision-making patterns
        </p>
      </motion.div>

      {/* ── Genome Visualization ── */}
      <motion.div variants={fadeUp}>
        <BehavioralGenome profile={MOCK_PROFILE} />
      </motion.div>

      {/* ── How It Works ── */}
      <motion.div variants={fadeUp}>
        <Card padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Brain size={18} style={{ color: '#34d399' }} />
            <h2
              className="text-base font-semibold"
              style={{ color: 'var(--text-primary, #e2e8f0)' }}
            >
              How It Works
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3
                className="text-sm font-medium mb-1"
                style={{ color: '#22d3ee' }}
              >
                Trust Inversion
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary, #94a3b8)' }}
              >
                Traditional surveys ask you what kind of decision-maker you are.
                People are notoriously poor at self-assessment.{' '}
                <BrandedName className="font-medium" /> uses{' '}
                <span style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                  trust inversion
                </span>{' '}
                — we observe what you actually do, not what you say. How long you
                linger on worst-case scenarios. Whether you revise inputs. Which
                sections you skip.
              </p>
            </div>

            <div>
              <h3
                className="text-sm font-medium mb-1"
                style={{ color: '#34d399' }}
              >
                Friction, Not Verdicts
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary, #94a3b8)' }}
              >
                Your genome{' '}
                <span
                  className="font-medium"
                  style={{ color: 'var(--text-primary, #e2e8f0)' }}
                >
                  never changes your scores or verdicts
                </span>
                . Those are deterministic, based purely on your inputs. Instead,
                your genome adjusts{' '}
                <span style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                  how we present information
                </span>{' '}
                — adding confirmation steps if you are loss-averse, leading with
                stories if you are narrative-driven, or slowing down reveals if
                uncertainty makes you anxious.
              </p>
            </div>

            <div>
              <h3
                className="text-sm font-medium mb-1"
                style={{ color: '#facc15' }}
              >
                Growing Confidence
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary, #94a3b8)' }}
              >
                Each dimension has a confidence score that increases as{' '}
                <BrandedName className="font-medium" /> observes more of your
                behavior. Early on, the genome is mostly neutral. Over time,
                it becomes a precise model of your decision-making style —
                your cognitive fingerprint.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Active Friction Adjustments ── */}
      {MOCK_ADJUSTMENTS.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card padding="md">
            <div className="flex items-center gap-2 mb-4">
              <Eye size={18} style={{ color: '#22d3ee' }} />
              <h2
                className="text-base font-semibold"
                style={{ color: 'var(--text-primary, #e2e8f0)' }}
              >
                Active UX Adjustments
              </h2>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  color: '#22d3ee',
                  background: 'rgba(34, 211, 238, 0.1)',
                }}
              >
                {MOCK_ADJUSTMENTS.length}
              </span>
            </div>
            <p
              className="text-xs mb-4"
              style={{ color: 'var(--text-secondary, #94a3b8)' }}
            >
              Based on your genome, these presentation adjustments are currently
              active. They affect how you see information, never what the
              information is.
            </p>
            <div className="space-y-3">
              {MOCK_ADJUSTMENTS.map((adj) => (
                <FrictionCard key={adj.id} adjustment={adj} />
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── Privacy ── */}
      <motion.div variants={fadeUp}>
        <Card padding="md">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={18} style={{ color: '#34d399' }} />
            <h2
              className="text-base font-semibold"
              style={{ color: 'var(--text-primary, #e2e8f0)' }}
            >
              Privacy
            </h2>
          </div>
          <ul className="space-y-2.5">
            {[
              'Your genome data is never shared with third parties.',
              'Behavioral signals are processed locally and never leave your session.',
              'You can reset your genome at any time from Settings.',
              'Your genome is never used to influence the score or verdict itself — only how it is presented to you.',
              'We do not sell behavioral data. Ever.',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span
                  className="mt-1.5 size-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: '#34d399' }}
                />
                <span
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary, #94a3b8)' }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </motion.div>
    </motion.div>
  );
}
