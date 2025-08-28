'use client'

import React, { useState } from 'react'

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  async function onResend(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    await fetch('/api/auth/email/verify-request', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
    })
    setMsg('If your email is not verified, we sent you a verification link.')
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Verify your email</h1>
      <form onSubmit={onResend} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" required className="w-full border rounded px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded">Resend verification</button>
      </form>
      {msg && <div className="mt-3 text-green-700 text-sm">{msg}</div>}
    </div>
  )
}


