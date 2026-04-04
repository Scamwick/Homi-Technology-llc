import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAdminAssessmentsData } from '@/lib/data/admin';
import AdminAssessmentsContent from './AdminAssessmentsContent';

export default async function AdminAssessmentsPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <AdminAssessmentsContent assessments={[]} avgScore={0} crisisCount={0} />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const data = await getAdminAssessmentsData();
  return (
    <AdminAssessmentsContent
      assessments={data?.assessments ?? []}
      avgScore={data?.avgScore ?? 0}
      crisisCount={data?.crisisCount ?? 0}
    />
  );
}
