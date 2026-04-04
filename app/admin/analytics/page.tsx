import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminAnalyticsContent from './AdminAnalyticsContent';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Analytics — Server Component
 *
 * Fetches assessment and profile data for cohort, funnel, and dimension analysis.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default async function AdminAnalyticsPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <AdminAnalyticsContent assessments={[]} profiles={[]} />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const [assessmentsResult, profilesResult] = await Promise.all([
    supabase.from('assessments').select('*').order('created_at', { ascending: false }).limit(500),
    supabase.from('profiles').select('id, created_at, onboarding_complete, tier').limit(5000),
  ]);

  return (
    <AdminAnalyticsContent
      assessments={assessmentsResult.data ?? []}
      profiles={profilesResult.data ?? []}
    />
  );
}
