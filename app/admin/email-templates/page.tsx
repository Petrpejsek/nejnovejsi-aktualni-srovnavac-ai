'use client'

import React, { useState } from 'react'
import { AdminOnly } from '@/components/RoleGuard'

type TemplateKey = 'password_reset' | 'verify_email' | 'generic_notice'

export default function EmailTemplatesPage() {
  const [template, setTemplate] = useState<TemplateKey>('password_reset')
  const [locale, setLocale] = useState('en')
  const [to, setTo] = useState('')
  const [actionUrl, setActionUrl] = useState('https://comparee.ai/')
  const [userName, setUserName] = useState('')
  const [message, setMessage] = useState('')
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [loadingSend, setLoadingSend] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [previewText, setPreviewText] = useState<string>('')
  const [previewSubject, setPreviewSubject] = useState<string>('')
  const [sendResult, setSendResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  async function doPreview() {
    setLoadingPreview(true)
    setError(null)
    setSendResult(null)
    try {
      const variables: any = { action_url: actionUrl }
      if (userName) variables.user_name = userName
      if (message) variables.message = message
      const res = await fetch('/api/admin/email/preview-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template, locale, variables })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail || data?.error || 'Preview failed')
      setPreviewHtml(data.html || '')
      setPreviewText(data.text || '')
      setPreviewSubject(data.subject || '')
    } catch (e: any) {
      setError(e.message || 'Preview error')
    } finally {
      setLoadingPreview(false)
    }
  }

  async function doSend() {
    setLoadingSend(true)
    setError(null)
    setSendResult(null)
    try {
      const variables: any = { action_url: actionUrl }
      if (userName) variables.user_name = userName
      if (message) variables.message = message
      const res = await fetch('/api/admin/email/send-template-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, template, locale, variables })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail || data?.error || 'Send failed')
      setSendResult(data)
    } catch (e: any) {
      setError(e.message || 'Send error')
    } finally {
      setLoadingSend(false)
    }
  }

  return (
    <AdminOnly fallback={<div className="p-6">Access denied</div>}>
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Email Templates</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Template</label>
              <select value={template} onChange={e => setTemplate(e.target.value as TemplateKey)} className="w-full border rounded px-3 py-2">
                <option value="password_reset">password_reset</option>
                <option value="verify_email">verify_email</option>
                <option value="generic_notice">generic_notice</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Locale</label>
              <select value={locale} onChange={e => setLocale(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="en">en</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">To (for Send test)</label>
              <input value={to} onChange={e => setTo(e.target.value)} type="email" className="w-full border rounded px-3 py-2" placeholder="user@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">action_url</label>
              <input value={actionUrl} onChange={e => setActionUrl(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">user_name (optional)</label>
              <input value={userName} onChange={e => setUserName(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            {template === 'generic_notice' && (
              <div>
                <label className="block text-sm font-medium mb-1">message</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} className="w-full border rounded px-3 py-2" />
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={doPreview} disabled={loadingPreview} className="px-4 py-2 bg-gray-800 text-white rounded">{loadingPreview ? 'Preview…' : 'Preview'}</button>
              <button onClick={doSend} disabled={loadingSend} className="px-4 py-2 bg-purple-600 text-white rounded">{loadingSend ? 'Sending…' : 'Send test'}</button>
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>}
            {sendResult && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
                <div>OK: {String(sendResult.ok)}</div>
                <div>Provider: {sendResult.provider}</div>
                {sendResult.messageId && <div>MessageID: {sendResult.messageId}</div>}
                {sendResult.status && <div>Status: {sendResult.status}</div>}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-1">Subject</div>
              <div className="border rounded px-3 py-2 bg-white">{previewSubject || <span className="text-gray-500">(none)</span>}</div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">HTML Preview</div>
              <div className="border rounded bg-white" style={{height: 360}}>
                <iframe title="html-preview" srcDoc={previewHtml} className="w-full h-full" />
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Text Fallback</div>
              <textarea value={previewText} readOnly rows={10} className="w-full border rounded px-3 py-2 bg-white" />
            </div>
          </div>
        </div>
      </div>
    </AdminOnly>
  )
}


