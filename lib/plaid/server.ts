import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

/**
 * Returns a configured Plaid API client, or null if credentials are missing.
 * Mirrors the getStripeServer() pattern from lib/stripe/server.ts.
 */
export function getPlaidClient(): PlaidApi | null {
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  const env = process.env.PLAID_ENV ?? 'sandbox';

  if (!clientId || !secret) return null;

  const configuration = new Configuration({
    basePath: PlaidEnvironments[env] ?? PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': clientId,
        'PLAID-SECRET': secret,
      },
    },
  });

  return new PlaidApi(configuration);
}
