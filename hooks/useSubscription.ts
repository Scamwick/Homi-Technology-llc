'use client';

import { useCallback, useMemo } from 'react';
import type { SubscriptionTier } from '@/types/user';
import { TIER_LIMITS } from '@/lib/utils/constants';
import { useProfile } from '@/providers/ProfileProvider';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * useSubscription — Client-side subscription state & access control
 *
 * Reads the user's actual subscription tier from the ProfileProvider.
 * Returns feature limits, access checks, and an upgrade handler.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

type TierLimits = (typeof TIER_LIMITS)[keyof typeof TIER_LIMITS];
type FeatureKey = keyof TierLimits;

export interface UseSubscriptionReturn {
  /** Current subscription tier */
  tier: SubscriptionTier;
  /** Feature limits for the current tier */
  limits: TierLimits;
  /** Check if a specific feature is accessible at the current tier */
  canAccess: (feature: FeatureKey) => boolean;
  /** Redirect to Stripe Checkout for the given tier */
  upgrade: (targetTier: Exclude<SubscriptionTier, 'free'>) => Promise<void>;
  /** Whether the user is on a paid plan */
  isPaid: boolean;
  /** Whether the user's role bypasses paywalls */
  bypassesPaywall: boolean;
}

export function useSubscription(): UseSubscriptionReturn {
  const { profile } = useProfile();

  // Read tier from real profile data, default to 'free'
  const tier: SubscriptionTier = profile?.subscription_tier ?? 'free';
  const role = profile?.role ?? 'user';

  // ceo_founder and admin bypass all paywalls
  const bypassesPaywall = role === 'ceo_founder' || role === 'admin';

  const limits = useMemo(() => TIER_LIMITS[tier], [tier]);

  const isPaid = tier !== 'free' && tier !== 'enterprise_free';

  const canAccess = useCallback(
    (feature: FeatureKey): boolean => {
      // Admins and CEO bypass everything
      if (bypassesPaywall) return true;

      const value = limits[feature];
      // null means unlimited, true means enabled, number > 0 means has quota
      if (value === null) return true;
      if (typeof value === 'boolean') return value;
      if (typeof value === 'number') return value > 0;
      return false;
    },
    [limits, bypassesPaywall],
  );

  const upgrade = useCallback(
    async (targetTier: Exclude<SubscriptionTier, 'free'>) => {
      try {
        const response = await fetch('/api/payments/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier: targetTier }),
        });

        const result = await response.json();

        if (result.success && result.data?.url) {
          window.location.href = result.data.url;
        } else {
          console.error('[useSubscription] Checkout failed:', result.error);
        }
      } catch (error) {
        console.error('[useSubscription] Checkout error:', error);
      }
    },
    [],
  );

  return { tier, limits, canAccess, upgrade, isPaid, bypassesPaywall };
}
