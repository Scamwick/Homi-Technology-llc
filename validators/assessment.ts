import { z } from 'zod'

export const createAssessmentSchema = z.object({
  decision_type: z.enum(['home_buying', 'car_purchase', 'career_change', 'business_launch', 'investment', 'education', 'retirement', 'other']),
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

// Scoring input validation
export const scoringInputSchema = z.object({
  financial: z.object({
    annualIncome: z.number().min(0),
    monthlyDebt: z.number().min(0),
    downPaymentSaved: z.number().min(0),
    targetPrice: z.number().min(0),
    emergencyFundMonths: z.number().min(0),
    creditScore: z.number().min(300).max(850),
  }),
  emotional: z.object({
    lifeStability: z.number().min(1).max(10),
    confidenceLevel: z.number().min(1).max(10),
    partnerAlignment: z.number().min(1).max(10).nullable(),
    fomoLevel: z.number().min(1).max(10),
  }),
  timing: z.object({
    timeHorizonMonths: z.number().min(0),
    monthlySavingsRate: z.number().min(0).max(100),
    progressPercent: z.number().min(0).max(100),
  }),
})
