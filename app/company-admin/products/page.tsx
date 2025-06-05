'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  PlusIcon,
  PencilIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ChartBarIcon,
  TagIcon
} from '@heroicons/react/24/outline'

interface Product {
  id: string
  name: string
  description: string
  price: number
  status: 'active' | 'pending' | 'rejected' | 'draft'
  imageUrl: string
  category: string
  tags: string[]
  stats: {
    views: number
    clicks: number
    ctr: number
  }
  lastUpdated: string
  createdAt: string
}

export default function ProductsPage() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'pending' | 'draft'>('all')
  
  // Mock data - simplified for realistic company with 3 products
  const products: Product[] = [
    {
      id: '1',
      name: 'AI Content Generator Pro',
      description: 'Advanced AI tool for creating high-quality marketing content, blog posts, and social media content.',
      price: 49,
      status: 'active',
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200&h=200&fit=crop',
      category: 'AI Writing',
      tags: ['AI', 'Content', 'Marketing'],
      stats: { views: 2341, clicks: 187, ctr: 8.0 },
      lastUpdated: '2024-01-20',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'ChatBot Builder',
      description: 'No-code chatbot builder with AI integration for customer support and lead generation.',
      price: 29,
      status: 'active',
      imageUrl: 'https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?w=200&h=200&fit=crop',
      category: 'AI Chatbots',
      tags: ['Chatbot', 'No-code', 'AI'],
      stats: { views: 1876, clicks: 156, ctr: 8.3 },
      lastUpdated: '2024-01-18',
      createdAt: '2024-01-10'
    },
    {
      id: '3',
      name: 'Video Transcription AI',
      description: 'Automatic video transcription and subtitle generation with speaker identification.',
      price: 19,
      status: 'pending',
      imageUrl: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=200&h=200&fit=crop',
      category: 'AI Video',
      tags: ['Video', 'Transcription', 'AI'],
      stats: { views: 0, clicks: 0, ctr: 0 },
      lastUpdated: '2024-01-22',
      createdAt: '2024-01-22'
    },

  ]

  const filteredProducts = products.filter(product => 
    selectedTab === 'all' || product.status === selectedTab
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />
      case 'rejected':
        return <XCircleIcon className="w-4 h-4 text-red-500" />
      case 'draft':
        return <PencilIcon className="w-4 h-4 text-gray-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'draft':
        return `${baseClasses} bg-gray-100 text-gray-800`
      default:
        return baseClasses
    }
  }

  // Calculate overview stats
  const overviewStats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    pending: products.filter(p => p.status === 'pending').length,
    totalViews: products.reduce((sum, p) => sum + p.stats.views, 0),
    totalClicks: products.reduce((sum, p) => sum + p.stats.clicks, 0),
    avgCtr: products.filter(p => p.stats.views > 0).reduce((sum, p) => sum + p.stats.ctr, 0) / products.filter(p => p.stats.views > 0).length || 0
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Products</h1>
          <p className="text-sm text-gray-600">Manage your product listings and performance</p>
        </div>
        <button className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-md hover:from-purple-700 hover:to-pink-700 transition-colors">
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Stats overview - simplified for small companies */}
      <div className="flex-shrink-0 grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-semibold text-gray-900">{overviewStats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-semibold text-green-600">{overviewStats.active}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Total Views</p>
          <p className="text-2xl font-semibold text-gray-900">{overviewStats.totalViews.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Avg. CTR</p>
          <p className="text-2xl font-semibold text-purple-600">{overviewStats.avgCtr.toFixed(1)}%</p>
        </div>
      </div>

      {/* Tabs and content */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 flex flex-col min-h-0">
        {/* Tabs */}
        <div className="border-b border-gray-200 px-4 py-3">
          <nav className="flex space-x-6">
            {[
              { key: 'all', label: 'All Products', count: products.length },
              { key: 'active', label: 'Active', count: products.filter(p => p.status === 'active').length },
              { key: 'pending', label: 'Pending', count: products.filter(p => p.status === 'pending').length },
              { key: 'draft', label: 'Drafts', count: products.filter(p => p.status === 'draft').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as any)}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedTab === tab.key
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-200 text-gray-700 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Products table */}
        <div className="flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-lg object-cover"
                        src={product.imageUrl}
                        alt={product.name}
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {product.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={getStatusBadge(product.status)}>
                      {getStatusIcon(product.status)}
                      <span className="ml-1 capitalize">{product.status}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      ${product.price}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {product.stats.views > 0 ? (
                      <div className="text-xs text-gray-500">
                        <div className="flex items-center">
                          <EyeIcon className="w-3 h-3 mr-1" />
                          {product.stats.views.toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <CursorArrowRaysIcon className="w-3 h-3 mr-1" />
                          {product.stats.clicks} ({product.stats.ctr}%)
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No data</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-500">
                      {new Date(product.lastUpdated).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                        title="View Analytics"
                      >
                        <ChartBarIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => router.push(`/company-admin/products/${product.id}/edit`)}
                        className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                        title="Edit Product"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 