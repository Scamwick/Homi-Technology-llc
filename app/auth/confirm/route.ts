import { NextResponse } from 'next/server';

/**
 * GET /auth/confirm
 *
 * Redirects to /auth/callback, preserving all query parameters.
 * Supabase email templates sometimes use /auth/confirm as the
 * confirmation endpoint. This route ensures those links work by
 * forwarding to the main callback handler.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const callbackUrl = new URL('/auth/callback', url.origin);

  // Forward all query parameters
  url.searchParams.forEach((value, key) => {
    callbackUrl.searchParams.set(key, value);
  });

  return NextResponse.redirect(callbackUrl.toString());
}
