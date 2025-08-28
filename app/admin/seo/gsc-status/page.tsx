import React from 'react'
import prisma from '@/lib/prisma'
import type { seo_gsc_status as SeoGscStatus } from '@prisma/client'
import { isProduction } from '@/lib/env'

async function getData(search: string | null, indexed: string | null, canonicalMismatch: string | null, stale: string | null) {
  const where: any = {}
  if (search) where.url = { contains: search }
  if (indexed === 'true') where.indexed = true
  if (indexed === 'false') where.indexed = false
  if (stale === '48h') {
    const d = new Date(Date.now() - 48 * 3600 * 1000)
    where.checked_at = { lt: d }
  }
  const rows: SeoGscStatus[] = await prisma.seo_gsc_status.findMany({
    where,
    orderBy: { checked_at: 'desc' },
    take: 500
  })
  if (canonicalMismatch === 'true') {
    return rows.filter(r => r.user_canonical && r.google_canonical && r.user_canonical !== r.google_canonical)
  }
  return rows
}

export default async function GscStatusPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const q = typeof searchParams.q === 'string' ? searchParams.q : null
  const idx = typeof searchParams.indexed === 'string' ? searchParams.indexed : null
  const cm = typeof searchParams.canonical_mismatch === 'string' ? searchParams.canonical_mismatch : null
  const stale = typeof searchParams.stale === 'string' ? searchParams.stale : null
  const rows = await getData(q, idx, cm, stale)
  const enrollment = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/seo/enrollment-status`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ enabled: false }))

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">GSC URL Inspection Status</h1>
        <div className="flex gap-2">
          {enrollment?.enabled ? (
            <a href="/admin/gsc/oauth/start" className="px-3 py-2 rounded bg-emerald-600 text-white">Sign in &amp; get refresh token</a>
          ) : null}
          <form action="/api/seo/gsc-sync" method="post">
            <button className="px-3 py-2 rounded bg-blue-600 text-white">Sync now</button>
          </form>
        </div>
      </div>

      <form className="flex gap-2 mb-4" method="get">
        <input className="border px-2 py-1 rounded" name="q" placeholder="Search URL" defaultValue={q || ''} />
        <select className="border px-2 py-1 rounded" name="indexed" defaultValue={idx || ''}>
          <option value="">all</option>
          <option value="true">indexed</option>
          <option value="false">not indexed</option>
        </select>
        <label className="flex items-center gap-1">
          <input type="checkbox" name="canonical_mismatch" value="true" defaultChecked={cm === 'true'} />
          <span>canonical mismatch</span>
        </label>
        <select className="border px-2 py-1 rounded" name="stale" defaultValue={stale || ''}>
          <option value="">any</option>
          <option value="48h">stale &gt;48h</option>
        </select>
        <button className="px-3 py-1 border rounded">Filter</button>
      </form>

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">URL</th>
              <th className="text-left p-2">Indexed</th>
              <th className="text-left p-2">Coverage</th>
              <th className="text-left p-2">Last crawl</th>
              <th className="text-left p-2">Checked at</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const mismatch = r.user_canonical && r.google_canonical && r.user_canonical !== r.google_canonical
              return (
                <tr key={r.url} className="border-t">
                  <td className="p-2"><a className="text-blue-600 underline" href={r.url} target="_blank" rel="noreferrer">{r.url}</a></td>
                  <td className="p-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${r.indexed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{r.indexed ? 'Indexed' : 'Not indexed'}</span>
                  </td>
                  <td className="p-2">
                    <span className={`px-2 py-1 text-xs rounded ${mismatch ? 'bg-red-100 text-red-700' : ''}`} title={mismatch ? `User: ${r.user_canonical}\nGoogle: ${r.google_canonical}` : ''}>
                      {r.coverage_state || '-'}
                    </span>
                  </td>
                  <td className="p-2">{r.last_crawl ? new Date(r.last_crawl).toISOString() : '-'}</td>
                  <td className="p-2">{new Date(r.checked_at).toISOString()}</td>
                  <td className="p-2">
                    <form action="/api/admin/gsc/rescan" method="post" className="inline">
                      <input type="hidden" name="url" value={r.url} />
                      <button className="px-2 py-1 border rounded text-xs">Re-inspect</button>
                    </form>
                    <a className="ml-2 text-xs text-blue-600 underline" target="_blank" rel="noreferrer" href={`https://search.google.com/search-console/inspect?resource_id=https://comparee.ai/&url=${encodeURIComponent(r.url)}`}>
                      Open in GSC
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}


