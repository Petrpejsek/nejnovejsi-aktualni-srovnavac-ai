'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function AccountVerifyPage() {
  const params = useSearchParams()
  const token = params.get('token') || ''
  const [result, setResult] = useState<string>('')

  async function doVerify() {
    try {
      const res = await fetch('/api/auth/email/verify-confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      if (res.status === 204) { setResult('Already verified'); return }
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setResult(data?.error || 'Verification failed'); return }
      setResult('Email verified')
    } catch {
      setResult('Verification failed')
    }
  }

  useEffect(() => { if (token) doVerify() }, [token])

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Verify Email</h1>
      <div className="p-3 bg-gray-50 border rounded">{result || 'Verifying…'}</div>
      <button onClick={doVerify} className="mt-3 px-4 py-2 bg-purple-600 text-white rounded">Retry</button>
    </div>
  )
}


