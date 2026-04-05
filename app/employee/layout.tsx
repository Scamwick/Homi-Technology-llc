import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { EmployeeNav } from './EmployeeNav';

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1628]">
        <p className="text-[#94a3b8]">Supabase is not configured. Set environment variables in .env.local</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role ?? 'user';

  if (role !== 'employee' && role !== 'admin' && role !== 'founder') {
    redirect('/dashboard');
  }

  return <EmployeeNav>{children}</EmployeeNav>;
}
