'use client';

// =============================================================================
// hooks/useAssessmentFlow.ts — React Hook for Assessment Flow Engine
// =============================================================================
// Wraps the AssessmentFlow class with React state management. Provides
// reactive access to the current question, progress, scoring, and navigation.
// =============================================================================

import { useState, useCallback, useMemo, useRef } from 'react';
import { AssessmentFlow } from '@/lib/questions/flow';
import type { FlowProgress } from '@/lib/questions/flow';
import type { Question, ResponseValue, Dimension } from '@/lib/questions/bank';
import type {
  DimensionScoreResult,
  AssessmentScoreSummary,
} from '@/lib/questions/scoring';

// ---------------------------------------------------------------------------
// Hook return type
// ---------------------------------------------------------------------------

export interface UseAssessmentFlowReturn {
  /** The current question to display, or null when the flow is complete. */
  currentQuestion: Question | null;

  /** Progress information (current position, dimension, fractions). */
  progress: FlowProgress;

  /** Submit a response for the current question and advance. */
  submitResponse: (questionId: string, value: ResponseValue) => void;

  /** Navigate to the previous question. */
  goBack: () => void;

  /** Navigate to the next question (without submitting a response). */
  goNext: () => void;

  /** Whether the user can go back. */
  canGoBack: boolean;

  /** Whether all questions have been answered or skipped. */
  isComplete: boolean;

  /** Whether the flow has advanced past the final question. */
  isPastEnd: boolean;

  /** Skip the current question and advance. */
  skipQuestion: (questionId: string) => void;

  /** Navigate directly to a question by ID. */
  goToQuestion: (questionId: string) => boolean;

  /** Get the response for a specific question. */
  getResponse: (questionId: string) => ResponseValue | undefined;

  /** All responses collected so far. */
  responses: Map<string, ResponseValue>;

  /** Number of answered questions. */
  answeredCount: number;

  /** Real-time score preview for a single dimension. */
  getDimensionScore: (dimension: Dimension) => DimensionScoreResult;

  /** Real-time full assessment score preview (all dimensions). */
  assessmentScore: AssessmentScoreSummary;

  /** Score for the current question's response, or null. */
  currentQuestionScore: number | null;

  /** All questions for a specific dimension. */
  getDimensionQuestions: (dimension: Dimension) => Question[];

  /** Reset the flow to the beginning. */
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAssessmentFlow(decisionType: string): UseAssessmentFlowReturn {
  // The flow instance is stable for the lifetime of the hook (given the same
  // decisionType). We use a ref to hold it and state to trigger re-renders.
  const flowRef = useRef<AssessmentFlow | null>(null);

  // Initialize or re-initialize if decisionType changes
  if (flowRef.current === null) {
    flowRef.current = new AssessmentFlow(decisionType);
  }

  const flow = flowRef.current;

  // A counter used purely to trigger re-renders when the flow state changes.
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick((t) => t + 1), []);

  // -----------------------------------------------------------------------
  // Derived state (computed on every render, cheap)
  // -----------------------------------------------------------------------

  const currentQuestion = flow.getCurrentQuestion();
  const progress = flow.getProgress();
  const canGoBack = flow.canGoBack();
  const isComplete = flow.isComplete();
  const isPastEnd = flow.isPastEnd();
  const responses = flow.getResponses();
  const answeredCount = flow.getAnsweredCount();

  // -----------------------------------------------------------------------
  // Scoring (memoized on answeredCount to avoid excessive recalculation)
  // -----------------------------------------------------------------------

  const assessmentScore = useMemo(
    () => flow.scoreAll(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answeredCount]
  );

  const currentQuestionScore = useMemo(() => {
    if (!currentQuestion) return null;
    return flow.scoreQuestion(currentQuestion.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion?.id, answeredCount]);

  // -----------------------------------------------------------------------
  // Actions
  // -----------------------------------------------------------------------

  const submitResponse = useCallback(
    (questionId: string, value: ResponseValue) => {
      flow.submitResponse(questionId, value);
      flow.goNext();
      rerender();
    },
    [flow, rerender]
  );

  const goBack = useCallback(() => {
    flow.goBack();
    rerender();
  }, [flow, rerender]);

  const goNext = useCallback(() => {
    flow.goNext();
    rerender();
  }, [flow, rerender]);

  const skipQuestion = useCallback(
    (questionId: string) => {
      flow.skipQuestion(questionId);
      flow.goNext();
      rerender();
    },
    [flow, rerender]
  );

  const goToQuestion = useCallback(
    (questionId: string): boolean => {
      const result = flow.goToQuestion(questionId);
      if (result) rerender();
      return result;
    },
    [flow, rerender]
  );

  const getResponse = useCallback(
    (questionId: string): ResponseValue | undefined => {
      return flow.getResponse(questionId);
    },
    [flow]
  );

  const getDimensionScore = useCallback(
    (dimension: Dimension): DimensionScoreResult => {
      return flow.scoreDimension(dimension);
    },
    [flow]
  );

  const getDimensionQuestions = useCallback(
    (dimension: Dimension): Question[] => {
      return flow.getDimensionQuestions(dimension);
    },
    [flow]
  );

  const reset = useCallback(() => {
    flow.reset();
    rerender();
  }, [flow, rerender]);

  return {
    currentQuestion,
    progress,
    submitResponse,
    goBack,
    goNext,
    canGoBack,
    isComplete,
    isPastEnd,
    skipQuestion,
    goToQuestion,
    getResponse,
    responses,
    answeredCount,
    getDimensionScore,
    assessmentScore,
    currentQuestionScore,
    getDimensionQuestions,
    reset,
  };
}
