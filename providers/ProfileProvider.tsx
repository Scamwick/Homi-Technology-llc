'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { SubscriptionTier, UserRole, AccountType } from '@/types/user'

// ---------------------------------------------------------------------------
// Profile shape returned by /api/user/profile
// ---------------------------------------------------------------------------

export interface UserProfileData {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  account_type: AccountType
  subscription_tier: SubscriptionTier
  subscription_status: string
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

interface ProfileContextValue {
  profile: UserProfileData | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  loading: true,
  error: null,
  refresh: async () => {},
})

export function useProfile() {
  return useContext(ProfileContext)
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/user/profile')
      if (!res.ok) {
        if (res.status === 401) {
          // Not authenticated — not an error, just no profile
          setProfile(null)
          return
        }
        throw new Error(`Profile fetch failed: ${res.status}`)
      }
      const json = await res.json()
      if (json.success && json.data) {
        setProfile(json.data)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load profile'
      setError(message)
      console.error('[ProfileProvider]', message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return (
    <ProfileContext.Provider value={{ profile, loading, error, refresh: fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}
