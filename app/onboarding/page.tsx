'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { ThresholdCompass } from '@/components/brand/ThresholdCompass';
import { BrandedName } from '@/components/brand/BrandedName';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * OnboardingPage — 6-screen first-time experience.
 *
 * Full-screen layout with NO sidebar or topbar. Progress dots at the bottom.
 * Each screen slides in/out via framer-motion AnimatePresence.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const TOTAL_SCREENS = 6;

/* ── Decision type options ── */
const DECISION_TYPES = [
  { id: 'home',       label: 'Home Purchase',   emoji: '\u{1F3E0}', color: '#22d3ee' },
  { id: 'car',        label: 'Car Purchase',    emoji: '\u{1F697}', color: '#22d3ee' },
  { id: 'career',     label: 'Career Change',   emoji: '\u{1F4BC}', color: '#34d399' },
  { id: 'business',   label: 'Business Launch',  emoji: '\u{1F680}', color: '#34d399' },
  { id: 'investment', label: 'Investment',        emoji: '\u{1F4C8}', color: '#facc15' },
  { id: 'education',  label: 'Education',         emoji: '\u{1F393}', color: '#facc15' },
  { id: 'retirement', label: 'Retirement',        emoji: '\u{1F305}', color: '#fb923c' },
  { id: 'other',      label: 'Other',             emoji: '\u2728',    color: '#64748b' },
] as const;

/* ── Three dimensions data ── */
const DIMENSIONS = [
  {
    title: 'Financial Reality',
    color: '#22d3ee',
    weight: '35%',
    description:
      'Hard numbers. No fudging. Your income, debt, savings, and true risk capacity — measured against what this decision actually costs.',
    bullets: [
      'Debt-to-income ratio and monthly cash flow',
      'Emergency fund coverage and savings rate',
      'Risk capacity relative to decision magnitude',
    ],
  },
  {
    title: 'Emotional Truth',
    color: '#34d399',
    weight: '35%',
    description:
      'The part everyone ignores. Your stress levels, confidence alignment, and whether the people in your life are truly on board.',
    bullets: [
      'Decision-related stress and anxiety levels',
      'Confidence alignment with past patterns',
      'Relationship and support system readiness',
    ],
  },
  {
    title: 'Perfect Timing',
    color: '#facc15',
    weight: '30%',
    description:
      'Context matters. Market conditions, your life stage, and whether the window of opportunity is actually open right now.',
    bullets: [
      'Market and economic condition signals',
      'Life stage appropriateness and stability',
      'Opportunity window and urgency assessment',
    ],
  },
] as const;

/* ── Slide animation variants ── */
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

const slideTransition = {
  x: { type: 'spring' as const, stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 },
};

/* ── Stagger children ── */
const staggerContainer = {
  center: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const staggerItem = {
  enter: { opacity: 0, y: 24 },
  center: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function OnboardingPage() {
  const router = useRouter();
  const [screen, setScreen] = useState(0);
  const [direction, setDirection] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  /* Track which screens have been visited for progress dots */
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));

  /* Fetch user name from Supabase session */
  const [userName, setUserName] = useState<string | null>(null);
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      queueMicrotask(() => setUserName('Explorer'));
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      const name =
        data.session?.user?.user_metadata?.full_name ||
        data.session?.user?.email?.split('@')[0] ||
        'Explorer';
      setUserName(name);
    });
  }, []);

  const goTo = useCallback(
    (target: number) => {
      setDirection(target > screen ? 1 : -1);
      setScreen(target);
      setVisited((prev) => new Set(prev).add(target));
    },
    [screen],
  );

  const goNext = useCallback(() => {
    /* Screen 4 (Compass Reveal, index 4) -> if no decision type selected, skip screen 5 */
    if (screen === 4 && !selectedType) {
      /* Skip screen 5 — go to assessment */
      router.push('/assess/new');
      return;
    }
    if (screen < TOTAL_SCREENS - 1) {
      goTo(screen + 1);
    }
  }, [screen, selectedType, goTo, router]);

  const goBack = useCallback(() => {
    if (screen > 0) {
      goTo(screen - 1);
    }
  }, [screen, goTo]);

  const skipToDashboard = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  const goToAssessment = useCallback(() => {
    router.push('/assess/new');
  }, [router]);

  /* Determine effective total screens: if no decision type, screen 5 is hidden */
  const effectiveTotal = selectedType ? TOTAL_SCREENS : TOTAL_SCREENS - 1;

  return (
    <div
      className="relative flex min-h-screen flex-col"
      style={{ backgroundColor: '#0a1628' }}
    >
      {/* ── Subtle radial gradient background ── */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 60% 50% at 20% 30%, rgba(34,211,238,0.04) 0%, transparent 70%)',
            'radial-gradient(ellipse 50% 60% at 80% 70%, rgba(52,211,153,0.03) 0%, transparent 70%)',
            'radial-gradient(ellipse 40% 40% at 50% 50%, rgba(250,204,21,0.02) 0%, transparent 70%)',
          ].join(', '),
        }}
      />

      {/* ── Main content area ── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait" custom={direction}>
          {/* ════════════════════════════════════════════════════════════════
             SCREEN 1: Welcome
             ════════════════════════════════════════════════════════════════ */}
          {screen === 0 && (
            <motion.div
              key="welcome"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="flex w-full max-w-lg flex-col items-center text-center"
            >
              <ThresholdCompass size={200} animate showKeyhole />

              <h1 className="mt-10 text-3xl font-bold" style={{ color: '#e2e8f0' }}>
                Welcome to <BrandedName className="font-bold" />
                {userName ? `, ${userName}` : ''}.
              </h1>

              <p
                className="mt-6 max-w-md text-base leading-relaxed"
                style={{ color: '#94a3b8' }}
              >
                You&apos;re about to discover something most platforms
                will never tell you: whether you&apos;re actually ready.
              </p>

              <p
                className="mt-3 text-sm opacity-70"
                style={{ color: '#94a3b8' }}
              >
                It takes about 12 minutes. No judgment. Just truth.
              </p>

              <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
                <Button
                  variant="cta"
                  size="lg"
                  fullWidth
                  onClick={goNext}
                  style={{ backgroundColor: '#34d399', color: '#0a1628' }}
                >
                  Let&apos;s Begin
                </Button>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
             SCREEN 2: Decision Type
             ════════════════════════════════════════════════════════════════ */}
          {screen === 1 && (
            <motion.div
              key="decision-type"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="flex w-full max-w-2xl flex-col items-center text-center"
            >
              <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>
                What decision are you evaluating?
              </h1>

              <div className="mt-8 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
                {DECISION_TYPES.map((type) => {
                  const isSelected = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className="group relative flex flex-col items-center gap-2 rounded-[var(--radius-lg)] p-5 transition-all duration-200 cursor-pointer"
                      style={{
                        background: isSelected
                          ? 'rgba(30, 41, 59, 0.95)'
                          : 'rgba(30, 41, 59, 0.5)',
                        backdropFilter: 'blur(10px)',
                        border: isSelected
                          ? `2px solid ${type.color}`
                          : '2px solid rgba(51, 65, 85, 0.5)',
                        boxShadow: isSelected
                          ? `0 0 20px ${type.color}20`
                          : 'none',
                      }}
                    >
                      {/* Checkmark for selected state */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full"
                          style={{ backgroundColor: type.color }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M2.5 6L5 8.5L9.5 3.5"
                              stroke="#0a1628"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </motion.div>
                      )}

                      <span className="text-3xl">{type.emoji}</span>
                      <span
                        className="text-xs font-medium"
                        style={{
                          color: isSelected ? type.color : '#94a3b8',
                        }}
                      >
                        {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
                <Button
                  variant="cta"
                  size="lg"
                  fullWidth
                  onClick={goNext}
                  disabled={!selectedType}
                  style={
                    selectedType
                      ? { backgroundColor: '#34d399', color: '#0a1628' }
                      : undefined
                  }
                >
                  Continue
                </Button>
                <Button variant="ghost" size="md" fullWidth onClick={goBack}>
                  Back
                </Button>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
             SCREEN 3: Three Dimensions (THE SHOWCASE)
             ════════════════════════════════════════════════════════════════ */}
          {screen === 2 && (
            <motion.div
              key="dimensions"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="flex w-full max-w-2xl flex-col items-center text-center"
            >
              <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>
                <BrandedName className="font-bold" /> measures readiness across
                three dimensions.
              </h1>

              <motion.div
                className="mt-8 flex w-full flex-col gap-5"
                variants={staggerContainer}
                initial="enter"
                animate="center"
              >
                {DIMENSIONS.map((dim) => (
                  <motion.div key={dim.title} variants={staggerItem}>
                    <Card
                      padding="md"
                      className="relative overflow-hidden text-left"
                      style={{
                        borderLeft: `4px solid ${dim.color}`,
                        border: `1px solid rgba(34, 211, 238, 0.2)`,
                        borderLeftWidth: '4px',
                        borderLeftColor: dim.color,
                      }}
                    >
                      {/* Watermark weight */}
                      <div
                        className="pointer-events-none absolute right-4 top-2 select-none font-bold"
                        style={{
                          fontSize: '4rem',
                          lineHeight: 1,
                          color: dim.color,
                          opacity: 0.1,
                        }}
                      >
                        {dim.weight}
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center justify-between">
                          <h3
                            className="text-base font-semibold"
                            style={{ color: dim.color }}
                          >
                            {dim.title}
                          </h3>
                          <span
                            className="text-xs font-medium"
                            style={{ color: '#94a3b8' }}
                          >
                            {dim.weight} weight
                          </span>
                        </div>
                        <p
                          className="mt-2 text-sm leading-relaxed"
                          style={{ color: '#94a3b8' }}
                        >
                          {dim.description}
                        </p>
                        <ul className="mt-3 space-y-1.5">
                          {dim.bullets.map((bullet, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-xs"
                              style={{ color: '#94a3b8' }}
                            >
                              <span
                                className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                                style={{ backgroundColor: dim.color }}
                              />
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              <p className="mt-6 text-sm" style={{ color: '#94a3b8' }}>
                All three must align for a{' '}
                <span className="font-semibold" style={{ color: '#34d399' }}>
                  READY
                </span>{' '}
                verdict.
              </p>

              <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
                <Button
                  variant="cta"
                  size="lg"
                  fullWidth
                  onClick={goNext}
                  style={{ backgroundColor: '#34d399', color: '#0a1628' }}
                >
                  I Understand
                </Button>
                <Button variant="ghost" size="md" fullWidth onClick={goBack}>
                  Back
                </Button>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
             SCREEN 4: The ~70% Insight
             ════════════════════════════════════════════════════════════════ */}
          {screen === 3 && (
            <motion.div
              key="insight"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="flex w-full max-w-lg flex-col items-center text-center"
            >
              {/* Large gradient stat */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' as const }}
                className="text-7xl font-bold sm:text-8xl"
                style={{
                  background: 'linear-gradient(135deg, #22d3ee, #34d399)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 1.1,
                }}
              >
                ~70%
              </motion.div>

              <p
                className="mt-4 text-lg font-medium"
                style={{ color: '#e2e8f0' }}
              >
                of users receive a <span className="font-bold">NOT YET</span>{' '}
                verdict
              </p>

              {/* Explanation box */}
              <div
                className="mt-8 w-full rounded-[var(--radius-lg)] p-6 text-left"
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  borderLeft: '4px solid #34d399',
                  border: '1px solid rgba(34, 211, 238, 0.15)',
                  borderLeftWidth: '4px',
                  borderLeftColor: '#34d399',
                }}
              >
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: '#94a3b8' }}
                >
                  This isn&apos;t a flaw — it&apos;s the feature.{' '}
                  <BrandedName className="font-semibold" /> exists to tell you
                  the truth, even when the truth is &ldquo;not yet.&rdquo;
                  We&apos;re the only platform aligned with what&apos;s
                  actually right for your life.
                </p>
              </div>

              <p
                className="mt-6 text-sm italic"
                style={{ color: '#94a3b8' }}
              >
                Your homie, not your banker.
              </p>

              <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
                <Button
                  variant="cta"
                  size="lg"
                  fullWidth
                  onClick={goNext}
                  style={{ backgroundColor: '#34d399', color: '#0a1628' }}
                >
                  Got It
                </Button>
                <Button variant="ghost" size="md" fullWidth onClick={goBack}>
                  Back
                </Button>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
             SCREEN 5: Compass Reveal
             ════════════════════════════════════════════════════════════════ */}
          {screen === 4 && (
            <motion.div
              key="compass-reveal"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="flex w-full max-w-lg flex-col items-center text-center"
            >
              {/* Large compass with low-opacity ring overlay */}
              <div className="relative">
                <ThresholdCompass
                  size={280}
                  animate
                  showKeyhole
                  className="opacity-100"
                />
                {/* Overlay ring glow at 15% opacity */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <ThresholdCompass
                    size={280}
                    animate
                    showKeyhole={false}
                    className="opacity-[0.15]"
                  />
                </div>
              </div>

              <h1
                className="mt-8 text-2xl font-bold"
                style={{ color: '#e2e8f0' }}
              >
                Your readiness compass is empty.
              </h1>

              <p className="mt-3 text-base" style={{ color: '#94a3b8' }}>
                Let&apos;s fill it in.
              </p>

              <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
                {/* Pulse animation on the CTA */}
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(52, 211, 153, 0)',
                      '0 0 0 8px rgba(52, 211, 153, 0.15)',
                      '0 0 0 0 rgba(52, 211, 153, 0)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut' as const,
                  }}
                  className="rounded-[var(--radius-md)]"
                >
                  <Button
                    variant="cta"
                    size="lg"
                    fullWidth
                    onClick={
                      selectedType ? goNext : goToAssessment
                    }
                    style={{ backgroundColor: '#34d399', color: '#0a1628' }}
                  >
                    Take My First Assessment
                  </Button>
                </motion.div>

                <Button
                  variant="ghost"
                  size="md"
                  fullWidth
                  onClick={skipToDashboard}
                >
                  Explore Dashboard First
                </Button>

                <Button variant="ghost" size="md" fullWidth onClick={goBack}>
                  Back
                </Button>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
             SCREEN 6: Assessment Prep (only if decision type selected)
             ════════════════════════════════════════════════════════════════ */}
          {screen === 5 && selectedType && (
            <motion.div
              key="assessment-prep"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="flex w-full max-w-lg flex-col items-center text-center"
            >
              {/* Small compass accent */}
              <ThresholdCompass size={80} animate showKeyhole={false} />

              <h1
                className="mt-8 text-2xl font-bold"
                style={{ color: '#e2e8f0' }}
              >
                Here&apos;s what to expect
              </h1>

              <div className="mt-6 space-y-4 text-left">
                <p
                  className="text-base leading-relaxed"
                  style={{ color: '#94a3b8' }}
                >
                  You&apos;ll answer questions about your finances, emotions,
                  and timing.
                </p>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: '#94a3b8' }}
                >
                  There are no wrong answers. Only honest ones.
                </p>

                {/* Dimension preview pills */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {DIMENSIONS.map((dim) => (
                    <span
                      key={dim.title}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: `${dim.color}15`,
                        color: dim.color,
                        border: `1px solid ${dim.color}30`,
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: dim.color }}
                      />
                      {dim.title}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
                <Button
                  variant="cta"
                  size="lg"
                  fullWidth
                  onClick={goToAssessment}
                  style={{ backgroundColor: '#34d399', color: '#0a1628' }}
                >
                  Begin Assessment &rarr;
                </Button>

                <Button
                  variant="ghost"
                  size="md"
                  fullWidth
                  onClick={skipToDashboard}
                >
                  Explore Dashboard First
                </Button>

                <Button variant="ghost" size="md" fullWidth onClick={goBack}>
                  Back
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Progress dots + skip link ── */}
      <div className="relative z-10 flex flex-col items-center gap-4 pb-10">
        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: effectiveTotal }).map((_, i) => {
            const isCurrent = i === screen;
            const isCompleted = !isCurrent && visited.has(i);
            return (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  /* Active = cyan pill, completed = emerald dot, future = slate dot */
                  width: isCurrent ? '24px' : '8px',
                  height: '8px',
                  backgroundColor: isCurrent
                    ? '#22d3ee'
                    : isCompleted
                      ? '#34d399'
                      : 'rgba(100, 116, 139, 0.5)',
                }}
              />
            );
          })}
        </div>

        {/* Skip link — always visible */}
        <button
          type="button"
          onClick={skipToDashboard}
          className="text-xs transition-opacity hover:opacity-100 cursor-pointer"
          style={{ color: '#94a3b8', opacity: 0.6 }}
        >
          Skip to Dashboard
        </button>
      </div>
    </div>
  );
}
