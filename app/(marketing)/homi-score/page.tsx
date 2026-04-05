'use client';

import Link from 'next/link';
import { motion, useInView, type Variants } from 'framer-motion';
import { useRef } from 'react';
import {
  ArrowRight,
  ArrowDown,
  BarChart3,
  Building2,
  Check,
  DollarSign,
  Heart,
  Timer,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { ThresholdCompass, BrandedName } from '@/components/brand';
import { Card } from '@/components/ui';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * HōMI-Score Explainer Page
 * The category-defining page. Positions HōMI-Score as the credit score
 * replacement for decision readiness.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* ── Animation presets ─────────────────────────────────────────────────── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: 'easeInOut' as const },
  }),
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.8, delay: i * 0.1 },
  }),
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1, ease: 'easeInOut' as const },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
} as const;

function useAnimateOnView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  return { ref, isInView };
}

function Section({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className={`relative py-24 lg:py-32 ${className}`}
    >
      {children}
    </motion.section>
  );
}

/* ── Comparison table data ─────────────────────────────────────────────── */

const COMPARISON_ROWS = [
  { label: 'Created', fico: '1989', homi: '2025' },
  { label: 'Scale', fico: '300 - 850', homi: '0 - 100' },
  { label: 'Measures', fico: 'Repayment probability', homi: 'Decision readiness' },
  { label: 'Dimensions', fico: '1 (financial only)', homi: '3 (financial + emotional + timing)' },
  { label: 'Serves', fico: 'Lenders', homi: 'People' },
  { label: 'Revenue model', fico: 'Sold to institutions', homi: 'User subscription' },
  { label: 'Conflict of interest', fico: 'Lenders profit from approval', homi: 'Zero commissions' },
  { label: 'Updates', fico: 'Monthly (delayed)', homi: 'Real-time reassessment' },
  { label: 'Emotional factors', fico: 'None', homi: '35% of total score' },
  { label: 'Timing analysis', fico: 'None', homi: '30% of total score' },
] as const;

/* ── Verdict system data ──────────────────────────────────────────────── */

const VERDICTS = [
  {
    label: 'READY',
    range: '80 - 100',
    emoji: '🔑',
    color: 'var(--emerald)',
    colorRgb: '52, 211, 153',
    bg: 'rgba(52, 211, 153, 0.08)',
    border: 'rgba(52, 211, 153, 0.3)',
    temp: 'Cool',
    description:
      'All three dimensions are aligned. You have the financial capacity, the emotional clarity, and the timing is right. The decision is confirmed.',
  },
  {
    label: 'ALMOST THERE',
    range: '65 - 79',
    emoji: '🔓',
    color: 'var(--yellow)',
    colorRgb: '250, 204, 21',
    bg: 'rgba(250, 204, 21, 0.08)',
    border: 'rgba(250, 204, 21, 0.3)',
    temp: 'Warm',
    description:
      'You are close but one or more dimensions need attention. Your roadmap will show exactly what to strengthen before reassessing.',
  },
  {
    label: 'BUILD FIRST',
    range: '50 - 64',
    emoji: '🔒',
    color: 'var(--homi-amber)',
    colorRgb: '251, 146, 60',
    bg: 'rgba(251, 146, 60, 0.08)',
    border: 'rgba(251, 146, 60, 0.3)',
    temp: 'Warm+',
    description:
      'Meaningful gaps exist in your readiness profile. Acting now would create unnecessary risk. We will show you exactly what to build.',
  },
  {
    label: 'NOT YET',
    range: '0 - 49',
    emoji: '🚫',
    color: 'var(--homi-crimson)',
    colorRgb: '239, 68, 68',
    bg: 'rgba(239, 68, 68, 0.08)',
    border: 'rgba(239, 68, 68, 0.3)',
    temp: 'Hot',
    description:
      'This decision would cause more harm than good right now. That is not failure, it is intelligence. Your roadmap starts here.',
  },
] as const;

/* ── Path to Standard data ────────────────────────────────────────────── */

const PATH_STEPS = [
  {
    phase: 'Phase 1',
    title: 'B2C Adoption',
    icon: Users,
    color: 'var(--cyan)',
    colorRgb: '34, 211, 238',
    description:
      'Individuals use HōMI to assess their own readiness. Build trust through accuracy and outcomes.',
  },
  {
    phase: 'Phase 2',
    title: 'Data Flywheel',
    icon: TrendingUp,
    color: 'var(--emerald)',
    colorRgb: '52, 211, 153',
    description:
      'Aggregate anonymized readiness data creates the largest decision-outcome dataset ever built.',
  },
  {
    phase: 'Phase 3',
    title: 'B2B API',
    icon: Zap,
    color: 'var(--yellow)',
    colorRgb: '250, 204, 21',
    description:
      'Responsible lenders, insurers, and advisors integrate the HōMI-Score to serve clients better, not to gatekeep.',
  },
  {
    phase: 'Phase 4',
    title: 'Industry Standard',
    icon: Building2,
    color: 'var(--text-primary)',
    colorRgb: '226, 232, 240',
    description:
      'The HōMI-Score becomes the expected benchmark alongside FICO: readiness alongside creditworthiness.',
  },
] as const;

/* ── Three-ring weight data ───────────────────────────────────────────── */

const RINGS = [
  {
    label: 'Financial Reality',
    weight: 35,
    color: 'var(--cyan)',
    colorRgb: '34, 211, 238',
    icon: DollarSign,
  },
  {
    label: 'Emotional Truth',
    weight: 35,
    color: 'var(--emerald)',
    colorRgb: '52, 211, 153',
    icon: Heart,
  },
  {
    label: 'Perfect Timing',
    weight: 30,
    color: 'var(--yellow)',
    colorRgb: '250, 204, 21',
    icon: Timer,
  },
] as const;

/* ═══════════════════════════════════════════════════════════════════════════
 * Page Component
 * ═══════════════════════════════════════════════════════════════════════════ */

export default function HomiScorePage() {
  const hero = useAnimateOnView(0.1);
  const cta = useAnimateOnView(0.2);

  return (
    <article>
      {/* ──────────────────────────────────────────────────────────────────────
       * 1. HERO
       * ──────────────────────────────────────────────────────────────────── */}
      <section
        ref={hero.ref}
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 15% 20%, rgba(34, 211, 238, 0.05), transparent 60%),
            radial-gradient(ellipse 80% 60% at 85% 80%, rgba(52, 211, 153, 0.04), transparent 60%),
            var(--navy, #0a1628)
          `,
        }}
      >
        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 211, 238, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={hero.isInView ? 'visible' : 'hidden'}
            custom={0}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-widest rounded-full border border-[rgba(34,211,238,0.3)] text-[var(--cyan)] bg-[rgba(34,211,238,0.08)] mb-8">
              <BarChart3 className="size-3.5" />
              Category Defining
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate={hero.isInView ? 'visible' : 'hidden'}
            custom={1}
            className="mb-6 max-w-3xl text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.08]"
            style={{ color: 'var(--text-primary, #e2e8f0)' }}
          >
            The{' '}
            <span className="text-gradient"><BrandedName />-Score</span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={hero.isInView ? 'visible' : 'hidden'}
            custom={2}
            className="mb-12 max-w-2xl text-lg sm:text-xl leading-relaxed"
            style={{ color: 'var(--text-secondary, #94a3b8)' }}
          >
            A new standard for financial decision-making. Not whether you
            qualify, but whether you are ready.
          </motion.p>

          {/* Compass */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate={hero.isInView ? 'visible' : 'hidden'}
          >
            <ThresholdCompass
              size={220}
              financial={92}
              emotional={88}
              timing={85}
              animate
              showKeyhole
            />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
            className="flex flex-col items-center gap-2"
          >
            <span
              className="text-xs font-medium uppercase tracking-[0.2em]"
              style={{ color: 'var(--text-secondary, #94a3b8)' }}
            >
              Scroll
            </span>
            <div
              className="h-8 w-[1px]"
              style={{
                background:
                  'linear-gradient(to bottom, var(--text-secondary, #94a3b8), transparent)',
              }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────
       * 2. WHAT IS THE HōMI-SCORE?
       * ──────────────────────────────────────────────────────────────────── */}
      <Section>
        <div className="mx-auto max-w-4xl px-6">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--emerald)] mb-4 block">
              Definition
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              What is the{' '}
              <span className="text-[var(--emerald)]"><BrandedName />-Score</span>?
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            {[
              {
                value: '0 - 100',
                label: 'Simple Scale',
                detail: 'No confusing 300-850 range. Zero means not ready. Hundred means fully aligned.',
                colorRgb: '34, 211, 238',
              },
              {
                value: '3',
                label: 'Dimensions',
                detail: 'Financial reality, emotional truth, and perfect timing, measured simultaneously.',
                colorRgb: '52, 211, 153',
              },
              {
                value: 'Real-time',
                label: 'Reassessment',
                detail: 'Your score updates as your life changes. Not a monthly lagging snapshot.',
                colorRgb: '250, 204, 21',
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                custom={i + 1}
                className="group relative overflow-hidden rounded-2xl p-8 text-center transition-all duration-500 hover:translate-y-[-4px]"
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: `1px solid rgba(${stat.colorRgb}, 0.2)`,
                }}
              >
                {/* Top glow line */}
                <div
                  className="absolute left-0 top-0 h-[2px] w-full"
                  style={{
                    background: `linear-gradient(90deg, transparent, rgba(${stat.colorRgb}, 0.6), transparent)`,
                  }}
                />
                <p className="text-3xl font-bold text-gradient mb-2">
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                  {stat.label}
                </p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {stat.detail}
                </p>
                {/* Bottom hover glow */}
                <div
                  className="pointer-events-none absolute -bottom-16 left-1/2 h-32 w-48 -translate-x-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
                  style={{ background: `rgba(${stat.colorRgb}, 0.1)` }}
                />
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp}>
            <Card padding="lg">
              <p className="text-[var(--text-secondary)] leading-relaxed text-center max-w-2xl mx-auto">
                The HōMI-Score is the first three-dimensional readiness
                measurement for major financial decisions. It does not predict
                whether a lender will approve you. It predicts whether{' '}
                <span className="text-[var(--text-primary)] font-medium">
                  you will be okay
                </span>{' '}
                financially, emotionally, and in terms of timing, after you
                say yes.
              </p>
            </Card>
          </motion.div>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────────────
       * 3. HōMI-SCORE vs FICO COMPARISON
       * ──────────────────────────────────────────────────────────────────── */}
      <Section id="comparison">
        <div className="mx-auto max-w-4xl px-6">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--cyan)] mb-4 block">
              Side by Side
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <BrandedName />-Score{' '}
              <span className="text-[var(--text-secondary)]">vs</span>{' '}
              <span className="text-[var(--cyan)]">FICO</span>
            </h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              FICO tells lenders if they should trust you. HōMI tells{' '}
              <span className="text-[var(--text-primary)] font-medium italic">
                you
              </span>{' '}
              if you should trust the decision.
            </p>
          </motion.div>

          {/* Comparison grid */}
          <motion.div
            variants={fadeUp}
            custom={1}
            className="overflow-hidden rounded-2xl"
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(34, 211, 238, 0.1)',
            }}
          >
            {/* Header row */}
            <div
              className="grid grid-cols-[1fr_1fr_1fr] gap-0"
              style={{ borderBottom: '1px solid rgba(34, 211, 238, 0.1)' }}
            >
              <div className="px-6 py-5" />
              <div
                className="flex items-center justify-center gap-2 px-6 py-5"
                style={{
                  borderLeft: '1px solid rgba(34, 211, 238, 0.1)',
                  borderRight: '1px solid rgba(34, 211, 238, 0.1)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-10 rounded-full"
                    style={{ background: '#64748b' }}
                  />
                  <span
                    className="text-sm font-bold uppercase tracking-wider"
                    style={{ color: '#94a3b8' }}
                  >
                    FICO
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 px-6 py-5">
                <div className="flex items-center gap-3">
                  <ThresholdCompass size={28} animate={false} showKeyhole={false} />
                  <span className="text-sm font-bold uppercase tracking-wider">
                    <BrandedName />-Score
                  </span>
                </div>
              </div>
            </div>

            {/* Data rows */}
            {COMPARISON_ROWS.map((row, i) => {
              const isFicoNull = row.fico === 'None';
              return (
                <motion.div
                  key={row.label}
                  variants={fadeIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i + 2}
                  className="grid grid-cols-[1fr_1fr_1fr] gap-0"
                  style={{
                    borderBottom:
                      i < COMPARISON_ROWS.length - 1
                        ? '1px solid rgba(34, 211, 238, 0.06)'
                        : undefined,
                  }}
                >
                  {/* Label */}
                  <div className="flex items-center px-6 py-4">
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-secondary, #94a3b8)' }}
                    >
                      {row.label}
                    </span>
                  </div>

                  {/* FICO value */}
                  <div
                    className="flex items-center justify-center px-6 py-4"
                    style={{
                      borderLeft: '1px solid rgba(34, 211, 238, 0.06)',
                      borderRight: '1px solid rgba(34, 211, 238, 0.06)',
                    }}
                  >
                    {isFicoNull ? (
                      <span className="flex items-center gap-1.5 text-sm" style={{ color: '#94a3b8' }}>
                        <X size={14} className="text-homi-crimson/60" />
                        Ignores
                      </span>
                    ) : (
                      <span className="text-sm" style={{ color: '#94a3b8' }}>
                        {row.fico}
                      </span>
                    )}
                  </div>

                  {/* HōMI value */}
                  <div className="flex items-center justify-center px-6 py-4">
                    {isFicoNull ? (
                      <span
                        className="flex items-center gap-1.5 text-sm font-medium"
                        style={{ color: 'var(--emerald, #34d399)' }}
                      >
                        <Check size={14} />
                        {row.homi}
                      </span>
                    ) : (
                      <span
                        className="text-sm font-medium"
                        style={{ color: 'var(--text-primary, #e2e8f0)' }}
                      >
                        {row.homi}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────────────
       * 4. HOW IT IS CALCULATED — Visual breakdown of 35/35/30
       * ──────────────────────────────────────────────────────────────────── */}
      <Section>
        <div className="mx-auto max-w-7xl px-6">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--yellow)] mb-4 block">
              Methodology
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How it is{' '}
              <span className="text-[var(--yellow)]">calculated</span>
            </h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              Three rings. Three dimensions. One score that tells you whether
              you will be okay.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Compass visualization */}
            <motion.div
              variants={fadeUp}
              className="flex justify-center"
            >
              <div className="relative">
                {/* Ambient glow */}
                <div
                  className="absolute inset-0 rounded-full blur-3xl opacity-20"
                  style={{ background: 'var(--emerald)' }}
                  aria-hidden="true"
                />
                <ThresholdCompass
                  size={280}
                  financial={85}
                  emotional={80}
                  timing={75}
                  animate
                  showKeyhole
                />

                {/* Labels around compass */}
                {RINGS.map((ring, i) => {
                  const positions = [
                    'absolute -top-4 left-1/2 -translate-x-1/2',
                    'absolute top-1/2 -right-4 translate-x-full -translate-y-1/2',
                    'absolute -bottom-4 left-1/2 -translate-x-1/2 translate-y-full',
                  ];
                  return (
                    <div
                      key={ring.label}
                      className={`${positions[i]} flex items-center gap-2 whitespace-nowrap`}
                    >
                      <ring.icon
                        className="size-4"
                        style={{ color: ring.color }}
                      />
                      <span
                        className="text-xs font-semibold"
                        style={{ color: ring.color }}
                      >
                        {ring.label} ({ring.weight}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Ring details */}
            <motion.div
              variants={staggerContainer}
              className="space-y-6"
            >
              {RINGS.map((ring) => {
                const Icon = ring.icon;
                return (
                  <motion.div
                    key={ring.label}
                    variants={fadeUp}
                    className="flex items-start gap-4"
                  >
                    <div
                      className="flex items-center justify-center size-12 rounded-xl shrink-0"
                      style={{
                        background: `rgba(${ring.colorRgb}, 0.08)`,
                        border: `1px solid rgba(${ring.colorRgb}, 0.15)`,
                      }}
                    >
                      <Icon className="size-5" style={{ color: ring.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className="text-lg font-bold"
                          style={{ color: ring.color }}
                        >
                          {ring.label}
                        </h3>
                        <span
                          className="text-2xl font-bold"
                          style={{ color: ring.color, opacity: 0.6 }}
                        >
                          {ring.weight}%
                        </span>
                      </div>
                      {/* Weight bar */}
                      <div className="h-2 rounded-full bg-[rgba(30,41,59,0.8)] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: ring.color }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${ring.weight}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' as const }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              <motion.div variants={fadeUp}>
                <Card padding="md">
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    <span className="text-[var(--text-primary)] font-semibold">
                      Why 35/35/30?
                    </span>{' '}
                    Financial and emotional dimensions are weighted equally
                    because data shows emotional misalignment causes as many bad
                    decisions as financial strain. Timing is weighted at 30%
                    because it contextualizes everything else. Even perfect
                    finances and clear emotions cannot overcome catastrophic
                    timing.
                  </p>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────────────
       * 5. THE VERDICT SYSTEM
       * ──────────────────────────────────────────────────────────────────── */}
      <Section>
        <div className="mx-auto max-w-7xl px-6">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--emerald)] mb-4 block">
              The Verdict System
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Four temperature states.{' '}
              <span className="text-[var(--emerald)]">One clear answer.</span>
            </h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              No ambiguity. No fine print. Your HōMI-Score maps to one of four
              verdicts, each with a concrete action plan.
            </p>
          </motion.div>

          {/* Temperature gradient bar */}
          <motion.div variants={fadeUp} className="mb-12">
            <div className="h-3 rounded-full overflow-hidden">
              <div className="h-full w-full bg-[linear-gradient(90deg,var(--emerald)_0%,var(--yellow)_40%,var(--homi-amber)_65%,var(--homi-crimson)_100%)]" />
            </div>
            <div className="flex justify-between mt-2 text-xs text-[var(--text-secondary)]">
              <span>Cool</span>
              <span>Warm</span>
              <span>Warm+</span>
              <span>Hot</span>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {VERDICTS.map((verdict) => (
              <motion.div key={verdict.label} variants={fadeUp}>
                <div
                  className="group relative h-full overflow-hidden rounded-xl p-6 transition-all duration-500 hover:translate-y-[-4px]"
                  style={{
                    background: verdict.bg,
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: `1px solid ${verdict.border}`,
                  }}
                >
                  {/* Top glow line */}
                  <div
                    className="absolute left-0 top-0 h-[2px] w-full"
                    style={{
                      background: `linear-gradient(90deg, transparent, rgba(${verdict.colorRgb}, 0.6), transparent)`,
                    }}
                  />
                  {/* Hover glow blob */}
                  <div
                    className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: `rgba(${verdict.colorRgb}, 0.08)` }}
                  />

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{verdict.emoji}</span>
                      <div>
                        <h3
                          className="text-lg font-bold"
                          style={{ color: verdict.color }}
                        >
                          {verdict.label}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {verdict.temp}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-sm font-mono font-bold px-3 py-1 rounded-full"
                      style={{
                        color: verdict.color,
                        background: `rgba(${verdict.colorRgb}, 0.12)`,
                      }}
                    >
                      {verdict.range}
                    </span>
                  </div>

                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {verdict.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────────────
       * 6. THE PATH TO STANDARD
       * ──────────────────────────────────────────────────────────────────── */}
      <Section>
        <div className="mx-auto max-w-4xl px-6">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--cyan)] mb-4 block">
              The Vision
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              The Path to{' '}
              <span className="text-gradient">Standard</span>
            </h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              FICO took decades to become the default. We are building the next
              standard. One that finally serves people, not institutions.
            </p>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div
              className="absolute left-6 top-0 bottom-0 w-px hidden sm:block"
              style={{
                background:
                  'linear-gradient(180deg, var(--cyan), var(--emerald), var(--yellow), var(--text-secondary))',
                opacity: 0.3,
              }}
              aria-hidden="true"
            />

            <div className="space-y-8">
              {PATH_STEPS.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.phase}
                    variants={fadeUp}
                    className="flex gap-6 items-start"
                  >
                    {/* Dot */}
                    <div className="relative z-10 shrink-0">
                      {/* Ambient glow */}
                      <div
                        className="absolute inset-0 rounded-xl blur-2xl opacity-15"
                        style={{ background: step.color }}
                        aria-hidden="true"
                      />
                      <div
                        className="relative flex items-center justify-center size-12 rounded-xl"
                        style={{
                          background: `rgba(${step.colorRgb}, 0.08)`,
                          border: `1px solid rgba(${step.colorRgb}, 0.15)`,
                        }}
                      >
                        <Icon className="size-5" style={{ color: step.color }} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-4">
                      <span
                        className="text-xs font-semibold uppercase tracking-widest mb-1 block"
                        style={{ color: step.color }}
                      >
                        {step.phase}
                      </span>
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────────────
       * 7. CTA
       * ──────────────────────────────────────────────────────────────────── */}
      <section
        ref={cta.ref}
        className="relative py-24 sm:py-32 lg:py-40 overflow-hidden"
      >
        {/* Multi-layer gradient background */}
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 60% 50% at 50% 100%, rgba(34, 211, 238, 0.12) 0%, transparent 70%),
                radial-gradient(ellipse 50% 40% at 30% 0%, rgba(52, 211, 153, 0.08) 0%, transparent 60%),
                var(--navy)
              `,
            }}
          />
        </div>

        <motion.div
          className="mx-auto max-w-3xl px-6 text-center"
          initial="hidden"
          animate={cta.isInView ? 'visible' : 'hidden'}
        >
          <motion.div variants={fadeUp} custom={0}>
            <ThresholdCompass
              size={120}
              financial={95}
              emotional={90}
              timing={88}
              animate
              showKeyhole
              className="mx-auto mb-8"
            />
          </motion.div>

          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            Ready to know if you are{' '}
            <span className="text-gradient">ready</span>?
          </motion.h2>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-[var(--text-secondary)] mb-10 max-w-lg mx-auto"
          >
            Stop guessing. Stop relying on tools built for lenders. Get the
            first score that was built for{' '}
            <span className="text-[var(--text-primary)] font-medium">you</span>.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-full bg-[var(--emerald)] text-white hover:opacity-90 transition-opacity no-underline"
            >
              Get Your <BrandedName />-Score
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-full border border-[var(--slate-light)] text-[var(--text-primary)] hover:border-[var(--cyan)] hover:text-[var(--cyan)] transition-colors no-underline"
            >
              Learn About <BrandedName />
            </Link>
          </motion.div>

          <motion.p
            variants={fadeUp}
            custom={4}
            className="mt-8 text-sm text-[var(--text-secondary)] opacity-70"
          >
            Join 2,847 people already on the waitlist
          </motion.p>
        </motion.div>
      </section>
    </article>
  );
}
