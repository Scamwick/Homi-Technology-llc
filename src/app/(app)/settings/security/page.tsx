'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Shield, Key, LogOut, ChevronLeft, Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SecuritySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  const [signOutAllLoading, setSignOutAllLoading] = useState(false)
  const [signOutAllDone, setSignOutAllDone] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  const changePassword = async () => {
    setPwError(null)
    setPwSuccess(false)

    if (newPassword.length < 8) {
      setPwError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match.')
      return
    }

    setPwLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        setPwError(error.message)
      } else {
        setPwSuccess(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } finally {
      setPwLoading(false)
    }
  }

  const signOutAll = async () => {
    setSignOutAllLoading(true)
    try {
      await supabase.auth.signOut({ scope: 'global' })
      setSignOutAllDone(true)
      router.push('/login')
    } finally {
      setSignOutAllLoading(false)
    }
  }

  const signOutCurrent = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/settings" className="text-text-3 hover:text-text-1 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-brand-emerald" />
            Security
          </h1>
          <p className="text-text-2 text-sm mt-0.5">Manage your password and active sessions.</p>
        </div>
      </div>

      {/* Change Password */}
      <Card variant="elevated">
        <div className="px-5 pt-4 pb-2 border-b border-surface-3 flex items-center gap-2">
          <Key className="w-4 h-4 text-brand-cyan" />
          <p className="text-sm font-semibold text-text-1">Change Password</p>
        </div>
        <div className="p-5 space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="At least 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Repeat new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {pwError && (
            <div className="flex items-center gap-2 text-sm text-brand-crimson">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {pwError}
            </div>
          )}
          {pwSuccess && (
            <div className="flex items-center gap-2 text-sm text-brand-emerald">
              <Check className="w-4 h-4 flex-shrink-0" />
              Password updated successfully.
            </div>
          )}

          <Button
            variant="primary"
            onClick={changePassword}
            loading={pwLoading}
            disabled={!newPassword || !confirmPassword}
          >
            Update Password
          </Button>
        </div>
      </Card>

      {/* Sessions */}
      <Card variant="elevated">
        <div className="px-5 pt-4 pb-2 border-b border-surface-3 flex items-center gap-2">
          <LogOut className="w-4 h-4 text-brand-yellow" />
          <p className="text-sm font-semibold text-text-1">Sessions</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-brand-sm border border-surface-3 bg-surface-2">
            <div>
              <p className="text-sm font-medium text-text-1">Current Session</p>
              <p className="text-xs text-text-3 mt-0.5">This browser / device</p>
            </div>
            <Badge variant="emerald" size="sm">Active</Badge>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={signOutCurrent}
            >
              Sign Out of This Device
            </Button>
            <Button
              variant="ghost"
              className="w-full text-brand-crimson hover:bg-brand-crimson/10"
              onClick={signOutAll}
              loading={signOutAllLoading}
            >
              Sign Out of All Devices
            </Button>
          </div>

          <p className="text-xs text-text-4">
            Signing out of all devices will end all active sessions and require you to log in again everywhere.
          </p>
        </div>
      </Card>

      {/* Account deletion note */}
      <Card variant="elevated">
        <div className="p-5 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-text-4 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-text-4">
            To permanently delete your account and all associated data, contact support. Account deletion is irreversible and removes all assessments, scores, and transformation data.
          </p>
        </div>
      </Card>
    </div>
  )
}
