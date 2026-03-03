import { z } from 'zod'

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  avatar_url: z.string().url().nullable().optional(),
})

export const updateNotificationPreferencesSchema = z.object({
  email_verdicts: z.boolean().optional(),
  email_nurture: z.boolean().optional(),
  email_product: z.boolean().optional(),
  in_app: z.boolean().optional(),
})

export const deleteAccountSchema = z.object({
  confirmation: z.literal('DELETE'),
  reason: z.string().optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type UpdateNotificationPreferencesInput = z.infer<typeof updateNotificationPreferencesSchema>
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>
