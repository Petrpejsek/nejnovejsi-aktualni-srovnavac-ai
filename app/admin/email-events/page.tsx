'use client'

import React, { useEffect, useState } from 'react'
import { AdminOnly } from '@/components/RoleGuard'

type BounceItem = {
  ID: number
  Type: string
  Email: string
  BouncedAt?: string
  Description?: string
  Inactive?: boolean
}

export default function EmailEventsPage() {
  const [type, setType] = useState('All')
  const [count, setCount] = useState(50)
  const [offset, setOffset] = useState(0)
  const [items, setItems] = useState<BounceItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<any>(null)
  const [activating, setActivating] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  async function loadList() {
    setLoading(true)
    setError(null)
    setDetail(null)
    try {
      const params = new URLSearchParams()
      if (type) params.set('type', type)
      params.set('count', String(count))
      params.set('offset', String(offset))
      const res = await fetch(`/api/admin/email/bounces?${params.toString()}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail || data?.error || 'Failed to load')
      setItems(data.Bounces || [])
    } catch (e: any) {
      setError(e.message || 'Load error')
    } finally {
      setLoading(false)
    }
  }

  async function loadDetail(id: number) {
    setSelectedId(id)
    setDetail(null)
    try {
      const res = await fetch(`/api/admin/email/bounces/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail || data?.error || 'Failed to load detail')
      setDetail(data)
    } catch (e: any) {
      setDetail({ error: e.message || 'Detail error' })
    }
  }

  async function activateSelected() {
    if (!detail || !selectedId) return
    if (!detail.CanActivate || detail.Inactive === false) {
      setToast('Bounce not eligible for activation')
      return
    }
    if (!confirm('This will ask Postmark to reactivate the address. Proceed?')) return
    setActivating(true)
    try {
      const res = await fetch(`/api/admin/email/bounces/${selectedId}/activate`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail || data?.error || 'Activation failed')
      setToast('Activated')
      // refresh detail and list
      await loadDetail(selectedId)
      await loadList()
    } catch (e: any) {
      setToast(e.message || 'Activation error')
    } finally {
      setActivating(false)
    }
  }

  useEffect(() => { loadList() }, [])

  return (
    <AdminOnly fallback={<div className="p-6">Access denied</div>}>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Email Events</h1>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select value={type} onChange={e => setType(e.target.value)} className="border rounded px-3 py-2">
            <option>All</option>
            <option>HardBounce</option>
            <option>SoftBounce</option>
            <option>SpamComplaint</option>
          </select>
          <select value={count} onChange={e => setCount(Number(e.target.value))} className="border rounded px-3 py-2">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <button onClick={() => { setOffset(0); loadList() }} className="px-4 py-2 bg-gray-800 text-white rounded">Reload</button>
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded mb-3">{error}</div>}

        <div className="overflow-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">BouncedAt</th>
                <th className="text-left px-3 py-2">Type</th>
                <th className="text-left px-3 py-2">Email</th>
                <th className="text-left px-3 py-2">Description</th>
                <th className="text-left px-3 py-2">Inactive</th>
              </tr>
            </thead>
            <tbody>
              {items.map(it => (
                <tr key={it.ID} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => loadDetail(it.ID)}>
                  <td className="px-3 py-2 whitespace-nowrap">{it.BouncedAt || '-'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{it.Type}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{it.Email}</td>
                  <td className="px-3 py-2">{it.Description || '-'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{String(it.Inactive ?? false)}</td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr><td className="px-3 py-4" colSpan={5}>No items</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && <div className="mt-3 text-sm text-gray-500">Loading…</div>}

        {toast && (
          <div className="mt-3 p-2 text-sm bg-gray-800 text-white inline-block rounded">{toast}</div>
        )}

        {selectedId !== null && (
          <div className="mt-6 border rounded p-3 bg-white">
            <div className="font-medium mb-2">Detail ID: {selectedId}</div>
            {detail && detail.Inactive && detail.CanActivate && (
              <button onClick={activateSelected} disabled={activating} className="mb-3 px-4 py-2 bg-purple-600 text-white rounded">
                {activating ? 'Activating…' : 'Activate address'}
              </button>
            )}
            <pre className="text-xs whitespace-pre-wrap">{detail ? JSON.stringify(detail, null, 2) : 'Loading detail...'}</pre>
          </div>
        )}
      </div>
    </AdminOnly>
  )
}


