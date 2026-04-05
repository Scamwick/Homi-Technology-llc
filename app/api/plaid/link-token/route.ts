/**
 * POST /api/plaid/link-token — Create Plaid Link token
 * =====================================================
 *
 * Creates a Link token for the Plaid Link UI component.
 * Requires Plaid credentials to be configured.
 *
 * Returns: { success: boolean, data?: LinkTokenResponse, error?: { code, message } }
 */

import { NextResponse } from 'next/server';
import { getPlaidClient } from '@/lib/plaid/server';
import { withAuth } from '@/lib/api/middleware';
import { Products, CountryCode } from 'plaid';

export const POST = withAuth(async (_req, ctx) => {
  const client = getPlaidClient();

  if (!client) {
    return NextResponse.json(
      { success: false, error: { code: 'PLAID_NOT_CONFIGURED', message: 'Plaid credentials are not configured. Set PLAID_CLIENT_ID and PLAID_SECRET environment variables.' } },
      { status: 503 },
    );
  }

  try {
    const response = await client.linkTokenCreate({
      user: { client_user_id: ctx.user!.id },
      client_name: 'HōMI',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
      webhook: process.env.PLAID_WEBHOOK_URL,
    });

    return NextResponse.json({
      success: true,
      data: {
        link_token: response.data.link_token,
        expiration: response.data.expiration,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create link token';
    return NextResponse.json(
      { success: false, error: { code: 'PLAID_ERROR', message } },
      { status: 500 },
    );
  }
});
