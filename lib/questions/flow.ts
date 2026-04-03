// =============================================================================
// lib/questions/flow.ts — Assessment Question Flow Engine
// =============================================================================
// Runtime that loads questions from the question bank, sequences them by
// dimension (financial -> emotional -> timing), handles navigation, and
// feeds responses to the scoring engine.
//
// This class is framework-agnostic. The React hook (useAssessmentFlow)
// wraps it with state management.
// =============================================================================

import type { Question, ResponseValue, Dimension } from './bank';
import {
  getQuestionsForDecisionType,
  DIMENSION_ORDER,
} from './bank';
import {
  scoreResponse,
  scoreDimension,
  scoreAssessment,
  type DimensionScoreResult,
  type AssessmentScoreSummary,
} from './scoring';

// ---------------------------------------------------------------------------
// Progress info
// ---------------------------------------------------------------------------

export interface FlowProgress {
  /** 1-indexed position of the current question in the full sequence. */
  current: number;
  /** Total number of questions in the flow. */
  total: number;
  /** Current question's dimension. */
  dimension: Dimension;
  /** 1-indexed position within the current dimension. */
  dimensionCurrent: number;
  /** Total questions in the current dimension. */
  dimensionTotal: number;
  /** Fraction complete (0-1) overall. */
  fraction: number;
  /** Fraction complete (0-1) within the current dimension. */
  dimensionFraction: number;
}

// ---------------------------------------------------------------------------
// AssessmentFlow
// ---------------------------------------------------------------------------

export class AssessmentFlow {
  private questions: Question[];
  private currentIndex: number = 0;
  private responses: Map<string, ResponseValue> = new Map();
  private skippedIds: Set<string> = new Set();
  private readonly decisionType: string;

  constructor(decisionType: string) {
    this.decisionType = decisionType;

    // Filter by decision type, then sort: dimension order first, then order_index
    const raw = getQuestionsForDecisionType(decisionType);

    // Sort by dimension order (financial=0, emotional=1, timing=2), then by order_index
    this.questions = raw.sort((a, b) => {
      const dimA = DIMENSION_ORDER.indexOf(a.dimension);
      const dimB = DIMENSION_ORDER.indexOf(b.dimension);
      if (dimA !== dimB) return dimA - dimB;
      return a.order_index - b.order_index;
    });
  }

  // -----------------------------------------------------------------------
  // Navigation
  // -----------------------------------------------------------------------

  /** Returns the current question, or null if the flow is complete. */
  getCurrentQuestion(): Question | null {
    if (this.currentIndex < 0 || this.currentIndex >= this.questions.length) {
      return null;
    }
    return this.questions[this.currentIndex];
  }

  /** Returns the current question index (0-based). */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /** Returns progress information for the current position. */
  getProgress(): FlowProgress {
    const total = this.questions.length;
    const current = Math.min(this.currentIndex + 1, total);

    const currentQuestion = this.getCurrentQuestion();
    const dimension: Dimension = currentQuestion?.dimension ?? 'financial';

    // Count questions in the current dimension
    const dimensionQuestions = this.questions.filter((q) => q.dimension === dimension);
    const dimensionTotal = dimensionQuestions.length;
    const dimensionCurrent = currentQuestion
      ? dimensionQuestions.indexOf(currentQuestion) + 1
      : dimensionTotal;

    return {
      current,
      total,
      dimension,
      dimensionCurrent,
      dimensionTotal,
      fraction: total > 0 ? (current - 1) / total : 0,
      dimensionFraction: dimensionTotal > 0 ? (dimensionCurrent - 1) / dimensionTotal : 0,
    };
  }

  /** Submits a response for a question and advances to the next. */
  submitResponse(questionId: string, value: ResponseValue): void {
    this.responses.set(questionId, value);
    this.skippedIds.delete(questionId);
  }

  /** Advances to the next unskipped question. Returns the next question or null. */
  goNext(): Question | null {
    if (this.currentIndex >= this.questions.length - 1) {
      // Move past the last question to indicate completion
      this.currentIndex = this.questions.length;
      return null;
    }

    this.currentIndex++;

    // Skip any questions marked as skipped
    while (
      this.currentIndex < this.questions.length &&
      this.skippedIds.has(this.questions[this.currentIndex].id)
    ) {
      this.currentIndex++;
    }

    return this.getCurrentQuestion();
  }

  /** Returns true if the user can navigate backward. */
  canGoBack(): boolean {
    return this.currentIndex > 0;
  }

  /** Moves to the previous unskipped question. Returns it or null. */
  goBack(): Question | null {
    if (!this.canGoBack()) return null;

    this.currentIndex--;

    // Skip backward over skipped questions
    while (
      this.currentIndex > 0 &&
      this.skippedIds.has(this.questions[this.currentIndex].id)
    ) {
      this.currentIndex--;
    }

    return this.getCurrentQuestion();
  }

  /** Navigates directly to a specific question by ID. Returns false if not found. */
  goToQuestion(questionId: string): boolean {
    const idx = this.questions.findIndex((q) => q.id === questionId);
    if (idx === -1) return false;
    this.currentIndex = idx;
    return true;
  }

  /** Returns true when all non-skipped questions have been answered. */
  isComplete(): boolean {
    return this.questions.every(
      (q) => this.responses.has(q.id) || this.skippedIds.has(q.id)
    );
  }

  /** Returns true when the current index is past the last question. */
  isPastEnd(): boolean {
    return this.currentIndex >= this.questions.length;
  }

  // -----------------------------------------------------------------------
  // Skip
  // -----------------------------------------------------------------------

  /** Marks a question as skipped (for optional questions). */
  skipQuestion(questionId: string): void {
    this.skippedIds.add(questionId);
    // Remove any existing response
    this.responses.delete(questionId);
  }

  /** Unmarks a question as skipped. */
  unskipQuestion(questionId: string): void {
    this.skippedIds.delete(questionId);
  }

  /** Returns the set of skipped question IDs. */
  getSkippedIds(): Set<string> {
    return new Set(this.skippedIds);
  }

  // -----------------------------------------------------------------------
  // Responses
  // -----------------------------------------------------------------------

  /** Returns all collected responses. */
  getResponses(): Map<string, ResponseValue> {
    return new Map(this.responses);
  }

  /** Returns the response for a specific question, or undefined. */
  getResponse(questionId: string): ResponseValue | undefined {
    return this.responses.get(questionId);
  }

  /** Returns whether a specific question has been answered. */
  hasResponse(questionId: string): boolean {
    return this.responses.has(questionId);
  }

  /** Clears all responses and resets to the first question. */
  reset(): void {
    this.responses.clear();
    this.skippedIds.clear();
    this.currentIndex = 0;
  }

  // -----------------------------------------------------------------------
  // Questions
  // -----------------------------------------------------------------------

  /** Returns all questions in the flow. */
  getAllQuestions(): Question[] {
    return [...this.questions];
  }

  /** Returns all questions for a specific dimension. */
  getDimensionQuestions(dimension: Dimension): Question[] {
    return this.questions.filter((q) => q.dimension === dimension);
  }

  /** Returns the total number of questions. */
  getTotalQuestions(): number {
    return this.questions.length;
  }

  /** Returns the number of answered questions. */
  getAnsweredCount(): number {
    return this.responses.size;
  }

  // -----------------------------------------------------------------------
  // Scoring (delegates to scoring module)
  // -----------------------------------------------------------------------

  /** Scores a single response for a given question. */
  scoreQuestion(questionId: string): number | null {
    const question = this.questions.find((q) => q.id === questionId);
    if (!question) return null;

    const response = this.responses.get(questionId);
    if (response === undefined) return null;

    return scoreResponse(question, response);
  }

  /** Computes the score for a single dimension based on current responses. */
  scoreDimension(dimension: Dimension): DimensionScoreResult {
    const dimensionQuestions = this.getDimensionQuestions(dimension);
    return scoreDimension(dimensionQuestions, this.responses);
  }

  /** Computes the full assessment score summary across all dimensions. */
  scoreAll(): AssessmentScoreSummary {
    return scoreAssessment(this.questions, this.responses);
  }
}
