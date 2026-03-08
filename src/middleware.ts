import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/pricing',
  '/about',
  '/terms',
  '/privacy',
  '/disclaimer',
  '/auth',
  '/api/og',
  '/api/webhooks',
]

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/assessments',
  '/advisor',
  '/couples',
  '/settings',
  '/transformation',
  '/reports',
  '/admin',
  '/partner',
]

// Admin-only routes
const adminRoutes = ['/admin']

// Partner-only routes
const partnerRoutes = ['/partner']

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // Check if route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Check if route is admin-only
  const isAdminRoute = adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Check if route is partner-only
  const isPartnerRoute = partnerRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // If no session and trying to access protected route, redirect to login
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If has session, check profile for onboarding and role
  if (session) {
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('onboarding_completed, role')
      .eq('id', session.user.id)
      .single()

    // Onboarding gate: if not completed, only allow onboarding and settings
    if (profile && !(profile as any).onboarding_completed) {
      const allowedRoutes = ['/onboarding', '/settings', '/auth/logout', '/api']
      const isAllowed = allowedRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
      )

      if (!isAllowed && !isPublicRoute) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }

    // If onboarding completed, redirect away from onboarding
    if (profile?.onboarding_completed && pathname === '/onboarding') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Admin route check
    if (isAdminRoute && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Partner route check
    if (isPartnerRoute && profile?.role !== 'partner' && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Redirect authenticated users away from auth pages
    if (pathname.startsWith('/auth/') && !pathname.includes('/callback')) {
      const redirectTo = request.nextUrl.searchParams.get('redirect') || '/dashboard'
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
