import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTransformationData } from '@/lib/data/features';
import TransformationContent from './TransformationContent';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Transformation Path Page — Server Component
 *
 * Fetches the user's transformation path and latest assessment from Supabase,
 * then passes the data to the client-side TransformationContent component.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default async function TransformationPage() {
  // When Supabase is not configured, render with empty data
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return <TransformationContent data={null} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const data = await getTransformationData(user.id);

  return <TransformationContent data={data} />;
}
