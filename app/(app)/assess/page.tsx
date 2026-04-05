import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserAssessments } from '@/lib/data/assessments';
import { AssessListContent } from './AssessListContent';

export default async function AssessPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return <AssessListContent assessments={null} />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const assessments = await getUserAssessments(user.id);
  return <AssessListContent assessments={assessments} />;
}
