'use client'

import { useState } from 'react'
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
  id: number
  name: string
  category: string
  description: string
}

export default function CreateCampaignPage() {
  const router = useRouter()
  const [creating, setCreating] = useState(false)

  // Available products (mock data)
  const availableProducts: Product[] = [
    { id: 1, name: 'Adobe Firefly', category: 'AI Image Generation', description: 'AI-powered creative tools' },
    { id: 2, name: 'Midjourney', category: 'AI Image Generation', description: 'Advanced AI art generation' },
    { id: 3, name: 'CapCut', category: 'Video Editing', description: 'Easy video editing tool' },
    { id: 4, name: 'InVideo', category: 'Video Editing', description: 'Professional video creation' },
    { id: 5, name: 'Canva AI', category: 'Design Tools', description: 'AI-powered design platform' },
    { id: 6, name: 'Figma', category: 'Design Tools', description: 'Collaborative design tool' }
  ]

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedProducts: [] as number[],
    cpc: 0.15,
    dailyBudget: 50,
    autoBidding: false
  })

  const recommendedMinCPC = 0.15

  const handleProductToggle = (productId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(productId)
        ? prev.selectedProducts.filter(id => id !== productId)
        : [...prev.selectedProducts, productId]
    }))
  }

  const getSelectedProducts = () => {
    return availableProducts.filter(p => formData.selectedProducts.includes(p.id))
  }

  const handleCreate = async () => {
    if (!formData.name || formData.selectedProducts.length === 0) {
      alert('Please fill in campaign name and select at least one product')
      return
    }

    setCreating(true)
    
    // Mock API call
    setTimeout(() => {
      setCreating(false)
      router.push('/company-admin/campaigns/manage')
    }, 2000)
  }

  const handleCancel = () => {
    router.push('/company-admin/campaigns/manage')
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
            <Link href="/company-admin/campaigns/manage" className="text-blue-600 hover:text-blue-700">
              Manage
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
            disabled={creating || !formData.name || formData.selectedProducts.length === 0}
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

      {/* Step indicator */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-center space-x-8">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
            <span className="ml-2 text-sm font-medium text-gray-900">Campaign Info</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
            <span className="ml-2 text-sm font-medium text-gray-900">Set CPC & Budget</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
            <span className="ml-2 text-sm font-medium text-gray-900">Select Products</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Campaign Info */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-2">1</span>
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

        {/* Step 2: CPC & Budget */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-2">2</span>
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
      </div>

      {/* Step 3: Product Selection */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-2">3</span>
          Select Products to Promote *
        </h3>

        {formData.selectedProducts.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>{formData.selectedProducts.length} product{formData.selectedProducts.length !== 1 ? 's' : ''} selected:</strong> {getSelectedProducts().map(p => p.name).join(', ')}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableProducts.map((product) => (
            <div
              key={product.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                formData.selectedProducts.includes(product.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleProductToggle(product.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <CubeIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{product.category}</p>
                  <p className="text-xs text-gray-400 mt-1">{product.description}</p>
                </div>
                <div className={`w-5 h-5 border-2 rounded ${
                  formData.selectedProducts.includes(product.id)
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300'
                }`}>
                  {formData.selectedProducts.includes(product.id) && (
                    <CheckIcon className="h-3 w-3 text-white m-0.5" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {formData.selectedProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CubeIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p>Select at least one product to promote in your campaign</p>
          </div>
        )}
      </div>

      {/* Preview */}
      {formData.name && formData.selectedProducts.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2 flex items-center">
            <SparklesIcon className="h-5 w-5 mr-2" />
            Campaign Preview
          </h4>
          <div className="text-sm text-green-800 space-y-1">
            <p><strong>Campaign:</strong> {formData.name}</p>
            <p><strong>Products:</strong> {getSelectedProducts().map(p => p.name).join(', ')}</p>
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
              disabled={creating || !formData.name || formData.selectedProducts.length === 0}
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