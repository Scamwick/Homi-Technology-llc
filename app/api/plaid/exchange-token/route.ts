/**
 * POST /api/plaid/exchange-token — Exchange Public Token
 * ========================================================
 *
 * After a user completes Plaid Link, the client sends the public_token
 * here. We exchange it for a permanent access_token and store it.
 * Then trigger an initial data sync.
 *
 * Request:  { public_token: string, institution: { id: string, name: string } }
 * Response: { item_id: string, accounts: number }
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { plaidClient, isPlaidConfigured } from '@/lib/plaid/client';
import { createClient } from '@/lib/supabase/server';
import { fullSync } from '@/lib/plaid/sync';

const ExchangeSchema = z.object({
  public_token: z.string().min(1),
  institution: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

export async function POST(request: NextRequest) {
  if (!isPlaidConfigured()) {
    return NextResponse.json(
      { error: 'Plaid is not configured' },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    );
  }

  // Validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = ExchangeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { public_token, institution } = parsed.data;

  try {
    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const { access_token, item_id } = exchangeResponse.data;

    // Store the Plaid item in our database
    const { error: insertError } = await supabase
      .from('plaid_items')
      .insert({
        user_id: user.id,
        plaid_item_id: item_id,
        plaid_access_token: access_token,
        institution_id: institution.id,
        institution_name: institution.name,
        products: ['transactions', 'auth', 'liabilities', 'investments', 'identity'],
        status: 'active',
      });

    if (insertError) {
      console.error('[Plaid Exchange] DB insert failed:', insertError);
      return NextResponse.json(
        { error: 'Failed to store connection' },
        { status: 500 },
      );
    }

    // Trigger initial sync (non-blocking — we return immediately)
    fullSync(access_token, item_id, user.id).catch((syncError) => {
      console.error('[Plaid Exchange] Initial sync failed:', syncError);
    });

    return NextResponse.json({
      item_id,
      institution: institution.name,
      status: 'connected',
      message: 'Bank account connected. Initial sync in progress.',
    });
  } catch (error) {
    console.error('[Plaid Exchange] Token exchange failed:', error);
    return NextResponse.json(
      { error: 'Failed to connect bank account' },
      { status: 500 },
    );
  }
}
