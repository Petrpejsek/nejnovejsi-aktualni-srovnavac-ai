import React from 'react'

async function fetchJSON<T>(url: string): Promise<T> {
  const r = await fetch(url, { cache: 'no-store' })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}

type Diagnostics = {
  environment: string
  email_enabled: boolean
  email_tokens_enabled: boolean
  provider: string | null
  _from: string | null
  transactional_stream: string | null
  newsletter_stream: string | null
  missing: string[]
  base_urls: Record<string, string | null>
  version: string | null
}

export const dynamic = 'force-dynamic'

export default async function EmailDiagnosticsPage() {
  const diag = await fetchJSON<Diagnostics>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/email/diagnostics`).catch(() => null)

  async function PostmarkSanity() {
    'use server'
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Email Diagnostics</h1>
      {!diag ? (
        <div className="p-4 rounded border border-red-200 bg-red-50 text-red-700">Failed to load diagnostics</div>
      ) : (
        <div className="space-y-6">
          {!diag.email_enabled && (
            <div className="p-3 rounded border border-red-200 bg-red-50 text-red-700">
              Email disabled{diag.missing?.length ? `: ${diag.missing.join(', ')}` : ''}
            </div>
          )}

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h2 className="font-medium mb-2">Status</h2>
              <ul className="text-sm space-y-1">
                <li><b>Environment:</b> {diag.environment}</li>
                <li><b>Email enabled:</b> {String(diag.email_enabled)}</li>
                <li><b>Email tokens enabled:</b> {String(diag.email_tokens_enabled)}</li>
                <li><b>Provider:</b> {diag.provider || '-'}</li>
                <li><b>From:</b> {diag._from || '-'}</li>
                <li><b>Transactional stream:</b> {diag.transactional_stream || '-'}</li>
                <li><b>Newsletter stream:</b> {diag.newsletter_stream || '-'}</li>
                <li><b>Version:</b> {diag.version || '-'}</li>
              </ul>
            </div>
            <div className="p-4 border rounded">
              <h2 className="font-medium mb-2">Missing secrets</h2>
              <div className="flex flex-wrap gap-2">
                {diag.missing?.length ? diag.missing.map((m) => (
                  <span key={m} className="px-2 py-1 text-xs rounded-full bg-yellow-50 text-yellow-800 border border-yellow-200">{m}</span>
                )) : <span className="text-sm text-gray-500">none</span>}
              </div>
            </div>
          </section>

          <section className="p-4 border rounded">
            <h2 className="font-medium mb-2">Base URLs</h2>
            <ul className="text-sm space-y-1">
              <li><b>Python API:</b> {diag.base_urls?.python_api_url || '-'}</li>
              <li><b>Next Public API Base:</b> {diag.base_urls?.next_public_api_base_url || '-'}</li>
            </ul>
          </section>

          <section className="p-4 border rounded">
            <h2 className="font-medium mb-2">Actions</h2>
            <div className="flex gap-3">
              <form action={`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/email/postmark-sanity`} method="get">
                <button className="px-3 py-2 rounded bg-blue-600 text-white">Check Postmark</button>
              </form>
              <a href="/admin/email-templates" className="px-3 py-2 rounded bg-gray-800 text-white">Send template test</a>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}



