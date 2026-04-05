import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAssessmentById } from '@/lib/data/assessments';
import { AssessmentResultContent } from './AssessmentResultContent';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AssessmentResultPage({ params }: PageProps) {
  const { id } = await params;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return <AssessmentResultContent assessment={null} assessmentId={id} />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const assessment = await getAssessmentById(id, user.id);
  return <AssessmentResultContent assessment={assessment} assessmentId={id} />;
}
