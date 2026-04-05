import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserSubscription } from '@/lib/data/settings';
import BillingContent from './BillingContent';
import type { SubscriptionTier } from '@/types/user';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Billing Settings Page — Server Component
 *
 * Fetches subscription data from Supabase and passes to the
 * client-side BillingContent component.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default async function BillingPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <BillingContent subscription={null} profileTier="free" />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch subscription and profile tier in parallel
  const [subscription, profileResult] = await Promise.all([
    getUserSubscription(user.id),
    supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single(),
  ]);

  const profileTier = (profileResult.data?.subscription_tier as SubscriptionTier) ?? 'free';

  return (
    <BillingContent
      subscription={subscription}
      profileTier={profileTier}
    />
  );
}
