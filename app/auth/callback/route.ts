import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * GET /auth/callback
 *
 * Handles the Supabase auth callback after email verification, OAuth,
 * or magic-link sign-in. Supports both:
 *   - PKCE flow: `?code=...`
 *   - Token hash flow: `?token_hash=...&type=signup|recovery|invite`
 *
 * Exchanges the credential for a persistent session and redirects the
 * user to /dashboard (or the `next` query param if provided).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as
    | 'signup'
    | 'recovery'
    | 'invite'
    | 'magiclink'
    | 'email'
    | null;
  const next = searchParams.get('next') ?? '/dashboard';

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Cookies may be read-only in certain edge cases.
          }
        },
      },
    },
  );

  let error: unknown = null;

  if (code) {
    // PKCE flow — exchange authorization code for session
    const result = await supabase.auth.exchangeCodeForSession(code);
    error = result.error;
  } else if (tokenHash && type) {
    // Token hash flow — verify OTP from email link
    const result = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    error = result.error;
  } else {
    // No valid auth parameters
    error = new Error('Missing auth callback parameters');
  }

  if (!error) {
    // Successful verification — redirect to intended destination
    const forwardUrl = next.startsWith('/')
      ? `${origin}${next}`
      : `${origin}/dashboard`;

    // For password recovery, redirect to reset-password page
    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/auth/reset-password`);
    }

    return NextResponse.redirect(forwardUrl);
  }

  // Verification failed — redirect to login with error hint
  console.error('[Auth Callback] Error:', error);
  return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`);
}
