/**
 * Experian Connect API Client
 * =============================
 *
 * Interfaces with Experian's Connect API for credit score pulls.
 * This performs a "soft pull" that does not impact the user's credit score.
 *
 * Required env vars:
 *   EXPERIAN_CLIENT_ID     — Experian API client ID
 *   EXPERIAN_CLIENT_SECRET — Experian API client secret
 *   EXPERIAN_ENV           — 'sandbox' | 'production'
 */

import type { CreditPull } from './reconcile';
import { createClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

function getBaseUrl(): string {
  const env = process.env.EXPERIAN_ENV ?? 'sandbox';
  return env === 'production'
    ? 'https://api.experian.com/v2'
    : 'https://sandbox.api.experian.com/v2';
}

function isConfigured(): boolean {
  return Boolean(
    process.env.EXPERIAN_CLIENT_ID &&
    process.env.EXPERIAN_CLIENT_SECRET,
  );
}

/**
 * Gets an OAuth access token from Experian.
 */
async function getAccessToken(): Promise<string | null> {
  try {
    const response = await fetch(`${getBaseUrl()}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.EXPERIAN_CLIENT_ID!,
        client_secret: process.env.EXPERIAN_CLIENT_SECRET!,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.access_token;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------

/**
 * Pulls a VantageScore from Experian.
 * Returns null if Experian is not configured.
 */
export async function pullExperian(
  userId: string,
): Promise<CreditPull | null> {
  if (!isConfigured()) {
    console.log('[Experian] Not configured — skipping pull');
    return null;
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.error('[Experian] Failed to get access token');
    return null;
  }

  // Get user profile for the pull
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', userId)
    .single();

  if (!profile) {
    console.warn('[Experian] No profile found for user:', userId);
    return null;
  }

  try {
    const response = await fetch(`${getBaseUrl()}/consumer/credit/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        consumerIdentity: {
          name: profile.full_name,
        },
        requestedScores: ['VantageScore3'],
        softPull: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Experian] API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();

    return {
      source: 'experian',
      score: data.score ?? data.creditScore?.score,
      scoreType: 'vantage3',
      factors: data.riskFactors?.map((f: { description: string }) => f.description) ?? [],
      pulledAt: new Date().toISOString(),
      rawData: data,
    };
  } catch (error) {
    console.error('[Experian] Pull failed:', error);
    return null;
  }
}
