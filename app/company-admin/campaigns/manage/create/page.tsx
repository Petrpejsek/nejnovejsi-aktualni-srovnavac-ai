'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusIcon,
  InformationCircleIcon,
  SparklesIcon,
  CubeIcon
} from '@heroicons/react/24/outline'

interface Product {
  id: string
  name: string
  category: string
  description: string
  imageUrl?: string
  price?: number
  externalUrl?: string
}

export default function CreateCampaignPage() {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [message, setMessage] = useState<{type: 'success' | 'error' | null, text: string}>({type: null, text: ''})

  // Form state
  const [formData, setFormData] = useState({
    selectedProduct: '',
    name: '',
    description: '',
    cpc: 0.15,
    dailyBudget: 50,
    autoBidding: false
  })

  const recommendedMinCPC = 0.15

  // Load company products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/company-admin/products', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          // Filter only approved products
          const approvedProducts = data.products.filter((p: any) => 
            p.changesStatus === 'approved' || p.isActive
          )
          setProducts(approvedProducts)
        } else {
          console.error('Failed to load products')
        }
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const getSelectedProduct = () => {
    return products.find(p => p.id === formData.selectedProduct)
  }

  const handleCreate = async () => {
    if (!formData.selectedProduct || !formData.name) {
      setMessage({type: 'error', text: 'Please select a product and enter campaign name'})
      return
    }

    setCreating(true)
    setMessage({type: null, text: ''})
    
    try {
      console.log('Creating campaign with data:', {
        name: formData.name,
        description: formData.description,
        productId: formData.selectedProduct,
        bidAmount: formData.cpc,
        dailyBudget: formData.dailyBudget,
        totalBudget: formData.dailyBudget * 30,
        targetUrl: getSelectedProduct()?.externalUrl || '#'
      })

      const response = await fetch('/api/advertiser/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          productId: formData.selectedProduct,
          bidAmount: formData.cpc,
          dailyBudget: formData.dailyBudget,
          totalBudget: formData.dailyBudget * 30, // 30 days budget
          targetUrl: getSelectedProduct()?.externalUrl || '#'
        })
      })

      console.log('API Response status:', response.status)
      const result = await response.json()
      console.log('API Response:', result)

      if (response.ok && result.success) {
        // Success - show success message and redirect
        setMessage({type: 'success', text: `Campaign "${formData.name}" was created and activated successfully! Your ads are now live.`})
        setTimeout(() => {
          router.push('/company-admin/campaigns')
        }, 2000)
      } else {
        // Error response from API
        const errorMessage = result.error || result.message || 'Unknown error occurred'
        console.error('Campaign creation failed:', errorMessage)
        setMessage({type: 'error', text: `Error creating campaign: ${errorMessage}`})
      }
    } catch (error) {
      // Network or other errors
      console.error('Network error creating campaign:', error)
      setMessage({type: 'error', text: 'Network error occurred. Please check your connection and try again.'})
    } finally {
      setCreating(false)
    }
  }

  const handleCancel = () => {
    router.push('/company-admin/campaigns')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your products...</p>
        </div>
      </div>
    )
  }

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
            <span className="text-gray-900">Create Campaign</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create New PPC Campaign</h1>
          <p className="text-gray-600">Set up your campaign with our simple 3-step process</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <XMarkIcon className="h-4 w-4 inline mr-2" />
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !formData.selectedProduct || !formData.name}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4 inline mr-2" />
                Create Campaign
              </>
            )}
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message.type && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckIcon className="h-5 w-5 mr-2" />
            ) : (
              <XMarkIcon className="h-5 w-5 mr-2" />
            )}
            <p>{message.text}</p>
          </div>
        </div>
      )}

      {/* Step indicator */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-center space-x-8">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
            <span className="ml-2 text-sm font-medium text-gray-900">Select Product</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
            <span className="ml-2 text-sm font-medium text-gray-900">Campaign Info</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
            <span className="ml-2 text-sm font-medium text-gray-900">CPC & Budget</span>
          </div>
        </div>
      </div>

      {/* Step 1: Product Selection */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-2">1</span>
          Select Product to Promote *
        </h3>

        {products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CubeIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-lg font-medium mb-2">No approved products found</p>
            <p className="text-sm">You need to have at least one approved product before creating a campaign.</p>
            <Link 
              href="/company-admin/products/add" 
              className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </div>
        ) : (
          <>
            {formData.selectedProduct && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Selected:</strong> {getSelectedProduct()?.name}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.selectedProduct === product.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, selectedProduct: product.id }))}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-8 h-8 rounded object-cover mr-2"
                          />
                        ) : (
                          <CubeIcon className="h-5 w-5 text-gray-400 mr-2" />
                        )}
                        <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{product.category}</p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{product.description}</p>
                      {product.price && (
                        <p className="text-xs text-green-600 mt-1 font-medium">${product.price}</p>
                      )}
                    </div>
                    <div className={`w-5 h-5 border-2 rounded-full ${
                      formData.selectedProduct === product.id
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {formData.selectedProduct === product.id && (
                        <CheckIcon className="h-3 w-3 text-white m-0.5" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Step 2: Campaign Info */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-2">2</span>
          Campaign Information
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Summer AI Tools Promotion"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your campaign goals and target audience..."
            />
          </div>
        </div>
      </div>

      {/* Step 3: CPC & Budget */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-2">3</span>
          CPC & Budget Settings
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cost Per Click (CPC) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.cpc}
                onChange={(e) => setFormData(prev => ({ ...prev, cpc: Number(e.target.value) }))}
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  formData.cpc < recommendedMinCPC ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.15"
              />
            </div>
            {formData.cpc < recommendedMinCPC && (
              <div className="flex items-center mt-2 text-sm text-red-600">
                <InformationCircleIcon className="h-4 w-4 mr-1" />
                Below recommended minimum of ${recommendedMinCPC}
              </div>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Start with ${recommendedMinCPC} minimum • Higher CPC = Better visibility
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Budget *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="1"
                min="1"
                value={formData.dailyBudget}
                onChange={(e) => setFormData(prev => ({ ...prev, dailyBudget: Number(e.target.value) }))}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="50"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Recommended: $50+ for best results
            </p>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.autoBidding}
                onChange={(e) => setFormData(prev => ({ ...prev, autoBidding: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Enable Auto-bidding
              </span>
            </label>
            <p className="text-sm text-gray-500 mt-2 ml-6">
              Let our system optimize your CPC for maximum clicks
            </p>
          </div>
        </div>
      </div>

      {/* Preview */}
      {formData.selectedProduct && formData.name && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2 flex items-center">
            <SparklesIcon className="h-5 w-5 mr-2" />
            Campaign Preview
          </h4>
          <div className="text-sm text-green-800 space-y-1">
            <p><strong>Campaign:</strong> {formData.name}</p>
            <p><strong>Product:</strong> {getSelectedProduct()?.name}</p>
            <p><strong>CPC:</strong> ${formData.cpc.toFixed(2)} per click</p>
            <p><strong>Daily Budget:</strong> ${formData.dailyBudget}</p>
            <p><strong>Estimated Daily Clicks:</strong> ~{Math.floor(formData.dailyBudget / formData.cpc)} clicks</p>
            <p><strong>Bidding Mode:</strong> {formData.autoBidding ? 'Automatic optimization' : 'Manual CPC'}</p>
          </div>
        </div>
      )}

      {/* Bottom Create Button */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Ready to Launch?</h3>
            <p className="text-gray-600">Review your campaign settings and create your PPC campaign.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <XMarkIcon className="h-4 w-4 inline mr-2" />
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !formData.selectedProduct || !formData.name}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                  Creating Campaign...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-4 w-4 inline mr-2" />
                  Create Campaign
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 