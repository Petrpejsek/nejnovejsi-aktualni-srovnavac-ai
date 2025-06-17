'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ChartBarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  CurrencyDollarIcon,
  CursorArrowRaysIcon,
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
}

export default function ManageCampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  // Recommended minimum CPC (podle naší logiky)
  const recommendedMinCPC = 0.15

  useEffect(() => {
    // Mock data - později z API
    const fetchCampaigns = async () => {
      setTimeout(() => {
        setCampaigns([
          {
            id: 1,
            name: 'AI Tools Summer Campaign',
            status: 'active',
            products: ['Adobe Firefly', 'Midjourney'],
            cpc: 0.25,
            dailyBudget: 50,
            spent: 32.40,
            clicks: 1240,
            impressions: 45600,
            ctr: 2.7,
            created: '2024-01-15',
            autoBidding: false
          },
          {
            id: 2,
            name: 'Video Editing Promotion',
            status: 'active',
            products: ['CapCut', 'InVideo'],
            cpc: 0.30,
            dailyBudget: 75,
            spent: 58.20,
            clicks: 890,
            impressions: 32100,
            ctr: 2.8,
            created: '2024-01-10',
            autoBidding: true
          },
          {
            id: 3,
            name: 'Design Tools Campaign',
            status: 'paused',
            products: ['Canva AI'],
            cpc: 0.20,
            dailyBudget: 40,
            spent: 15.60,
            clicks: 450,
            impressions: 18200,
            ctr: 2.5,
            created: '2024-01-05',
            autoBidding: false
          }
        ])
        setLoading(false)
      }, 1000)
    }

    fetchCampaigns()
  }, [])

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.products.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const toggleCampaignStatus = async (campaignId: number) => {
    setCampaigns(prev => prev.map(campaign => {
      if (campaign.id === campaignId) {
        return {
          ...campaign,
          status: campaign.status === 'active' ? 'paused' : 'active'
        }
      }
      return campaign
    }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <PlayIcon className="h-3 w-3 mr-1" />
            Active
          </span>
        )
      case 'paused':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <PauseIcon className="h-3 w-3 mr-1" />
            Paused
          </span>
        )
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Draft
          </span>
        )
      default:
        return null
    }
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
            <span className="text-gray-900">Manage</span>
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
          <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
          <p className="text-gray-600">Create and manage your PPC campaigns with our simple CPC system</p>
        </div>
        <Link
          href="/company-admin/campaigns/manage/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Campaign
        </Link>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <CurrencyDollarIcon className="h-5 w-5 text-blue-600 mr-2" />
          <div className="text-sm text-blue-800">
            <strong>Recommended minimum CPC:</strong> ${recommendedMinCPC.toFixed(2)} per click
            <span className="ml-2 text-blue-600">• Simple bidding • Pay only for real clicks • Set daily limits</span>
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
              placeholder="Search campaigns or products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:ring-blue-500 focus:border-blue-500 min-w-[120px]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Campaign Management Table */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ) : filteredCampaigns.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign & Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPC & Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Today's Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Settings
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                        <div className="text-sm text-gray-500">
                          Products: {campaign.products.join(', ')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(campaign.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="text-gray-900">
                        CPC: <span className="font-medium">${campaign.cpc.toFixed(2)}</span>
                        {campaign.cpc < recommendedMinCPC && (
                          <span className="text-red-500 text-xs ml-1">(Low)</span>
                        )}
                      </div>
                      <div className="text-gray-500">
                        Daily: ${campaign.spent.toFixed(2)} / ${campaign.dailyBudget}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full ${
                            (campaign.spent / campaign.dailyBudget) > 0.8 ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min((campaign.spent / campaign.dailyBudget) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <CursorArrowRaysIcon className="h-4 w-4 text-green-600 mr-1" />
                        {campaign.clicks} clicks
                      </div>
                      <div className="text-gray-500">{campaign.ctr}% CTR</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {campaign.autoBidding ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                            Auto-bidding
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                            Manual
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => toggleCampaignStatus(campaign.id)}
                          className={`p-2 rounded-md transition-colors ${
                            campaign.status === 'active' 
                              ? 'text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700' 
                              : 'text-green-600 hover:bg-green-100 hover:text-green-700'
                          }`}
                          title={campaign.status === 'active' ? 'Pause Campaign' : 'Activate Campaign'}
                        >
                          {campaign.status === 'active' ? (
                            <PauseIcon className="h-6 w-6" />
                          ) : (
                            <PlayIcon className="h-6 w-6" />
                          )}
                        </button>
                        <Link
                          href={`/company-admin/campaigns/manage/${campaign.id}`}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/company-admin/campaigns/manage/${campaign.id}/edit`}
                          className="text-gray-600 hover:text-gray-900 p-1"
                          title="Edit Campaign"
                        >
                          <Cog6ToothIcon className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Empty State 
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || statusFilter !== 'all' ? 'No campaigns found' : 'No campaigns yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Create your first PPC campaign to start advertising your products and driving traffic.'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Link
              href="/company-admin/campaigns/manage/create"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Your First Campaign
            </Link>
          )}
        </div>
      )}
    </div>
  )
} 