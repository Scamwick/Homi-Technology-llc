import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTemporalMessages } from '@/lib/data/features';
import TemporalTwinContent from './TemporalTwinContent';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Temporal Twin Page — Server Component
 *
 * Fetches the authenticated user's temporal messages and latest assessment
 * score from Supabase, then passes them to the client-side
 * TemporalTwinContent component for rendering.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default async function TemporalTwinPage() {
  // When Supabase is not configured, render with empty data
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return <TemporalTwinContent initialMessages={[]} currentScore={null} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch temporal messages and latest assessment in parallel
  const [messages, assessmentResult] = await Promise.all([
    getTemporalMessages(user.id),
    supabase
      .from('assessments')
      .select('overall_score')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
  ]);

  const currentScore = assessmentResult.data?.overall_score ?? null;

  return (
    <TemporalTwinContent
      initialMessages={messages}
      currentScore={currentScore}
    />
  );
}
