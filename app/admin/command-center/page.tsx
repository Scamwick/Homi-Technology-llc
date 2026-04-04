import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCEOCommandCenterData } from '@/lib/data/admin';
import CommandCenterContent from './CommandCenterContent';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * CEO Command Center — Server Component
 *
 * Strategic overview for the Founder/CEO. Full access to all platform
 * KPIs, revenue metrics, growth data, and system health.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default async function CommandCenterPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <CommandCenterContent data={null} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const data = await getCEOCommandCenterData();
  return <CommandCenterContent data={data} />;
}
