export { getPlaidClient } from './server';
export { getPlaidClientId, PLAID_PRODUCTS, PLAID_COUNTRY_CODES, PLAID_LANGUAGE } from './client';
export { mapTransactionToEvent, mapTransactionsToEvents } from './mapping';
export { deriveFinancialMetrics, computeCoupleAlignment, estimateReadinessCountdown } from './insights';
export type { FinancialMetrics, DangerZone, SubscriptionItem, TransactionAnomaly, ReadinessMilestone, CoupleAlignment } from './insights';
export { DECISION_TEMPLATES, analyzeDecisionReadiness, rehearseDecision } from './decisions';
export type { DecisionType, DecisionAnalysis, DecisionRehearsalResult, DecisionTemplate } from './decisions';
