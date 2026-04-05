/**
 * POST /api/plaid/create-link-token — Create Plaid Link Token
 * =============================================================
 *
 * Creates a Link token that the client uses to initialize Plaid Link.
 * Requires an authenticated user session.
 *
 * Response: { link_token: string, expiration: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { plaidClient, PLAID_PRODUCTS, PLAID_COUNTRY_CODES, isPlaidConfigured } from '@/lib/plaid/client';
import { createClient } from '@/lib/supabase/server';
import { Products, CountryCode } from 'plaid';

export async function POST(request: NextRequest) {
  if (!isPlaidConfigured()) {
    return NextResponse.json(
      { error: 'Plaid is not configured' },
      { status: 503 },
    );
  }

  // Authenticate user
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    );
  }

  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: user.id },
      client_name: 'HōMI',
      products: PLAID_PRODUCTS.map((p) => p as Products),
      country_codes: PLAID_COUNTRY_CODES.map((c) => c as CountryCode),
      language: 'en',
      webhook: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://homi.app'}/api/plaid/webhooks`,
    });

    return NextResponse.json({
      link_token: response.data.link_token,
      expiration: response.data.expiration,
    });
  } catch (error) {
    console.error('[Plaid Link] Token creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create link token' },
      { status: 500 },
    );
  }
}
