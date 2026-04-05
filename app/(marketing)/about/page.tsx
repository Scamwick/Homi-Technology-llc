'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  DollarSign,
  Compass,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  XCircle,
  Heart,
  Timer,
  Scale,
  CalendarCheck,
  Home,
  Car,
  GraduationCap,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';
import { ThresholdCompass, BrandedName } from '@/components/brand';
import { Card } from '@/components/ui';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * About Page — "The Missing Voice"
 * HōMI Decision Readiness Intelligence
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* ── Shared animation presets ─────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeInOut' as const },
  },
} as const;

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
} as const;

function Section({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className={`relative py-24 lg:py-32 ${className}`}
    >
      {children}
    </motion.section>
  );
}

/* ── How It Works steps ─────────────────────────────────────────────────── */

const STEPS = [
  {
    step: 1,
    title: 'Answer honestly',
    color: 'var(--cyan)',
    colorClass: 'text-[var(--cyan)]',
    bgClass: 'rgba(30, 41, 59, 0.8)',
    borderClass: 'rgba(34, 211, 238, 0.2)',
    compassProps: { financial: 60, emotional: 0, timing: 0 },
    bullets: [
      'Financial data: income, debt, savings, obligations',
      'Emotional questions: stress levels, partner alignment, fear vs. excitement',
      'Timing factors: life stage, market conditions, upcoming changes',
    ],
  },
  {
    step: 2,
    title: 'Get your HōMI-Score',
    color: 'var(--emerald)',
    colorClass: 'text-[var(--emerald)]',
    bgClass: 'rgba(30, 41, 59, 0.8)',
    borderClass: 'rgba(52, 211, 153, 0.2)',
    compassProps: { financial: 75, emotional: 70, timing: 65 },
    bullets: [
      '35% Financial Reality: can you actually afford this?',
      '35% Emotional Truth: are you deciding from clarity or pressure?',
      '30% Perfect Timing: is this the right moment in your life?',
    ],
  },
  {
    step: 3,
    title: 'Know if you will be okay',
    color: 'var(--yellow)',
    colorClass: 'text-[var(--yellow)]',
    bgClass: 'rgba(30, 41, 59, 0.8)',
    borderClass: 'rgba(250, 204, 21, 0.2)',
    compassProps: { financial: 90, emotional: 85, timing: 80 },
    bullets: [
      'Verdict: READY, ALMOST THERE, BUILD FIRST, or NOT YET',
      'Roadmap: exactly what to do before your next assessment',
      'Trinity Engine analysis: three-factor readiness scoring',
    ],
  },
] as const;

/* ── Three Dimensions data ─────────────────────────────────────────────── */

const DIMENSIONS = [
  {
    title: 'Financial Reality',
    weight: '35%',
    color: 'var(--cyan)',
    bgColor: 'rgba(34, 211, 238, 0.08)',
    borderColor: 'rgba(34, 211, 238, 0.3)',
    icon: DollarSign,
    description:
      'Not just can you afford it, but can you absorb the shock? We measure true affordability across every decision type.',
    measures: [
      'Debt-to-income ratio and residual income',
      'Emergency fund depth after commitment',
      'Income stability and trajectory',
      'Hidden costs and ongoing obligations',
      'Insurance and protection gaps',
    ],
  },
  {
    title: 'Emotional Truth',
    weight: '35%',
    color: 'var(--emerald)',
    bgColor: 'rgba(52, 211, 153, 0.08)',
    borderColor: 'rgba(52, 211, 153, 0.3)',
    icon: Heart,
    description:
      'Every major decision carries an emotional weight. Excitement is not readiness. Fear is not wisdom.',
    measures: [
      'Decision clarity vs. external pressure',
      'Partner and household alignment',
      'Stress capacity and emotional bandwidth',
      'Comparison traps and FOMO indicators',
      'Confidence in your own timeline',
    ],
  },
  {
    title: 'Perfect Timing',
    weight: '30%',
    color: 'var(--yellow)',
    bgColor: 'rgba(250, 204, 21, 0.08)',
    borderColor: 'rgba(250, 204, 21, 0.3)',
    icon: Timer,
    description:
      'The right decision at the wrong time is still the wrong decision. We assess whether your life context supports this move right now.',
    measures: [
      'Career stability and upcoming transitions',
      'Life events on the horizon (kids, moves, retirement)',
      'Market timing relative to your timeline',
      'Relationship stability indicators',
      'Personal runway and optionality preservation',
    ],
  },
] as const;

/* ── What HōMI Is NOT ────────────────────────────────────────────────── */

const NOT_LIST = [
  {
    label: 'Not a financial calculator',
    detail:
      'We do not tell you how much you can afford. That question is already answered everywhere. We tell you if you should.',
  },
  {
    label: 'Not a lender, broker, dealer, or recruiter',
    detail:
      'We do not originate loans, sell cars, place candidates, or collect commissions from any industry. Zero financial incentive to push you toward yes.',
  },
  {
    label: 'Not a financial advisor',
    detail:
      'We do not give investment advice, manage assets, or recommend products. We measure decision readiness across homes, careers, businesses, investments, and every other major life choice.',
  },
  {
    label: 'Not trying to sell you anything',
    detail:
      'We have no inventory, no listings, no referral fees, no partnerships with sellers. The only product is clarity. The only outcome that matters is yours.',
  },
] as const;

/* ═══════════════════════════════════════════════════════════════════════════
 * Page Component
 * ═══════════════════════════════════════════════════════════════════════════ */

export default function AboutPage() {
  return (
    <article>
      {/* ──────────────────────────────────────────────────────────────────────
       * 1. HERO — "The Missing Voice"
       * ──────────────────────────────────────────────────────────────────── */}
      <Section className="overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Badge */}
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-widest rounded-full border border-[rgba(34,211,238,0.3)] text-[var(--cyan)] bg-[rgba(34,211,238,0.08)] mb-8">
                <Compass className="size-3.5" />
                About <BrandedName />
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6"
            >
              The{' '}
              <span className="text-gradient">Missing Voice</span>
            </motion.h1>

            {/* Subhead */}
            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-[var(--text-secondary)] leading-relaxed max-w-2xl"
            >
              Every major life decision has stakeholders who profit from your yes. Nobody profits from your readiness. We built H&#x14D;MI to change that.
            </motion.p>

            {/* Compass */}
            <motion.div
              variants={fadeUp}
              className="mt-12"
            >
              <ThresholdCompass
                size={180}
                financial={85}
                emotional={80}
                timing={75}
                animate
                showKeyhole
              />
            </motion.div>
          </div>
        </div>

        {/* Background glow */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        >
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.06)_0%,transparent_70%)]" />
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────────────
       * 2. WHY HōMI EXISTS
       * ──────────────────────────────────────────────────────────────────── */}
      <Section>
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div>
              <motion.span
                variants={fadeUp}
                className="text-xs font-semibold uppercase tracking-widest text-[var(--emerald)] mb-4 block"
              >
                Why we exist
              </motion.span>

              <motion.h2
                variants={fadeUp}
                className="text-3xl sm:text-4xl font-bold mb-6 leading-tight"
              >
                You can&rsquo;t rush{' '}
                <span className="text-[var(--emerald)]">alignment</span>.
              </motion.h2>

              <motion.div variants={fadeUp} className="space-y-5 text-[var(--text-secondary)] leading-relaxed">
                <p>
                  Every major financial decision has the same broken structure:
                  everyone around you profits from your &ldquo;yes,&rdquo; and
                  nobody profits from your readiness.
                </p>
                <p>
                  Lenders profit when you borrow. Dealers profit when you sign.
                  Recruiters profit when you accept. Schools profit when you
                  enroll. Nobody measures whether{' '}
                  <span className="text-[var(--text-primary)] font-medium">
                    you
                  </span>{' '}
                  are actually ready.
                </p>
                <p>
                  HōMI was built to be the missing voice: the only stakeholder
                  whose incentives are aligned with what&rsquo;s actually right
                  for your life. We measure three dimensions of readiness
                  (financial, emotional, and timing) because good decisions
                  require all three to align.
                </p>
                <p>
                  We tell approximately 70% of users to wait. That&rsquo;s not a
                  flaw. It&rsquo;s the feature. Honesty is our competitive
                  advantage.
                </p>
              </motion.div>
            </div>

            {/* Visual — Three alignment blocks */}
            <motion.div
              variants={fadeUp}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="flex flex-col items-center gap-3">
                  {[
                    { label: 'Financial', color: 'var(--cyan)' },
                    { label: 'Emotional', color: 'var(--emerald)' },
                    { label: 'Timing', color: 'var(--yellow)' },
                  ].map((block, i) => (
                    <motion.div
                      key={block.label}
                      initial={{ opacity: 0, x: (i % 2 === 0 ? -1 : 1) * 20 }}
                      whileInView={{
                        opacity: 1,
                        x: 0,
                        transition: { delay: 0.3 + i * 0.15, duration: 0.5 },
                      }}
                      viewport={{ once: true }}
                      className="flex items-center justify-center w-56 h-20 rounded-xl border text-sm font-semibold"
                      style={{
                        borderColor: block.color,
                        color: block.color,
                        background: `linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.7))`,
                        boxShadow: `0 0 20px ${block.color}33`,
                      }}
                    >
                      {block.label} Alignment
                    </motion.div>
                  ))}
                </div>

                {/* Connecting line */}
                <div
                  className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 -z-10"
                  style={{
                    background:
                      'linear-gradient(180deg, var(--cyan), var(--emerald), var(--yellow))',
                    opacity: 0.3,
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────────────
       * 3. MISSION
       * ──────────────────────────────────────────────────────────────────── */}
      <Section>
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.span
            variants={fadeUp}
            className="text-xs font-semibold uppercase tracking-widest text-[var(--yellow)] mb-4 block"
          >
            Our Mission
          </motion.span>

          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl font-bold mb-12 leading-tight"
          >
            We imagine a world where{' '}
            <span className="text-[var(--yellow)]">readiness</span> precedes
            action.
          </motion.h2>

          <motion.div
            variants={staggerContainer}
            className="grid sm:grid-cols-2 gap-6 text-left"
          >
            {[
              {
                icon: Sparkles,
                text: 'Where decisions are timed with clarity, not pressure.',
              },
              {
                icon: Scale,
                text: 'Where people stop confusing affordability with readiness.',
              },
              {
                icon: ShieldCheck,
                text: 'Where your yes finally belongs to you.',
              },
              {
                icon: CalendarCheck,
                text: 'Where the right time matters as much as the right price.',
              },
            ].map((item) => (
              <motion.div
                key={item.text}
                variants={fadeUp}
                className="flex gap-4 p-6 rounded-xl border border-[rgba(250,204,21,0.15)] bg-[rgba(250,204,21,0.04)]"
              >
                <item.icon
                  className="size-5 shrink-0 mt-0.5"
                  style={{ color: 'var(--yellow)' }}
                />
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────────────
       * 3.5. MARKET GRID — Conflicts of interest across industries
       * ──────────────────────────────────────────────────────────────────── */}
      <Section>
        <div className="mx-auto max-w-7xl px-6">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--cyan)] mb-4 block">
              The Conflict Map
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Every industry has{' '}
              <span className="text-[var(--cyan)]">the same problem</span>
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              In every major decision, the people guiding you profit from your yes. H&#x14D;MI is the first platform built entirely around your readiness.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: Home,
                industry: 'Real Estate',
                conflict: 'Agents and lenders profit from your yes',
                color: 'var(--cyan)',
                bgColor: 'rgba(34, 211, 238, 0.08)',
                borderColor: 'rgba(34, 211, 238, 0.2)',
              },
              {
                icon: Car,
                industry: 'Automotive',
                conflict: 'Dealers and finance companies profit from your signature',
                color: 'var(--emerald)',
                bgColor: 'rgba(52, 211, 153, 0.08)',
                borderColor: 'rgba(52, 211, 153, 0.2)',
              },
              {
                icon: GraduationCap,
                industry: 'Education',
                conflict: 'Schools and loan providers profit from enrollment',
                color: 'var(--yellow)',
                bgColor: 'rgba(250, 204, 21, 0.08)',
                borderColor: 'rgba(250, 204, 21, 0.2)',
              },
              {
                icon: Briefcase,
                industry: 'Career',
                conflict: 'Recruiters and agencies profit from placements',
                color: 'var(--cyan)',
                bgColor: 'rgba(34, 211, 238, 0.08)',
                borderColor: 'rgba(34, 211, 238, 0.2)',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.industry}
                  variants={fadeUp}
                  className="rounded-xl p-6 border"
                  style={{
                    background: item.bgColor,
                    borderColor: item.borderColor,
                  }}
                >
                  <div
                    className="flex items-center justify-center size-10 rounded-lg mb-4"
                    style={{ background: item.bgColor }}
                  >
                    <Icon className="size-5" style={{ color: item.color }} />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: item.color }}>
                    {item.industry}
                  </h3>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="size-3.5 shrink-0 mt-0.5 text-[var(--homi-crimson)]" />
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {item.conflict}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────────────
       * 4. HOW IT WORKS — 3 Steps with animated compass progression
       * ──────────────────────────────────────────────────────────────────── */}
      <Section>
        <div className="mx-auto max-w-7xl px-6">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--cyan)] mb-4 block">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Three steps to{' '}
              <span className="text-gradient">decision clarity</span>
            </h2>
          </motion.div>

          <div className="space-y-20">
            {STEPS.map((step, idx) => (
              <motion.div
                key={step.step}
                variants={fadeUp}
                className="grid lg:grid-cols-2 gap-12 items-center"
              >
                {/* Text side */}
                <div className={idx % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="flex items-center gap-4 mb-6">
                    <span
                      className="inline-flex items-center justify-center size-10 rounded-full text-sm font-bold"
                      style={{
                        background: step.bgClass,
                        color: step.color,
                        border: `1px solid ${step.borderClass}`,
                      }}
                    >
                      {step.step}
                    </span>
                    <h3
                      className="text-2xl font-bold"
                      style={{ color: step.color }}
                    >
                      {step.title}
                    </h3>
                  </div>

                  <ul className="space-y-3">
                    {step.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-3 text-[var(--text-secondary)]"
                      >
                        <ArrowRight
                          className="size-4 shrink-0 mt-1"
                          style={{ color: step.color }}
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Compass side — no container box, just the compass with ambient glow on navy */}
                <div
                  className={`flex items-center justify-center ${
                    idx % 2 === 1 ? 'lg:order-1' : ''
                  }`}
                >
                  <div className="relative">
                    {/* Ambient glow behind compass */}
                    <div
                      className="absolute inset-0 rounded-full blur-3xl opacity-20"
                      style={{ background: step.color }}
                      aria-hidden="true"
                    />
                    <ThresholdCompass
                      size={240}
                      financial={step.compassProps.financial}
                      emotional={step.compassProps.emotional}
                      timing={step.compassProps.timing}
                      animate
                      showKeyhole
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────────────
       * 5. THE THREE DIMENSIONS
       * ──────────────────────────────────────────────────────────────────── */}
      <Section>
        <div className="mx-auto max-w-7xl px-6">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--emerald)] mb-4 block">
              The Three Dimensions
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              What we{' '}
              <span className="text-[var(--emerald)]">actually measure</span>
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Traditional tools measure one dimension. HōMI measures three,
              because a decision you can afford but aren&rsquo;t ready for is
              still a bad decision.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {DIMENSIONS.map((dim) => {
              const Icon = dim.icon;
              return (
                <motion.div key={dim.title} variants={fadeUp}>
                  <Card padding="lg" className="h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center justify-center size-10 rounded-lg"
                          style={{
                            background: dim.bgColor,
                            color: dim.color,
                          }}
                        >
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <h3
                            className="text-lg font-bold"
                            style={{ color: dim.color }}
                          >
                            {dim.title}
                          </h3>
                        </div>
                      </div>
                      <span
                        className="text-2xl font-bold"
                        style={{ color: dim.color, opacity: 0.9 }}
                      >
                        {dim.weight}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                      {dim.description}
                    </p>

                    {/* Measures */}
                    <div className="space-y-2.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                        What we measure
                      </span>
                      {dim.measures.map((m) => (
                        <div
                          key={m}
                          className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]"
                        >
                          <div
                            className="size-1.5 rounded-full shrink-0 mt-1.5"
                            style={{ background: dim.color }}
                          />
                          {m}
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────────────
       * 6. WHAT HōMI IS NOT
       * ──────────────────────────────────────────────────────────────────── */}
      <Section>
        <div className="mx-auto max-w-4xl px-6">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--homi-crimson)] mb-4 block">
              Important Distinction
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold">
              What <BrandedName /> is{' '}
              <span className="text-[var(--homi-crimson)]">NOT</span>
            </h2>
          </motion.div>

          <div className="space-y-6">
            {NOT_LIST.map((item) => (
              <motion.div
                key={item.label}
                variants={fadeUp}
                className="flex gap-5 p-6 rounded-xl border border-[rgba(239,68,68,0.15)] bg-[rgba(239,68,68,0.04)]"
              >
                <XCircle className="size-6 shrink-0 text-[var(--homi-crimson)] mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                    {item.label}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div variants={fadeUp} className="mt-16 text-center">
            <Link
              href="/homi-score"
              className="inline-flex items-center gap-2 px-8 py-3 text-base font-semibold rounded-full bg-[var(--emerald)] text-white hover:opacity-90 transition-opacity no-underline"
            >
              Learn about the <BrandedName />-Score
              <ArrowRight className="size-4" />
            </Link>
          </motion.div>
        </div>
      </Section>
    </article>
  );
}
