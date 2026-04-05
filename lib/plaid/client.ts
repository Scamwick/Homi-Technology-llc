/**
 * Plaid client-side configuration.
 *
 * The react-plaid-link component handles the client-side Link flow.
 * This module exports the Plaid client ID for use in Link initialization.
 */

export function getPlaidClientId(): string | undefined {
  return process.env.NEXT_PUBLIC_PLAID_CLIENT_ID;
}

export const PLAID_PRODUCTS = ['transactions'] as const;
export const PLAID_COUNTRY_CODES = ['US'] as const;
export const PLAID_LANGUAGE = 'en' as const;

/**
 * Check if Plaid is configured (env vars present).
 */
/**
 * Server-side Plaid API client (stub — returns null when not configured).
 * Cast to any so callers can chain .linkTokenCreate() etc behind isPlaidConfigured() guard.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const plaidClient: any = null;

export function isPlaidConfigured(): boolean {
  return !!(
    process.env.PLAID_CLIENT_ID &&
    process.env.PLAID_SECRET &&
    process.env.PLAID_ENV
  );
}
