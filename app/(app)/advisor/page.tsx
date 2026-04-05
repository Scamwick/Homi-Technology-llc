import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdvisorContent from './AdvisorContent';

/* ━━━━━━━━━��━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━��━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * AI Advisor — Server Component
 *
 * Fetches user's recent assessments from Supabase and passes them
 * to the client-side chat interface.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default async function AdvisorPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return <AdvisorContent assessments={[]} />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch recent assessments for context selector
  const { data: assessments } = await supabase
    .from('assessments')
    .select('id, overall_score, financial_score, emotional_score, timing_score, verdict, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return <AdvisorContent assessments={assessments ?? []} />;
}
