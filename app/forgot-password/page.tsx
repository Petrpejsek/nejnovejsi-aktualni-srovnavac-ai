'use client'

import React, { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await fetch('/api/auth/password/reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      setDone(true)
    } catch (e: any) {
      setDone(true)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Forgot Password</h1>
      {done ? (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded">
          If an account exists for this email, we sent instructions to reset your password.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" required className="w-full border rounded px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded">Send reset link</button>
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </form>
      )}
    </div>
  )
}


