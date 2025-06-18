'use client'

import { useState, useEffect, useRef } from 'react'
import {
  ChartBarIcon,
  CursorArrowRaysIcon,
  EyeIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

interface AnalyticsData {
  summary: {
    totalSpend: number
    totalClicks: number
    totalImpressions: number
    averageCPC: number
    averageCTR: number
    activeCampaigns: number
  }
  campaignPerformance: Array<{
    id: string
    name: string
    status: string
    isApproved: boolean
    impressions: number
    clicks: number
    spend: number
    ctr: number
    avgCpc: number
    bidAmount: number
    dailyBudget: number
  }>
  chartData: {
    clicksPerDay: Array<{
      date: string
      clicks: number
    }>
    impressionsPerDay: Array<{
      date: string
      impressions: number
    }>
    spendPerDay: Array<{
      date: string
      spend: number
    }>
  }
}

interface ChartDataPoint {
  date: string
  fullDate: string
  clicks: number
  spend: number
  impressions: number
  ctr: number
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('30d')
  const [ppcMetric, setPpcMetric] = useState('clicks')
  const [hoveredPoint, setHoveredPoint] = useState<{index: number, x: number, y: number} | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])

  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' }
  ]

  // Načtení analytics dat z API
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/advertiser/analytics?period=${timeRange}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch analytics data')
        }

        setAnalyticsData(result.data)

        // Transformace dat do formátu pro graf
        if (result.data.chartData) {
          const transformedChartData: ChartDataPoint[] = []
          
          // Vytvoříme mapu pro rychlé vyhledávání
          const clicksMap = new Map()
          const impressionsMap = new Map() 
          const spendMap = new Map()

          result.data.chartData.clicksPerDay?.forEach((item: any) => {
            const dateKey = new Date(item.date).toDateString()
            clicksMap.set(dateKey, item.clicks || 0)
          })

          result.data.chartData.impressionsPerDay?.forEach((item: any) => {
            const dateKey = new Date(item.date).toDateString()
            impressionsMap.set(dateKey, item.impressions || 0)
          })

          result.data.chartData.spendPerDay?.forEach((item: any) => {
            const dateKey = new Date(item.date).toDateString()
            spendMap.set(dateKey, Math.abs(item.spend || 0)) // Absolute value pro spend
          })

          // Vytvoříme unified chart data pro posledních N dní
          const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
          const now = new Date()
          
          for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now)
            date.setDate(date.getDate() - i)
            const dateKey = date.toDateString()
            
            const clicks = clicksMap.get(dateKey) || 0
            const impressions = impressionsMap.get(dateKey) || 0
            const spend = spendMap.get(dateKey) || 0
            const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0

            transformedChartData.push({
              date: `${date.getDate()}.${date.getMonth() + 1}`,
              fullDate: date.toLocaleDateString('cs-CZ', { 
                year: 'numeric',
                month: 'long', 
                day: 'numeric'
              }),
              clicks,
              spend,
              impressions,
              ctr: Math.round(ctr * 10) / 10
            })
          }

          setChartData(transformedChartData)
        }

      } catch (err) {
        console.error('Error fetching analytics:', err)
        setError(err instanceof Error ? err.message : 'Failed to load analytics data')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [timeRange])

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

  const renderPPCAnalytics = () => {
    if (!analyticsData) return null

    const { summary } = analyticsData

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Spend"
            value={`$${summary.totalSpend.toFixed(2)}`}
            icon={CurrencyDollarIcon}
            color="text-blue-600"
          />
          <StatCard
            title="Total Clicks"
            value={summary.totalClicks.toLocaleString()}
            icon={CursorArrowRaysIcon}
            color="text-green-600"
          />
          <StatCard
            title="Average CPC"
            value={`$${summary.averageCPC.toFixed(3)}`}
            icon={ChartBarIcon}
            color="text-purple-600"
          />
          <StatCard
            title="Total Impressions"
            value={summary.totalImpressions.toLocaleString()}
            icon={EyeIcon}
          />
          <StatCard
            title="Average CTR"
            value={`${summary.averageCTR.toFixed(1)}%`}
            icon={ChartBarIcon}
          />
          <StatCard
            title="Active Campaigns"
            value={summary.activeCampaigns.toString()}
            icon={CursorArrowRaysIcon}
          />
        </div>

        {/* Performance Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Performance Over Time</h3>
              <p className="text-sm text-gray-500">Track your advertising performance trends</p>
            </div>
            <select
              value={ppcMetric}
              onChange={(e) => setPpcMetric(e.target.value)}
              className="border border-gray-300 rounded-lg px-6 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-40"
            >
              <option value="clicks">Clicks</option>
              <option value="spend">Spend ($)</option>
              <option value="impressions">Impressions</option>
              <option value="ctr">CTR (%)</option>
            </select>
          </div>

          <div className="relative w-full bg-gray-50 p-1" ref={containerRef}>
            {chartData.length > 0 ? (
              <svg 
                width="100%" 
                height={300}
                viewBox={`0 0 1400 300`}
                className="w-full"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Grid lines */}
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <line
                    key={i}
                    x1={50}
                    y1={40 + (i * 44)}
                    x2={1360}
                    y2={40 + (i * 44)}
                    stroke="#f3f4f6"
                    strokeWidth="1"
                  />
                ))}

                {/* Chart line */}
                {chartData.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    points={chartData.map((_, index) => {
                      const x = 50 + (index * ((1360 - 50) / (chartData.length - 1)))
                      const maxValue = Math.max(...chartData.map(d => d[ppcMetric as keyof typeof d] as number), 1)
                      const y = 260 - (((chartData[index][ppcMetric as keyof typeof chartData[0]] as number) / maxValue) * 220)
                      return `${x},${y}`
                    }).join(' ')}
                  />
                )}

                {/* Data points */}
                {chartData.map((data, index) => {
                  const x = 50 + (index * ((1360 - 50) / Math.max(chartData.length - 1, 1)))
                  const maxValue = Math.max(...chartData.map(d => d[ppcMetric as keyof typeof d] as number), 1)
                  const y = 260 - (((data[ppcMetric as keyof typeof data] as number) / maxValue) * 220)
                  
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="6"
                      fill="#3b82f6"
                      stroke="white"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-80 transition-all"
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                      onMouseEnter={(e) => {
                        if (!containerRef.current) return
                        const containerRect = containerRef.current.getBoundingClientRect()
                        setHoveredPoint({
                          index,
                          x: e.clientX - containerRect.left,
                          y: e.clientY - containerRect.top
                        })
                      }}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  )
                })}

                {/* X-axis labels */}
                {chartData.map((data, index) => {
                  const x = 50 + (index * ((1360 - 50) / Math.max(chartData.length - 1, 1)))
                  
                  // Show fewer labels based on period to avoid crowding
                  const shouldShow = timeRange === '7d' ? index % 1 === 0 : 
                                   timeRange === '30d' ? index % 3 === 0 : 
                                   index % 7 === 0
                  
                  if (!shouldShow) return null
                  
                  return (
                    <text
                      key={index}
                      x={x}
                      y={290}
                      textAnchor="middle"
                      className="text-xs fill-gray-600"
                      transform={`rotate(-90, ${x}, 290)`}
                    >
                      {data.date}
                    </text>
                  )
                })}

                {/* Y-axis labels */}
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const maxValue = Math.max(...chartData.map(d => d[ppcMetric as keyof typeof d] as number), 1)
                  const value = Math.round((maxValue / 5) * (5 - i))
                  const displayValue = ppcMetric === 'spend' ? `$${value}` : 
                                     ppcMetric === 'ctr' ? `${value}%` : 
                                     value.toString()
                  return (
                    <text
                      key={i}
                      x={40}
                      y={44 + (i * 44)}
                      textAnchor="end"
                      className="text-xs fill-gray-600"
                    >
                      {displayValue}
                    </text>
                  )
                })}
              </svg>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <ChartBarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No data available for selected period</p>
                </div>
              </div>
            )}

            {/* Tooltip */}
            {hoveredPoint && chartData[hoveredPoint.index] && (() => {
              const containerWidth = containerRef.current?.offsetWidth || 800
              const isLeftSide = hoveredPoint.x < 120
              const isRightSide = hoveredPoint.x > containerWidth - 120
              
              return (
                <div
                  className="absolute z-10 bg-gray-900 text-white text-sm rounded-lg px-3 py-2 pointer-events-none"
                  style={{
                    left: isLeftSide ? 10 : isRightSide ? hoveredPoint.x : hoveredPoint.x,
                    top: hoveredPoint.y,
                    transform: isLeftSide ? 'translate(0%, -120%)' : isRightSide ? 'translate(-100%, -120%)' : 'translate(-50%, -120%)'
                  }}
                >
                  <div className="font-medium">
                    {chartData[hoveredPoint.index]?.fullDate}
                  </div>
                  <div className="text-xs opacity-75">
                    {(() => {
                      const value = chartData[hoveredPoint.index]?.[ppcMetric as keyof typeof chartData[0]] as number || 0
                      const displayValue = ppcMetric === 'spend' ? `$${value.toFixed(2)}` : 
                                         ppcMetric === 'ctr' ? `${value.toFixed(1)}%` : 
                                         value.toString()
                      return `${displayValue} ${ppcMetric}`
                    })()}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>

        {/* Campaign Performance Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Campaign Performance</h3>
            <p className="text-sm text-gray-500">Individual campaign statistics for selected period</p>
          </div>
          
          {analyticsData.campaignPerformance && analyticsData.campaignPerformance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Impressions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CTR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Spend
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg CPC
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsData.campaignPerformance.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                        <div className="text-sm text-gray-500">Daily Budget: ${campaign.dailyBudget}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          campaign.status === 'active' && campaign.isApproved
                            ? 'bg-green-100 text-green-800'
                            : campaign.status === 'paused'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {!campaign.isApproved ? 'pending approval' : campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.impressions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.clicks.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.ctr.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${campaign.spend.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${campaign.avgCpc.toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Campaign Data</h3>
              <p className="text-gray-600">No campaigns found for the selected period</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Comprehensive performance analytics and insights</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <ChartBarIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Analytics</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

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
            className="border border-gray-300 rounded-lg px-6 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-40"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        renderPPCAnalytics()
      )}
    </div>
  )
} 