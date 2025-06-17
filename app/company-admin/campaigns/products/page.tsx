'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShoppingBagIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  FireIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

export default function AdvertisedProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [mockData, setMockData] = useState<any[]>([])
  
  // Generate consistent mock data after hydration
  useEffect(() => {
    const data = [1, 2, 3, 4, 5, 6].map((i) => ({
      id: i,
      clicks: Math.floor(Math.random() * 500 + 100),
      ctr: (Math.random() * 3 + 1).toFixed(1),
      spend: (Math.random() * 200 + 50).toFixed(0),
      campaigns: Math.floor(Math.random() * 3 + 1)
    }))
    setMockData(data)
  }, [])

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
            <span className="text-gray-900">Advertised Products</span>
          </div>
          {/* Back button */}
          <div className="mb-3">
            <Link
              href="/company-admin/campaigns"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Campaigns
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Advertised Products</h1>
          <p className="text-gray-600">Manage products included in your advertising campaigns</p>
        </div>
        <Link
          href="/company-admin/campaigns/manage/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Campaign
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Total Products</div>
              <div className="text-2xl font-bold text-gray-900">24</div>
            </div>
            <ShoppingBagIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Active Campaigns</div>
              <div className="text-2xl font-bold text-green-600">18</div>
            </div>
            <ChartBarIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Total Spend</div>
              <div className="text-2xl font-bold text-gray-900">$2,450</div>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Top Performer</div>
              <div className="text-2xl font-bold text-orange-600">3.8% CTR</div>
            </div>
            <FireIcon className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:ring-blue-500 focus:border-blue-500 min-w-[140px]"
          >
            <option value="all">All Categories</option>
            <option value="ai-tools">AI Tools</option>
            <option value="design">Design</option>
            <option value="video">Video Editing</option>
            <option value="productivity">Productivity</option>
          </select>
        </div>
        <div className="text-sm text-gray-500">
          Showing 24 products
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mock Products */}
        {mockData.map((item) => (
          <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Product Image */}
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">AI</span>
              </div>
            </div>
            
            {/* Product Details */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900">AI Tool {item.id} - Professional Design</h3>
                <p className="text-sm text-gray-600">Advanced AI-powered design software for professionals</p>
              </div>
              
              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-xs text-gray-500">Clicks</div>
                  <div className="font-semibold text-gray-900">{item.clicks}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-xs text-gray-500">CTR</div>
                  <div className="font-semibold text-blue-600">{item.ctr}%</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-xs text-gray-500">Spend</div>
                  <div className="font-semibold text-gray-900">${item.spend}</div>
                </div>
              </div>

              {/* Campaign Status */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  item.id % 3 === 0 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {item.id % 3 === 0 ? 'Paused' : 'Active'}
                </span>
                <div className="text-xs text-gray-500">
                  {item.campaigns} campaigns
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <Link
                  href={`/company-admin/campaigns/products/${item.id}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Details
                </Link>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/company-admin/campaigns/products/${item.id}/analytics`}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="View Analytics"
                  >
                    <ChartBarIcon className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/company-admin/campaigns/products/${item.id}/edit`}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Edit Product"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (hidden when there are products) */}
      <div className="hidden bg-white rounded-lg border border-gray-200 p-12 text-center">
        <ShoppingBagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Products in Campaigns</h3>
        <p className="text-gray-600 mb-6">
          Add products to your campaigns to start advertising and driving traffic to your offerings.
        </p>
        <Link
          href="/company-admin/campaigns/products/add"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Your First Product
        </Link>
      </div>
    </div>
  )
} 