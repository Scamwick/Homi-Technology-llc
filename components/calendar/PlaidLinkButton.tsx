'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Landmark, Loader2, Check, AlertTriangle } from 'lucide-react';
import type { LinkedAccountView } from '@/types/plaid';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LinkState = 'idle' | 'fetching_token' | 'ready' | 'exchanging' | 'done' | 'error';

interface PlaidLinkButtonProps {
  onSuccess: (accounts: LinkedAccountView[]) => void;
  onError?: (error: string) => void;
  variant?: 'primary' | 'compact';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PlaidLinkButton({ onSuccess, onError, variant = 'primary' }: PlaidLinkButtonProps) {
  const [state, setState] = useState<LinkState>('idle');
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch link token when user clicks connect
  const fetchLinkToken = useCallback(async () => {
    setState('fetching_token');
    setErrorMessage(null);

    try {
      const res = await fetch('/api/plaid/link-token', { method: 'POST' });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error?.message ?? 'Failed to create link token');
      }

      setLinkToken(data.data.link_token);
      setState('ready');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setState('error');
      setErrorMessage(message);
      onError?.(message);
    }
  }, [onError]);

  // Exchange public token after Plaid Link succeeds
  const exchangeToken = useCallback(async (publicToken: string, metadata: { institution?: { institution_id?: string; name?: string } | null }) => {
    setState('exchanging');

    try {
      const res = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_token: publicToken,
          institution_id: metadata.institution?.institution_id ?? undefined,
          institution_name: metadata.institution?.name ?? undefined,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error?.message ?? 'Failed to link account');
      }

      setState('done');
      onSuccess(data.data.accounts);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to link account';
      setState('error');
      setErrorMessage(message);
      onError?.(message);
    }
  }, [onSuccess, onError]);

  // Plaid Link hook
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (publicToken, metadata) => {
      exchangeToken(publicToken, metadata);
    },
    onExit: (err) => {
      if (err) {
        setState('error');
        setErrorMessage(err.display_message ?? err.error_message ?? 'Link closed with error');
      } else {
        setState('idle');
        setLinkToken(null);
      }
    },
  });

  // Open Plaid Link once token is fetched and Link is ready
  useEffect(() => {
    if (state === 'ready' && ready && linkToken) {
      open();
    }
  }, [state, ready, linkToken, open]);

  const handleClick = useCallback(() => {
    if (state === 'idle' || state === 'error') {
      fetchLinkToken();
    } else if (state === 'done') {
      setState('idle');
      setLinkToken(null);
      setErrorMessage(null);
    }
  }, [state, fetchLinkToken]);

  const isLoading = state === 'fetching_token' || state === 'ready' || state === 'exchanging';

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer disabled:cursor-wait"
        style={{
          background: state === 'done' ? 'rgba(52, 211, 153, 0.1)' : state === 'error' ? 'rgba(248, 113, 113, 0.1)' : 'rgba(34, 211, 238, 0.1)',
          color: state === 'done' ? '#34d399' : state === 'error' ? '#f87171' : '#22d3ee',
        }}
      >
        {isLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : state === 'done' ? (
          <Check size={14} />
        ) : state === 'error' ? (
          <AlertTriangle size={14} />
        ) : (
          <Landmark size={14} />
        )}
        {state === 'idle' && 'Connect'}
        {state === 'fetching_token' && 'Preparing...'}
        {state === 'ready' && 'Opening...'}
        {state === 'exchanging' && 'Syncing...'}
        {state === 'done' && 'Connected'}
        {state === 'error' && 'Retry'}
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 w-full rounded-lg px-4 py-3 text-sm font-semibold transition-all cursor-pointer disabled:cursor-wait"
        style={{
          background: state === 'done'
            ? 'rgba(52, 211, 153, 0.15)'
            : state === 'error'
              ? 'rgba(248, 113, 113, 0.15)'
              : 'rgba(34, 211, 238, 0.15)',
          color: state === 'done' ? '#34d399' : state === 'error' ? '#f87171' : '#22d3ee',
          border: `1px solid ${state === 'done' ? 'rgba(52, 211, 153, 0.3)' : state === 'error' ? 'rgba(248, 113, 113, 0.3)' : 'rgba(34, 211, 238, 0.3)'}`,
        }}
      >
        {isLoading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : state === 'done' ? (
          <Check size={18} />
        ) : state === 'error' ? (
          <AlertTriangle size={18} />
        ) : (
          <Landmark size={18} />
        )}
        {state === 'idle' && 'Connect Bank Account'}
        {state === 'fetching_token' && 'Preparing Secure Connection...'}
        {state === 'ready' && 'Opening Plaid Link...'}
        {state === 'exchanging' && 'Syncing Accounts...'}
        {state === 'done' && 'Bank Connected Successfully'}
        {state === 'error' && 'Connection Failed — Tap to Retry'}
      </button>

      {errorMessage && (
        <p className="text-xs text-center" style={{ color: '#f87171' }}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
