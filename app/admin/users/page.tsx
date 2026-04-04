import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAdminUsersData } from '@/lib/data/admin';
import AdminUsersContent from './AdminUsersContent';

export default async function AdminUsersPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <AdminUsersContent users={[]} total={0} />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const data = await getAdminUsersData();
  return <AdminUsersContent users={data?.users ?? []} total={data?.total ?? 0} />;
}
