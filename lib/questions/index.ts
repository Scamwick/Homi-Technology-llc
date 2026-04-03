// =============================================================================
// lib/questions/index.ts — Barrel Export
// =============================================================================

// --- Question Bank ---
export {
  QUESTION_BANK,
  DIMENSION_ORDER,
  getQuestionsForDecisionType,
  getQuestionsByDimension,
} from './bank';

export type {
  Question,
  QuestionType,
  Dimension,
  ChoiceOption,
  SliderConfig,
  ResponseValue,
  ScoringFunction,
  LinearScaleScoring,
  InverseScaleScoring,
  OptionMapScoring,
  SliderDirectScoring,
  ThresholdScoring,
  ThresholdEntry,
} from './bank';

// --- Scoring ---
export {
  scoreResponse,
  scoreDimension,
  scoreAssessment,
} from './scoring';

export type {
  CategoryScore,
  DimensionScoreResult,
  AssessmentScoreSummary,
} from './scoring';

// --- Flow Engine ---
export { AssessmentFlow } from './flow';

export type { FlowProgress } from './flow';
