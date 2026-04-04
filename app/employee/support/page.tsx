import { createClient } from '@/lib/supabase/server';
import { getSupportDashboardData } from '@/lib/data/employee';
import SupportContent from './SupportContent';

export default async function SupportPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <SupportContent data={null} />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <SupportContent data={null} />;

  const data = await getSupportDashboardData();
  return <SupportContent data={data} />;
}
