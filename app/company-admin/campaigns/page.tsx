'use client'

import { useState, useEffect } from 'react'
import {
  PlusIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  BanknotesIcon,
  ChartBarIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Campaign {
  id: string
  name: string
  productId: string
  productName: string
  targetUrl: string
  bidAmount: number
  dailyBudget: number
  totalBudget: number
  status: 'active' | 'paused' | 'draft'
  isApproved: boolean
  totalSpent: number
  totalClicks: number
  totalImpressions: number
  averageCPC: number
  createdAt: string
}

interface Product {
  id: string
  name: string
  description: string
  imageUrl: string
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    productId: '',
    targetUrl: '',
    bidAmount: '',
    dailyBudget: '',
    totalBudget: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchCampaigns()
    fetchProducts()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/advertiser/campaigns')
      const data = await response.json()
      if (data.success) {
        setCampaigns(data.data)
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?pageSize=100')
      const data = await response.json()
      if (data.success) {
        setProducts(data.data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/advertiser/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          productId: formData.productId,
          targetUrl: formData.targetUrl,
          bidAmount: parseFloat(formData.bidAmount),
          dailyBudget: parseFloat(formData.dailyBudget),
          totalBudget: parseFloat(formData.totalBudget)
        })
      })

      const data = await response.json()
      if (data.success) {
        setShowCreateForm(false)
        setFormData({
          name: '',
          productId: '',
          targetUrl: '',
          bidAmount: '',
          dailyBudget: '',
          totalBudget: ''
        })
        fetchCampaigns() // Refresh campaigns
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert('Failed to create campaign')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (campaign: Campaign) => {
    if (!campaign.isApproved) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <ClockIcon className="h-3 w-3" />
          Čeká schválení
        </span>
      )
    }

    const statusStyles = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800'
    }

    const statusIcons = {
      active: <CheckCircleIcon className="h-3 w-3" />,
      paused: <XCircleIcon className="h-3 w-3" />,
      draft: <ExclamationTriangleIcon className="h-3 w-3" />
    }

    const statusLabels = {
      active: 'Aktivní',
      paused: 'Pozastavená',
      draft: 'Koncept'
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[campaign.status]}`}>
        {statusIcons[campaign.status]}
        {statusLabels[campaign.status]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítání kampaní...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reklamní kampaně</h2>
          <p className="mt-1 text-sm text-gray-500">
            Spravujte své CPC kampaně a sledujte jejich výkonnost
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nová kampaň
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Celkem kampaní</p>
              <p className="text-2xl font-semibold text-gray-900">{campaigns.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Aktivní</p>
              <p className="text-2xl font-semibold text-gray-900">
                {campaigns.filter(c => c.status === 'active' && c.isApproved).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <CursorArrowRaysIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Celkem kliků</p>
              <p className="text-2xl font-semibold text-gray-900">
                {campaigns.reduce((sum, c) => sum + c.totalClicks, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-50 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Celkem utraceno</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${campaigns.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Vaše kampaně
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kampaň
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPC Bid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rozpočet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Výkonnost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {campaign.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {campaign.productName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(campaign)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${campaign.bidAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Denní: ${campaign.dailyBudget}
                    </div>
                    <div className="text-sm text-gray-500">
                      Celkem: ${campaign.totalBudget}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-4 text-sm">
                      <div className="flex items-center">
                        <EyeIcon className="h-4 w-4 text-gray-400 mr-1" />
                        {campaign.totalImpressions}
                      </div>
                      <div className="flex items-center">
                        <CursorArrowRaysIcon className="h-4 w-4 text-gray-400 mr-1" />
                        {campaign.totalClicks}
                      </div>
                      <div className="flex items-center">
                        <BanknotesIcon className="h-4 w-4 text-gray-400 mr-1" />
                        ${campaign.totalSpent.toFixed(2)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {campaigns.length === 0 && (
            <div className="text-center py-12">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Žádné kampaně</h3>
              <p className="mt-1 text-sm text-gray-500">
                Začněte vytvořením své první reklamní kampaně.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Vytvořit kampaň
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Nová reklamní kampaň
              </h3>
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Název kampaně
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Produkt
                  </label>
                  <select
                    required
                    value={formData.productId}
                    onChange={(e) => setFormData({...formData, productId: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Vyberte produkt</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Cílová URL
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.targetUrl}
                    onChange={(e) => setFormData({...formData, targetUrl: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    CPC Bid ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.bidAmount}
                    onChange={(e) => setFormData({...formData, bidAmount: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Denní rozpočet ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={formData.dailyBudget}
                    onChange={(e) => setFormData({...formData, dailyBudget: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Celkový rozpočet ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={formData.totalBudget}
                    onChange={(e) => setFormData({...formData, totalBudget: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Zrušit
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Vytváří se...' : 'Vytvořit kampaň'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 