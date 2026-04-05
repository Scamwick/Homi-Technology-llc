'use client';

/**
 * PlaidLinkButton — Connect Bank Account via Plaid Link
 * =======================================================
 *
 * Renders a button that launches Plaid Link for account connection.
 * Handles the full flow: create link token → open Link → exchange token.
 *
 * Props:
 *   onSuccess: Called when account is successfully linked
 *   onExit:    Called when user exits Link without connecting
 *   className: Optional CSS class override
 *   children:  Custom button content (defaults to "Connect Bank Account")
 */

import { useState, useCallback } from 'react';

interface PlaidLinkButtonProps {
  onSuccess?: (itemId: string, institution: string) => void;
  onExit?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function PlaidLinkButton({
  onSuccess,
  onExit,
  className,
  children,
}: PlaidLinkButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Get a link token from our API
      const tokenResponse = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
      });

      if (!tokenResponse.ok) {
        const err = await tokenResponse.json();
        throw new Error(err.error ?? 'Failed to create link token');
      }

      const { link_token } = await tokenResponse.json();

      // 2. Dynamically import and initialize Plaid Link
      // This loads the Plaid Link script only when needed
      const Plaid = await loadPlaidLink();

      const handler = Plaid.create({
        token: link_token,
        onSuccess: async (publicToken: string, metadata: PlaidLinkMetadata) => {
          try {
            // 3. Exchange the public token for an access token
            const exchangeResponse = await fetch('/api/plaid/exchange-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                public_token: publicToken,
                institution: {
                  id: metadata.institution?.institution_id ?? '',
                  name: metadata.institution?.name ?? 'Unknown',
                },
              }),
            });

            if (!exchangeResponse.ok) {
              throw new Error('Failed to connect account');
            }

            const result = await exchangeResponse.json();
            onSuccess?.(result.item_id, result.institution);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Connection failed');
          }
        },
        onExit: (_err: unknown) => {
          onExit?.();
        },
      });

      handler.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start connection');
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onExit]);

  const defaultClasses = [
    'inline-flex items-center justify-center gap-2',
    'rounded-lg px-4 py-2.5',
    'bg-emerald-600 text-white font-medium',
    'hover:bg-emerald-700 transition-colors',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' ');

  return (
    <div>
      <button
        onClick={handleConnect}
        disabled={loading}
        className={className ?? defaultClasses}
      >
        {loading ? (
          <>
            <LoadingSpinner />
            Connecting...
          </>
        ) : (
          children ?? (
            <>
              <BankIcon />
              Connect Bank Account
            </>
          )
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface PlaidLinkMetadata {
  institution?: { institution_id: string; name: string };
  accounts?: Array<{ id: string; name: string }>;
}

interface PlaidHandler {
  open: () => void;
  exit: () => void;
}

interface PlaidLinkFactory {
  create: (config: {
    token: string;
    onSuccess: (publicToken: string, metadata: PlaidLinkMetadata) => void;
    onExit: (err: unknown) => void;
  }) => PlaidHandler;
}

/**
 * Loads the Plaid Link SDK script dynamically.
 */
function loadPlaidLink(): Promise<PlaidLinkFactory> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).Plaid) {
      resolve((window as unknown as Record<string, PlaidLinkFactory>).Plaid);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.async = true;
    script.onload = () => {
      resolve((window as unknown as Record<string, PlaidLinkFactory>).Plaid);
    };
    script.onerror = () => reject(new Error('Failed to load Plaid Link'));
    document.head.appendChild(script);
  });
}

function LoadingSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="4"
        className="opacity-25"
      />
      <path
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        fill="currentColor"
        className="opacity-75"
      />
    </svg>
  );
}

function BankIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="10" width="18" height="11" rx="2" />
      <path d="m12 2 9 7H3z" />
      <path d="M7 21V14M12 21V14M17 21V14" />
    </svg>
  );
}
