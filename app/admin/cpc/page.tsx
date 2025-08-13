'use client'

import React, { useEffect, useMemo, useState } from 'react'

type RangeKey = 'today' | '7d' | '30d' | '90d' | 'all'

interface CampaignRow {
  id: string
  partnerId: string | null
  monetizableType: string
  monetizableId: string
  refCode: string
  cpcRate: number | null
  clicks: number
  cost: number
}

interface CpcStatsResponse {
  range: string
  totals: { clicks: number; cost: number; cpc: number }
  campaigns: CampaignRow[]
}

export default function AdminCpcPage() {
  const [range, setRange] = useState<RangeKey>('7d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<CpcStatsResponse | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/admin/cpc?range=${range}`, { signal: controller.signal, cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        setData(json)
      } catch (e: any) {
        setError(e?.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [range])

  const ranges: { value: RangeKey; label: string }[] = useMemo(() => (
    [
      { value: 'today', label: 'Dnes' },
      { value: '7d', label: '7 dní' },
      { value: '30d', label: '30 dní' },
      { value: '90d', label: '90 dní' },
      { value: 'all', label: 'Max' },
    ]
  ), [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CPC</h1>
          <p className="text-gray-600 mt-1">Kliky, náklady, sazby a kampaně</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Období</label>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as RangeKey)}
            className="min-w-[160px] text-sm border rounded-md px-3 py-1.5"
          >
            {ranges.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600">Kliky</div>
          <div className="text-3xl font-semibold text-gray-900">{loading ? '…' : (data?.totals.clicks ?? 0).toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600">Náklady</div>
          <div className="text-3xl font-semibold text-gray-900">{loading ? '…' : (data?.totals.cost ?? 0).toLocaleString('cs-CZ', { style: 'currency', currency: 'USD' })}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600">CPC</div>
          <div className="text-3xl font-semibold text-gray-900">{loading ? '…' : (data?.totals.cpc ?? 0).toFixed(2)}</div>
        </div>
      </div>

      {/* Campaign table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Kampaně</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kliky</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPC rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Náklady</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(data?.campaigns || []).map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.refCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.partnerId ?? '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.clicks.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.cpcRate ?? '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.cost.toLocaleString('cs-CZ', { style: 'currency', currency: 'USD' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


