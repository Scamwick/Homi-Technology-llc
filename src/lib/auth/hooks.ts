'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Profile, UserSession } from '@/types/user'

export function useAuth() {
  const [session, setSession] = useState<UserSession>({
    user: null,
    profile: null,
    isLoading: true,
  })
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setSession({ user: null, profile: null, isLoading: false })
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setSession({ user: null, profile: null, isLoading: false })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    const { data: { user } } = await supabase.auth.getUser()

    setSession({
      user: user ? { id: user.id, email: user.email! } : null,
      profile: profile as Profile | null,
      isLoading: false,
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return { ...session, signOut }
}

export function useRequireAuth(redirectTo: string = '/auth/login') {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectTo)
    }
  }, [user, isLoading, router, redirectTo])

  return { user, isLoading }
}

export function useOnboardingGuard() {
  const { profile, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && profile && !profile.onboarding_completed) {
      router.push('/onboarding')
    }
  }, [profile, isLoading, router])

  return { profile, isLoading }
}
