/**
 * Partner API Key Management
 * 
 * Handles generation, validation, and revocation of partner API keys
 * for white-label access to HōMI assessment capabilities.
 */

import { createHash, randomBytes } from 'crypto'

export interface PartnerApiKey {
  id: string
  partnerId: string
  name: string
  keyHash: string
  keyPrefix: string
  permissions: string[]
  rateLimit: number
  createdAt: string
  expiresAt: string | null
  lastUsedAt: string | null
  isActive: boolean
}

export interface Partner {
  id: string
  name: string
  email: string
  website: string | null
  branding: {
    logoUrl: string | null
    primaryColor: string | null
    companyName: string | null
  }
  webhookUrl: string | null
  createdAt: string
  status: 'active' | 'suspended' | 'inactive'
}

/**
 * Generate a new API key
 * Returns the raw key (to be shown once) and the hashed version (to be stored)
 */
export function generateApiKey(): { rawKey: string; keyHash: string; keyPrefix: string } {
  const rawKey = `homi_partner_${randomBytes(32).toString('hex')}`
  const keyHash = hashApiKey(rawKey)
  const keyPrefix = rawKey.substring(0, 16) + '...'

  return { rawKey, keyHash, keyPrefix }
}

/**
 * Hash an API key for secure storage
 */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

/**
 * Validate an API key against a stored hash
 */
export function validateApiKey(providedKey: string, storedHash: string): boolean {
  const providedHash = hashApiKey(providedKey)
  return providedHash === storedHash
}

/**
 * Default permissions for partner API keys
 */
export const DEFAULT_PARTNER_PERMISSIONS = [
  'assessments:create',
  'assessments:read',
  'assessments:submit',
  'results:read',
  'webhooks:receive',
]

/**
 * Extended permissions for premium partners
 */
export const PREMIUM_PARTNER_PERMISSIONS = [
  ...DEFAULT_PARTNER_PERMISSIONS,
  'assessments:customize',
  'branding:customize',
  'analytics:read',
  'users:manage',
]

/**
 * Check if a partner has a specific permission
 */
export function hasPermission(partnerKey: PartnerApiKey, permission: string): boolean {
  return partnerKey.permissions.includes(permission) || partnerKey.permissions.includes('*')
}

/**
 * Rate limit check (simplified - would use Redis in production)
 */
export function checkRateLimit(
  partnerKey: PartnerApiKey,
  requestCount: number,
  windowStart: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute window
  
  // Reset window if expired
  if (now - windowStart > windowMs) {
    return { allowed: true, remaining: partnerKey.rateLimit - 1, resetAt: now + windowMs }
  }

  const remaining = partnerKey.rateLimit - requestCount
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    resetAt: windowStart + windowMs,
  }
}
