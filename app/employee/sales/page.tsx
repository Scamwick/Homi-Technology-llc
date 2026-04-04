import { createClient } from '@/lib/supabase/server';
import { getSalesDashboardData } from '@/lib/data/employee';
import SalesContent from './SalesContent';

export default async function SalesPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <SalesContent data={null} />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <SalesContent data={null} />;

  const data = await getSalesDashboardData();
  return <SalesContent data={data} />;
}
