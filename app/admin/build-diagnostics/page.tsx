'use client'

import React, { useEffect, useState } from 'react'
import { AdminOnly } from '@/components/RoleGuard'

export default function BuildDiagnosticsPage() {
  const [result, setResult] = useState<string>('')
  const [info, setInfo] = useState<{ nodeEnv: string; pythonApiUrl: string; emailTokenSecretSet: boolean; clientEnvUsagePass: boolean } | null>(null)

  async function loadInfo() {
    try {
      const r = await fetch('/api/admin/build-diagnostics', { cache: 'no-store' })
      if (!r.ok) throw new Error(`status ${r.status}`)
      const j = await r.json()
      setInfo(j)
    } catch (e: any) {
      setInfo(null)
    }
  }

  async function probe() {
    try {
      const r = await fetch('/api/auth/password/reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'diagnostic@example.com' })
      })
      setResult(`probe /api/auth/password/reset-request: ${r.status}`)
    } catch (e: any) {
      setResult(`probe failed: ${e?.message || 'error'}`)
    }
  }

  useEffect(() => { loadInfo(); probe() }, [])

  return (
    <AdminOnly fallback={<div className="p-6">Access denied</div>}>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Build Diagnostics</h1>
        <div className="space-y-2 text-sm">
          <div>NODE_ENV: <span className="font-mono">{info?.nodeEnv ?? '(unknown)'}</span></div>
          <div>PYTHON_API_URL: <span className="font-mono">{info?.pythonApiUrl || '(unset)'} </span></div>
          <div>EMAIL_TOKEN_SECRET: <span className="font-mono">{info?.emailTokenSecretSet ? 'set' : 'unset'}</span></div>
          <div>client env usage: <span className="font-mono">{info?.clientEnvUsagePass ? 'PASS' : 'FAIL'}</span></div>
        </div>
        <div className="mt-4 p-3 bg-gray-50 border rounded text-sm">
          {result || 'probing…'}
        </div>
      </div>
    </AdminOnly>
  )
}
