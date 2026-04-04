'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ClipboardCheck,
  Bot,
  Calculator,
  Clock,
  CheckCircle2,
  Circle,
  ArrowRight,
  Activity,
  ListChecks,
  Bell,
} from 'lucide-react';
import { ScoreOrb, DimensionCard, VerdictBadge } from '@/components/scoring';
import { Card, Badge } from '@/components/ui';
import {
  AssessmentHistoryChart,
  GoalTracker,
  FinancialSnapshot,
  ProfileCompletion,
  EngagementSection,
} from '@/components/dashboard';
import type { DashboardData } from '@/lib/data/dashboard';
import type { Verdict } from '@/types/assessment';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * DashboardContent — Client component with animations & interactivity.
 * Receives all data as props from the server component page.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface QuickAction {
  label: string;
  description: string;
  href: string;
  Icon: typeof ClipboardCheck;
  color: string;
  glowColor: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Take Assessment',
    description: 'Recalculate your readiness score',
    href: '/assess/new',
    Icon: ClipboardCheck,
    color: 'var(--cyan, #22d3ee)',
    glowColor: 'rgba(34, 211, 238, 0.15)',
  },
  {
    label: 'Open Agent',
    description: 'Chat with your HōMI advisor',
    href: '/agent',
    Icon: Bot,
    color: 'var(--emerald, #34d399)',
    glowColor: 'rgba(52, 211, 153, 0.15)',
  },
  {
    label: 'Financial Tools',
    description: 'Calculators and simulators',
    href: '/tools',
    Icon: Calculator,
    color: 'var(--yellow, #facc15)',
    glowColor: 'rgba(250, 204, 21, 0.12)',
  },
  {
    label: 'View History',
    description: 'Past assessments and trends',
    href: '/assess',
    Icon: Clock,
    color: 'var(--cyan, #22d3ee)',
    glowColor: 'rgba(34, 211, 238, 0.15)',
  },
];

// ---------------------------------------------------------------------------
// Animation config
// ---------------------------------------------------------------------------

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeInOut' as const } },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface Props {
  data: DashboardData;
}

export default function DashboardContent({ data }: Props) {
  const {
    profile,
    latestAssessment,
    scoreHistory,
    notifications,
    transformationPath,
    genome,
    couple,
    assessmentCount,
  } = data;

  const score = latestAssessment?.overall_score ?? 0;
  const verdict = (latestAssessment?.verdict ?? 'NOT_YET') as Verdict;
  const financialScore = latestAssessment?.financial_score ?? 0;
  const emotionalScore = latestAssessment?.emotional_score ?? 0;
  const timingScore = latestAssessment?.timing_score ?? 0;
  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <motion.div
      className="mx-auto w-full max-w-6xl space-y-8"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* ── Page header ── */}
      <motion.div variants={fadeUp}>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--text-primary, #e2e8f0)' }}
        >
          {profile ? `Welcome back, ${profile.name.split(' ')[0]}` : 'Dashboard'}
        </h1>
        <p
          className="mt-1 text-sm"
          style={{ color: 'var(--text-secondary, #94a3b8)' }}
        >
          Your decision readiness at a glance
        </p>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════
         SCORE OVERVIEW
         ════════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp}>
        {latestAssessment ? (
          <Card padding="lg">
            <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-10">
              <div className="flex flex-col items-center gap-3">
                <ScoreOrb score={score} size="md" showLabel />
                <VerdictBadge verdict={verdict} pulse />
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                <DimensionCard dimension="financial" score={financialScore} maxContribution={40} />
                <DimensionCard dimension="emotional" score={emotionalScore} maxContribution={35} />
                <DimensionCard dimension="timing" score={timingScore} maxContribution={25} />
              </div>
            </div>
          </Card>
        ) : (
          <Card padding="lg">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ScoreOrb score={0} size="md" showLabel />
              <p className="mt-4 text-sm font-medium text-[#e2e8f0]">
                No assessment yet
              </p>
              <p className="mt-1 text-xs text-[#94a3b8]">
                Take your first assessment to see your decision readiness score.
              </p>
              <Link
                href="/assess/new"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#22d3ee] to-[#34d399] px-5 py-2.5 text-sm font-semibold text-[#0a1628] transition-opacity hover:opacity-90"
              >
                <ClipboardCheck size={16} />
                Start Assessment
              </Link>
            </div>
          </Card>
        )}
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════
         SCORE HISTORY CHART
         ════════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp}>
        <AssessmentHistoryChart history={scoreHistory} />
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════
         NOTIFICATIONS + ACTIVITY
         ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Notifications (left, 3/5) ── */}
        <motion.div className="lg:col-span-3" variants={fadeUp}>
          <Card
            padding="md"
            header={
              <div className="flex items-center gap-2">
                <Bell size={18} style={{ color: 'var(--cyan, #22d3ee)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                  Notifications
                </span>
                {unreadNotifications.length > 0 && (
                  <Badge variant="info">{unreadNotifications.length} new</Badge>
                )}
                <Link href="/notifications" className="ml-auto text-xs text-[#22d3ee] hover:underline">
                  View all
                </Link>
              </div>
            }
          >
            {notifications.length > 0 ? (
              <ul className="space-y-3">
                {notifications.map((n) => (
                  <li key={n.id} className="flex items-start gap-3">
                    <span
                      className="mt-1.5 size-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor: n.read ? '#94a3b8' : '#22d3ee',
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-[#e2e8f0]">{n.title}</p>
                      <p className="text-xs mt-0.5 text-[#94a3b8]">{n.body}</p>
                      <p className="text-xs mt-1 text-[rgba(148,163,184,0.6)]">
                        {new Date(n.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-4 text-center text-sm text-[#94a3b8]">
                No notifications yet.
              </p>
            )}
          </Card>
        </motion.div>

        {/* ── Couple Status (right, 2/5) ── */}
        <motion.div className="lg:col-span-2" variants={fadeUp}>
          <Card
            padding="md"
            header={
              <div className="flex items-center gap-2">
                <Activity size={18} style={{ color: 'var(--emerald, #34d399)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                  {couple ? 'Couples Mode' : 'Recent Activity'}
                </span>
              </div>
            }
          >
            {couple ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(52,211,153,0.15)]">
                    <span className="text-sm font-bold text-[#34d399]">
                      {couple.partner_name?.[0] ?? '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#e2e8f0]">
                      {couple.partner_name ?? 'Partner'}
                    </p>
                    <p className="text-xs text-[#94a3b8]">
                      {couple.partner_score != null
                        ? `Score: ${couple.partner_score}`
                        : 'No assessment yet'}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-[rgba(10,22,40,0.5)] px-3 py-2">
                  <p className="text-xs text-[#94a3b8]">
                    Sharing: {couple.share_assessments ? 'Assessments shared' : 'Summary only'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-sm text-[#94a3b8]">
                  {assessmentCount > 0
                    ? `${assessmentCount} assessment${assessmentCount !== 1 ? 's' : ''} completed`
                    : 'Start your first assessment to build activity.'}
                </p>
                <Link
                  href="/couples"
                  className="mt-3 text-xs text-[#22d3ee] hover:underline"
                >
                  Enable couples mode
                </Link>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
         GOALS + FINANCIAL + PROFILE (3-column)
         ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={fadeUp}>
          <GoalTracker transformationPath={transformationPath} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <FinancialSnapshot latestAssessment={latestAssessment} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <ProfileCompletion
            profile={profile}
            assessmentCount={assessmentCount}
            hasCoupleLink={!!couple}
          />
        </motion.div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
         ENGAGEMENT
         ════════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp}>
        <EngagementSection genome={genome} assessmentCount={assessmentCount} />
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════
         QUICK ACTIONS
         ════════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((qa) => (
            <Link key={qa.href} href={qa.href} className="group">
              <Card interactive padding="md">
                <div className="flex flex-col gap-3">
                  <div
                    className="flex size-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: qa.glowColor }}
                  >
                    <qa.Icon size={20} style={{ color: qa.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                      {qa.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                      {qa.description}
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                    style={{ color: qa.color }}
                  />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
