'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ChartBarIcon,
  PlayIcon,
  PauseIcon,
  CurrencyDollarIcon,
  CursorArrowRaysIcon,
  EyeIcon,
  Cog6ToothIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

interface Campaign {
  id: number
  name: string
  status: 'active' | 'paused' | 'draft'
  products: string[]
  cpc: number
  dailyBudget: number
  spent: number
  clicks: number
  impressions: number
  ctr: number
  created: string
  autoBidding: boolean
  description: string
}

interface ChartDataPoint {
  date: string
  fullDate: string
  clicks: number
  impressions: number
  spend: number
  ctr: number
}

interface MetricConfig {
  key: keyof ChartDataPoint
  label: string
  color: string
  icon: any
  unit: string
  format: (value: number) => string
}

const metrics: MetricConfig[] = [
  {
    key: 'clicks',
    label: 'Clicks',
    color: '#3B82F6',
    icon: CursorArrowRaysIcon,
    unit: 'clicks',
    format: (value) => value.toLocaleString()
  },
  {
    key: 'impressions',
    label: 'Impressions',
    color: '#10B981',
    icon: EyeIcon,
    unit: 'impressions',
    format: (value) => value.toLocaleString()
  },
  {
    key: 'spend',
    label: 'Spend',
    color: '#8B5CF6',
    icon: CurrencyDollarIcon,
    unit: '$',
    format: (value) => `$${value.toFixed(2)}`
  },
  {
    key: 'ctr',
    label: 'CTR',
    color: '#F59E0B',
    icon: ChartBarIcon,
    unit: '%',
    format: (value) => `${value.toFixed(2)}%`
  }
]

const timePeriods = [
  { value: 7, label: 'Last 7 days' },
  { value: 14, label: 'Last 14 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' }
]

const generateChartData = (days: number): ChartDataPoint[] => {
  const data: ChartDataPoint[] = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    
    const baseClicks = isWeekend ? 30 : 80
    const clicks = Math.floor(baseClicks + Math.random() * 60)
    const impressions = clicks * (15 + Math.random() * 10)
    const spend = clicks * (0.50 + Math.random() * 1.50)
    const ctr = (clicks / impressions) * 100
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      clicks: Math.round(clicks),
      impressions: Math.round(impressions),
      spend: Math.round(spend * 100) / 100,
      ctr: Math.round(ctr * 100) / 100
    })
  }
  
  return data
}

export default function CampaignDetailPage() {
  const params = useParams()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const campaignId = Number(params.id)
  const [selectedPeriod, setSelectedPeriod] = useState(7)
  const [selectedMetric, setSelectedMetric] = useState<keyof ChartDataPoint>('clicks')
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchCampaign = async () => {
      setTimeout(() => {
        const mockCampaigns = [
          {
            id: 1,
            name: 'AI Tools Summer Campaign',
            status: 'active' as const,
            products: ['Adobe Firefly', 'Midjourney'],
            cpc: 0.25,
            dailyBudget: 50,
            spent: 32.40,
            clicks: 1240,
            impressions: 45600,
            ctr: 2.7,
            created: '2024-01-15',
            autoBidding: false,
            description: 'Promoting AI image generation tools during summer season with focus on creative professionals.'
          }
        ]

        const foundCampaign = mockCampaigns.find(c => c.id === campaignId)
        setCampaign(foundCampaign || null)
        setLoading(false)
      }, 1000)
    }

    fetchCampaign()
  }, [campaignId])

  useEffect(() => {
    setChartData(generateChartData(selectedPeriod))
  }, [selectedPeriod])

  const toggleStatus = () => {
    if (campaign) {
      setCampaign({
        ...campaign,
        status: campaign.status === 'active' ? 'paused' : 'active'
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Campaign Not Found</h3>
        <p className="text-gray-600 mb-6">The campaign you're looking for doesn't exist.</p>
        <Link
          href="/company-admin/campaigns/manage"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Link>
      </div>
    )
  }

  // Chart calculations
  const currentMetric = metrics.find(m => m.key === selectedMetric)!
  const metricValues = chartData.map(d => d[selectedMetric] as number)
  const maxValue = Math.max(...metricValues)
  const minValue = Math.min(...metricValues)
  const range = maxValue - minValue

  const chartWidth = 1400
  const chartHeight = 500
  const padding = { top: 40, right: 40, bottom: 80, left: 50 }
  const innerWidth = chartWidth - padding.left - padding.right
  const innerHeight = chartHeight - padding.top - padding.bottom

  const points = chartData.map((data, index) => {
    const x = padding.left + (index / (chartData.length - 1)) * innerWidth
    const value = data[selectedMetric] as number
    const y = padding.top + ((maxValue - value) / range) * innerHeight
    return { x, y, value, data }
  })

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')

  const areaPath = `${pathData} L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${padding.left} ${padding.top + innerHeight} Z`

  const totalValue = metricValues.reduce((sum, value) => sum + value, 0)

  const yTicks = 5
  const yTickValues = Array.from({ length: yTicks }, (_, i) => {
    return minValue + (range * i) / (yTicks - 1)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Link href="/company-admin/campaigns" className="text-blue-600 hover:text-blue-700">
              PPC Campaigns
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/company-admin/campaigns/manage" className="text-blue-600 hover:text-blue-700">
              Manage
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">Campaign Detail</span>
          </div>
          <div className="mb-3">
            <Link
              href="/company-admin/campaigns/manage"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Campaigns
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
          <p className="text-gray-600">{campaign.description}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleStatus}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              campaign.status === 'active'
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300'
                : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
            }`}
          >
            {campaign.status === 'active' ? (
              <>
                <PauseIcon className="h-4 w-4 inline mr-2" />
                Pause Campaign
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 inline mr-2" />
                Start Campaign
              </>
            )}
          </button>
          <Link
            href={`/company-admin/campaigns/manage/${campaign.id}/edit`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Cog6ToothIcon className="h-4 w-4 mr-2" />
            Edit Campaign
          </Link>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`rounded-lg p-4 ${
        campaign.status === 'active' 
          ? 'bg-green-50 border border-green-200' 
          : campaign.status === 'paused'
          ? 'bg-yellow-50 border border-yellow-200'
          : 'bg-gray-50 border border-gray-200'
      }`}>
        <div className="flex items-center">
          {campaign.status === 'active' ? (
            <PlayIcon className="h-5 w-5 text-green-600 mr-2" />
          ) : campaign.status === 'paused' ? (
            <PauseIcon className="h-5 w-5 text-yellow-600 mr-2" />
          ) : null}
          <span className={`font-medium ${
            campaign.status === 'active' ? 'text-green-800' :
            campaign.status === 'paused' ? 'text-yellow-800' : 'text-gray-800'
          }`}>
            Campaign is {campaign.status}
          </span>
          {campaign.status === 'active' && (
            <span className="ml-2 text-green-700">• Currently receiving traffic</span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Cost Per Click</p>
              <p className="text-2xl font-bold text-blue-600">${campaign.cpc.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">
                {campaign.autoBidding ? 'Auto-bidding' : 'Manual bidding'}
              </p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Daily Budget</p>
              <p className="text-2xl font-bold text-gray-900">${campaign.dailyBudget}</p>
              <p className="text-sm text-gray-500 mt-1">
                ${campaign.spent.toFixed(2)} spent today
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Clicks</p>
              <p className="text-2xl font-bold text-green-600">{campaign.clicks.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">
                {campaign.impressions.toLocaleString()} impressions
              </p>
            </div>
            <CursorArrowRaysIcon className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Click-Through Rate</p>
              <p className="text-2xl font-bold text-purple-600">{campaign.ctr}%</p>
              <p className="text-sm text-gray-500 mt-1">Above average</p>
            </div>
            <EyeIcon className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-6 px-6 pt-6">
          <h3 className="text-lg font-semibold text-gray-900">Performance Over Time</h3>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-6 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-40"
          >
            {timePeriods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg inline-flex mx-6">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <button
                key={metric.key}
                onClick={() => setSelectedMetric(metric.key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedMetric === metric.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{metric.label}</span>
              </button>
            )
          })}
        </div>

        <div className="relative w-full bg-gray-50 p-1" ref={containerRef}>
          <svg 
            width="100%" 
            height={chartHeight} 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" opacity="0.5"/>

            {yTickValues.map((value, index) => (
              <g key={index}>
                <line
                  x1={padding.left}
                  y1={padding.top + (index / (yTicks - 1)) * innerHeight}
                  x2={padding.left + innerWidth}
                  y2={padding.top + (index / (yTicks - 1)) * innerHeight}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={padding.top + (index / (yTicks - 1)) * innerHeight + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-600"
                >
                  {currentMetric.format(yTickValues[yTicks - 1 - index])}
                </text>
              </g>
            ))}

            <path
              d={areaPath}
              fill={currentMetric.color}
              fillOpacity="0.1"
            />

            <path
              d={pathData}
              fill="none"
              stroke={currentMetric.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="6"
                fill={currentMetric.color}
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer transition-all hover:opacity-80"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
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
            ))}

            {chartData.map((data, index) => (
              <text
                key={index}
                x={points[index]?.x || 0}
                y={chartHeight - 20}
                textAnchor={selectedPeriod >= 30 ? "start" : "middle"}
                className="text-xs fill-gray-600"
                transform={selectedPeriod >= 30 ? `rotate(-90, ${points[index]?.x || 0}, ${chartHeight - 20})` : undefined}
              >
                {data.date}
              </text>
            ))}
          </svg>

          {hoveredPoint && (() => {
            const containerWidth = containerRef.current?.offsetWidth || 800;
            const isLeftSide = hoveredPoint.x < 120;
            const isRightSide = hoveredPoint.x > containerWidth - 120;
            
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
                  {currentMetric.format(chartData[hoveredPoint.index]?.[selectedMetric] as number || 0)}
                </div>
              </div>
            );
          })()}
        </div>

        <div className="mt-6 text-center px-6 pb-6">
          <div className="text-3xl font-bold" style={{ color: currentMetric.color }}>
            {currentMetric.format(totalValue)}
          </div>
          <div className="text-sm text-gray-600">
            Total {currentMetric.label} This Period
          </div>
        </div>
      </div>
    </div>
  )
} 