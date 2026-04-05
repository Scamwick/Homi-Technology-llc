import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getPartnerOrganization, getPartnerBrandingData } from '@/lib/data/partner';
import PartnerBrandingContent from './PartnerBrandingContent';

export default async function PartnerBrandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const partner = await getPartnerOrganization(user.id);
  if (!partner) {
    redirect('/dashboard');
  }

  const data = await getPartnerBrandingData(partner.orgId);
  if (!data) {
    redirect('/dashboard');
  }

  return <PartnerBrandingContent data={data} />;
}
