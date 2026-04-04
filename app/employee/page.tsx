import { createClient } from '@/lib/supabase/server';
import { getEmployeeOverviewData } from '@/lib/data/employee';
import EmployeeOverviewContent from './EmployeeOverviewContent';

export default async function EmployeeOverviewPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <EmployeeOverviewContent data={null} />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return <EmployeeOverviewContent data={null} />;
  }

  const data = await getEmployeeOverviewData();
  return <EmployeeOverviewContent data={data} />;
}
