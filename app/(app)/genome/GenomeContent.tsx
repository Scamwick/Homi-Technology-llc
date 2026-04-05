'use client';

import { motion } from 'framer-motion';
import {
  Fingerprint,
  Brain,
  ShieldCheck,
  TrendingUp,
  Activity,
  Sparkles,
  AlertTriangle,
  Clock,
  BarChart3,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { BehavioralGenomeRow } from '@/types/database';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * GenomeContent — Client Component
 *
 * Renders the behavioral genome visualization using real data passed
 * from the server component. Shows an empty state when no genome exists.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Animation variants
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
// Shared glass card style
// ---------------------------------------------------------------------------

const glassCardStyle = {
  background: 'rgba(15, 23, 42, 0.6)',
  border: '1px solid rgba(34, 211, 238, 0.1)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
} as const;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
  accent = '#22d3ee',
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="p-4 rounded-xl" style={glassCardStyle}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} style={{ color: accent }} />
        <span
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: 'rgba(148, 163, 184, 0.7)' }}
        >
          {label}
        </span>
      </div>
      <p
        className="text-2xl font-bold tabular-nums"
        style={{ color: '#e2e8f0' }}
      >
        {value}
      </p>
    </div>
  );
}

function ScoreTrajectoryChart({ trajectory }: { trajectory: number[] }) {
  const data = trajectory.map((score, index) => ({
    assessment: index + 1,
    score,
  }));

  return (
    <div className="rounded-xl p-5" style={glassCardStyle}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={18} style={{ color: '#22d3ee' }} />
        <h2
          className="text-base font-semibold"
          style={{ color: '#e2e8f0' }}
        >
          Score Trajectory
        </h2>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.1)"
            />
            <XAxis
              dataKey="assessment"
              tick={{ fill: 'rgba(148, 163, 184, 0.6)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(148, 163, 184, 0.15)' }}
              tickLine={false}
              label={{
                value: 'Assessment',
                position: 'insideBottomRight',
                offset: -4,
                style: { fill: 'rgba(148, 163, 184, 0.5)', fontSize: 11 },
              }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: 'rgba(148, 163, 184, 0.6)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(148, 163, 184, 0.15)' }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(34, 211, 238, 0.2)',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: 13,
              }}
              labelFormatter={(val) => `Assessment ${val}`}
              formatter={(val: unknown) => [`${val}`, 'Score']}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#22d3ee"
              strokeWidth={2}
              fill="url(#scoreGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function EmotionalPatternsCard({
  patterns,
}: {
  patterns: Record<string, unknown>;
}) {
  const entries = Object.entries(patterns);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl p-5" style={glassCardStyle}>
      <div className="flex items-center gap-2 mb-4">
        <Activity size={18} style={{ color: '#a78bfa' }} />
        <h2
          className="text-base font-semibold"
          style={{ color: '#e2e8f0' }}
        >
          Emotional Patterns
        </h2>
      </div>
      <div className="space-y-3">
        {entries.map(([key, value]) => {
          const numericValue = typeof value === 'number' ? value : null;
          const displayValue =
            numericValue !== null
              ? `${Math.round(numericValue * 100)}%`
              : String(value);

          return (
            <div key={key} className="flex items-center justify-between">
              <span
                className="text-sm capitalize"
                style={{ color: 'rgba(148, 163, 184, 0.9)' }}
              >
                {key.replace(/_/g, ' ')}
              </span>
              {numericValue !== null ? (
                <div className="flex items-center gap-3">
                  <div
                    className="h-1.5 w-24 rounded-full overflow-hidden"
                    style={{ background: 'rgba(148, 163, 184, 0.15)' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round(numericValue * 100)}%`,
                        background: 'linear-gradient(90deg, #a78bfa, #22d3ee)',
                      }}
                    />
                  </div>
                  <span
                    className="text-xs tabular-nums font-medium"
                    style={{ color: '#a78bfa' }}
                  >
                    {displayValue}
                  </span>
                </div>
              ) : (
                <span
                  className="text-xs font-medium"
                  style={{ color: '#a78bfa' }}
                >
                  {displayValue}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PreferredSkillsCard({ skills }: { skills: string[] }) {
  if (skills.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl p-5" style={glassCardStyle}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} style={{ color: '#34d399' }} />
        <h2
          className="text-base font-semibold"
          style={{ color: '#e2e8f0' }}
        >
          Preferred Skills
        </h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="text-xs font-medium px-3 py-1.5 rounded-full"
            style={{
              color: '#34d399',
              background: 'rgba(52, 211, 153, 0.1)',
              border: '1px solid rgba(52, 211, 153, 0.2)',
            }}
          >
            {skill.replace(/_/g, ' ')}
          </span>
        ))}
      </div>
    </div>
  );
}

function TrustProfileCard({
  trustProfile,
}: {
  trustProfile: Record<string, number | string>;
}) {
  const entries = Object.entries(trustProfile);

  if (entries.length === 0) {
    return null;
  }

  const trustColors: Record<string, string> = {
    full: '#34d399',
    high: '#22d3ee',
    medium: '#facc15',
    low: '#fb923c',
    none: '#f87171',
  };

  return (
    <div className="rounded-xl p-5" style={glassCardStyle}>
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={18} style={{ color: '#22d3ee' }} />
        <h2
          className="text-base font-semibold"
          style={{ color: '#e2e8f0' }}
        >
          Trust Profile
        </h2>
      </div>
      <div className="space-y-3">
        {entries.map(([agent, level]) => (
          <div key={agent} className="flex items-center justify-between">
            <span
              className="text-sm capitalize"
              style={{ color: 'rgba(148, 163, 184, 0.9)' }}
            >
              {agent.replace(/_/g, ' ')}
            </span>
            <span
              className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
              style={{
                color: trustColors[level] ?? '#94a3b8',
                background: `${trustColors[level] ?? '#94a3b8'}18`,
              }}
            >
              {level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyGenomeState() {
  return (
    <motion.div
      className="mx-auto w-full max-w-4xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="rounded-2xl p-12 text-center"
        style={{
          ...glassCardStyle,
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          className="size-16 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'rgba(34, 211, 238, 0.1)' }}
        >
          <Fingerprint size={32} style={{ color: '#22d3ee' }} />
        </div>
        <h2
          className="text-xl font-semibold mb-3"
          style={{ color: '#e2e8f0' }}
        >
          No Behavioral Genome Yet
        </h2>
        <p
          className="text-sm max-w-md leading-relaxed"
          style={{ color: 'rgba(148, 163, 184, 0.8)' }}
        >
          Complete your first assessment to build your behavioral genome.
          As you interact with the platform, we will learn your
          decision-making patterns and personalize your experience.
        </p>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface GenomeContentProps {
  genome: BehavioralGenomeRow | null;
}

export default function GenomeContent({ genome }: GenomeContentProps) {
  if (!genome) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#0a1628' }}>
        <div className="px-4 py-8">
          <EmptyGenomeState />
        </div>
      </div>
    );
  }

  const intervalDisplay =
    genome.avg_reassessment_interval_days !== null
      ? `${Math.round(genome.avg_reassessment_interval_days)} days`
      : 'N/A';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a1628' }}>
      <div className="px-4 py-8">
        <motion.div
          className="mx-auto w-full max-w-4xl space-y-8"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* ── Page header ── */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center gap-3 mb-1">
              <Fingerprint size={28} style={{ color: '#22d3ee' }} />
              <h1
                className="text-2xl font-bold tracking-tight"
                style={{ color: '#e2e8f0' }}
              >
                Your Behavioral Genome
              </h1>
            </div>
            <p
              className="text-sm ml-[40px]"
              style={{ color: 'rgba(148, 163, 184, 0.8)' }}
            >
              How your decision-making patterns shape your personalized
              experience
            </p>
          </motion.div>

          {/* ── Stats grid ── */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <StatCard
              icon={BarChart3}
              label="Assessments"
              value={genome.assessment_count}
            />
            <StatCard
              icon={AlertTriangle}
              label="Deflections"
              value={genome.deflection_count}
              accent="#facc15"
            />
            <StatCard
              icon={Clock}
              label="Avg Interval"
              value={intervalDisplay}
              accent="#a78bfa"
            />
            <StatCard
              icon={Brain}
              label="Skills Used"
              value={genome.preferred_skills.length}
              accent="#34d399"
            />
          </motion.div>

          {/* ── Score trajectory chart ── */}
          {genome.score_trajectory.length > 0 && (
            <motion.div variants={fadeUp}>
              <ScoreTrajectoryChart trajectory={genome.score_trajectory} />
            </motion.div>
          )}

          {/* ── Emotional patterns + Preferred skills (two-column on larger screens) ── */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <EmotionalPatternsCard patterns={genome.emotional_patterns} />
            <PreferredSkillsCard skills={genome.preferred_skills} />
          </motion.div>

          {/* ── Trust profile ── */}
          {Object.keys(genome.trust_profile).length > 0 && (
            <motion.div variants={fadeUp}>
              <TrustProfileCard trustProfile={genome.trust_profile} />
            </motion.div>
          )}

          {/* ── Privacy ── */}
          <motion.div variants={fadeUp}>
            <div className="rounded-xl p-5" style={glassCardStyle}>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={18} style={{ color: '#34d399' }} />
                <h2
                  className="text-base font-semibold"
                  style={{ color: '#e2e8f0' }}
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
                      style={{ color: 'rgba(148, 163, 184, 0.8)' }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
