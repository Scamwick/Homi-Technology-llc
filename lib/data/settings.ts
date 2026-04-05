import { createClient } from '@/lib/supabase/server';
import type { SubscriptionRow, NotificationRow, ProfileRow } from '@/types/database';

// =============================================================================
// lib/data/settings.ts — Settings Page Data Access
// =============================================================================

export interface SettingsData {
  profile: ProfileRow | null;
  subscription: SubscriptionRow | null;
  notifications: NotificationRow[];
}

export async function getSettingsData(userId: string): Promise<SettingsData | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const supabase = await createClient();

  const [profileResult, subscriptionResult, notificationsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single(),
    supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single(),
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  return {
    profile: profileResult.data ?? null,
    subscription: subscriptionResult.data ?? null,
    notifications: notificationsResult.data ?? [],
  };
}

export async function getUserSubscription(userId: string): Promise<SubscriptionRow | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  return data ?? null;
}
