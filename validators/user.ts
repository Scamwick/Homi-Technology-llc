import { z } from 'zod'

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  avatar_url: z.string().url().nullable().optional(),
})

export const notificationPreferencesSchema = z.object({
  email_verdicts: z.boolean(),
  email_nurture: z.boolean(),
  email_product: z.boolean(),
  email_couples: z.boolean(),
})
