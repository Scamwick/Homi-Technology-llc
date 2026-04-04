import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAdminAuditData } from '@/lib/data/admin';
import AdminAuditContent from './AdminAuditContent';

export default async function AdminAuditLogPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <AdminAuditContent entries={[]} total={0} />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const data = await getAdminAuditData();
  return <AdminAuditContent entries={data?.entries ?? []} total={data?.total ?? 0} />;
}
