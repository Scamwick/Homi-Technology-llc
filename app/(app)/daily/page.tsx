'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandedName } from '@/components/brand';
import { Card, Badge } from '@/components/ui';
import {
  recordCheckIn,
  getStreak,
  getTodayEntry,
  generateMockHistory,
  type DailyResponses,
  type DailyInsight,
  type DailyEntry,
  type FinancialFeeling,
  type EmotionalConfidence,
  type TimingReady,
  type DailySentiment,
} from '@/lib/daily/tracker';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Daily Money Minute — 60-Second Financial Check-In
 *
 * A quick daily pulse-check across three behavioral dimensions:
 * financial feeling, emotional confidence, and timing readiness.
 * Uses localStorage for persistence and generates mock history.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------

type Step = 'financial' | 'emotional' | 'timing' | 'complete';

const STEP_ORDER: Step[] = ['financial', 'emotional', 'timing', 'complete'];

interface QuestionOption<T extends string> {
  value: T;
  emoji: string;
  label: string;
}

const FINANCIAL_OPTIONS: QuestionOption<FinancialFeeling>[] = [
  { value: 'good', emoji: '\uD83D\uDE0A', label: 'Good' },
  { value: 'okay', emoji: '\uD83D\uDE10', label: 'Okay' },
  { value: 'worried', emoji: '\uD83D\uDE1F', label: 'Worried' },
];

const EMOTIONAL_OPTIONS: QuestionOption<EmotionalConfidence>[] = [
  { value: 'strong', emoji: '\uD83D\uDCAA', label: 'Strong' },
  { value: 'thinking', emoji: '\uD83E\uDD14', label: 'Thinking' },
  { value: 'anxious', emoji: '\uD83D\uDE30', label: 'Anxious' },
];

const TIMING_OPTIONS: QuestionOption<TimingReady>[] = [
  { value: 'yes', emoji: '\u2705', label: 'Yes' },
  { value: 'not-yet', emoji: '\u23F3', label: 'Not yet' },
  { value: 'no', emoji: '\u274C', label: 'No' },
];

const SENTIMENT_CONFIG: Record<
  DailySentiment,
  { color: string; bg: string; border: string; label: string }
> = {
  positive: {
    color: '#34d399',
    bg: 'rgba(52, 211, 153, 0.1)',
    border: 'rgba(52, 211, 153, 0.3)',
    label: 'Positive',
  },
  mixed: {
    color: '#facc15',
    bg: 'rgba(250, 204, 21, 0.1)',
    border: 'rgba(250, 204, 21, 0.3)',
    label: 'Mixed',
  },
  concerned: {
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.3)',
    label: 'Concerned',
  },
};

// ---------------------------------------------------------------------------
// Calendar Heatmap Component
// ---------------------------------------------------------------------------

function CalendarHeatmap({ entries }: { entries: DailyEntry[] }) {
  const entryMap = useMemo(() => {
    const map = new Map<string, DailySentiment>();
    entries.forEach((e) => map.set(e.date, e.insight.sentiment));
    return map;
  }, [entries]);

  // Generate last 28 days (4 weeks)
  const days = useMemo(() => {
    const result: { date: string; dayOfWeek: number; dayNum: number }[] = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push({
        date: d.toISOString().split('T')[0],
        dayOfWeek: d.getDay(),
        dayNum: d.getDate(),
      });
    }
    return result;
  }, []);

  const getColor = (date: string): string => {
    const sentiment = entryMap.get(date);
    if (!sentiment) return 'rgba(30, 41, 59, 0.6)';
    if (sentiment === 'positive') return '#34d399';
    if (sentiment === 'mixed') return '#facc15';
    return '#ef4444';
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-[#e2e8f0]">
          Last 28 Days
        </h3>
        <div className="flex items-center gap-2 ml-auto text-xs text-[#94a3b8]">
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm"
              style={{ background: '#34d399' }}
            />
            Positive
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm"
              style={{ background: '#facc15' }}
            />
            Mixed
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm"
              style={{ background: '#ef4444' }}
            />
            Concerned
          </span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div
            key={`label-${i}`}
            className="text-center text-[10px] text-[#94a3b8] pb-1"
          >
            {d}
          </div>
        ))}
        {/* Pad leading empty cells for first week alignment */}
        {days.length > 0 &&
          Array.from({ length: days[0].dayOfWeek }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
        {days.map((day) => {
          const sentiment = entryMap.get(day.date);
          return (
            <motion.div
              key={day.date}
              className="aspect-square rounded-sm flex items-center justify-center text-[10px] font-medium cursor-default"
              style={{
                background: getColor(day.date),
                color: sentiment ? '#0a1628' : '#94a3b8',
              }}
              whileHover={{ scale: 1.2 }}
              title={`${day.date}${sentiment ? ` — ${sentiment}` : ' — No check-in'}`}
            >
              {day.dayNum}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick-Tap Question Component
// ---------------------------------------------------------------------------

function QuickTapQuestion<T extends string>({
  question,
  options,
  accentColor,
  selected,
  onSelect,
}: {
  question: string;
  options: QuestionOption<T>[];
  accentColor: string;
  selected: T | null;
  onSelect: (value: T) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-[#e2e8f0] mb-3">{question}</p>
      <div className="flex gap-3">
        {options.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <motion.button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className="flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-[var(--radius-md)] border cursor-pointer transition-all duration-[var(--duration-fast)]"
              style={{
                background: isSelected
                  ? `${accentColor}15`
                  : 'rgba(30, 41, 59, 0.5)',
                borderColor: isSelected
                  ? accentColor
                  : 'rgba(51, 65, 85, 0.5)',
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span
                className="text-xs font-medium"
                style={{ color: isSelected ? accentColor : '#94a3b8' }}
              >
                {opt.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Timer Display Component
// ---------------------------------------------------------------------------

function TimerDisplay({ seconds }: { seconds: number }) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = ((60 - seconds) / 60) * 100;
  const isLow = seconds <= 10;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="rgba(30, 41, 59, 0.8)"
            strokeWidth="3"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke={isLow ? '#ef4444' : '#22d3ee'}
            strokeWidth="3"
            strokeDasharray={`${(progress / 100) * 175.93} 175.93`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s linear' }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-lg font-bold font-mono"
          style={{ color: isLow ? '#ef4444' : '#22d3ee' }}
        >
          {mins}:{secs.toString().padStart(2, '0')}
        </span>
      </div>
      <div>
        <p className="text-xs text-[#94a3b8]">Time Remaining</p>
        <p
          className="text-sm font-medium"
          style={{ color: isLow ? '#ef4444' : '#e2e8f0' }}
        >
          {seconds > 0 ? 'Take your time' : "Time's up!"}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function DailyPage() {
  const [step, setStep] = useState<Step>('financial');
  const [timer, setTimer] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [financial, setFinancial] = useState<FinancialFeeling | null>(null);
  const [emotional, setEmotional] = useState<EmotionalConfidence | null>(null);
  const [timing, setTiming] = useState<TimingReady | null>(null);
  const [insight, setInsight] = useState<DailyInsight | null>(null);
  const [streak, setStreak] = useState(0);
  const [todayDone, setTodayDone] = useState(false);
  const [mockHistory, setMockHistory] = useState<DailyEntry[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load state on mount
  useEffect(() => {
    const existingEntry = getTodayEntry();
    if (existingEntry) {
      setTodayDone(true);
      setInsight(existingEntry.insight);
      setFinancial(existingEntry.responses.financial);
      setEmotional(existingEntry.responses.emotional);
      setTiming(existingEntry.responses.timing);
      setStep('complete');
    }
    setStreak(getStreak());
    setMockHistory(generateMockHistory(28));
  }, []);

  // Timer effect
  useEffect(() => {
    if (timerActive && timer > 0) {
      timerRef.current = setTimeout(() => setTimer((t) => t - 1), 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timerActive, timer]);

  // Auto-advance steps
  const handleFinancial = useCallback(
    (value: FinancialFeeling) => {
      setFinancial(value);
      if (!timerActive) setTimerActive(true);
      setTimeout(() => setStep('emotional'), 300);
    },
    [timerActive],
  );

  const handleEmotional = useCallback((value: EmotionalConfidence) => {
    setEmotional(value);
    setTimeout(() => setStep('timing'), 300);
  }, []);

  const handleTiming = useCallback(
    (value: TimingReady) => {
      setTiming(value);
      if (financial && emotional) {
        const responses: DailyResponses = {
          financial: financial,
          emotional: emotional,
          timing: value,
        };
        const result = recordCheckIn(responses);
        setInsight(result);
        setStreak(getStreak());
        setTodayDone(true);
        setTimerActive(false);
        setTimeout(() => setStep('complete'), 300);
      }
    },
    [financial, emotional],
  );

  const handleDoAgain = useCallback(() => {
    setStep('financial');
    setFinancial(null);
    setEmotional(null);
    setTiming(null);
    setInsight(null);
    setTimer(60);
    setTimerActive(false);
    setTodayDone(false);
  }, []);

  const currentStepIndex = STEP_ORDER.indexOf(step);
  const sentimentConfig = insight
    ? SENTIMENT_CONFIG[insight.sentiment]
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label="timer">
              &#x23F1;&#xFE0F;
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-[#e2e8f0]">
              Daily Money Minute
            </h1>
          </div>
          {streak > 0 && (
            <Badge variant="warning" dot>
              &#x1F525; {streak}-day streak
            </Badge>
          )}
        </div>
        <p className="text-[#94a3b8] text-base md:text-lg">
          A 60-second check-in with <BrandedName className="font-semibold" />.
          How are you feeling about your finances today?
        </p>
      </motion.div>

      {/* ── Timer + Progress ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
      >
        <Card padding="md">
          <div className="flex items-center justify-between">
            <TimerDisplay seconds={timer} />
            {/* Step indicators */}
            <div className="flex items-center gap-2">
              {(['financial', 'emotional', 'timing'] as const).map((s, i) => {
                const isActive = step === s;
                const isDone = currentStepIndex > i;
                const colors = ['#22d3ee', '#34d399', '#facc15'];
                return (
                  <div key={s} className="flex items-center gap-2">
                    <motion.div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: isDone
                          ? colors[i]
                          : isActive
                            ? `${colors[i]}30`
                            : 'rgba(30, 41, 59, 0.8)',
                        color: isDone ? '#0a1628' : colors[i],
                        border: isActive
                          ? `2px solid ${colors[i]}`
                          : '2px solid transparent',
                      }}
                      animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                      transition={{
                        duration: 1.5,
                        repeat: isActive ? Infinity : 0,
                      }}
                    >
                      {isDone ? '\u2713' : i + 1}
                    </motion.div>
                    {i < 2 && (
                      <div
                        className="w-6 h-0.5 rounded"
                        style={{
                          background: isDone
                            ? colors[i]
                            : 'rgba(51, 65, 85, 0.5)',
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Questions ── */}
      <AnimatePresence mode="wait">
        {step === 'financial' && (
          <motion.div
            key="financial"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
          >
            <Card padding="lg">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#22d3ee' }}
                />
                <span className="text-xs font-semibold text-[#22d3ee] uppercase tracking-wider">
                  Financial
                </span>
              </div>
              <QuickTapQuestion
                question="How do you feel about your spending today?"
                options={FINANCIAL_OPTIONS}
                accentColor="#22d3ee"
                selected={financial}
                onSelect={handleFinancial}
              />
            </Card>
          </motion.div>
        )}

        {step === 'emotional' && (
          <motion.div
            key="emotional"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
          >
            <Card padding="lg">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#34d399' }}
                />
                <span className="text-xs font-semibold text-[#34d399] uppercase tracking-wider">
                  Emotional
                </span>
              </div>
              <QuickTapQuestion
                question="How confident are you about your decisions?"
                options={EMOTIONAL_OPTIONS}
                accentColor="#34d399"
                selected={emotional}
                onSelect={handleEmotional}
              />
            </Card>
          </motion.div>
        )}

        {step === 'timing' && (
          <motion.div
            key="timing"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
          >
            <Card padding="lg">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#facc15' }}
                />
                <span className="text-xs font-semibold text-[#facc15] uppercase tracking-wider">
                  Timing
                </span>
              </div>
              <QuickTapQuestion
                question="Is today the right day to take action?"
                options={TIMING_OPTIONS}
                accentColor="#facc15"
                selected={timing}
                onSelect={handleTiming}
              />
            </Card>
          </motion.div>
        )}

        {step === 'complete' && insight && sentimentConfig && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="rounded-[var(--radius-lg)] p-6 backdrop-blur-[10px]"
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: `1px solid ${sentimentConfig.border}`,
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {insight.sentiment === 'positive'
                      ? '\u2728'
                      : insight.sentiment === 'mixed'
                        ? '\uD83D\uDCA1'
                        : '\uD83D\uDC99'}
                  </span>
                  <h3
                    className="text-lg font-bold"
                    style={{ color: sentimentConfig.color }}
                  >
                    Today&apos;s Insight
                  </h3>
                </div>
                <Badge
                  variant={
                    insight.sentiment === 'positive'
                      ? 'success'
                      : insight.sentiment === 'mixed'
                        ? 'warning'
                        : 'danger'
                  }
                  dot
                >
                  {sentimentConfig.label}
                </Badge>
              </div>

              {/* Responses summary */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  {
                    label: 'Financial',
                    value: financial,
                    color: '#22d3ee',
                    opts: FINANCIAL_OPTIONS,
                  },
                  {
                    label: 'Emotional',
                    value: emotional,
                    color: '#34d399',
                    opts: EMOTIONAL_OPTIONS,
                  },
                  {
                    label: 'Timing',
                    value: timing,
                    color: '#facc15',
                    opts: TIMING_OPTIONS,
                  },
                ].map((dim) => {
                  const opt = dim.opts.find(
                    (o: { value: string }) => o.value === dim.value,
                  );
                  return (
                    <div
                      key={dim.label}
                      className="text-center p-3 rounded-[var(--radius-md)]"
                      style={{ background: `${dim.color}10` }}
                    >
                      <p className="text-lg">{opt?.emoji}</p>
                      <p
                        className="text-xs font-medium mt-1"
                        style={{ color: dim.color }}
                      >
                        {opt?.label}
                      </p>
                      <p className="text-[10px] text-[#94a3b8] mt-0.5">
                        {dim.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Insight message */}
              <div
                className="rounded-[var(--radius-md)] p-4 mb-4"
                style={{ background: sentimentConfig.bg }}
              >
                <p className="text-sm text-[#e2e8f0] leading-relaxed">
                  {insight.message}
                </p>
              </div>

              {/* Tip */}
              <div className="rounded-[var(--radius-md)] p-4 bg-[rgba(34,211,238,0.05)] border border-[rgba(34,211,238,0.15)]">
                <p className="text-sm font-medium text-[#22d3ee] mb-1">
                  Quick Tip
                </p>
                <p className="text-sm text-[#94a3b8] leading-relaxed">
                  {insight.tip}
                </p>
              </div>

              {/* Redo button */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={handleDoAgain}
                  className="text-sm text-[#94a3b8] hover:text-[#22d3ee] transition-colors cursor-pointer"
                >
                  Check in again
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Streak & History ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        className="space-y-6"
      >
        {/* Streak Card */}
        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#e2e8f0] mb-1">
                Check-in Streak
              </h3>
              <p className="text-xs text-[#94a3b8]">
                Consistency builds financial awareness
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[#facc15]">
                {streak || mockHistory.length > 0 ? Math.max(streak, 7) : 0}
              </p>
              <p className="text-xs text-[#94a3b8]">days</p>
            </div>
          </div>
          {/* Mini streak bar */}
          <div className="flex gap-1 mt-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-1.5 rounded-full"
                style={{
                  background:
                    i < Math.max(streak, 7)
                      ? '#facc15'
                      : 'rgba(51, 65, 85, 0.5)',
                }}
              />
            ))}
          </div>
        </Card>

        {/* Calendar Heatmap */}
        <Card padding="md">
          <CalendarHeatmap entries={mockHistory} />
        </Card>
      </motion.div>

      {/* ── About Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.45, ease: 'easeOut' }}
      >
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-[#e2e8f0] mb-4 flex items-center gap-2">
            <span className="text-xl" role="img" aria-label="brain">
              &#x1F9E0;
            </span>
            About the Daily Money Minute
          </h3>
          <div className="space-y-3 text-[#94a3b8] text-sm leading-relaxed">
            <p>
              Research shows that brief, consistent financial check-ins build
              stronger money awareness than occasional deep dives. The Daily
              Money Minute takes just 60 seconds to assess your readiness across
              three dimensions.
            </p>
            <p>
              <span className="text-[#22d3ee]">Financial feeling</span> tracks
              your spending comfort.{' '}
              <span className="text-[#34d399]">Emotional confidence</span>{' '}
              measures decision clarity.{' '}
              <span className="text-[#facc15]">Timing readiness</span> gauges
              whether now is the right moment to act.
            </p>
            <p>
              Over time, <BrandedName /> uses these patterns to help you
              recognize when you&apos;re in the best position to make important
              financial decisions.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
