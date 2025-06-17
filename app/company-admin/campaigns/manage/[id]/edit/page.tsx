'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface Campaign {
  id: number
  name: string
  description: string
  status: 'active' | 'paused' | 'draft'
  products: string[]
  cpc: number
  dailyBudget: number
  autoBidding: boolean
}

export default function EditCampaignPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const campaignId = Number(params.id)

  // Form state
  const [formData, setFormData] = useState<Campaign>({
    id: 0,
    name: '',
    description: '',
    status: 'draft',
    products: [],
    cpc: 0.15,
    dailyBudget: 50,
    autoBidding: false
  })

  const recommendedMinCPC = 0.15

  useEffect(() => {
    // Mock data load - později z API
    const fetchCampaign = async () => {
      setTimeout(() => {
        const mockCampaigns = [
          {
            id: 1,
            name: 'AI Tools Summer Campaign',
            description: 'Promoting AI image generation tools during summer season with focus on creative professionals.',
            status: 'active' as const,
            products: ['Adobe Firefly', 'Midjourney'],
            cpc: 0.25,
            dailyBudget: 50,
            autoBidding: false
          },
          {
            id: 2,
            name: 'Video Editing Promotion',
            description: 'Targeting video creators and content marketers with advanced video editing solutions.',
            status: 'active' as const,
            products: ['CapCut', 'InVideo'],
            cpc: 0.30,
            dailyBudget: 75,
            autoBidding: true
          },
          {
            id: 3,
            name: 'Design Tools Campaign',
            description: 'Focus on small businesses and entrepreneurs needing design automation tools.',
            status: 'paused' as const,
            products: ['Canva AI'],
            cpc: 0.20,
            dailyBudget: 40,
            autoBidding: false
          }
        ]

        const foundCampaign = mockCampaigns.find(c => c.id === campaignId)
        if (foundCampaign) {
          setFormData(foundCampaign)
        }
        setLoading(false)
      }, 1000)
    }

    fetchCampaign()
  }, [campaignId])

  const handleSave = async () => {
    setSaving(true)
    
    // Mock save - později API call
    setTimeout(() => {
      setSaving(false)
      router.push(`/company-admin/campaigns/manage/${campaignId}`)
    }, 1500)
  }

  const handleCancel = () => {
    router.push(`/company-admin/campaigns/manage/${campaignId}`)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
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
            <Link href="/company-admin/campaigns/manage" className="text-blue-600 hover:text-blue-700">
              Manage
            </Link>
            <span className="text-gray-400">/</span>
            <Link href={`/company-admin/campaigns/manage/${campaignId}`} className="text-blue-600 hover:text-blue-700">
              {formData.name}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">Edit</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Campaign Settings</h1>
          <p className="text-gray-600">Adjust your CPC, daily budget, and bidding strategy</p>
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
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4 inline mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Settings */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Cog6ToothIcon className="h-5 w-5 mr-2" />
            Basic Settings
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter campaign name"
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
                placeholder="Describe your campaign goals and target audience"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* CPC & Budget Settings */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CurrencyDollarIcon className="h-5 w-5 mr-2" />
            CPC & Budget Settings
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost Per Click (CPC)
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
                Recommended minimum: ${recommendedMinCPC} • Higher CPC = More visibility
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Budget
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
                Maximum amount to spend per day on this campaign
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
                Automatically optimize your CPC to get more clicks within your daily budget
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2" />
          Promoted Products
        </h3>
        
        <div className="space-y-3">
          {formData.products.map((product, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{product}</p>
                <p className="text-sm text-gray-500">AI Tool</p>
              </div>
              <button 
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    products: prev.products.filter((_, i) => i !== index)
                  }))
                }}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {formData.products.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No products selected for this campaign</p>
            <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm">
              Add Products
            </button>
          </div>
        )}
      </div>

      {/* Preview Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Campaign Preview</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>CPC:</strong> ${formData.cpc.toFixed(2)} per click</p>
          <p><strong>Daily Budget:</strong> ${formData.dailyBudget}</p>
          <p><strong>Max Daily Clicks:</strong> ~{Math.floor(formData.dailyBudget / formData.cpc)} clicks</p>
          <p><strong>Bidding:</strong> {formData.autoBidding ? 'Automatic optimization' : 'Manual CPC'}</p>
        </div>
      </div>
    </div>
  )
} 