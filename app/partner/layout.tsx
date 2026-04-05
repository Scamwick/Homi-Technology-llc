import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PartnerNav } from './PartnerNav';

export default async function PartnerLayout({
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

  // Check if user belongs to an organization
  const { data: membership } = await supabase
    .from('partner_users')
    .select('organization_id, role, organizations(company_name, status)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (!membership || !membership.organizations) {
    redirect('/dashboard');
  }

  const org = membership.organizations as unknown as { company_name: string; status: string };

  return (
    <PartnerNav
      companyName={org.company_name}
      partnerRole={membership.role}
    >
      {children}
    </PartnerNav>
  );
}
