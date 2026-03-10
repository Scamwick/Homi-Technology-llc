'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Shield, Key, LogOut, ChevronLeft, Check, AlertCircle, Download, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SecuritySettingsPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  const [signOutAllLoading, setSignOutAllLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showDeleteForm, setShowDeleteForm] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  const changePassword = async () => {
    setPwError(null)
    setPwSuccess(false)
    if (newPassword.length < 8) { setPwError('Password must be at least 8 characters.'); return }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match.'); return }
    setPwLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) { setPwError(error.message) } else {
        setPwSuccess(true)
        setNewPassword('')
        setConfirmPassword('')
      }
    } finally { setPwLoading(false) }
  }

  const signOutAll = async () => {
    setSignOutAllLoading(true)
    try {
      await supabase.auth.signOut({ scope: 'global' })
      router.push('/login')
    } finally { setSignOutAllLoading(false) }
  }

  const exportData = async () => {
    setExportLoading(true)
    try {
      const res = await fetch('/api/user/export')
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `homi-data-export-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } finally { setExportLoading(false) }
  }

  const deleteAccount = async () => {
    setDeleteError(null)
    if (deleteConfirm !== 'DELETE MY ACCOUNT') {
      setDeleteError('Type DELETE MY ACCOUNT exactly to confirm.')
      return
    }
    setDeleteLoading(true)
    try {
      const res = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'DELETE MY ACCOUNT' }),
      })
      const data = await res.json()
      if (!data.success) { setDeleteError(data.error ?? 'Deletion failed.'); return }
      await supabase.auth.signOut()
      router.push('/login')
    } finally { setDeleteLoading(false) }
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
          <p className="text-text-2 text-sm mt-0.5">Manage your password, sessions, and data.</p>
        </div>
      </div>

      {/* Change Password */}
      <Card variant="elevated">
        <div className="px-5 pt-4 pb-2 border-b border-surface-3 flex items-center gap-2">
          <Key className="w-4 h-4 text-brand-cyan" />
          <p className="text-sm font-semibold text-text-1">Change Password</p>
        </div>
        <div className="p-5 space-y-4">
          <Input label="New Password" type="password" placeholder="At least 8 characters"
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <Input label="Confirm New Password" type="password" placeholder="Repeat new password"
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          {pwError && (
            <div className="flex items-center gap-2 text-sm text-brand-crimson">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{pwError}
            </div>
          )}
          {pwSuccess && (
            <div className="flex items-center gap-2 text-sm text-brand-emerald">
              <Check className="w-4 h-4 flex-shrink-0" />Password updated successfully.
            </div>
          )}
          <Button variant="primary" onClick={changePassword} loading={pwLoading}
            disabled={!newPassword || !confirmPassword}>
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
            <Button variant="outline" className="w-full" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}>
              Sign Out of This Device
            </Button>
            <Button variant="ghost" className="w-full text-brand-crimson hover:bg-brand-crimson/10"
              onClick={signOutAll} loading={signOutAllLoading}>
              Sign Out of All Devices
            </Button>
          </div>
        </div>
      </Card>

      {/* Data Export */}
      <Card variant="elevated">
        <div className="px-5 pt-4 pb-2 border-b border-surface-3 flex items-center gap-2">
          <Download className="w-4 h-4 text-brand-cyan" />
          <p className="text-sm font-semibold text-text-1">Export Your Data</p>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-text-2">
            Download a complete copy of all your HōMI data — assessments, scores, transformation paths, messages, and account information — as a JSON file.
          </p>
          <Button variant="outline" onClick={exportData} loading={exportLoading}
            rightIcon={<Download className="w-4 h-4" />}>
            Download My Data
          </Button>
        </div>
      </Card>

      {/* Delete Account */}
      <Card variant="elevated" className="border-brand-crimson/20">
        <div className="px-5 pt-4 pb-2 border-b border-surface-3 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-brand-crimson" />
          <p className="text-sm font-semibold text-brand-crimson">Delete Account</p>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-text-2">
            Permanently delete your account and all associated data. This action is irreversible — all assessments, scores, transformation paths, and messages will be erased.
          </p>
          {!showDeleteForm ? (
            <Button
              variant="ghost"
              className="text-brand-crimson hover:bg-brand-crimson/10"
              onClick={() => setShowDeleteForm(true)}
            >
              I want to delete my account
            </Button>
          ) : (
            <div className="space-y-3 p-4 rounded-brand border border-brand-crimson/30 bg-brand-crimson/5">
              <p className="text-sm font-medium text-text-1">
                Type <span className="font-mono text-brand-crimson">DELETE MY ACCOUNT</span> to confirm:
              </p>
              <Input
                placeholder="DELETE MY ACCOUNT"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
              />
              {deleteError && (
                <div className="flex items-center gap-2 text-sm text-brand-crimson">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{deleteError}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  className="text-brand-crimson hover:bg-brand-crimson/10"
                  onClick={deleteAccount}
                  loading={deleteLoading}
                  disabled={deleteConfirm !== 'DELETE MY ACCOUNT'}
                >
                  Permanently Delete
                </Button>
                <Button variant="outline" onClick={() => { setShowDeleteForm(false); setDeleteConfirm('') }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
