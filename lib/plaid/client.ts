/**
 * Plaid SDK Client — Singleton
 * =============================
 *
 * Initializes and exports a single Plaid API client instance.
 * Uses environment variables for configuration.
 *
 * Required env vars:
 *   PLAID_CLIENT_ID   — Your Plaid client ID
 *   PLAID_SECRET      — Your Plaid secret (environment-specific)
 *   PLAID_ENV         — 'sandbox' | 'development' | 'production'
 */

import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

function getPlaidEnv(): string {
  const env = process.env.PLAID_ENV ?? 'sandbox';
  switch (env) {
    case 'production':
      return PlaidEnvironments.production;
    case 'development':
      return PlaidEnvironments.development;
    default:
      return PlaidEnvironments.sandbox;
  }
}

const configuration = new Configuration({
  basePath: getPlaidEnv(),
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID ?? '',
      'PLAID-SECRET': process.env.PLAID_SECRET ?? '',
      'Plaid-Version': '2020-09-14',
    },
  },
});

/** Singleton Plaid API client. */
export const plaidClient = new PlaidApi(configuration);

/** Plaid products we request during Link. */
export const PLAID_PRODUCTS = [
  'transactions',
  'auth',
  'liabilities',
  'investments',
  'identity',
] as const;

/** Country codes for Plaid Link. */
export const PLAID_COUNTRY_CODES = ['US'] as const;

/**
 * Checks whether Plaid is configured (all required env vars present).
 * Returns false in development when Plaid keys aren't set.
 */
export function isPlaidConfigured(): boolean {
  return Boolean(
    process.env.PLAID_CLIENT_ID &&
    process.env.PLAID_SECRET,
  );
}
