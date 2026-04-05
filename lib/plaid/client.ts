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
