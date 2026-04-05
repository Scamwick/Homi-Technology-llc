import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCouplesData } from '@/lib/data/features';
import CouplesContent from './CouplesContent';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Couples Page — Server Component
 *
 * Fetches couples data from Supabase and passes it to the
 * client-side CouplesContent component for interactive rendering.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default async function CouplesPage() {
  // When Supabase is not configured, render with empty data
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <CouplesContent data={null} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const data = await getCouplesData(user.id);

  return <CouplesContent data={data} />;
}
