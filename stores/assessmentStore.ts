import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  AssessmentInputs,
  FinancialInputs,
  EmotionalInputs,
  TimingInputs,
  AssessmentResult,
  AssessmentSummary,
} from '@/types/assessment';

// ---------------------------------------------------------------------------
// Step Management
// ---------------------------------------------------------------------------

export type DecisionType =
  | 'home'
  | 'car'
  | 'business'
  | 'career'
  | 'investment'
  | 'education'
  | 'retirement'
  | 'other';

export type AssessmentStep =
  | 'idle'
  | 'financial'
  | 'emotional'
  | 'timing'
  | 'processing'
  | 'results';

const STEP_ORDER: AssessmentStep[] = [
  'idle',
  'financial',
  'emotional',
  'timing',
  'processing',
  'results',
];

/** Map step to 0-indexed position for ProgressDots (only the 3 user-facing steps). */
export function stepToIndex(step: AssessmentStep): number {
  switch (step) {
    case 'financial':
      return 0;
    case 'emotional':
      return 1;
    case 'timing':
      return 2;
    default:
      return 0;
  }
}

// ---------------------------------------------------------------------------
// Default Inputs
// ---------------------------------------------------------------------------

const DEFAULT_FINANCIAL: FinancialInputs = {
  annualIncome: 0,
  monthlyDebt: 0,
  downPaymentSaved: 0,
  targetHomePrice: 0,
  emergencyFundMonths: 4.5,
  creditScore: 720,
};

const DEFAULT_EMOTIONAL: EmotionalInputs = {
  lifeStability: 5,
  confidenceLevel: 5,
  partnerAlignment: 5,
  fomoLevel: 5,
};

const DEFAULT_TIMING: TimingInputs = {
  timeHorizonMonths: 9,
  monthlySavingsRate: 10,
  downPaymentProgress: 25,
};

// ---------------------------------------------------------------------------
// State & Action Types
// ---------------------------------------------------------------------------

interface AssessmentState {
  currentStep: AssessmentStep;
  /** Sub-question index within the current step (for mobile one-at-a-time). */
  questionIndex: number;
  /** The type of decision being assessed. */
  decisionType: DecisionType;
  financial: FinancialInputs;
  emotional: EmotionalInputs;
  timing: TimingInputs;
  /** Whether the user is doing this solo (skips partner alignment). */
  isSolo: boolean;
  /** The result object returned by POST /api/scoring. */
  currentResult: AssessmentResult | null;
  /** Assessment history summaries. */
  history: AssessmentSummary[];
  submitting: boolean;
  error: string | null;
}

interface AssessmentActions {
  // --- Field Updates ---
  setFinancial: <K extends keyof FinancialInputs>(
    key: K,
    value: FinancialInputs[K],
  ) => void;
  setEmotional: <K extends keyof EmotionalInputs>(
    key: K,
    value: EmotionalInputs[K],
  ) => void;
  setTiming: <K extends keyof TimingInputs>(
    key: K,
    value: TimingInputs[K],
  ) => void;
  setSolo: (solo: boolean) => void;
  setDecisionType: (type: DecisionType) => void;

  // --- Navigation ---
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: AssessmentStep) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;

  // --- Lifecycle ---
  reset: () => void;
  submit: () => Promise<AssessmentResult>;
  setResult: (result: AssessmentResult) => void;
  addToHistory: (summary: AssessmentSummary) => void;
  setHistory: (history: AssessmentSummary[]) => void;

  // --- Computed ---
  getInputs: () => AssessmentInputs;
}

export type AssessmentStore = AssessmentState & AssessmentActions;

// ---------------------------------------------------------------------------
// Initial State
// ---------------------------------------------------------------------------

const initialState: AssessmentState = {
  currentStep: 'idle',
  questionIndex: 0,
  decisionType: 'home',
  financial: { ...DEFAULT_FINANCIAL },
  emotional: { ...DEFAULT_EMOTIONAL },
  timing: { ...DEFAULT_TIMING },
  isSolo: false,
  currentResult: null,
  history: [],
  submitting: false,
  error: null,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAssessmentStore = create<AssessmentStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // --- Field Updates ---

      setFinancial: (key, value) => {
        set(
          { financial: { ...get().financial, [key]: value } },
          false,
          'assessment/setFinancial',
        );
      },

      setEmotional: (key, value) => {
        set(
          { emotional: { ...get().emotional, [key]: value } },
          false,
          'assessment/setEmotional',
        );
      },

      setTiming: (key, value) => {
        set(
          { timing: { ...get().timing, [key]: value } },
          false,
          'assessment/setTiming',
        );
      },

      setDecisionType: (type) => {
        set({ decisionType: type }, false, 'assessment/setDecisionType');
      },

      setSolo: (solo) => {
        set(
          {
            isSolo: solo,
            emotional: {
              ...get().emotional,
              partnerAlignment: solo ? null : 5,
            },
          },
          false,
          'assessment/setSolo',
        );
      },

      // --- Navigation ---

      nextStep: () => {
        const { currentStep } = get();
        const idx = STEP_ORDER.indexOf(currentStep);
        if (idx < STEP_ORDER.length - 1) {
          set(
            { currentStep: STEP_ORDER[idx + 1], questionIndex: 0 },
            false,
            'assessment/nextStep',
          );
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        const idx = STEP_ORDER.indexOf(currentStep);
        if (idx > 1) {
          // Don't go back past 'financial' (index 1)
          set(
            { currentStep: STEP_ORDER[idx - 1], questionIndex: 0 },
            false,
            'assessment/prevStep',
          );
        }
      },

      goToStep: (step) => {
        set({ currentStep: step, questionIndex: 0 }, false, 'assessment/goToStep');
      },

      nextQuestion: () => {
        set(
          { questionIndex: get().questionIndex + 1 },
          false,
          'assessment/nextQuestion',
        );
      },

      prevQuestion: () => {
        const qi = get().questionIndex;
        if (qi > 0) {
          set({ questionIndex: qi - 1 }, false, 'assessment/prevQuestion');
        }
      },

      // --- Lifecycle ---

      reset: () => {
        set({ ...initialState, history: get().history }, false, 'assessment/reset');
      },

      submit: async () => {
        const state = get();
        set(
          { submitting: true, error: null, currentStep: 'processing' },
          false,
          'assessment/submit',
        );

        const inputs: AssessmentInputs = {
          financial: state.financial,
          emotional: {
            ...state.emotional,
            partnerAlignment: state.isSolo ? null : state.emotional.partnerAlignment,
          },
          timing: state.timing,
        };

        try {
          const response = await fetch('/api/scoring', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inputs),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(
              errorData?.error ?? `Scoring failed (${response.status})`,
            );
          }

          const result: AssessmentResult = await response.json();

          const summary: AssessmentSummary = {
            id: result.id,
            overall: result.overall,
            verdict: result.verdict,
            confidenceBand: result.confidenceBand,
            crisisDetected: result.crisisDetected,
            createdAt: result.createdAt,
          };

          set(
            {
              currentResult: result,
              currentStep: 'results',
              history: [summary, ...state.history],
              submitting: false,
            },
            false,
            'assessment/submit/success',
          );

          return result;
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Submission failed';
          set(
            { error: message, currentStep: 'timing', submitting: false },
            false,
            'assessment/submit/error',
          );
          throw err;
        }
      },

      setResult: (result) => {
        set({ currentResult: result }, false, 'assessment/setResult');
      },

      addToHistory: (summary) => {
        set(
          { history: [summary, ...get().history] },
          false,
          'assessment/addToHistory',
        );
      },

      setHistory: (history) => {
        set({ history }, false, 'assessment/setHistory');
      },

      // --- Computed ---

      getInputs: () => {
        const state = get();
        return {
          financial: state.financial,
          emotional: {
            ...state.emotional,
            partnerAlignment: state.isSolo
              ? null
              : state.emotional.partnerAlignment,
          },
          timing: state.timing,
        };
      },
    }),
    { name: 'AssessmentStore' },
  ),
);
