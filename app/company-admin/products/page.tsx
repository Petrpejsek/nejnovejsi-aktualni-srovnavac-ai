'use client'

import { useState, useEffect } from 'react'
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
  TagIcon,
  ArrowTopRightOnSquareIcon
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
  externalUrl?: string
  hasTrial?: boolean
  hasPendingChanges?: boolean
  changesStatus?: 'pending' | 'approved' | 'rejected' | null
  changesSubmittedAt?: string
  adminNotes?: string | null
  pendingImageApproval?: boolean
  isNewProductPending?: boolean
}

interface CompanyInfo {
  id: string
  name: string
  email: string
}

export default function ProductsPage() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'pending' | 'draft'>('all')
  const [products, setProducts] = useState<Product[]>([])
  const [company, setCompany] = useState<CompanyInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Načtení dat z API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/company-admin/products')
        
        if (!response.ok) {
          throw new Error('Nepodařilo se načíst produkty')
        }

        const data = await response.json()
        
        if (data.success) {
          setProducts(data.products || [])
          setCompany(data.company)
        } else {
          throw new Error(data.error || 'Chyba při načítání produktů')
        }
      } catch (err) {
        console.error('Error loading products:', err)
        setError(err instanceof Error ? err.message : 'Neočekávaná chyba')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Products</h1>
          <p className="text-sm text-gray-600">
            {company ? `Product management for ${company.name}` : 'Manage your products and their performance'}
          </p>
          {products.length === 0 && (
            <div className="text-sm text-gray-500 bg-blue-50 px-3 py-2 rounded-md mt-2">
              <p>You don't have any assigned product yet.</p>
              <p>You can add a new product for approval.</p>
            </div>
          )}
          
          {/* Pending products notification */}
          {products.some(p => p.isNewProductPending) && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mt-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <ClockIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-purple-900">
                    🎉 Product Submitted Successfully!
                  </h3>
                  <div className="mt-2 text-sm text-purple-700">
                    <p>Your new product has been submitted and is waiting for approval from our team.</p>
                    <p className="mt-1">
                      <strong>What happens next:</strong>
                    </p>
                    <ul className="mt-1 space-y-1 list-disc list-inside text-sm">
                      <li>Our team will review your product within <strong>48 hours</strong></li>
                      <li>You'll receive an email notification with the approval decision</li>
                      <li>Once approved, your product will become active and visible to users</li>
                    </ul>
                  </div>
                  <div className="mt-3 flex items-center space-x-4 text-xs text-purple-600">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <span>Pending Review</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-3 h-3" />
                      <span>Expected response: 24-48 hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <button 
          onClick={() => router.push('/company-admin/products/add')}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
                      <PlusIcon className="w-4 h-4 mr-2" />
            Add Product
        </button>
      </div>

      {products.length > 0 && (
        <>
          {/* Stats overview */}
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
              <p className="text-sm text-gray-500">Average CTR</p>
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
              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center">
                  <TagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No products in this category
                  </h3>
                  <p className="text-gray-500">
                    {selectedTab === 'all' 
                      ? 'You don\'t have any assigned products yet.'
                      : `You don't have any products with status "${selectedTab}".`
                    }
                  </p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr 
                        key={product.id} 
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => router.push(`/company-admin/products/${product.id}/edit`)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                              <Image
                                src={product.imageUrl}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/screenshots/default-product.png'
                                }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {product.name}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {product.category}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {product.tags.slice(0, 2).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {product.tags.length > 2 && (
                                  <span className="text-xs text-gray-500">
                                    +{product.tags.length - 2} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <span className={getStatusBadge(product.status)}>
                              {getStatusIcon(product.status)}
                              <span className="ml-1 capitalize">
                                {product.status === 'active' && 'Active'}
                                {product.status === 'pending' && 'Pending Approval'}
                                {product.status === 'rejected' && 'Rejected'}
                                {product.status === 'draft' && 'Draft'}
                              </span>
                            </span>
                            {product.isNewProductPending && (
                              <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                ✨ New product awaiting approval
                              </div>
                            )}
                            {product.hasPendingChanges && product.changesStatus === 'pending' && !product.isNewProductPending && (
                              <div className="text-xs text-yellow-600">
                                Changes submitted {product.changesSubmittedAt && new Date(product.changesSubmittedAt).toLocaleDateString()}
                              </div>
                            )}
                            {product.pendingImageApproval && (
                              <div className="text-xs text-blue-600">
                                New image pending approval
                              </div>
                            )}
                            {product.adminNotes && 
                             !product.adminNotes.includes('New product submitted by company') && 
                             !product.adminNotes.includes('for approval') && (
                              <div className="text-xs text-red-600" title={product.adminNotes}>
                                Admin notes available
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            {product.price === 0 ? (
                              <span className="text-green-600 font-medium">Free</span>
                            ) : (
                              <span className="text-gray-900 font-medium">${product.price}</span>
                            )}
                            {product.hasTrial && (
                              <div className="text-xs text-green-600">Trial Available</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <div className="flex items-center space-x-4">
                              <div className="text-center">
                                <p className="text-xs text-gray-500">Views</p>
                                <p className="font-medium">{product.stats.views.toLocaleString()}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500">Clicks</p>
                                <p className="font-medium">{product.stats.clicks}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500">CTR</p>
                                <p className="font-medium text-purple-600">{product.stats.ctr.toFixed(1)}%</p>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {product.lastUpdated}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            {product.externalUrl && (
                              <a
                                href={product.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-gray-600"
                                title="View Product"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/company-admin/products/${product.id}/edit`)
                              }}
                              className="text-gray-400 hover:text-gray-600"
                              title="Edit Product"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="text-gray-400 hover:text-gray-600"
                              title="View Analytics"
                            >
                              <ChartBarIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
} 