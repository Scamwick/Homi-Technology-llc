import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getPartnerOrganization, getPartnerAnalyticsData } from '@/lib/data/partner';
import PartnerAnalyticsContent from './PartnerAnalyticsContent';

export default async function PartnerAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const partner = await getPartnerOrganization(user.id);
  if (!partner) {
    redirect('/dashboard');
  }

  const data = await getPartnerAnalyticsData(partner.orgId);
  if (!data) {
    redirect('/dashboard');
  }

  return <PartnerAnalyticsContent data={data} />;
}
