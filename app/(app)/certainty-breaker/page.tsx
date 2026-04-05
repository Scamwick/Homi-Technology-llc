'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui';
import { BrandedName } from '@/components/brand/BrandedName';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Certainty Breaker
 *
 * Challenges over-confidence in financial decisions. When users are
 * too certain (all sliders maxed, rushing through assessment), this
 * feature presents counter-perspectives and calibration tools.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const USER_CONFIDENCE = 95;
const HOMI_ASSESSMENT = 73;
const GAP = USER_CONFIDENCE - HOMI_ASSESSMENT;

const SKEPTIC_QUESTIONS = [
  {
    id: 'regret',
    question:
      'Have you talked to someone who regretted this exact decision?',
    placeholder:
      'Think about someone you know, or a story you\'ve read. What happened to them?',
  },
  {
    id: 'blind-spot',
    question:
      'What\'s the ONE thing that could go wrong that you haven\'t considered?',
    placeholder:
      'Look past the obvious risks. What\'s hiding in your blind spot?',
  },
  {
    id: 'income-drop',
    question:
      'If your income dropped 30% tomorrow, would you still feel ready?',
    placeholder:
      'Imagine the scenario concretely. What would change?',
  },
  {
    id: 'want-vs-sustain',
    question:
      'Are you deciding based on what you want, or what you can sustain?',
    placeholder:
      'Desire and sustainability aren\'t enemies, but they\'re not the same thing.',
  },
  {
    id: 'best-friend',
    question:
      'What would you tell your best friend if they were in your position?',
    placeholder:
      'We give better advice to others than ourselves. What would you say?',
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Horizontal bar used in the confidence calibration chart */
function ConfidenceBar({
  label,
  value,
  color,
  delay,
}: {
  label: string;
  value: number;
  color: string;
  delay: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-[#94a3b8]">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>
          {value}%
        </span>
      </div>
      <div className="w-full h-3 rounded-full bg-[rgba(148,163,184,0.15)] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

/** Expandable skeptic question with reflection textarea */
function SkepticQuestion({
  id,
  question,
  placeholder,
  index,
}: {
  id: string;
  question: string;
  placeholder: string;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState('');

  const toggle = useCallback(() => setExpanded((prev) => !prev), []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 * index }}
      className="border-l-2 pl-4"
      style={{
        borderColor: expanded
          ? '#34d399'
          : 'rgba(148, 163, 184, 0.3)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[#e2e8f0] text-sm leading-relaxed flex-1">
          <span
            className="inline-block w-5 h-5 rounded-full text-[10px] font-bold text-center leading-5 mr-2 shrink-0"
            style={{
              backgroundColor: 'rgba(250, 204, 21, 0.2)',
              color: '#facc15',
            }}
          >
            {index + 1}
          </span>
          {question}
        </p>
        <button
          onClick={toggle}
          className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
          style={{
            color: expanded ? '#0a1628' : '#34d399',
            backgroundColor: expanded
              ? '#34d399'
              : 'rgba(52, 211, 153, 0.15)',
          }}
        >
          {expanded ? 'Close' : 'Reflect'}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            key={`journal-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder}
              rows={3}
              className="mt-3 w-full rounded-lg px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#64748b] resize-none focus:outline-none focus:ring-2 focus:ring-[#34d399]/40"
              style={{
                backgroundColor: 'rgba(10, 22, 40, 0.6)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
              }}
            />
            {text.length > 0 && (
              <p className="mt-1 text-xs text-[#34d399]">
                Reflection saved locally. No one else can see this.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function CertaintyBreakerPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" role="img" aria-label="lightning">
            &#x26A1;
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-[#e2e8f0]">
            Certainty Breaker
          </h1>
        </div>
        <p className="text-[#94a3b8] text-base md:text-lg">
          Confidence is good. Unchecked confidence is risky.{' '}
          <BrandedName className="font-semibold" /> helps you stress-test
          your assumptions.
        </p>
      </motion.div>

      {/* ── Section 1: What if you're wrong? ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-5">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
              }}
            >
              ?
            </span>
            <h2 className="text-lg font-semibold text-[#e2e8f0]">
              What if you&apos;re wrong?
            </h2>
          </div>

          {/* Assumption */}
          <div
            className="rounded-lg px-4 py-3 mb-4"
            style={{
              backgroundColor: 'rgba(250, 204, 21, 0.08)',
              border: '1px solid rgba(250, 204, 21, 0.25)',
            }}
          >
            <p className="text-xs text-[#94a3b8] mb-1 uppercase tracking-wider font-medium">
              Your strongest assumption
            </p>
            <p className="text-[#facc15] font-semibold text-base">
              &quot;I can definitely afford this.&quot;
            </p>
          </div>

          {/* Counter-perspective */}
          <div
            className="rounded-lg px-4 py-3 mb-4"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            <p className="text-xs text-[#94a3b8] mb-1 uppercase tracking-wider font-medium">
              Counter-perspective
            </p>
            <p className="text-[#e2e8f0] text-sm leading-relaxed">
              <span className="text-[#ef4444] font-semibold">73%</span> of
              people who felt this confident encountered unexpected costs within
              the first year. Confidence doesn&apos;t account for what you
              can&apos;t see yet.
            </p>
          </div>

          {/* Alternative framing */}
          <div
            className="rounded-lg px-4 py-3"
            style={{
              backgroundColor: 'rgba(34, 211, 238, 0.08)',
              border: '1px solid rgba(34, 211, 238, 0.2)',
            }}
          >
            <p className="text-xs text-[#94a3b8] mb-1 uppercase tracking-wider font-medium">
              Alternative framing
            </p>
            <p className="text-[#e2e8f0] text-sm leading-relaxed">
              What would change if the cost was{' '}
              <span className="text-[#22d3ee] font-semibold">20% higher</span>?
              Would you still feel the same certainty, or would your plan need
              adjustments?
            </p>
          </div>
        </Card>
      </motion.div>

      {/* ── Section 2: The Skeptic's Challenge ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                backgroundColor: 'rgba(52, 211, 153, 0.15)',
                color: '#34d399',
              }}
            >
              5
            </span>
            <h2 className="text-lg font-semibold text-[#e2e8f0]">
              The Skeptic&apos;s Challenge
            </h2>
          </div>
          <p className="text-[#94a3b8] text-sm mb-6">
            Five provocative questions to stress-test your certainty. Tap{' '}
            <span className="text-[#34d399] font-medium">Reflect</span> to
            journal your honest answer.
          </p>

          <div className="space-y-5">
            {SKEPTIC_QUESTIONS.map((q, i) => (
              <SkepticQuestion
                key={q.id}
                id={q.id}
                question={q.question}
                placeholder={q.placeholder}
                index={i}
              />
            ))}
          </div>
        </Card>
      </motion.div>

      {/* ── Section 3: Confidence Calibration ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
      >
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-5">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{
                backgroundColor: 'rgba(34, 211, 238, 0.15)',
                color: '#22d3ee',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </span>
            <h2 className="text-lg font-semibold text-[#e2e8f0]">
              Confidence Calibration
            </h2>
          </div>

          {/* Bar chart */}
          <div className="space-y-4 mb-6">
            <ConfidenceBar
              label="You said"
              value={USER_CONFIDENCE}
              color="#facc15"
              delay={0.2}
            />
            <ConfidenceBar
              label={`H\u014DMI says`}
              value={HOMI_ASSESSMENT}
              color="#22d3ee"
              delay={0.4}
            />
          </div>

          {/* Gap analysis */}
          <div
            className="rounded-lg px-4 py-4"
            style={{
              backgroundColor: 'rgba(250, 204, 21, 0.06)',
              border: '1px solid rgba(250, 204, 21, 0.2)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'rgba(250, 204, 21, 0.2)',
                  color: '#facc15',
                }}
              >
                {GAP}-point gap
              </span>
              <span className="text-xs text-[#94a3b8]">
                Confidence vs. Data
              </span>
            </div>
            <p className="text-[#e2e8f0] text-sm leading-relaxed mb-3">
              The {GAP}-point gap suggests you may be more optimistic than your
              data supports. This is not uncommon &mdash; optimism bias affects
              most financial decisions.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#34d399' }}>
              Your optimism is a strength. Let&apos;s make sure it&apos;s
              grounded in what the numbers actually show. A gap this size usually
              means there are 1&ndash;2 factors you&apos;re underweighting.
            </p>
          </div>

          {/* Positive framing */}
          <div className="mt-4 flex items-start gap-3">
            <span
              className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs mt-0.5"
              style={{
                backgroundColor: 'rgba(52, 211, 153, 0.15)',
                color: '#34d399',
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
              This is{' '}
              <span className="text-[#e2e8f0] font-medium">not criticism</span>
              . High confidence paired with honest calibration is the foundation
              of every great financial decision. You&apos;re already doing the
              hard part by being here.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
