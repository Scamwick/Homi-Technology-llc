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
  webhook_url: z.string().url().nullable().optional(),
  webhook_events: z.array(z.string()).optional(),
})

export const inviteClientSchema = z.object({
  email: z.string().email(),
  external_client_id: z.string().optional(),
  message: z.string().max(500).optional(),
})
