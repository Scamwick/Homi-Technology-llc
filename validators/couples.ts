import { z } from 'zod'

export const inviteCoupleSchema = z.object({
  partner_email: z.string().email(),
  message: z.string().max(500).optional(),
})

export const acceptInviteSchema = z.object({
  token: z.string().min(1),
})
