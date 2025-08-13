'use client'

import React, { useEffect, useMemo, useState } from 'react'

type RangeKey = 'today' | '7d' | '30d' | '90d' | 'all'

interface PartnerRow {
  partnerId: string
  clicks: number
  conversions: number
  commission: number
}

interface RefRow {
  refCode: string
  clicks: number
  conversions: number
  commission: number
}

interface AffiliateStatsResponse {
  range: string
  totals: { clicks: number; conversions: number; commission: number; cr: number }
  topPartners: PartnerRow[]
  topRefCodes: RefRow[]
}

export default function AdminAffiliatePage() {
  const [range, setRange] = useState<RangeKey>('7d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<AffiliateStatsResponse | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/admin/affiliate?range=${range}`, { signal: controller.signal, cache: 'no-store' })
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
          <h1 className="text-3xl font-bold text-gray-900">Affiliate</h1>
          <p className="text-gray-600 mt-1">Přehled partnerů, ref kódů a provizí</p>
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

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600">Kliky</div>
          <div className="text-3xl font-semibold text-gray-900">{loading ? '…' : (data?.totals.clicks ?? 0).toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600">Konverze</div>
          <div className="text-3xl font-semibold text-gray-900">{loading ? '…' : (data?.totals.conversions ?? 0).toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600">Provize</div>
          <div className="text-3xl font-semibold text-gray-900">{loading ? '…' : (data?.totals.commission ?? 0).toLocaleString('cs-CZ', { style: 'currency', currency: 'USD' })}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600">CR</div>
          <div className="text-3xl font-semibold text-gray-900">{loading ? '…' : `${(data?.totals.cr ?? 0).toFixed(1)}%`}</div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Top partneři</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kliky</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Konverze</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provize</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(data?.topPartners || []).map((p) => (
                  <tr key={p.partnerId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.partnerId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.clicks.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.conversions.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.commission.toLocaleString('cs-CZ', { style: 'currency', currency: 'USD' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Top ref kódy</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kliky</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Konverze</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provize</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(data?.topRefCodes || []).map((r) => (
                  <tr key={r.refCode} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.refCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.clicks.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.conversions.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.commission.toLocaleString('cs-CZ', { style: 'currency', currency: 'USD' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}


