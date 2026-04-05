import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getPartnerOrganization, getPartnerBillingData } from '@/lib/data/partner';
import PartnerBillingContent from './PartnerBillingContent';

export default async function PartnerBillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const partner = await getPartnerOrganization(user.id);
  if (!partner) {
    redirect('/dashboard');
  }

  const data = await getPartnerBillingData(partner.orgId);
  if (!data) {
    redirect('/dashboard');
  }

  return <PartnerBillingContent data={data} />;
}
