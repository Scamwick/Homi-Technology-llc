'use client';

import { useRef, useState, useEffect } from 'react';
import {
  motion,
  useInView,
  type Variants,
} from 'framer-motion';
import {
  Building2,
  Handshake,
  Heart,
  ArrowRight,
  ArrowDown,
  Shield,
  Clock,
  TrendingUp,
  X,
  Check,
  Home,
  Car,
  LineChart,
  GraduationCap,
  Briefcase,
  Users,
} from 'lucide-react';
import { ThresholdCompass, BrandedName } from '@/components/brand';

/* ═══════════════════════════════════════════════════════════════════════════════
 * Animation Variants & Helpers
 * ═══════════════════════════════════════════════════════════════════════════ */

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

function useAnimateOnView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  return { ref, isInView };
}

/* ── CountUp ── */
function CountUp({
  end,
  suffix = '',
  prefix = '',
  duration = 2,
}: {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = end / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * SECTION WRAPPER — consistent spacing & max-width
 * ═══════════════════════════════════════════════════════════════════════════ */

function Section({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`relative px-6 py-16 md:py-24 lg:py-32 ${className}`}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * ACT 1 — THE HOOK
 * ═══════════════════════════════════════════════════════════════════════════ */

function HeroSection() {
  const { ref, isInView } = useAnimateOnView(0.1);

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 15% 20%, rgba(34, 211, 238, 0.05), transparent 60%),
          radial-gradient(ellipse 80% 60% at 85% 80%, rgba(52, 211, 153, 0.04), transparent 60%),
          var(--navy, #0a1628)
        `,
      }}
    >
      {/* Ambient particle grid lines */}
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
        {/* Compass */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mb-8"
        >
          <ThresholdCompass size={200} animate showKeyhole />
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0}
          className="mb-6 max-w-3xl text-4xl font-[800] leading-[1.1] tracking-tight sm:text-5xl md:text-[48px]"
          style={{ color: 'var(--text-primary, #e2e8f0)' }}
        >
          Will You Be Okay?
        </motion.h1>

        {/* Subhead */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={1}
          className="mb-10 max-w-2xl text-lg leading-relaxed sm:text-xl"
          style={{ color: 'var(--text-secondary, #94a3b8)' }}
        >
          The first AI that tells you IF you&apos;re ready for a major life
          decision&nbsp;&mdash; not just how to execute one.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={2}
          className="flex flex-col items-center gap-4 sm:flex-row"
        >
          <a
            href="/assess/new"
            className="group inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold transition-all duration-300 hover:shadow-lg"
            style={{
              backgroundColor: 'var(--emerald, #34d399)',
              color: 'var(--navy, #0a1628)',
              boxShadow: '0 0 20px rgba(52, 211, 153, 0.25)',
            }}
          >
            Get Your <BrandedName />-Score
            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </a>
          <a
            href="#solution"
            className="inline-flex items-center gap-2 rounded-full border px-8 py-3.5 text-base font-semibold transition-all duration-300 hover:border-[var(--cyan,#22d3ee)] hover:bg-[rgba(34,211,238,0.05)]"
            style={{
              borderColor: 'var(--slate-light, #334155)',
              color: 'var(--text-primary, #e2e8f0)',
            }}
          >
            See How It Works
            <ArrowDown size={18} />
          </a>
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
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * ACT 2 — THE PROBLEM
 * ═══════════════════════════════════════════════════════════════════════════ */

const problemCards = [
  {
    icon: Building2,
    headline: 'Your advisor profits when you invest',
    color: 'var(--cyan, #22d3ee)',
    colorRgb: '34, 211, 238',
  },
  {
    icon: Handshake,
    headline: 'Your dealer profits when you drive off the lot',
    color: 'var(--emerald, #34d399)',
    colorRgb: '52, 211, 153',
  },
  {
    icon: Heart,
    headline: 'Your recruiter profits when you accept the offer',
    color: 'var(--yellow, #facc15)',
    colorRgb: '250, 204, 21',
  },
];

function ProblemSection() {
  const { ref, isInView } = useAnimateOnView(0.15);

  return (
    <Section id="problem">
      <div ref={ref}>
        {/* Section label */}
        <motion.p
          variants={fadeIn}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mb-4 text-center text-sm font-semibold uppercase tracking-[0.15em]"
          style={{ color: 'var(--cyan, #22d3ee)' }}
        >
          Everyone Has an Agenda
        </motion.p>

        {/* Cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {problemCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                custom={i}
                className="group relative overflow-hidden rounded-2xl p-8 transition-all duration-500"
                style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: `1px solid rgba(${card.colorRgb}, 0.15)`,
                }}
              >
                {/* Hover glow */}
                <div
                  className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: `rgba(${card.colorRgb}, 0.08)` }}
                />
                <div
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `rgba(${card.colorRgb}, 0.1)` }}
                >
                  <Icon size={24} style={{ color: card.color }} />
                </div>
                <p
                  className="text-lg font-semibold leading-snug"
                  style={{ color: 'var(--text-primary, #e2e8f0)' }}
                >
                  {card.headline}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Punchline */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={4}
          className="mt-16 text-center"
        >
          <p
            className="text-2xl font-semibold leading-relaxed sm:text-3xl"
            style={{ color: 'var(--text-primary, #e2e8f0)' }}
          >
            Nobody profits from your readiness.
          </p>
          <p
            className="mt-2 text-2xl font-bold sm:text-3xl"
            style={{ color: 'var(--yellow, #facc15)' }}
          >
            Until now.
          </p>
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * ACT 3 — THE SOLUTION (Three Dimensions)
 * ═══════════════════════════════════════════════════════════════════════════ */

const dimensions = [
  {
    name: 'Financial Reality',
    weight: '35%',
    color: 'var(--cyan, #22d3ee)',
    colorRgb: '34, 211, 238',
    description:
      'Whether you\u2019re buying a home, launching a business, or making a career change \u2014 can you truly afford this without compromising your future?',
    icon: TrendingUp,
  },
  {
    name: 'Emotional Readiness',
    weight: '35%',
    color: 'var(--emerald, #34d399)',
    colorRgb: '52, 211, 153',
    description:
      'From signing a mortgage to accepting a job offer to planning retirement \u2014 fear, pressure, and FOMO drive 63% of regret. We measure what others ignore.',
    icon: Heart,
  },
  {
    name: 'Perfect Timing',
    weight: '30%',
    color: 'var(--yellow, #facc15)',
    colorRgb: '250, 204, 21',
    description:
      'Every major decision has a timing dimension. Career stability, life stage, market conditions, and personal runway all shape whether now is the right moment.',
    icon: Clock,
  },
];

function SolutionSection() {
  const { ref, isInView } = useAnimateOnView(0.15);

  return (
    <Section id="solution">
      <div ref={ref}>
        {/* Section label */}
        <motion.p
          variants={fadeIn}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mb-4 text-center text-sm font-semibold uppercase tracking-[0.15em]"
          style={{ color: 'var(--cyan, #22d3ee)' }}
        >
          Three Dimensions of Readiness
        </motion.p>
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0}
          className="mx-auto mb-16 max-w-xl text-center text-3xl font-bold leading-tight sm:text-4xl"
          style={{ color: 'var(--text-primary, #e2e8f0)' }}
        >
          <BrandedName /> measures what no one else does
        </motion.h2>

        <div className="grid gap-8 lg:grid-cols-3">
          {dimensions.map((dim, i) => {
            const Icon = dim.icon;
            return (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                custom={i + 1}
                className="group relative overflow-hidden rounded-2xl p-8 transition-all duration-500 hover:translate-y-[-4px]"
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: `1px solid rgba(${dim.colorRgb}, 0.2)`,
                }}
              >
                {/* Top glow line */}
                <div
                  className="absolute left-0 top-0 h-[2px] w-full"
                  style={{
                    background: `linear-gradient(90deg, transparent, rgba(${dim.colorRgb}, 0.6), transparent)`,
                  }}
                />

                {/* Ring icon */}
                <div className="mb-6 flex items-center gap-4">
                  <div className="relative">
                    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        stroke={dim.color}
                        strokeWidth="2"
                        opacity="0.3"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        stroke={dim.color}
                        strokeWidth="2"
                        strokeDasharray="100 51"
                        strokeLinecap="round"
                        opacity="0.8"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon size={20} style={{ color: dim.color }} />
                    </div>
                  </div>
                  <div>
                    <h3
                      className="text-xl font-bold"
                      style={{ color: 'var(--text-primary, #e2e8f0)' }}
                    >
                      {dim.name}
                    </h3>
                    <span
                      className="inline-block mt-1 rounded-full px-3 py-0.5 text-xs font-semibold"
                      style={{
                        background: `rgba(${dim.colorRgb}, 0.12)`,
                        color: dim.color,
                        border: `1px solid rgba(${dim.colorRgb}, 0.25)`,
                      }}
                    >
                      {dim.weight}
                    </span>
                  </div>
                </div>

                <p
                  className="text-base leading-relaxed"
                  style={{ color: 'var(--text-secondary, #94a3b8)' }}
                >
                  {dim.description}
                </p>

                {/* Bottom glow on hover */}
                <div
                  className="pointer-events-none absolute -bottom-16 left-1/2 h-32 w-48 -translate-x-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
                  style={{ background: `rgba(${dim.colorRgb}, 0.1)` }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * DECISION PHASES — The Six Pillars
 * ═══════════════════════════════════════════════════════════════════════════ */

const decisionPhases = [
  { name: 'Homes', icon: Home, color: 'var(--cyan, #22d3ee)', colorRgb: '34, 211, 238', status: 'Live' },
  { name: 'Cars', icon: Car, color: 'var(--emerald, #34d399)', colorRgb: '52, 211, 153', status: 'Coming Soon' },
  { name: 'Investments', icon: LineChart, color: 'var(--yellow, #facc15)', colorRgb: '250, 204, 21', status: 'Coming Soon' },
  { name: 'Education', icon: GraduationCap, color: 'var(--cyan, #22d3ee)', colorRgb: '34, 211, 238', status: 'Coming Soon' },
  { name: 'Business', icon: Briefcase, color: 'var(--emerald, #34d399)', colorRgb: '52, 211, 153', status: 'Coming Soon' },
  { name: 'Life', icon: Users, color: 'var(--yellow, #facc15)', colorRgb: '250, 204, 21', status: 'Coming Soon' },
];

function DecisionPhasesSection() {
  const { ref, isInView } = useAnimateOnView(0.15);

  return (
    <Section id="decisions">
      <div ref={ref}>
        <motion.p
          variants={fadeIn}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mb-4 text-center text-sm font-semibold uppercase tracking-[0.15em]"
          style={{ color: 'var(--emerald, #34d399)' }}
        >
          26+ Decision Types Across 6 Phases
        </motion.p>
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0}
          className="mx-auto mb-6 max-w-2xl text-center text-3xl font-bold leading-tight sm:text-4xl"
          style={{ color: 'var(--text-primary, #e2e8f0)' }}
        >
          One platform for every major{' '}
          <span className="text-gradient">life decision</span>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={1}
          className="mx-auto mb-14 max-w-xl text-center text-base leading-relaxed"
          style={{ color: 'var(--text-secondary, #94a3b8)' }}
        >
          Home buying is our most developed vertical. But the conflict of interest problem exists everywhere a major decision is made.
        </motion.p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {decisionPhases.map((phase, i) => {
            const Icon = phase.icon;
            const isLive = phase.status === 'Live';
            return (
              <motion.div
                key={phase.name}
                variants={fadeUp}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                custom={i + 2}
                className="group flex flex-col items-center gap-3 rounded-xl p-5 transition-all duration-300 hover:translate-y-[-2px]"
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: `1px solid rgba(${phase.colorRgb}, ${isLive ? '0.3' : '0.12'})`,
                }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg"
                  style={{ background: `rgba(${phase.colorRgb}, 0.1)` }}
                >
                  <Icon size={24} style={{ color: phase.color, opacity: isLive ? 1 : 0.6 }} />
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: isLive ? phase.color : 'var(--text-secondary, #94a3b8)' }}
                >
                  {phase.name}
                </span>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    background: isLive ? `rgba(${phase.colorRgb}, 0.15)` : 'rgba(100, 116, 139, 0.1)',
                    color: isLive ? phase.color : '#64748b',
                    border: `1px solid ${isLive ? `rgba(${phase.colorRgb}, 0.3)` : 'rgba(100, 116, 139, 0.2)'}`,
                  }}
                >
                  {phase.status}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * ACT 4 — HōMI vs THE CREDIT SCORE
 * ═══════════════════════════════════════════════════════════════════════════ */

const comparisonRows = [
  {
    label: 'What it measures',
    fico: 'Repayment probability',
    homi: 'Decision readiness across 3 dimensions',
  },
  {
    label: 'Who it serves',
    fico: 'Lenders',
    homi: 'You',
  },
  {
    label: 'Emotional readiness',
    fico: null,
    homi: '35% of your score',
  },
  {
    label: 'Market timing',
    fico: null,
    homi: '30% of your score',
  },
  {
    label: 'Conflict of interest',
    fico: 'Sold to lenders',
    homi: 'Zero commissions',
  },
  {
    label: 'What it predicts',
    fico: 'Will they pay?',
    homi: 'Will they be okay?',
  },
];

function ComparisonSection() {
  const { ref, isInView } = useAnimateOnView(0.1);

  return (
    <Section id="comparison">
      <div ref={ref}>
        <motion.p
          variants={fadeIn}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mb-4 text-center text-sm font-semibold uppercase tracking-[0.15em]"
          style={{ color: 'var(--cyan, #22d3ee)' }}
        >
          The Standard Is Changing
        </motion.p>
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mx-auto mb-16 max-w-lg text-center text-3xl font-bold leading-tight sm:text-4xl"
          style={{ color: 'var(--text-primary, #e2e8f0)' }}
        >
          The credit score is broken
        </motion.h2>

        {/* Comparison table */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
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
              {/* FICO header */}
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-10 rounded-full"
                  style={{ background: '#64748b' }}
                />
                <span
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ color: '#64748b' }}
                >
                  FICO
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 px-6 py-5">
              {/* HōMI header with mini compass */}
              <div className="flex items-center gap-3">
                <ThresholdCompass size={28} animate={false} showKeyhole={false} />
                <span className="text-sm font-bold uppercase tracking-wider">
                  <BrandedName />-Score
                </span>
              </div>
            </div>
          </div>

          {/* Data rows */}
          {comparisonRows.map((row, i) => (
            <motion.div
              key={i}
              variants={fadeIn}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={i + 2}
              className="grid grid-cols-[1fr_1fr_1fr] gap-0"
              style={{
                borderBottom:
                  i < comparisonRows.length - 1
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
                {row.fico === null ? (
                  <span className="flex items-center gap-1.5 text-sm" style={{ color: '#64748b' }}>
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
                {row.fico === null ? (
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
          ))}
        </motion.div>

        {/* Visual FICO bar vs HōMI compass */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={9}
          className="mt-12 flex flex-col items-center gap-8 sm:flex-row sm:justify-center sm:gap-16"
        >
          {/* FICO: flat bar */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="h-4 w-48 rounded-full"
              style={{ background: '#334155' }}
            >
              <div
                className="h-full w-[72%] rounded-full"
                style={{ background: '#64748b' }}
              />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#64748b' }}>
              One-dimensional
            </span>
          </div>

          {/* HōMI: three-ring compass */}
          <div className="flex flex-col items-center gap-3">
            <ThresholdCompass
              size={56}
              animate
              showKeyhole={false}
            />
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{
                background: 'linear-gradient(135deg, #22d3ee, #34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Three-dimensional
            </span>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * ACT 5 — THE PROOF
 * ═══════════════════════════════════════════════════════════════════════════ */

const stats = [
  {
    value: 70,
    suffix: '%',
    label: 'told to wait',
    sub: 'Our radical honesty',
    color: 'var(--emerald, #34d399)',
  },
  {
    value: 63,
    suffix: '%',
    label: 'regret the timing',
    sub: 'The problem we solve',
    color: 'var(--yellow, #facc15)',
  },
  {
    value: 2.3,
    suffix: 'T',
    prefix: '$',
    label: 'in major decisions',
    sub: 'The market we serve',
    color: 'var(--cyan, #22d3ee)',
  },
];

function ProofSection() {
  const { ref, isInView } = useAnimateOnView(0.15);

  return (
    <Section id="proof">
      <div ref={ref}>
        <motion.p
          variants={fadeIn}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mb-4 text-center text-sm font-semibold uppercase tracking-[0.15em]"
          style={{ color: 'var(--cyan, #22d3ee)' }}
        >
          The Numbers
        </motion.p>

        {/* Stats grid */}
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={i + 1}
              className="flex flex-col items-center text-center"
            >
              <span
                className="text-5xl font-[800] tracking-tight sm:text-6xl"
                style={{ color: stat.color }}
              >
                <CountUp
                  end={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix ?? ''}
                  duration={2.5}
                />
              </span>
              <span
                className="mt-2 text-lg font-semibold"
                style={{ color: 'var(--text-primary, #e2e8f0)' }}
              >
                {stat.label}
              </span>
              <span
                className="mt-1 text-sm"
                style={{ color: 'var(--text-secondary, #94a3b8)' }}
              >
                {stat.sub}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Honesty statement */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={5}
          className="mx-auto mt-20 max-w-2xl"
        >
          <div
            className="relative overflow-hidden rounded-2xl p-8 text-center sm:p-12"
            style={{
              background: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid rgba(34, 211, 238, 0.1)',
            }}
          >
            {/* Subtle glow */}
            <div
              className="pointer-events-none absolute left-1/2 top-0 h-[1px] w-3/4 -translate-x-1/2"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.3), transparent)',
              }}
            />
            <Shield
              size={32}
              className="mx-auto mb-4"
              style={{ color: 'var(--cyan, #22d3ee)' }}
            />
            <p
              className="text-lg leading-relaxed sm:text-xl"
              style={{ color: 'var(--text-primary, #e2e8f0)' }}
            >
              Honesty is our competitive advantage. We profit when you make the
              right decision&nbsp;&mdash; even if that&apos;s waiting.
            </p>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * ACT 6 — THE CTA
 * ═══════════════════════════════════════════════════════════════════════════ */

function CtaSection() {
  const { ref, isInView } = useAnimateOnView(0.2);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
    } catch {
      // Silently continue — still show success state
    }
    setSubmitted(true);
  }

  return (
    <section
      ref={ref}
      className="relative overflow-hidden px-6 py-24 sm:py-32 lg:py-40"
      style={{
        background: `
          radial-gradient(ellipse 70% 50% at 50% 100%, rgba(34, 211, 238, 0.06), transparent 70%),
          radial-gradient(ellipse 60% 40% at 50% 0%, rgba(52, 211, 153, 0.04), transparent 60%),
          var(--navy, #0a1628)
        `,
      }}
    >
      <div className="mx-auto max-w-2xl text-center">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mb-6 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl"
          style={{ color: 'var(--text-primary, #e2e8f0)' }}
        >
          Ready to find out
          <br />
          if you&apos;re ready?
        </motion.h2>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={1}
          className="mb-10 text-lg"
          style={{ color: 'var(--text-secondary, #94a3b8)' }}
        >
          Zero commissions. Zero conflicts. Just clarity.
        </motion.p>

        {/* Email form */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={2}
        >
          {submitted ? (
            <div
              className="mx-auto flex max-w-md items-center justify-center gap-3 rounded-2xl p-6"
              style={{
                background: 'rgba(52, 211, 153, 0.1)',
                border: '1px solid rgba(52, 211, 153, 0.2)',
              }}
            >
              <Check size={20} style={{ color: 'var(--emerald, #34d399)' }} />
              <span
                className="text-lg font-medium"
                style={{ color: 'var(--emerald, #34d399)' }}
              >
                You&apos;re on the list. We&apos;ll be in touch.
              </span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-full px-6 py-3.5 text-base outline-none transition-all duration-300 focus:ring-2 focus:ring-[var(--cyan,#22d3ee)] focus:ring-offset-2 focus:ring-offset-[var(--navy,#0a1628)]"
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid var(--slate-light, #334155)',
                  color: 'var(--text-primary, #e2e8f0)',
                }}
              />
              <button
                type="submit"
                className="group inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold transition-all duration-300 hover:shadow-lg"
                style={{
                  backgroundColor: 'var(--emerald, #34d399)',
                  color: 'var(--navy, #0a1628)',
                  boxShadow: '0 0 20px rgba(52, 211, 153, 0.2)',
                }}
              >
                Join the Waitlist
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            </form>
          )}
        </motion.div>

        {/* Social proof */}
        <motion.p
          variants={fadeIn}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={4}
          className="mt-8 text-sm"
          style={{ color: 'var(--text-secondary, #94a3b8)' }}
        >
          Join 2,847 people already on the waitlist
        </motion.p>

        {/* Assessment CTA */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={5}
          className="mt-6"
        >
          <a
            href="/assess/new"
            className="inline-flex items-center gap-2 text-base font-semibold transition-colors duration-300 hover:text-[var(--emerald,#34d399)]"
            style={{ color: 'var(--cyan, #22d3ee)' }}
          >
            Or get your H&#x14D;MI-Score now
            <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * PAGE EXPORT
 * ═══════════════════════════════════════════════════════════════════════════ */

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <DecisionPhasesSection />
      <ComparisonSection />
      <ProofSection />
      <CtaSection />
    </>
  );
}
