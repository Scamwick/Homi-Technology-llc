import { z } from 'zod'

export const signupSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/, 'Must contain uppercase').regex(/[0-9]/, 'Must contain number'),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const resetPasswordSchema = z.object({
  email: z.string().email(),
})

export const newPasswordSchema = z.object({
  password: z.string().min(8).regex(/[A-Z]/, 'Must contain uppercase').regex(/[0-9]/, 'Must contain number'),
})

export const magicLinkSchema = z.object({
  email: z.string().email(),
})

export const oauthCallbackSchema = z.object({
  code: z.string(),
  state: z.string().optional(),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type NewPasswordInput = z.infer<typeof newPasswordSchema>
export type MagicLinkInput = z.infer<typeof magicLinkSchema>
export type OAuthCallbackInput = z.infer<typeof oauthCallbackSchema>
