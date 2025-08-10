'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function CompanySettingsPage() {
  const { isAuthenticated, isCompany } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Auto‑recharge UI was moved to Billing. No controls here.

  // Password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState<string | null>(null)

  // Notifications
  const [notifLoading, setNotifLoading] = useState(true)
  const [notifSaving, setNotifSaving] = useState(false)
  const [notifSaved, setNotifSaved] = useState<string | null>(null)
  const [prefs, setPrefs] = useState<any>({})

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!isAuthenticated || !isCompany) return

        // Load notifications
        setNotifLoading(true)
        const n = await fetch('/api/advertiser/settings/notifications', { cache: 'no-store' })
        const nData = await n.json().catch(() => ({}))
        if (n.ok && nData?.success) setPrefs(nData.data)
        setNotifLoading(false)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isAuthenticated, isCompany])

  const saveNotifications = async () => {
    try {
      setNotifSaving(true)
      const resp = await fetch('/api/advertiser/settings/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(prefs)
      })
      if (!resp.ok) throw new Error('Failed to save notifications')
      setNotifSaved('Saved')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save notifications')
    } finally {
      setNotifSaving(false)
      setTimeout(() => setNotifSaved(null), 2500)
    }
  }

  const changePassword = async () => {
    try {
      setSavingPassword(true)
      setPasswordSaved(null)
      setError(null)

      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error('Fill all password fields')
      }
      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match')
      }
      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters')
      }

      const resp = await fetch('/api/advertiser/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword })
      })
      const data = await resp.json().catch(() => ({}))
      if (!resp.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to change password')
      }

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSaved('Password updated')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to change password')
    } finally {
      setSavingPassword(false)
      setTimeout(() => setPasswordSaved(null), 2500)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-40 w-full bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage account security, notifications and integrations</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-4">{error}</div>
      )}

      {/* Billing automation (Auto‑Recharge) is managed on the Billing page. */}

      {/* Email notifications */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Email notifications</h2>
        {notifLoading ? (
          <div className="h-24 bg-gray-100 rounded animate-pulse" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['emailLowBalance', 'Low balance alerts'],
              ['emailInvoice', 'Invoices ready'],
              ['emailWeeklySummary', 'Weekly performance summary'],
              ['emailNewsletter', 'Newsletter & product news'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between p-3 border rounded">
                <span className="text-sm text-gray-800">{label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(prefs[key])}
                  onChange={(e) => setPrefs((p: any) => ({ ...p, [key]: e.target.checked }))}
                  className="h-4 w-4"
                />
              </label>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3">
          <button onClick={saveNotifications} disabled={notifSaving} className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-black disabled:opacity-50">
            {notifSaving ? 'Saving…' : 'Save Notifications'}
          </button>
          {notifSaved && <span className="text-sm text-green-600">{notifSaved}</span>}
        </div>
      </div>

      {/* Password */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={changePassword}
            disabled={savingPassword}
            className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-black disabled:opacity-50"
          >
            {savingPassword ? 'Saving…' : 'Update Password'}
          </button>
          {passwordSaved && <span className="text-sm text-green-600">{passwordSaved}</span>}
        </div>
      </div>
    </div>
  )
}


