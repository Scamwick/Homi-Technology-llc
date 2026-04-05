import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getPartnerOrganization, getPartnerDashboardData } from '@/lib/data/partner';
import PartnerDashboardContent from './PartnerDashboardContent';

export default async function PartnerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const partner = await getPartnerOrganization(user.id);
  if (!partner) {
    redirect('/dashboard');
  }

  const data = await getPartnerDashboardData(partner.orgId);
  if (!data) {
    redirect('/dashboard');
  }

  return <PartnerDashboardContent data={data} />;
}
