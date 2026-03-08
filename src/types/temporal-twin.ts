import type { VerdictType, DecisionType, DimensionType } from "./database"

export type TemporalHorizon = "5yr" | "10yr" | "retirement"

export interface TemporalMessage {
  horizon: TemporalHorizon
  futureAge: number
  content: string
  signature: string
  assessment_id: string
  generated_at: string
}

export interface TemporalTwinResult {
  messages: {
    fiveYear?: TemporalMessage
    tenYear?: TemporalMessage
    retirement?: TemporalMessage
  }
}

export interface TemporalContext {
  decisionType: DecisionType
  verdict: VerdictType
  overallScore: number
  financialScore: number
  emotionalScore: number
  timingScore: number
  mcMedian?: number
  strengths: string[]
  weaknesses: string[]
  transformationPriority?: DimensionType | null
}
