'use client'

import { useState, useEffect } from 'react'
import {
  ChartBarIcon,
  CursorArrowRaysIcon,
  EyeIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

type AnalyticsTab = 'ppc' | 'products' | 'overall'

interface PPCStats {
  totalSpend: number
  totalClicks: number
  averageCPC: number
  totalImpressions: number
  averageCTR: number
  activeCampaigns: number
}

interface ProductStats {
  totalProducts: number
  productsInCampaigns: number
  topPerformingProduct: string
  averageProductRating: number
}

interface OverallStats {
  monthlyRevenue: number
  totalUsers: number
  conversionRate: number
  customerLifetimeValue: number
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('ppc')
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  
  // Mock data - později z API
  const [ppcStats, setPpcStats] = useState<PPCStats>({
    totalSpend: 2450.50,
    totalClicks: 12450,
    averageCPC: 0.197,
    totalImpressions: 389000,
    averageCTR: 3.2,
    activeCampaigns: 5
  })

  const [productStats, setProductStats] = useState<ProductStats>({
    totalProducts: 147,
    productsInCampaigns: 23,
    topPerformingProduct: "Adobe Firefly",
    averageProductRating: 4.2
  })

  const [overallStats, setOverallStats] = useState<OverallStats>({
    monthlyRevenue: 15420.50,
    totalUsers: 2340,
    conversionRate: 2.8,
    customerLifetimeValue: 345.60
  })

  useEffect(() => {
    // Simulace načítání dat
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [timeRange])

  const tabs = [
    {
      id: 'ppc' as AnalyticsTab,
      name: 'PPC Performance',
      icon: CursorArrowRaysIcon
    },
    {
      id: 'products' as AnalyticsTab,
      name: 'Product Performance',
      icon: ChartBarIcon
    },
    {
      id: 'overall' as AnalyticsTab,
      name: 'Overall Stats',
      icon: EyeIcon
    }
  ]

  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ]

  const StatCard = ({ title, value, change, icon: Icon, color = 'text-gray-900' }: {
    title: string
    value: string
    change?: { value: number, positive: boolean }
    icon: any
    color?: string
  }) => (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {change && (
            <div className={`flex items-center mt-1 text-sm ${
              change.positive ? 'text-green-600' : 'text-red-600'
            }`}>
              {change.positive ? (
                <ArrowUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 mr-1" />
              )}
              {Math.abs(change.value)}%
            </div>
          )}
        </div>
        <Icon className={`h-8 w-8 ${color === 'text-gray-900' ? 'text-gray-400' : color}`} />
      </div>
    </div>
  )

  const renderPPCTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Spend"
          value={`$${ppcStats.totalSpend.toFixed(2)}`}
          change={{ value: 12.5, positive: true }}
          icon={CurrencyDollarIcon}
          color="text-blue-600"
        />
        <StatCard
          title="Total Clicks"
          value={ppcStats.totalClicks.toLocaleString()}
          change={{ value: 8.3, positive: true }}
          icon={CursorArrowRaysIcon}
          color="text-green-600"
        />
        <StatCard
          title="Average CPC"
          value={`$${ppcStats.averageCPC.toFixed(3)}`}
          change={{ value: 3.2, positive: false }}
          icon={ChartBarIcon}
          color="text-purple-600"
        />
        <StatCard
          title="Total Impressions"
          value={ppcStats.totalImpressions.toLocaleString()}
          change={{ value: 15.7, positive: true }}
          icon={EyeIcon}
        />
        <StatCard
          title="Average CTR"
          value={`${ppcStats.averageCTR}%`}
          change={{ value: 0.8, positive: true }}
          icon={ChartBarIcon}
        />
        <StatCard
          title="Active Campaigns"
          value={ppcStats.activeCampaigns.toString()}
          icon={CursorArrowRaysIcon}
        />
      </div>

      {/* Placeholder pro grafy */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Over Time</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Chart coming soon...</p>
        </div>
      </div>
    </div>
  )

  const renderProductsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={productStats.totalProducts.toString()}
          icon={ChartBarIcon}
        />
        <StatCard
          title="In Campaigns"
          value={productStats.productsInCampaigns.toString()}
          icon={CursorArrowRaysIcon}
          color="text-blue-600"
        />
        <StatCard
          title="Top Performer"
          value={productStats.topPerformingProduct}
          icon={EyeIcon}
          color="text-green-600"
        />
        <StatCard
          title="Avg Rating"
          value={productStats.averageProductRating.toFixed(1)}
          icon={ChartBarIcon}
          color="text-yellow-600"
        />
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Performance</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Product analytics coming soon...</p>
        </div>
      </div>
    </div>
  )

  const renderOverallTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Monthly Revenue"
          value={`$${overallStats.monthlyRevenue.toLocaleString()}`}
          change={{ value: 18.2, positive: true }}
          icon={CurrencyDollarIcon}
          color="text-green-600"
        />
        <StatCard
          title="Total Users"
          value={overallStats.totalUsers.toLocaleString()}
          change={{ value: 23.1, positive: true }}
          icon={EyeIcon}
        />
        <StatCard
          title="Conversion Rate"
          value={`${overallStats.conversionRate}%`}
          change={{ value: 4.5, positive: true }}
          icon={ChartBarIcon}
          color="text-blue-600"
        />
        <StatCard
          title="Customer LTV"
          value={`$${overallStats.customerLifetimeValue.toFixed(2)}`}
          change={{ value: 7.3, positive: true }}
          icon={CurrencyDollarIcon}
          color="text-purple-600"
        />
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Business Metrics</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Overall analytics coming soon...</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Comprehensive performance analytics and insights</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center space-x-4">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'ppc' && renderPPCTab()}
          {activeTab === 'products' && renderProductsTab()}
          {activeTab === 'overall' && renderOverallTab()}
        </>
      )}
    </div>
  )
} 