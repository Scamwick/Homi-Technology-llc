import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getPartnerOrganization, getPartnerApiData } from '@/lib/data/partner';
import PartnerApiContent from './PartnerApiContent';

export default async function PartnerAPIPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const partner = await getPartnerOrganization(user.id);
  if (!partner) {
    redirect('/dashboard');
  }

  const data = await getPartnerApiData(partner.orgId);
  if (!data) {
    redirect('/dashboard');
  }

  return <PartnerApiContent data={data} />;
}
