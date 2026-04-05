/**
 * TransUnion API Client
 * =======================
 *
 * Interfaces with TransUnion's TrueVision API for credit score pulls.
 * This performs a "soft pull" that does not impact the user's credit score.
 *
 * Required env vars:
 *   TRANSUNION_API_KEY      — API key for TransUnion
 *   TRANSUNION_API_SECRET   — API secret
 *   TRANSUNION_ENV          — 'sandbox' | 'production'
 */

import type { CreditPull } from './reconcile';
import { createClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

function getBaseUrl(): string {
  const env = process.env.TRANSUNION_ENV ?? 'sandbox';
  return env === 'production'
    ? 'https://api.transunion.com/v3'
    : 'https://sandbox.api.transunion.com/v3';
}

function isConfigured(): boolean {
  return Boolean(
    process.env.TRANSUNION_API_KEY &&
    process.env.TRANSUNION_API_SECRET,
  );
}

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------

/**
 * Pulls a FICO score from TransUnion.
 * Returns null if TransUnion is not configured.
 */
export async function pullTransUnion(
  userId: string,
): Promise<CreditPull | null> {
  if (!isConfigured()) {
    console.log('[TransUnion] Not configured — skipping pull');
    return null;
  }

  // Get user profile data needed for the pull
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', userId)
    .single();

  if (!profile) {
    console.warn('[TransUnion] No profile found for user:', userId);
    return null;
  }

  try {
    const response = await fetch(`${getBaseUrl()}/credit/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TRANSUNION_API_KEY}`,
        'X-API-Secret': process.env.TRANSUNION_API_SECRET!,
      },
      body: JSON.stringify({
        consumer: {
          name: profile.full_name,
          // In production, additional PII would be collected securely
          // via a separate identity verification flow
        },
        productCode: 'FICO8',
        softPull: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TransUnion] API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();

    return {
      source: 'transunion',
      score: data.score ?? data.creditScore?.score,
      scoreType: 'fico8',
      factors: data.factors?.map((f: { description: string }) => f.description) ?? [],
      pulledAt: new Date().toISOString(),
      rawData: data,
    };
  } catch (error) {
    console.error('[TransUnion] Pull failed:', error);
    return null;
  }
}
