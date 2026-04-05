import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getGenomeData } from '@/lib/data/features';
import GenomeContent from './GenomeContent';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Genome Page — Server Component
 *
 * Fetches the authenticated user's behavioral genome from Supabase and
 * passes it to the client-side GenomeContent component for rendering.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default async function GenomePage() {
  // When Supabase is not configured, render with null data
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <GenomeContent genome={null} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const genome = await getGenomeData(user.id);

  return <GenomeContent genome={genome} />;
}
