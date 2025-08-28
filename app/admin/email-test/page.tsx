'use client'

import React, { useState } from 'react'
import { AdminOnly } from '@/components/RoleGuard'

export default function EmailTestPage() {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('Test email')
  const [text, setText] = useState('Hello from Comparee.ai')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, text })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.detail || data?.error || 'Request failed')
      } else {
        setResult(data)
      }
    } catch (err: any) {
      setError(err?.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminOnly fallback={<div className="p-6">Access denied</div>}>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Email Test</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <input
              type="email"
              value={to}
              onChange={e => setTo(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
              minLength={3}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Text</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              required
              rows={6}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send test'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
            <div className="font-medium">OK</div>
            <div className="text-sm">Provider: {result.provider}</div>
            {result.messageId && <div className="text-sm">MessageID: {result.messageId}</div>}
            {result.status && <div className="text-sm">Status: {result.status}</div>}
          </div>
        )}
      </div>
    </AdminOnly>
  )
}


