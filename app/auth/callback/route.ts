import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * GET /auth/callback
 *
 * Handles the Supabase auth callback after email verification, OAuth,
 * or magic-link sign-in. Exchanges the one-time `code` parameter for
 * a persistent session and redirects the user to /dashboard (or the
 * `next` query param if provided).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
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

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successful code exchange — redirect to the intended destination.
      const forwardUrl = next.startsWith('/') ? `${origin}${next}` : `${origin}/dashboard`;
      return NextResponse.redirect(forwardUrl);
    }
  }

  // If there is no code or the exchange failed, redirect to login with an
  // error hint so the login page can surface a message.
  return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`);
}
