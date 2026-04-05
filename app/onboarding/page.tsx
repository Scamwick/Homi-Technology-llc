'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { ThresholdCompass } from '@/components/brand/ThresholdCompass';
import { BrandedName } from '@/components/brand/BrandedName';
import { Button } from '@/components/ui/Button';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * OnboardingPage — 4-screen first-time experience.
 *
 * Full-screen layout with NO sidebar or topbar. Progress dots at the bottom.
 * Each screen slides in/out via framer-motion AnimatePresence.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const TOTAL_SCREENS = 4;

/* ── Decision type options ── */
const DECISION_TYPES = [
  { id: 'home',       label: 'Home Purchase',  emoji: '\u{1F3E0}', borderColor: '#22d3ee' },
  { id: 'car',        label: 'Car Purchase',   emoji: '\u{1F697}', borderColor: '#22d3ee' },
  { id: 'career',     label: 'Career Change',  emoji: '\u{1F4BC}', borderColor: '#34d399' },
  { id: 'business',   label: 'Business Launch', emoji: '\u{1F680}', borderColor: '#34d399' },
  { id: 'investment', label: 'Investment',      emoji: '\u{1F4C8}', borderColor: '#facc15' },
  { id: 'education',  label: 'Education',       emoji: '\u{1F393}', borderColor: '#facc15' },
  { id: 'retirement', label: 'Retirement',      emoji: '\u{1F305}', borderColor: '#f59e0b' },
  { id: 'other',      label: 'Other',           emoji: '\u2728',    borderColor: '#64748b' },
] as const;

/* ── Three dimensions data ── */
const DIMENSIONS = [
  {
    title: 'Financial Reality',
    borderColor: '#22d3ee',
    weight: '35%',
    description: 'Income, debt, savings, and risk capacity.',
  },
  {
    title: 'Emotional Truth',
    borderColor: '#34d399',
    weight: '35%',
    description: 'Stress levels, confidence, and relationship alignment.',
  },
  {
    title: 'Perfect Timing',
    borderColor: '#facc15',
    weight: '30%',
    description: 'Market conditions, life stage, and opportunity windows.',
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
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function OnboardingPage() {
  const router = useRouter();
  const [screen, setScreen] = useState(0);
  const [direction, setDirection] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  /* Fetch user name from Supabase session */
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setUserName('Explorer');
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

  const goNext = useCallback(() => {
    if (screen < TOTAL_SCREENS - 1) {
      setDirection(1);
      setScreen((s) => s + 1);
    }
  }, [screen]);

  const goBack = useCallback(() => {
    if (screen > 0) {
      setDirection(-1);
      setScreen((s) => s - 1);
    }
  }, [screen]);

  const completeOnboarding = useCallback(async () => {
    try {
      const supabase = createClient();
      if (supabase) {
        await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('id', (await supabase.auth.getUser()).data.user?.id ?? '');
      }
    } catch (err) {
      console.error('[Onboarding] Failed to mark complete:', err);
    }
  }, []);

  const skipToDashboard = useCallback(async () => {
    await completeOnboarding();
    router.push('/dashboard');
  }, [router, completeOnboarding]);

  const goToAssessment = useCallback(async () => {
    await completeOnboarding();
    router.push('/assess/new');
  }, [router, completeOnboarding]);

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

              <h1 className="mt-10 text-3xl font-bold text-[var(--text-primary)]">
                Welcome to <BrandedName className="font-bold" />
                {userName ? `, ${userName}` : ''}.
              </h1>

              <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--text-secondary)]">
                You&apos;re about to discover something most platforms
                will never tell you: whether you&apos;re actually ready.
              </p>

              <p className="mt-3 text-sm text-[var(--text-secondary)] opacity-70">
                It takes 12 minutes. No judgment. Just truth.
              </p>

              <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
                <Button
                  variant="cta"
                  size="lg"
                  fullWidth
                  onClick={goNext}
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
              className="flex w-full max-w-lg flex-col items-center text-center"
            >
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                What decision are you evaluating?
              </h1>

              <div className="mt-8 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
                {DECISION_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className="group flex flex-col items-center gap-2 rounded-[var(--radius-lg)] p-4 transition-all duration-200 cursor-pointer"
                    style={{
                      background:
                        selectedType === type.id
                          ? 'rgba(30, 41, 59, 0.95)'
                          : 'rgba(30, 41, 59, 0.5)',
                      border:
                        selectedType === type.id
                          ? `2px solid ${type.borderColor}`
                          : '2px solid rgba(51, 65, 85, 0.5)',
                    }}
                  >
                    <span className="text-2xl">{type.emoji}</span>
                    <span
                      className="text-xs font-medium"
                      style={{
                        color:
                          selectedType === type.id
                            ? type.borderColor
                            : 'var(--text-secondary)',
                      }}
                    >
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
                <Button
                  variant="cta"
                  size="lg"
                  fullWidth
                  onClick={goNext}
                  disabled={!selectedType}
                >
                  Continue
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  fullWidth
                  onClick={goBack}
                >
                  Back
                </Button>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
             SCREEN 3: Three Dimensions
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
              className="flex w-full max-w-lg flex-col items-center text-center"
            >
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                <BrandedName className="font-bold" /> measures readiness
                across three dimensions.
              </h1>

              <motion.div
                className="mt-8 flex w-full flex-col gap-4"
                variants={staggerContainer}
                initial="enter"
                animate="center"
              >
                {DIMENSIONS.map((dim) => (
                  <motion.div
                    key={dim.title}
                    variants={staggerItem}
                    className="flex items-start gap-4 rounded-[var(--radius-lg)] p-5 text-left"
                    style={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      borderLeft: `4px solid ${dim.borderColor}`,
                      border: '1px solid rgba(51, 65, 85, 0.5)',
                      borderLeftWidth: '4px',
                      borderLeftColor: dim.borderColor,
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3
                          className="text-sm font-semibold"
                          style={{ color: dim.borderColor }}
                        >
                          {dim.title}
                        </h3>
                        <span className="text-xs text-[var(--text-secondary)]">
                          {dim.weight}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        {dim.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <p className="mt-6 text-sm text-[var(--text-secondary)]">
                All three must align for a{' '}
                <span className="font-semibold text-[var(--emerald)]">
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
                >
                  I Understand
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  fullWidth
                  onClick={goBack}
                >
                  Back
                </Button>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
             SCREEN 4: Ready
             ════════════════════════════════════════════════════════════════ */}
          {screen === 3 && (
            <motion.div
              key="ready"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="flex w-full max-w-lg flex-col items-center text-center"
            >
              {/* Large compass with low-opacity rings */}
              <div className="relative">
                <ThresholdCompass
                  size={240}
                  animate
                  showKeyhole
                  className="opacity-100"
                />
                {/* Overlay ring glow at 15% opacity */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <ThresholdCompass
                    size={240}
                    animate
                    showKeyhole={false}
                    className="opacity-[0.15]"
                  />
                </div>
              </div>

              <h1 className="mt-8 text-2xl font-bold text-[var(--text-primary)]">
                Your readiness compass is empty.
              </h1>

              <p className="mt-3 text-base text-[var(--text-secondary)]">
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
                    ease: 'easeInOut',
                  }}
                  className="rounded-[var(--radius-md)]"
                >
                  <Button
                    variant="cta"
                    size="lg"
                    fullWidth
                    onClick={goToAssessment}
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

                <Button
                  variant="ghost"
                  size="md"
                  fullWidth
                  onClick={goBack}
                >
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
          {Array.from({ length: TOTAL_SCREENS }).map((_, i) => (
            <div
              key={i}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === screen ? '24px' : '8px',
                backgroundColor:
                  i === screen ? '#22d3ee' : 'rgba(100, 116, 139, 0.5)',
              }}
            />
          ))}
        </div>

        {/* Skip link — always visible */}
        <button
          type="button"
          onClick={skipToDashboard}
          className="text-xs text-[var(--text-secondary)] opacity-60 transition-opacity hover:opacity-100 cursor-pointer"
        >
          Skip to Dashboard
        </button>
      </div>
    </div>
  );
}
