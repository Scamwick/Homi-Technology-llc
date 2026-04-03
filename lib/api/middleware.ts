import { NextRequest, NextResponse } from 'next/server'

type ApiContext = {
  user?: { id: string; email: string; role: string; tier: string }
  partner?: { id: string; company_name: string }
}

type ApiHandler = (req: NextRequest, ctx: ApiContext) => Promise<NextResponse>

/**
 * withAuth -- Requires authenticated user.
 * Extracts Supabase session from request.
 * If no session -> 401 { error: 'Authentication required' }
 * If session -> passes user to handler via context.
 */
export function withAuth(handler: ApiHandler): (req: NextRequest) => Promise<NextResponse> {
  return async (req) => {
    // If Supabase not configured (dev mode), pass mock user
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return handler(req, {
        user: { id: 'dev-user', email: 'dev@test.com', role: 'user', tier: 'pro' },
      })
    }

    // TODO: Extract real Supabase session
    // For now, pass mock user
    return handler(req, {
      user: { id: 'dev-user', email: 'dev@test.com', role: 'user', tier: 'pro' },
    })
  }
}

/**
 * withSubscription -- Checks subscription tier.
 * Tier hierarchy: free < plus < pro < family
 */
export function withSubscription(requiredTier: string, handler: ApiHandler): ApiHandler {
  const tierOrder = ['free', 'plus', 'pro', 'family']

  return async (req, ctx) => {
    const userTierIndex = tierOrder.indexOf(ctx.user?.tier || 'free')
    const requiredIndex = tierOrder.indexOf(requiredTier)

    if (userTierIndex < requiredIndex) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UPGRADE_REQUIRED',
            message: `This feature requires ${requiredTier} tier or above`,
          },
        },
        { status: 403 }
      )
    }

    return handler(req, ctx)
  }
}

/**
 * withRateLimit -- Rate limiting per user or IP.
 * Uses in-memory Map for dev (TODO: Redis/Upstash for production).
 */
export function withRateLimit(
  config: { maxRequests: number; windowMs: number; keyBy: 'user' | 'ip' },
  handler: ApiHandler
): ApiHandler {
  const requests = new Map<string, { count: number; resetAt: number }>()

  return async (req, ctx) => {
    const key =
      config.keyBy === 'user'
        ? (ctx.user?.id || 'anon')
        : (req.headers.get('x-forwarded-for') || 'unknown')

    const now = Date.now()
    const record = requests.get(key)

    if (record && record.resetAt > now) {
      if (record.count >= config.maxRequests) {
        const retryAfter = Math.ceil((record.resetAt - now) / 1000)
        return NextResponse.json(
          {
            success: false,
            error: { code: 'RATE_LIMITED', message: 'Rate limit exceeded' },
          },
          { status: 429, headers: { 'Retry-After': String(retryAfter) } }
        )
      }
      record.count++
    } else {
      requests.set(key, { count: 1, resetAt: now + config.windowMs })
    }

    return handler(req, ctx)
  }
}

/**
 * withAdmin -- Requires admin role.
 */
export function withAdmin(handler: ApiHandler): ApiHandler {
  return async (req, ctx) => {
    if (ctx.user?.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Admin access required' },
        },
        { status: 403 }
      )
    }
    return handler(req, ctx)
  }
}

/**
 * withPartnerAuth -- For B2B API routes. Validates x-api-key header.
 */
export function withPartnerAuth(handler: ApiHandler): (req: NextRequest) => Promise<NextResponse> {
  return async (req) => {
    const apiKey = req.headers.get('x-api-key')

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'API_KEY_REQUIRED', message: 'x-api-key header is required' },
        },
        { status: 401 }
      )
    }

    // TODO: Validate against partners table
    return handler(req, {
      partner: { id: 'dev-partner', company_name: 'Dev Partner' },
    })
  }
}
