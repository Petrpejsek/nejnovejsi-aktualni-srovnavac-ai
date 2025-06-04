'use client'

import { useState } from 'react'
import {
  CreditCardIcon,
  ChartBarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function CompanyDashboard() {
  // Mock data - later from API
  const dashboardData = {
    credits: {
      current: 245,
      lastMonth: 320,
      trend: 'down'
    },
    products: {
      total: 8,
      active: 6,
      pending: 2,
      views: 12453,
      clicks: 847
    },
    analytics: {
      viewsThisMonth: 12453,
      clicksThisMonth: 847,
      conversionRate: 6.8,
      topProduct: "AI Content Generator Pro"
    },
    recentActivity: [
      { id: 1, type: 'credit_used', description: 'Product promotion boost', amount: -25, time: '2 hours ago' },
      { id: 2, type: 'product_approved', description: 'New product listing approved', amount: 0, time: '5 hours ago' },
      { id: 3, type: 'credit_purchase', description: 'Credits purchased', amount: +100, time: '1 day ago' },
      { id: 4, type: 'product_views', description: 'Product views milestone', amount: 0, time: '2 days ago' }
    ]
  }

  return (
    <div className="h-full flex flex-col">
      {/* Page header - compact */}
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600">Overview of your account and performance</p>
      </div>

      {/* Stats grid - optimized for single screen */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {/* Credits Card */}
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Credits</p>
              <div className="flex items-baseline">
                <p className="text-xl font-semibold text-gray-900">{dashboardData.credits.current}</p>
                <div className={`ml-2 flex items-center text-xs ${
                  dashboardData.credits.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {dashboardData.credits.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(dashboardData.credits.current - dashboardData.credits.lastMonth)}
                </div>
              </div>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <CreditCardIcon className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Products</p>
              <p className="text-xl font-semibold text-gray-900">{dashboardData.products.active}/{dashboardData.products.total}</p>
              <p className="text-xs text-gray-500">{dashboardData.products.pending} pending</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Views Card */}
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Views</p>
              <p className="text-xl font-semibold text-gray-900">{dashboardData.analytics.viewsThisMonth.toLocaleString()}</p>
              <p className="text-xs text-gray-500">this month</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <EyeIcon className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* Clicks Card */}
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Clicks</p>
              <p className="text-xl font-semibold text-gray-900">{dashboardData.analytics.clicksThisMonth}</p>
              <p className="text-xs text-green-600">{dashboardData.analytics.conversionRate}% CTR</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <CursorArrowRaysIcon className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content grid - optimized for remaining space */}
      <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
        {/* Recent Activity - takes 2 columns */}
        <div className="col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {dashboardData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      activity.type === 'credit_used' ? 'bg-red-100' :
                      activity.type === 'product_approved' ? 'bg-green-100' :
                      activity.type === 'credit_purchase' ? 'bg-blue-100' :
                      'bg-yellow-100'
                    }`}>
                      {activity.type === 'credit_used' && <CreditCardIcon className="w-3 h-3 text-red-600" />}
                      {activity.type === 'product_approved' && <CheckCircleIcon className="w-3 h-3 text-green-600" />}
                      {activity.type === 'credit_purchase' && <PlusIcon className="w-3 h-3 text-blue-600" />}
                      {activity.type === 'product_views' && <EyeIcon className="w-3 h-3 text-yellow-600" />}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                  {activity.amount !== 0 && (
                    <span className={`text-xs font-medium ${
                      activity.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {activity.amount > 0 ? '+' : ''}{activity.amount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions - takes 1 column */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="flex-1 p-4 space-y-3">
            <button className="w-full flex items-center justify-center px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium rounded-md hover:from-purple-700 hover:to-pink-700 transition-colors">
              <PlusIcon className="w-3 h-3 mr-2" />
              Add Credits
            </button>
            <button className="w-full flex items-center justify-center px-3 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors">
              <PlusIcon className="w-3 h-3 mr-2" />
              New Product
            </button>
            <button className="w-full flex items-center justify-center px-3 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors">
              <ChartBarIcon className="w-3 h-3 mr-2" />
              View Analytics
            </button>
          </div>
          
          {/* Upcoming charges preview */}
          <div className="p-4 border-t border-gray-200">
            <h4 className="text-xs font-medium text-gray-900 mb-2">Upcoming Charges</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Top listing</span>
                <span className="font-medium text-gray-900">-50 credits</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Promotion boost</span>
                <span className="font-medium text-gray-900">-25 credits</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 