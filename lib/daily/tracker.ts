/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Daily Money Minute Tracker
 *
 * Records 60-second daily check-ins across three dimensions (financial,
 * emotional, timing) and persists them in localStorage. Generates insights
 * and streak data for the Daily Money Minute feature.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FinancialFeeling = 'good' | 'okay' | 'worried';
export type EmotionalConfidence = 'strong' | 'thinking' | 'anxious';
export type TimingReady = 'yes' | 'not-yet' | 'no';

export interface DailyResponses {
  financial: FinancialFeeling;
  emotional: EmotionalConfidence;
  timing: TimingReady;
}

export type DailySentiment = 'positive' | 'mixed' | 'concerned';

export interface DailyInsight {
  sentiment: DailySentiment;
  message: string;
  tip: string;
}

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  responses: DailyResponses;
  insight: DailyInsight;
  timestamp: string; // ISO string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'homi_daily_checkins';

// Scoring: positive=2, neutral=1, negative=0
const FINANCIAL_SCORES: Record<FinancialFeeling, number> = {
  good: 2,
  okay: 1,
  worried: 0,
};

const EMOTIONAL_SCORES: Record<EmotionalConfidence, number> = {
  strong: 2,
  thinking: 1,
  anxious: 0,
};

const TIMING_SCORES: Record<TimingReady, number> = {
  yes: 2,
  'not-yet': 1,
  no: 0,
};

// ---------------------------------------------------------------------------
// Insight generation
// ---------------------------------------------------------------------------

function computeSentiment(responses: DailyResponses): DailySentiment {
  const total =
    FINANCIAL_SCORES[responses.financial] +
    EMOTIONAL_SCORES[responses.emotional] +
    TIMING_SCORES[responses.timing];

  if (total >= 5) return 'positive';
  if (total >= 3) return 'mixed';
  return 'concerned';
}

const INSIGHT_MESSAGES: Record<DailySentiment, string[]> = {
  positive: [
    'Your financial awareness is strong today. This clarity is your superpower.',
    "Great alignment across all dimensions. Trust this feeling \u2014 you're on track.",
    'When your finances, emotions, and timing all feel right, you can move with confidence.',
  ],
  mixed: [
    "Some uncertainty today is normal. The fact that you're checking in shows self-awareness.",
    "Mixed signals suggest it's a good day to observe rather than act on big decisions.",
    "You're somewhere in the middle \u2014 that's okay. Awareness is the first step to clarity.",
  ],
  concerned: [
    "Today feels heavy. That's valuable data \u2014 your instincts are telling you something.",
    'When all signals are cautious, the wisest move is often to pause and protect.',
    'Difficult days make for strong foundations. Give yourself permission to wait.',
  ],
};

const INSIGHT_TIPS: Record<DailySentiment, string[]> = {
  positive: [
    'Consider reviewing your goals while momentum is high.',
    'This could be a good day to make progress on a financial milestone.',
    'Write down what feels right today \u2014 reference it when things feel uncertain.',
  ],
  mixed: [
    'Try the 10-10-10 rule: How will this feel in 10 minutes, 10 months, 10 years?',
    'Journal for 5 minutes about what feels uncertain. Naming it reduces its power.',
    'Talk to someone you trust about the dimension that feels most unclear.',
  ],
  concerned: [
    'Avoid any non-essential financial decisions today. Tomorrow may feel different.',
    'Practice the 24-hour rule: no purchases over $50 until you sleep on it.',
    'Focus on one small win today \u2014 even checking in here counts.',
  ],
};

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

function loadEntries(): DailyEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DailyEntry[]) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: DailyEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Silently fail if localStorage is full
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function recordCheckIn(responses: DailyResponses): DailyInsight {
  const sentiment = computeSentiment(responses);
  const insight: DailyInsight = {
    sentiment,
    message: pickRandom(INSIGHT_MESSAGES[sentiment]),
    tip: pickRandom(INSIGHT_TIPS[sentiment]),
  };

  const today = new Date().toISOString().split('T')[0];
  const entries = loadEntries();

  // Replace today's entry if it exists, otherwise append
  const existingIndex = entries.findIndex((e) => e.date === today);
  const entry: DailyEntry = {
    date: today,
    responses,
    insight,
    timestamp: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.push(entry);
  }

  // Keep last 90 days only
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  const trimmed = entries.filter((e) => e.date >= cutoffStr);

  saveEntries(trimmed);
  return insight;
}

export function getStreak(): number {
  const entries = loadEntries();
  if (entries.length === 0) return 0;

  // Sort descending by date
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Streak must include today or yesterday
  if (sorted[0].date !== today && sorted[0].date !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(sorted[i - 1].date);
    const currDate = new Date(sorted[i].date);
    const diffDays = (prevDate.getTime() - currDate.getTime()) / 86400000;

    if (Math.round(diffDays) === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function getHistory(days: number): DailyEntry[] {
  const entries = loadEntries();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  return entries
    .filter((e) => e.date >= cutoffStr)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getTodayEntry(): DailyEntry | null {
  const today = new Date().toISOString().split('T')[0];
  const entries = loadEntries();
  return entries.find((e) => e.date === today) ?? null;
}

// ---------------------------------------------------------------------------
// Mock history generator (for demo purposes)
// ---------------------------------------------------------------------------

export function generateMockHistory(days: number): DailyEntry[] {
  const entries: DailyEntry[] = [];
  const financialOptions: FinancialFeeling[] = ['good', 'okay', 'worried'];
  const emotionalOptions: EmotionalConfidence[] = ['strong', 'thinking', 'anxious'];
  const timingOptions: TimingReady[] = ['yes', 'not-yet', 'no'];

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Bias toward positive (70% good/strong/yes)
    const bias = Math.random();
    const financial = bias > 0.3 ? 'good' : bias > 0.1 ? 'okay' : 'worried';
    const emotional = bias > 0.25 ? 'strong' : bias > 0.1 ? 'thinking' : 'anxious';
    const timing = bias > 0.35 ? 'yes' : bias > 0.15 ? 'not-yet' : 'no';

    // Skip some days randomly (~20% miss rate) except recent 7
    if (i > 7 && Math.random() < 0.2) continue;

    const responses: DailyResponses = {
      financial: financial as FinancialFeeling,
      emotional: emotional as EmotionalConfidence,
      timing: timing as TimingReady,
    };

    const sentiment = computeSentiment(responses);
    entries.push({
      date: dateStr,
      responses,
      insight: {
        sentiment,
        message: pickRandom(INSIGHT_MESSAGES[sentiment]),
        tip: pickRandom(INSIGHT_TIPS[sentiment]),
      },
      timestamp: date.toISOString(),
    });
  }

  return entries;
}
