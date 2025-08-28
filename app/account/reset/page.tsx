'use client'

import React, { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function ResetPage() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token') || ''
  const [pwd, setPwd] = useState('')
  const [pwd2, setPwd2] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    if (pwd !== pwd2) { setErr('Passwords do not match'); return }
    const res = await fetch('/api/auth/password/reset-confirm', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: pwd })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok && res.status !== 202) { setErr(data?.error || 'Reset failed'); return }
    setMsg('Password updated. Redirecting to login...')
    setTimeout(() => router.push('/auth/login'), 1500)
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Reset Password</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">New password</label>
          <input type="password" required className="w-full border rounded px-3 py-2" value={pwd} onChange={e => setPwd(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirm password</label>
          <input type="password" required className="w-full border rounded px-3 py-2" value={pwd2} onChange={e => setPwd2(e.target.value)} />
        </div>
        <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded">Update password</button>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        {msg && <div className="text-green-700 text-sm">{msg}</div>}
      </form>
    </div>
  )
}


