import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDashboardData } from '@/lib/data/dashboard';
import DashboardContent from './DashboardContent';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Dashboard Page — Server Component
 *
 * Fetches all dashboard data from Supabase and passes it to the
 * client-side DashboardContent component for interactive rendering.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default async function DashboardPage() {
  // When Supabase is not configured, render with empty data
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <DashboardContent
        data={{
          profile: null,
          latestAssessment: null,
          scoreHistory: [],
          notifications: [],
          transformationPath: null,
          genome: null,
          couple: null,
          assessmentCount: 0,
        }}
      />
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const data = await getDashboardData(user.id);

  return (
    <DashboardContent
      data={
        data ?? {
          profile: null,
          latestAssessment: null,
          scoreHistory: [],
          notifications: [],
          transformationPath: null,
          genome: null,
          couple: null,
          assessmentCount: 0,
        }
      }
    />
  );
}
