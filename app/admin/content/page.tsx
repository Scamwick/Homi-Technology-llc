import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminContentContent from './AdminContentContent';

export default async function AdminContentPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <AdminContentContent />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // Content management is configuration-driven, not data-driven.
  // Questions and templates will be managed via a future CMS integration.
  return <AdminContentContent />;
}
