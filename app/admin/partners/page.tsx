import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAdminPartnersData } from '@/lib/data/admin';
import AdminPartnersContent from './AdminPartnersContent';

export default async function AdminPartnersPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <AdminPartnersContent organizations={[]} />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const data = await getAdminPartnersData();
  return <AdminPartnersContent organizations={data?.organizations ?? []} />;
}
