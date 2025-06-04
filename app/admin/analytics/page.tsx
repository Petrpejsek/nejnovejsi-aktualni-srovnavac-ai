'use client'

import React, { useState, useEffect } from 'react'
import { 
  ChartBarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ChartBarIcon as TrendingUpIcon,
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
        const response = await fetch('/api/clicks')
        const data = await response.json()
        setAnalytics(data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  // Reset analytics function
  const resetAnalytics = async () => {
    if (!confirm('Opravdu chcete vynulovat všechny statistiky kliků? Tato akce je nevratná.')) {
      return
    }

    try {
      setLoading(true)
      await fetch('/api/clicks', { method: 'DELETE' })
      setAnalytics({ totalClicks: 0, uniqueVisitors: 0 })
      alert('Statistiky byly vynulovány')
    } catch (error) {
      console.error('Error resetting analytics:', error)
      alert('Chyba při vynulování statistik')
    } finally {
      setLoading(false)
    }
  }

  // Mock additional data (později nahradit skutečnými daty)
  const additionalStats = {
    products: {
      total: 235,
      views: 15420,
      clicksToday: 89
    },
    courses: {
      total: 9,
      enrollments: 2341,
      completionRate: 78
    },
    companies: {
      total: 45,
      active: 38,
      pendingApproval: 7
    },
    pages: {
      mostVisited: [
        { page: 'Homepage', views: 4532, clicks: 234 },
        { page: 'AI Tools', views: 3421, clicks: 189 },
        { page: 'Courses', views: 2876, clicks: 156 },
        { page: 'Top Lists', views: 2341, clicks: 134 },
        { page: 'Companies', views: 1987, clicks: 98 }
      ]
    }
  }

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
          
          <button
            onClick={resetAnalytics}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            Vynulovat statistiky
          </button>
        </div>
      </div>

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
              <p className="text-sm text-gray-600 mt-1">
                +12% oproti minulému týdnu
              </p>
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
              <p className="text-sm text-gray-600 mt-1">
                +8% oproti minulému týdnu
              </p>
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
              <p className="text-sm text-gray-600 mt-1">
                {parseFloat(conversionRate) > 5 ? '+' : '-'}2% oproti minulému týdnu
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUpIcon className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Průměr. kliky/den</p>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? '...' : Math.round(analytics.totalClicks / 7).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Za posledních 7 dní
              </p>
            </div>
          </div>
        </div>
      </div>

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
                const ctr = ((page.clicks / page.views) * 100).toFixed(1)
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

      {/* Quick Insights */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Rychlé pozorování</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h4 className="font-medium mb-2">Nejaktivnější den</h4>
            <p className="text-sm opacity-90">Úterý - 34% všech kliků</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h4 className="font-medium mb-2">Špičková hodina</h4>
            <p className="text-sm opacity-90">14:00-15:00 - 18% kliků</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h4 className="font-medium mb-2">Růst tento měsíc</h4>
            <p className="text-sm opacity-90">+23% oproti minulému měsíci</p>
          </div>
        </div>
      </div>
    </div>
  )
} 