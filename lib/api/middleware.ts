import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type ApiContext = {
  user?: { id: string; email: string; role: string; tier: string }
  partner?: { id: string; company_name: string }
}

type ApiHandler = (req: NextRequest, ctx: ApiContext) => Promise<NextResponse>

/**
 * withAuth -- Requires authenticated user.
 * Extracts Supabase session from request cookies.
 * If no session -> 401 { error: 'Authentication required' }
 * If session -> passes user to handler via context.
 */
export function withAuth(handler: ApiHandler): (req: NextRequest) => Promise<NextResponse> {
  return async (req) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_CONFIGURED', message: 'Supabase is not configured' } },
        { status: 503 },
      )
    }

    const supabase = await createClient()
    const { data: { user: authUser }, error } = await supabase.auth.getUser()

    if (error || !authUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 },
      )
    }

    // Fetch profile for role and subscription tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, subscription_tier')
      .eq('id', authUser.id)
      .single()

    return handler(req, {
      user: {
        id: authUser.id,
        email: authUser.email ?? '',
        role: profile?.role ?? 'user',
        tier: profile?.subscription_tier ?? 'free',
      },
    })
  }
}

/**
 * withSubscription -- Checks subscription tier.
 * ceo_founder and admin roles bypass all tier checks.
 * Tier hierarchy: free < plus < pro < family; enterprise_free < enterprise_paid
 */
export function withSubscription(requiredTier: string, handler: ApiHandler): ApiHandler {
  const tierOrder = ['free', 'plus', 'pro', 'family']
  const enterpriseTierOrder = ['enterprise_free', 'enterprise_paid']

  return async (req, ctx) => {
    const role = ctx.user?.role || 'user'

    // ceo_founder and admin bypass all paywalls
    if (role === 'ceo_founder' || role === 'admin') {
      return handler(req, ctx)
    }

    const userTier = ctx.user?.tier || 'free'

    // Enterprise tiers: enterprise_paid gets everything, enterprise_free is limited
    if (enterpriseTierOrder.includes(userTier)) {
      if (userTier === 'enterprise_paid') {
        return handler(req, ctx)
      }
      // enterprise_free only gets free-level access
      const requiredIndex = tierOrder.indexOf(requiredTier)
      if (requiredIndex > 0) {
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

    // Standard individual tier check
    const userTierIndex = tierOrder.indexOf(userTier)
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
 * withAdmin -- Requires admin or ceo_founder role.
 */
export function withAdmin(handler: ApiHandler): ApiHandler {
  return async (req, ctx) => {
    if (ctx.user?.role !== 'admin' && ctx.user?.role !== 'ceo_founder') {
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
 * withPartnerAuth -- For B2B API routes. Validates x-api-key header against organizations table.
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

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_CONFIGURED', message: 'Supabase is not configured' } },
        { status: 503 },
      )
    }

    const supabase = await createClient()
    const { data: org } = await supabase
      .from('organizations')
      .select('id, company_name')
      .eq('api_key', apiKey)
      .eq('status', 'active')
      .single()

    if (!org) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_API_KEY', message: 'Invalid or inactive API key' },
        },
        { status: 401 }
      )
    }

    return handler(req, {
      partner: { id: org.id, company_name: org.company_name },
    })
  }
}
