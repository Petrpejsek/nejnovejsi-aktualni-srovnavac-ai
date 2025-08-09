'use client'

import React, { useState, useEffect } from 'react'
import CompanyStatistics from '@/app/admin/company-statistics/page'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { 
  ChartBarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  CubeIcon,
  AcademicCapIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

interface AnalyticsData {
  totalClicks: number
  uniqueVisitors: number
}

export default function AnalyticsAdmin() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tabParam = ((searchParams?.get('tab') as 'traffic' | 'companies') || 'traffic')
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalClicks: 0,
    uniqueVisitors: 0
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/clicks?range=${timeRange}`)
        const data = await response.json()
        setAnalytics({
          totalClicks: data.totalClicks || 0,
          uniqueVisitors: data.uniqueVisitors || 0
        })
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeRange])

  // Reset analytics – odstraněno z UI pro bezpečnost

  // Reálná data – doplňkové metriky načteme z /api/admin-stats
  const [additionalStats, setAdditionalStats] = useState({
    products: { total: 0, views: 0, clicksToday: 0 },
    courses: { total: 0, enrollments: 0, completionRate: 0 },
    companies: { total: 0, active: 0, pendingApproval: 0 },
    pages: { mostVisited: [] as Array<{ page: string; views: number; clicks: number; ctr?: number }>} 
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, mvRes] = await Promise.all([
          fetch('/api/admin-stats', { cache: 'no-store' }),
          fetch(`/api/admin/most-visited?range=${timeRange}`, { cache: 'no-store' })
        ])
        if (statsRes.ok) {
          const data = await statsRes.json()
          setAdditionalStats({
            products: { total: data.products.total || 0, views: 0, clicksToday: 0 },
            courses: { total: data.courses.total || 0, enrollments: 0, completionRate: 0 },
            companies: { total: data.companies.total || 0, active: data.companies.active || 0, pendingApproval: data.companies.pending || 0 },
            pages: { mostVisited: [] }
          })
        }
        if (mvRes.ok) {
          const mv = await mvRes.json()
          setAdditionalStats(prev => ({
            ...prev,
            pages: { mostVisited: mv.items || [] }
          }))
        }
      } catch (e) {
        console.error('Failed to load admin stats for analytics page')
      }
    }
    load()
  }, [timeRange])

  const timeRanges = [
    { value: '1d', label: 'Dnes' },
    { value: '7d', label: 'Posledních 7 dní' },
    { value: '30d', label: 'Posledních 30 dní' },
    { value: '90d', label: 'Posledních 90 dní' }
  ]

  // Calculate conversion rate
  const conversionRate = analytics.totalClicks > 0 
    ? ((analytics.uniqueVisitors / analytics.totalClicks) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ChartBarIcon className="w-8 h-8 text-purple-600" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Přehled návštěvnosti, kliků a engagement metrik
          </p>
        </div>
        
      <div className="flex items-center gap-4">
          <div className="bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => router.replace(`${pathname}?tab=traffic`, { scroll: false })}
              className={`px-4 py-2 text-sm rounded-md ${tabParam === 'traffic' ? 'bg-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Návštěvnost & Kliky
            </button>
            <button
              onClick={() => router.replace(`${pathname}?tab=companies`, { scroll: false })}
              className={`px-4 py-2 text-sm rounded-md ${tabParam === 'companies' ? 'bg-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Firemní statistiky
            </button>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          
          {/* Reset statistik odstraněn kvůli bezpečnosti */}
        </div>
      </div>

      {tabParam === 'traffic' && (
        <>
        {/* Main Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <EyeIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Celkové kliky</p>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? '...' : analytics.totalClicks.toLocaleString()}
              </p>
              {/* Odstraněn statický trend – bude doplněn reálnými porovnáními */}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Unikátní návštěvníci</p>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? '...' : analytics.uniqueVisitors.toLocaleString()}
              </p>
              {/* Odstraněn statický trend – bude doplněn reálnými porovnáními */}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CursorArrowRaysIcon className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
              <p className="text-3xl font-bold text-gray-900">{conversionRate}%</p>
              <p className="text-xs text-gray-500 mt-1">
                Definice: unikátní návštěvníci ÷ celkové kliky × 100
                {loading ? '' : ` = ${analytics.uniqueVisitors.toLocaleString()} ÷ ${analytics.totalClicks.toLocaleString()} × 100`}
              </p>
              <p className="text-[11px] text-gray-400">(ekvivalentně 100 ÷ průměrný počet kliků na návštěvníka)</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Průměr. kliky/den</p>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? '...' : (() => {
                  const days = { '1d': 1, '7d': 7, '30d': 30, '90d': 90 }[timeRange] ?? 7
                  const val = days > 0 ? Math.round(analytics.totalClicks / days) : 0
                  return val.toLocaleString()
                })()}
              </p>
              <p className="text-[11px] text-gray-400">(počítáno z vybraného období)</p>
            </div>
          </div>
        </div>
        </div>
        </>
      )}

      {tabParam === 'companies' && (
        <div className="mt-4">
          <CompanyStatistics />
        </div>
      )}

      {/* Content Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Analytics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <CubeIcon className="w-6 h-6 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Produkty</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Celkem produktů</span>
              <span className="text-lg font-semibold text-gray-900">{additionalStats.products.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Zobrazení</span>
              <span className="text-lg font-semibold text-gray-900">{additionalStats.products.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Kliky dnes</span>
              <span className="text-lg font-semibold text-green-600">{additionalStats.products.clicksToday}</span>
            </div>
          </div>
        </div>

        {/* Course Analytics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <AcademicCapIcon className="w-6 h-6 text-purple-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">AI Kurzy</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Celkem kurzů</span>
              <span className="text-lg font-semibold text-gray-900">{additionalStats.courses.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Zapsaní studenti</span>
              <span className="text-lg font-semibold text-gray-900">{additionalStats.courses.enrollments.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Míra dokončení</span>
              <span className="text-lg font-semibold text-green-600">{additionalStats.courses.completionRate}%</span>
            </div>
          </div>
        </div>

        {/* Company Analytics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <BuildingOfficeIcon className="w-6 h-6 text-orange-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Firmy</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Celkem firem</span>
              <span className="text-lg font-semibold text-gray-900">{additionalStats.companies.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Aktivní</span>
              <span className="text-lg font-semibold text-green-600">{additionalStats.companies.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Čeká na schválení</span>
              <span className="text-lg font-semibold text-yellow-600">{additionalStats.companies.pendingApproval}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Most Visited Pages */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Nejnavštěvovanější stránky</h3>
          <p className="text-sm text-gray-600 mt-1">Za vybrané období: {timeRanges.find(r => r.value === timeRange)?.label}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stránka
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zobrazení
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kliky
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CTR
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {additionalStats.pages.mostVisited.map((page, index) => {
                const ctr = (page.ctr ?? ((page.views > 0 ? (page.clicks / page.views) * 100 : 0))).toFixed(1)
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{page.page}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{page.views.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{page.clicks.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{ctr}%</div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Insights – dočasně odstraněno, dokud nebudou reálné metriky porovnání */}
    </div>
  )
} 