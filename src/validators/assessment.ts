import { z } from 'zod'

export const createAssessmentSchema = z.object({
  decision_type: z.enum(['home_buying', 'career_change', 'investment', 'business_launch', 'major_purchase']),
})

export const submitResponseSchema = z.object({
  question_id: z.string().min(1),
  response_value: z.union([z.number(), z.string(), z.array(z.string())]),
  response_metadata: z.object({
    time_spent_ms: z.number().int().min(0),
    changes_made: z.number().int().min(0),
  }),
})

export const completeAssessmentSchema = z.object({
  assessment_id: z.string().uuid(),
})

export const assessmentFilterSchema = z.object({
  decision_type: z.enum(['home_buying', 'career_change', 'investment', 'business_launch', 'major_purchase']).optional(),
  status: z.enum(['in_progress', 'completed', 'expired']).optional(),
  verdict: z.enum(['ready', 'not_yet']).optional(),
  page: z.number().int().min(1).default(1),
  per_page: z.number().int().min(1).max(100).default(20),
})

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>
export type SubmitResponseInput = z.infer<typeof submitResponseSchema>
export type CompleteAssessmentInput = z.infer<typeof completeAssessmentSchema>
export type AssessmentFilterInput = z.infer<typeof assessmentFilterSchema>
