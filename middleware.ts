import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/* ─────────────────────────────────────────────────────────────────────────────
 * Route classification
 *
 * PUBLIC_ROUTES  — accessible without authentication.
 * AUTH_ROUTES    — login/signup pages that authenticated users should skip.
 * Everything else inside the matcher is a PROTECTED route.
 * ────────────────────────────────────────────────────────────────────────── */

const PUBLIC_ROUTES = new Set([
  '/',
  '/about',
  '/pricing',
  '/homi-score',
  '/terms',
  '/privacy',
  '/disclaimer',
]);

/** Prefixes that are always public (e.g. /auth/callback, /auth/confirm). */
const PUBLIC_PREFIXES = ['/auth/'];

/** Auth pages — authenticated users get redirected away from these. */
const AUTH_ROUTES = new Set(['/auth/login', '/auth/signup']);

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/* ─────────────────────────────────────────────────────────────────────────── */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If Supabase isn't configured, skip auth entirely (development mode)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  const { supabaseResponse, user } = await updateSession(request);

  // Authenticated users hitting login/signup → redirect to dashboard
  if (user && AUTH_ROUTES.has(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Onboarding gate — authenticated users who haven't completed onboarding
  // get redirected to /onboarding (except if already on /onboarding or /auth).
  if (
    user &&
    !isPublicRoute(pathname) &&
    pathname !== '/onboarding' &&
    !pathname.startsWith('/api/')
  ) {
    // Read onboarding_completed from the response cookie-based session.
    // We do a lightweight check: the app layout and ProfileProvider handle
    // the full redirect for edge cases, but middleware catches the common path.
    const { createServerClient } = await import('@supabase/ssr');
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // No-op for reads in middleware
          },
        },
      },
    );
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single();

    if (profile && profile.onboarding_completed === false) {
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }
  }

  // Unauthenticated users on a protected route → redirect to login
  if (!user && !isPublicRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    // Preserve the originally requested URL so we can redirect back after login
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Matcher — run middleware on everything except static assets and internals.
 * ────────────────────────────────────────────────────────────────────────── */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image  (image optimization)
     * - favicon.ico  (favicon)
     * - public folder assets (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|opengraph-image|twitter-image|icon|apple-icon|api/og|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
