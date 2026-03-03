import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppLayout } from '@/components/layout/AppLayout'

export const metadata: Metadata = {
  title: 'Dashboard | HōMI',
  description: 'Your decision readiness dashboard',
}

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Check if onboarding is completed
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('onboarding_completed, role')
    .eq('id', session.user.id)
    .single()

  if (profile && !(profile as any).onboarding_completed) {
    redirect('/onboarding')
  }

  return <AppLayout user={session.user as any} profile={profile}>{children}</AppLayout>
}
