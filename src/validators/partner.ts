import { z } from 'zod'

export const createPartnerSchema = z.object({
  company_name: z.string().min(2).max(200),
  contact_email: z.string().email(),
  branding: z.object({
    logo_url: z.string().url(),
    primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    company_name: z.string().min(1),
    welcome_message: z.string().max(500),
  }),
  pricing_per_assessment: z.number().int().min(0),
  webhook_url: z.string().url().nullable().optional(),
  webhook_events: z.array(z.string()).optional(),
})

export const inviteClientSchema = z.object({
  email: z.string().email(),
  external_client_id: z.string().optional(),
  message: z.string().max(500).optional(),
})

export const updatePartnerSchema = z.object({
  company_name: z.string().min(2).max(200).optional(),
  contact_email: z.string().email().optional(),
  branding: z.object({
    logo_url: z.string().url().optional(),
    primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    company_name: z.string().min(1).optional(),
    welcome_message: z.string().max(500).optional(),
  }).optional(),
  pricing_per_assessment: z.number().int().min(0).optional(),
  webhook_url: z.string().url().nullable().optional(),
  webhook_events: z.array(z.string()).optional(),
  status: z.enum(['pending', 'active', 'suspended']).optional(),
})

export const partnerApiKeySchema = z.object({
  'x-api-key': z.string().min(1),
})

export type CreatePartnerInput = z.infer<typeof createPartnerSchema>
export type InviteClientInput = z.infer<typeof inviteClientSchema>
export type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>
export type PartnerApiKeyInput = z.infer<typeof partnerApiKeySchema>
