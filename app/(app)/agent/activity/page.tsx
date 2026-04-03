'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Undo2,
  Activity,
  Zap,
  Settings,
  Cpu,
  Calendar,
  Shield,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ThresholdCompass } from '@/components/brand/ThresholdCompass';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Activity Feed — Every action receipted, nothing in the dark
 * HōMI Agent Platform
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

type FilterType = 'all' | 'actions' | 'skills' | 'system';

interface ReadinessScores {
  clarity: number;
  alignment: number;
  timing: number;
}

interface ActivityEntry {
  id: string;
  title: string;
  type: Exclude<FilterType, 'all'>;
  timestamp: string;
  readiness: ReadinessScores;
  confidence: number;
  reasoning: string;
  undoable: boolean;
  undone: boolean;
  skillName?: string;
}

const ACTIVITIES: ActivityEntry[] = [
  {
    id: 'act-1',
    title: 'Check my schedule for conflicts',
    type: 'actions',
    timestamp: '2 min ago',
    readiness: { clarity: 92, alignment: 88, timing: 95 },
    confidence: 91,
    reasoning:
      'User has a clear calendar context loaded. Request is unambiguous — scanning for overlapping events in the next 7 days. High alignment with user\'s stated productivity goals. Timing is optimal as calendar sync completed 30s ago.',
    undoable: false,
    undone: false,
  },
  {
    id: 'act-2',
    title: 'Archive 23 promotional emails',
    type: 'actions',
    timestamp: '8 min ago',
    readiness: { clarity: 85, alignment: 90, timing: 82 },
    confidence: 86,
    reasoning:
      'Inbox Manager skill identified 23 emails matching promotional patterns. All matched user-defined archive rules. None contained time-sensitive offers. Confidence slightly reduced because 2 senders were not previously categorized.',
    undoable: true,
    undone: false,
    skillName: 'Inbox Manager',
  },
  {
    id: 'act-3',
    title: 'Block 2pm-4pm for deep work',
    type: 'actions',
    timestamp: '15 min ago',
    readiness: { clarity: 78, alignment: 95, timing: 88 },
    confidence: 87,
    reasoning:
      'Schedule Optimizer detected a 2-hour gap with no meetings. User has deep work protection enabled. Clarity slightly lower because the specific task for deep work was not specified. Created calendar block with "Focus Time" label.',
    undoable: true,
    undone: false,
    skillName: 'Schedule Optimizer',
  },
  {
    id: 'act-4',
    title: 'Flag unusual $340 subscription charge',
    type: 'skills',
    timestamp: '22 min ago',
    readiness: { clarity: 94, alignment: 92, timing: 90 },
    confidence: 93,
    reasoning:
      'Spending Analyst detected a charge 3.2x above the rolling 90-day average for this merchant. Flagged for review per user\'s anomaly threshold settings. No action taken beyond notification — awaiting user decision.',
    undoable: false,
    undone: false,
    skillName: 'Spending Analyst',
  },
  {
    id: 'act-5',
    title: 'Draft reply to client follow-up',
    type: 'actions',
    timestamp: '35 min ago',
    readiness: { clarity: 72, alignment: 80, timing: 85 },
    confidence: 78,
    reasoning:
      'Inbox Manager generated a draft reply based on conversation context. Clarity reduced because the client\'s question had some ambiguity. Draft saved to outbox for review — not sent. Tone matched user\'s professional preset.',
    undoable: true,
    undone: true,
    skillName: 'Inbox Manager',
  },
  {
    id: 'act-6',
    title: 'Compiled Q1 research summary',
    type: 'skills',
    timestamp: '1 hr ago',
    readiness: { clarity: 88, alignment: 86, timing: 78 },
    confidence: 84,
    reasoning:
      'Deep Research aggregated 14 sources across 3 databases. All citations verified. Timing score lower because some sources had stale data (>30 days). Summary includes confidence intervals for each finding.',
    undoable: false,
    undone: false,
    skillName: 'Deep Research',
  },
  {
    id: 'act-7',
    title: 'System health check completed',
    type: 'system',
    timestamp: '1.5 hrs ago',
    readiness: { clarity: 98, alignment: 96, timing: 94 },
    confidence: 96,
    reasoning:
      'Routine system health check. All connected services responding normally. API quotas at 34% utilization. Memory usage nominal. No anomalies detected. Next check scheduled in 6 hours.',
    undoable: false,
    undone: false,
  },
  {
    id: 'act-8',
    title: 'Set living room to evening mode',
    type: 'skills',
    timestamp: '2 hrs ago',
    readiness: { clarity: 90, alignment: 94, timing: 92 },
    confidence: 92,
    reasoning:
      'Home Control triggered evening routine based on time-of-day rule. Dimmed lights to 40%, set color temperature to 2700K, lowered thermostat by 2 degrees. All devices confirmed state change.',
    undoable: true,
    undone: false,
    skillName: 'Home Control',
  },
  {
    id: 'act-9',
    title: 'Updated trust model weights',
    type: 'system',
    timestamp: '3 hrs ago',
    readiness: { clarity: 96, alignment: 98, timing: 88 },
    confidence: 94,
    reasoning:
      'Periodic recalibration of trust model based on last 50 actions. User approval rate: 96%. Two corrections noted — both in email categorization. Model weights adjusted by 0.3% to improve precision in promotional detection.',
    undoable: false,
    undone: false,
  },
  {
    id: 'act-10',
    title: 'Refactored utils/date.ts helper',
    type: 'skills',
    timestamp: '4 hrs ago',
    readiness: { clarity: 82, alignment: 76, timing: 80 },
    confidence: 79,
    reasoning:
      'Code Assistant identified a repeated date formatting pattern across 4 files. Extracted into a shared utility. All existing tests pass. Alignment slightly lower because the refactor was proactive rather than requested. Diff available for review.',
    undoable: true,
    undone: false,
    skillName: 'Code Assistant',
  },
];

const FILTER_TABS: { label: string; value: FilterType; icon: typeof Activity }[] = [
  { label: 'All', value: 'all', icon: Activity },
  { label: 'Actions', value: 'actions', icon: Zap },
  { label: 'Skills', value: 'skills', icon: Cpu },
  { label: 'System', value: 'system', icon: Settings },
];

/* ── Animation variants ──────────────────────────────────────────────────── */

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: 'easeInOut' as const },
  },
};

/* ── Readiness bar (mini) ────────────────────────────────────────────────── */

function ReadinessBar({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] w-14 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-[rgba(30,41,59,0.8)] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: 'easeInOut' as const }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] tabular-nums text-[var(--text-secondary)] w-7 text-right">
        {score}
      </span>
    </div>
  );
}

/* ── Activity receipt card ───────────────────────────────────────────────── */

function ActivityCard({
  entry,
  onUndo,
}: {
  entry: ActivityEntry;
  onUndo: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const typeIcon = {
    actions: <Zap size={14} />,
    skills: <Cpu size={14} />,
    system: <Settings size={14} />,
  }[entry.type];

  const confidenceColor =
    entry.confidence >= 90
      ? 'var(--emerald)'
      : entry.confidence >= 75
        ? 'var(--yellow)'
        : 'var(--homi-amber)';

  return (
    <Card padding="md" className={entry.undone ? 'opacity-60' : ''}>
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Mini compass */}
        <div className="shrink-0 mt-0.5">
          <ThresholdCompass
            size={36}
            financial={entry.readiness.clarity}
            emotional={entry.readiness.alignment}
            timing={entry.readiness.timing}
            animate={false}
            showKeyhole={false}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[var(--text-secondary)]">{typeIcon}</span>
            <h3
              className={[
                'text-sm font-medium',
                entry.undone
                  ? 'line-through text-[var(--text-secondary)]'
                  : 'text-[var(--text-primary)]',
              ].join(' ')}
            >
              {entry.undone && (
                <span className="text-[var(--homi-crimson)] font-semibold no-underline mr-1">
                  [UNDONE]
                </span>
              )}
              &ldquo;{entry.title}&rdquo;
            </h3>
          </div>

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-[var(--text-secondary)]">
              {entry.timestamp}
            </span>
            {entry.skillName && (
              <Badge variant="info">{entry.skillName}</Badge>
            )}
            <span
              className="text-xs font-semibold tabular-nums"
              style={{ color: confidenceColor }}
            >
              {entry.confidence}% confidence
            </span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {entry.undoable && !entry.undone && (
            <button
              type="button"
              onClick={() => onUndo(entry.id)}
              title="Undo this action"
              aria-label={`Undo: ${entry.title}`}
              className={[
                'p-1.5 rounded-lg text-[var(--text-secondary)]',
                'hover:text-[var(--homi-crimson)] hover:bg-[rgba(239,68,68,0.1)]',
                'transition-all duration-150 cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--homi-crimson)]',
              ].join(' ')}
            >
              <Undo2 size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse reasoning' : 'Expand reasoning'}
            className={[
              'p-1.5 rounded-lg text-[var(--text-secondary)]',
              'hover:text-[var(--cyan)] hover:bg-[rgba(34,211,238,0.1)]',
              'transition-all duration-150 cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)]',
            ].join(' ')}
          >
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={14} />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Readiness bars */}
      <div className="mt-3 flex flex-col gap-1.5">
        <ReadinessBar
          label="Clarity"
          score={entry.readiness.clarity}
          color="var(--cyan)"
        />
        <ReadinessBar
          label="Align"
          score={entry.readiness.alignment}
          color="var(--emerald)"
        />
        <ReadinessBar
          label="Timing"
          score={entry.readiness.timing}
          color="var(--yellow)"
        />
      </div>

      {/* Expandable reasoning */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' as const }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-[rgba(34,211,238,0.1)]">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1.5">
                Reasoning
              </p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {entry.reasoning}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Page
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function ActivityFeedPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [entries, setEntries] = useState<ActivityEntry[]>(ACTIVITIES);
  const [dateRange, setDateRange] = useState('today');

  const handleUndo = useCallback((id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, undone: true } : e)),
    );
  }, []);

  const filteredEntries = entries.filter(
    (e) => activeFilter === 'all' || e.type === activeFilter,
  );

  const totalActions = entries.length;
  const undoneCount = entries.filter((e) => e.undone).length;
  const avgConfidence = Math.round(
    entries.reduce((sum, e) => sum + e.confidence, 0) / entries.length,
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a1628' }}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' as const }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Activity Feed
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Every action receipted, nothing in the dark
          </p>
        </motion.div>

        {/* ── Stats summary ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
        >
          <Card padding="sm">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-[var(--cyan)]" />
                <span className="text-[var(--text-primary)] font-semibold tabular-nums">
                  47
                </span>
                <span className="text-[var(--text-secondary)]">
                  actions today
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-[var(--emerald)]" />
                <span className="text-[var(--emerald)] font-semibold">
                  100%
                </span>
                <span className="text-[var(--text-secondary)]">receipted</span>
              </div>
              <div className="flex items-center gap-2">
                <Undo2 size={14} className="text-[var(--text-secondary)]" />
                <span className="text-[var(--text-primary)] font-semibold tabular-nums">
                  {undoneCount}
                </span>
                <span className="text-[var(--text-secondary)]">undone</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-[var(--yellow)]" />
                <span className="text-[var(--text-secondary)]">
                  Avg confidence:
                </span>
                <span className="text-[var(--text-primary)] font-semibold tabular-nums">
                  {avgConfidence}%
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── Filter bar ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3"
        >
          <nav
            className="flex gap-1.5"
            role="tablist"
            aria-label="Activity filters"
          >
            {FILTER_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === tab.value}
                  onClick={() => setActiveFilter(tab.value)}
                  className={[
                    'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full cursor-pointer',
                    'transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)]',
                    activeFilter === tab.value
                      ? 'bg-[rgba(34,211,238,0.15)] text-[var(--cyan)] border border-[rgba(34,211,238,0.3)]'
                      : 'text-[var(--text-secondary)] border border-transparent hover:text-[var(--text-primary)] hover:bg-[rgba(30,41,59,0.6)]',
                  ].join(' ')}
                >
                  <Icon size={12} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Date range selector */}
          <div className="sm:ml-auto flex items-center gap-2">
            <Calendar size={14} className="text-[var(--text-secondary)]" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              aria-label="Date range"
              className={[
                'text-xs bg-[rgba(30,41,59,0.8)] border border-[rgba(34,211,238,0.15)]',
                'text-[var(--text-secondary)] rounded-lg px-2.5 py-1.5',
                'focus:outline-none focus:border-[var(--cyan)]',
                'cursor-pointer appearance-none',
              ].join(' ')}
              style={{
                backgroundImage:
                  'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
                paddingRight: '28px',
              }}
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
            </select>
          </div>
        </motion.div>

        {/* ── Activity list ─────────────────────────────────────────────── */}
        <motion.div
          key={activeFilter}
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-3"
          role="tabpanel"
        >
          {filteredEntries.map((entry) => (
            <motion.div key={entry.id} variants={itemVariants}>
              <ActivityCard entry={entry} onUndo={handleUndo} />
            </motion.div>
          ))}

          {filteredEntries.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center"
            >
              <p className="text-[var(--text-secondary)] text-sm">
                No activity entries for this filter.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
