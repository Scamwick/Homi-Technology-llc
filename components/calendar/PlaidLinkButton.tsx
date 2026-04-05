'use client';

import { useState, useCallback } from 'react';
import { Landmark, Loader2, Check, AlertTriangle } from 'lucide-react';
import type { LinkedAccountView } from '@/types/plaid';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LinkState = 'idle' | 'loading' | 'ready' | 'linking' | 'exchanging' | 'done' | 'error';

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConnect = useCallback(async () => {
    setState('loading');
    setErrorMessage(null);

    try {
      // Step 1: Get link token
      const tokenRes = await fetch('/api/plaid/link-token', { method: 'POST' });
      const tokenData = await tokenRes.json();

      if (!tokenData.success) {
        throw new Error(tokenData.error?.message ?? 'Failed to create link token');
      }

      setState('ready');

      // In production, this would open the Plaid Link modal using usePlaidLink.
      // For dev/mock mode, we simulate the flow:
      const isMockToken = tokenData.data.link_token.startsWith('link-sandbox-mock-');

      if (isMockToken) {
        // Mock mode: simulate Link flow
        setState('linking');
        await new Promise((r) => setTimeout(r, 800));

        setState('exchanging');
        const exchangeRes = await fetch('/api/plaid/exchange-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            public_token: 'public-sandbox-mock-' + Date.now(),
            institution_name: 'Chase',
          }),
        });
        const exchangeData = await exchangeRes.json();

        if (!exchangeData.success) {
          throw new Error(exchangeData.error?.message ?? 'Failed to exchange token');
        }

        setState('done');
        onSuccess(exchangeData.data.accounts);
      } else {
        // Production mode: would use react-plaid-link here
        // For now, fall back to mock behavior
        setState('linking');
        await new Promise((r) => setTimeout(r, 1500));
        setState('exchanging');

        const exchangeRes = await fetch('/api/plaid/exchange-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_token: 'mock-public-token' }),
        });
        const exchangeData = await exchangeRes.json();

        if (!exchangeData.success) {
          throw new Error(exchangeData.error?.message ?? 'Failed to exchange token');
        }

        setState('done');
        onSuccess(exchangeData.data.accounts);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setState('error');
      setErrorMessage(message);
      onError?.(message);
    }
  }, [onSuccess, onError]);

  // Reset after done/error
  const handleReset = useCallback(() => {
    setState('idle');
    setErrorMessage(null);
  }, []);

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={state === 'idle' || state === 'error' ? handleConnect : state === 'done' ? handleReset : undefined}
        disabled={state === 'loading' || state === 'linking' || state === 'exchanging'}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer disabled:cursor-wait"
        style={{
          background: state === 'done' ? 'rgba(52, 211, 153, 0.1)' : state === 'error' ? 'rgba(248, 113, 113, 0.1)' : 'rgba(34, 211, 238, 0.1)',
          color: state === 'done' ? '#34d399' : state === 'error' ? '#f87171' : '#22d3ee',
        }}
      >
        {state === 'loading' || state === 'linking' || state === 'exchanging' ? (
          <Loader2 size={14} className="animate-spin" />
        ) : state === 'done' ? (
          <Check size={14} />
        ) : state === 'error' ? (
          <AlertTriangle size={14} />
        ) : (
          <Landmark size={14} />
        )}
        {state === 'idle' && 'Connect'}
        {state === 'loading' && 'Preparing...'}
        {(state === 'ready' || state === 'linking') && 'Connecting...'}
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
        onClick={state === 'idle' || state === 'error' ? handleConnect : state === 'done' ? handleReset : undefined}
        disabled={state === 'loading' || state === 'linking' || state === 'exchanging'}
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
        {state === 'loading' || state === 'linking' || state === 'exchanging' ? (
          <Loader2 size={18} className="animate-spin" />
        ) : state === 'done' ? (
          <Check size={18} />
        ) : state === 'error' ? (
          <AlertTriangle size={18} />
        ) : (
          <Landmark size={18} />
        )}
        {state === 'idle' && 'Connect Bank Account'}
        {state === 'loading' && 'Preparing Secure Connection...'}
        {(state === 'ready' || state === 'linking') && 'Connecting to Bank...'}
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
