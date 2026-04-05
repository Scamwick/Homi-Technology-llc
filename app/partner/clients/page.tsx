import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getPartnerOrganization, getPartnerClients } from '@/lib/data/partner';
import PartnerClientsContent from './PartnerClientsContent';

export default async function PartnerClientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const partner = await getPartnerOrganization(user.id);
  if (!partner) {
    redirect('/dashboard');
  }

  const clients = await getPartnerClients(partner.orgId);

  return <PartnerClientsContent clients={clients} />;
}
