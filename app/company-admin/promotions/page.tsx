'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type PromotionalPackage = {
  id: string
  title: string
  description: string
  amount: number
  bonus: number
  savings?: number | null
  popular?: boolean | null
  firstTime?: boolean | null
  minimumSpend?: number | null
}

export default function PromotionsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [packages, setPackages] = useState<PromotionalPackage[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/promotional-packages', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setPackages(Array.isArray(data.packages) ? data.packages : [])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load promotions')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-6 bg-white animate-pulse">
              <div className="h-5 w-2/3 bg-gray-200 rounded mb-3" />
              <div className="h-4 w-full bg-gray-200 rounded mb-2" />
              <div className="h-4 w-5/6 bg-gray-200 rounded mb-6" />
              <div className="h-10 w-full bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-700">Error loading promotions: {error}</div>
          <button
            onClick={() => location.reload()}
            className="mt-3 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
          <p className="text-gray-600">Curated promotional credit packages for faster growth</p>
        </div>
        <Link
          href="/company-admin/billing"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Go to Billing
        </Link>
      </div>

      {packages.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-600">
          No promotions available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg.id} className={`border rounded-lg p-6 bg-white ${pkg.popular ? 'border-purple-300 shadow-sm' : 'border-gray-200'}`}>
              {pkg.popular && (
                <div className="mb-2 inline-block text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  Popular
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900">{pkg.title}</h3>
              <p className="text-gray-600 mt-1 mb-4">{pkg.description}</p>
              <div className="flex items-end gap-3 mb-6">
                <div className="text-3xl font-bold text-gray-900">${pkg.amount.toFixed(0)}</div>
                {pkg.bonus > 0 && (
                  <div className="text-sm text-green-700 bg-green-50 px-2 py-0.5 rounded">+${pkg.bonus} bonus</div>
                )}
              </div>
              <Link
                href={{ pathname: '/company-admin/billing', query: { offerId: 'starter' } }}
                className="w-full inline-flex justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Select
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


