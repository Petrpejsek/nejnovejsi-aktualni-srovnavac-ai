'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ChartBarIcon,
  ChartPieIcon,
  CreditCardIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

interface Campaign {
  id: string
  name: string
  status: string
  bidAmount: number
  dailyBudget: number
  totalBudget?: number
  todaySpent: number
  totalSpent: number
  todayClicks: number
  totalClicks: number
  todayImpressions: number
  totalImpressions: number
  isApproved: boolean
  product?: {
    id: string
    name: string
    imageUrl?: string
  }
  ctr: number
  createdAt: string
}

interface Stats {
  totalCampaigns: number
  activeCampaigns: number
  totalSpend: number
  totalClicks: number
  averageCTR: number
}

interface CompanyBalance {
  balance: number
}

export default function PPCCampaignsDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState<Stats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalSpend: 0,
    totalClicks: 0,
    averageCTR: 0
  })
  const [companyBalance, setCompanyBalance] = useState<CompanyBalance>({ balance: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // States pro inline editing
  const [editingCPC, setEditingCPC] = useState<string | null>(null)
  const [editingBudget, setEditingBudget] = useState<string | null>(null)
  const [editingCredit, setEditingCredit] = useState(false)
  const [tempCPC, setTempCPC] = useState('')
  const [tempBudget, setTempBudget] = useState('')
  const [tempCredit, setTempCredit] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Quick navigation cards data
  const quickActions = [
    {
      title: 'Analytics',
      description: 'View detailed PPC performance analytics and reports',
      href: '/company-admin/analytics',
      icon: ChartPieIcon,
      color: 'bg-purple-500'
    },
    {
      title: 'Budget & Billing',
      description: 'Manage your account balance, payments and daily limits',
      href: '/company-admin/billing',
      icon: CreditCardIcon,
      color: 'bg-orange-500'
    }
  ]

  // Načtení dat z API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Paralelní načtení kampaní a billing informací
        const [campaignsResponse, billingResponse] = await Promise.all([
          fetch('/api/advertiser/campaigns', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }),
          fetch('/api/advertiser/billing', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          })
        ])

        if (!campaignsResponse.ok || !billingResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const campaignsResult = await campaignsResponse.json()
        const billingResult = await billingResponse.json()

        console.log('🔍 Frontend Debug - Campaigns API Response:', campaignsResult)
        console.log('🔍 Frontend Debug - Billing API Response:', billingResult)

        if (!campaignsResult.success || !billingResult.success) {
          console.error('❌ API Error - Campaigns success:', campaignsResult.success, 'Billing success:', billingResult.success)
          throw new Error('API returned error')
        }

        const campaignsData = campaignsResult.data || []
        console.log('🔍 Frontend Debug - Campaigns Data:', campaignsData)
        console.log('🔍 Frontend Debug - Campaigns Count:', campaignsData.length)
        setCampaigns(campaignsData)
        setCompanyBalance({ balance: billingResult.data.company.balance || 0 })

        // Spočítat statistiky
        const calculatedStats: Stats = {
          totalCampaigns: campaignsData.length,
          activeCampaigns: campaignsData.filter((c: Campaign) => 
            c.status === 'active' && c.isApproved
          ).length,
          totalSpend: campaignsData.reduce((sum: number, c: Campaign) => 
            sum + (c.totalSpent || 0), 0
          ),
          totalClicks: campaignsData.reduce((sum: number, c: Campaign) => 
            sum + (c.totalClicks || 0), 0
          ),
          averageCTR: campaignsData.length > 0 
            ? campaignsData.reduce((sum: number, c: Campaign) => sum + c.ctr, 0) / campaignsData.length
            : 0
        }

        setStats(calculatedStats)

      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
    // Auto-refresh zrušen - obnovení pouze při načtení stránky
    // Uživatel může manuálně aktualizovat stránku když potřebuje
  }, [])

  // Toggle campaign status (play/pause)
  const toggleCampaignStatus = async (campaignId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active'
      
      const response = await fetch(`/api/advertiser/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setCampaigns(campaigns.map(c => 
          c.id === campaignId ? { ...c, status: newStatus } : c
        ))
      } else {
        alert('Failed to update campaign status')
      }
    } catch (error) {
      console.error('Error toggling campaign status:', error)
      alert('Error updating campaign status')
    }
  }

  // Aktualizace CPC - pouze zvýšení
  const updateCPC = async (campaignId: string, newCPC: number) => {
    const campaign = campaigns.find(c => c.id === campaignId)
    if (!campaign) return

    if (newCPC <= campaign.bidAmount) {
      alert(`CPC can only be increased. Current CPC is $${campaign.bidAmount}. Please enter a higher amount.`)
      return
    }

    try {
      const response = await fetch(`/api/advertiser/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ bidAmount: newCPC })
      })

      if (response.ok) {
        setCampaigns(campaigns.map(c => 
          c.id === campaignId ? { ...c, bidAmount: newCPC } : c
        ))
        setEditingCPC(null)
      } else {
        alert('Failed to update CPC')
      }
    } catch (error) {
      console.error('Error updating CPC:', error)
      alert('Error updating CPC')
    }
  }

  // Aktualizace denního rozpočtu - pouze zvýšení
  const updateBudget = async (campaignId: string, newBudget: number) => {
    const campaign = campaigns.find(c => c.id === campaignId)
    if (!campaign) return

    if (newBudget <= campaign.dailyBudget) {
      alert(`Daily budget can only be increased. Current budget is $${campaign.dailyBudget}. Please enter a higher amount.`)
      return
    }

    try {
      const response = await fetch(`/api/advertiser/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ dailyBudget: newBudget })
      })

      if (response.ok) {
        setCampaigns(campaigns.map(c => 
          c.id === campaignId ? { ...c, dailyBudget: newBudget } : c
        ))
        setEditingBudget(null)
      } else {
        alert('Failed to update budget')
      }
    } catch (error) {
      console.error('Error updating budget:', error)
      alert('Error updating budget')
    }
  }

  // Rychlé navýšení kreditu
  const addCredit = async (amount: number) => {
    try {
      const response = await fetch('/api/advertiser/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          action: 'add-mock-funds',
          amount: amount 
        })
      })

      if (response.ok) {
        const result = await response.json()
        setCompanyBalance({ balance: companyBalance.balance + amount })
        setEditingCredit(false)
        alert(`Successfully added $${amount} to your account!`)
      } else {
        alert('Failed to add credit')
      }
    } catch (error) {
      console.error('Error adding credit:', error)
      alert('Error adding credit')
    }
  }

  const getStatusColor = (campaign: Campaign) => {
    if (!campaign.isApproved) {
      return 'bg-gray-100 text-gray-800'
    }
    switch (campaign.status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (campaign: Campaign) => {
    if (!campaign.isApproved) {
      return <PauseIcon className="h-3 w-3 mr-1" />
    }
    return campaign.status === 'active' 
      ? <PlayIcon className="h-3 w-3 mr-1" />
      : <PauseIcon className="h-3 w-3 mr-1" />
  }

  const getStatusText = (campaign: Campaign) => {
    if (!campaign.isApproved) {
      return 'pending approval'
    }
    return campaign.status
  }

  const getBudgetWarning = (campaign: Campaign) => {
    const todaySpent = campaign.todaySpent || 0
    const dailyBudget = campaign.dailyBudget || 1
    const percentage = (todaySpent / dailyBudget) * 100
    
    if (percentage >= 100) {
      return {
        level: 'critical',
        message: 'Budget exceeded!',
        color: 'text-red-600 bg-red-50',
        percentage: Math.round(percentage)
      }
    } else if (percentage >= 80) {
      return {
        level: 'warning', 
        message: 'Budget limit approaching',
        color: 'text-yellow-600 bg-yellow-50',
        percentage: Math.round(percentage)
      }
    }
    return null
  }

  // Function for filtering and sorting campaigns
  const getFilteredAndSortedCampaigns = () => {
    let filtered = campaigns

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = campaigns.filter(campaign => {
        switch (statusFilter) {
          case 'active':
            return campaign.status === 'active' && campaign.isApproved
          case 'paused':
            return campaign.status === 'paused'
          case 'pending':
            return !campaign.isApproved
          default:
            return true
        }
      })
    }

    // Basic sorting by newest
    const sorted = [...filtered].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return sorted
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PPC Campaigns</h1>
          <p className="text-gray-600">Manage your pay-per-click advertising campaigns</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <ChartBarIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Campaigns</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PPC Campaigns</h1>
          <p className="text-gray-600">Manage your pay-per-click advertising campaigns</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Quick credit overview with top-up option */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Account Balance:</span>
            {editingCredit ? (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={tempCredit}
                  onChange={(e) => setTempCredit(e.target.value)}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Amount"
                />
                <button
                  onClick={() => {
                    const amount = parseFloat(tempCredit)
                    if (amount > 0) {
                      addCredit(amount)
                    }
                    setTempCredit('')
                  }}
                  className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setEditingCredit(false)
                    setTempCredit('')
                  }}
                  className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingCredit(true)}
                className="text-lg font-bold text-green-600 hover:text-green-700 cursor-pointer"
              >
                ${(companyBalance.balance || 0).toFixed(2)}
              </button>
            )}
          </div>
          <Link
            href="/company-admin/campaigns/manage/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Campaign
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Total Campaigns</div>
          <div className="text-2xl font-bold text-gray-900">
            {loading ? <div className="h-8 bg-gray-200 rounded animate-pulse"></div> : stats.totalCampaigns}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Active Campaigns</div>
          <div className="text-2xl font-bold text-green-600">
            {loading ? <div className="h-8 bg-gray-200 rounded animate-pulse"></div> : stats.activeCampaigns}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Total Spend</div>
          <div className="text-2xl font-bold text-gray-900">
            {loading ? <div className="h-8 bg-gray-200 rounded animate-pulse"></div> : `$${(stats.totalSpend || 0).toFixed(2)}`}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Total Clicks</div>
          <div className="text-2xl font-bold text-gray-900">
            {loading ? <div className="h-8 bg-gray-200 rounded animate-pulse"></div> : stats.totalClicks.toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Average CTR</div>
          <div className="text-2xl font-bold text-blue-600">
            {loading ? <div className="h-8 bg-gray-200 rounded animate-pulse"></div> : `${(stats.averageCTR || 0).toFixed(1)}%`}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${action.color} text-white mr-3`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Campaigns */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            All Campaigns 
            {!loading && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({getFilteredAndSortedCampaigns().length} z {campaigns.length})
              </span>
            )}
          </h2>
          <div className="flex space-x-3">
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-48"
            >
              <option value="all">All Campaigns</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="pending">Pending Approval</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : getFilteredAndSortedCampaigns().length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CPC / Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Controls
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredAndSortedCampaigns().map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {campaign.product?.imageUrl && (
                            <img 
                              src={campaign.product.imageUrl} 
                              alt={campaign.product.name}
                              className="h-10 w-10 rounded-lg object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                            <div className="text-sm text-gray-500">
                              {campaign.product?.name || `Campaign #${campaign.id.slice(0, 8)}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign)}`}>
                          {getStatusIcon(campaign)}
                          {getStatusText(campaign)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="space-y-1">
                          {/* Clickable CPC */}
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 mr-2">CPC:</span>
                            {editingCPC === campaign.id ? (
                              <div className="flex items-center space-x-1">
                                <input
                                  type="number"
                                  step="0.01"
                                  min={campaign.bidAmount + 0.01}
                                  value={tempCPC}
                                  onChange={(e) => setTempCPC(e.target.value)}
                                  className="w-16 px-1 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder={`>${campaign.bidAmount}`}
                                />
                                <span className="text-xs text-gray-500">USD</span>
                                <button
                                  onClick={() => {
                                    const newCPC = parseFloat(tempCPC)
                                    if (newCPC > 0) {
                                      updateCPC(campaign.id, newCPC)
                                    }
                                    setTempCPC('')
                                  }}
                                  className="px-1 py-0.5 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingCPC(null)
                                    setTempCPC('')
                                  }}
                                  className="px-1 py-0.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingCPC(campaign.id)
                                  setTempCPC(campaign.bidAmount.toString())
                                }}
                                className="text-blue-600 hover:text-blue-700 cursor-pointer flex items-center"
                              >
                                {(campaign.bidAmount || 0).toFixed(2)} USD
                                <PencilIcon className="h-3 w-3 ml-1" />
                              </button>
                            )}
                          </div>
                          {/* Budget information */}
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 mr-2">Budget:</span>
                            {editingBudget === campaign.id ? (
                              <div className="flex items-center space-x-1">
                                <input
                                  type="number"
                                  step="1"
                                  min={campaign.dailyBudget + 1}
                                  value={tempBudget}
                                  onChange={(e) => setTempBudget(e.target.value)}
                                  className="w-16 px-1 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder={`>${campaign.dailyBudget}`}
                                />
                                <span className="text-xs text-gray-500">USD</span>
                                <button
                                  onClick={() => {
                                    const newBudget = parseFloat(tempBudget)
                                    if (newBudget > 0) {
                                      updateBudget(campaign.id, newBudget)
                                    }
                                    setTempBudget('')
                                  }}
                                  className="px-1 py-0.5 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingBudget(null)
                                    setTempBudget('')
                                  }}
                                  className="px-1 py-0.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingBudget(campaign.id)
                                  setTempBudget(campaign.dailyBudget.toString())
                                }}
                                className="text-purple-600 hover:text-purple-700 cursor-pointer flex items-center"
                              >
                                {(campaign.dailyBudget || 0).toFixed(0)} USD
                                <PencilIcon className="h-3 w-3 ml-1" />
                              </button>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            Spent: ${(campaign.totalSpent || 0).toFixed(2)}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full ${
                                getBudgetWarning(campaign)?.level === 'critical' 
                                  ? 'bg-red-600' 
                                  : getBudgetWarning(campaign)?.level === 'warning'
                                  ? 'bg-yellow-500'
                                  : 'bg-blue-600'
                              }`} 
                              style={{ 
                                width: `${Math.min(((campaign.todaySpent || 0) / (campaign.dailyBudget || 1)) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              Today: ${(campaign.todaySpent || 0).toFixed(2)}
                            </div>
                            {getBudgetWarning(campaign) && (
                              <div className={`text-xs px-2 py-0.5 rounded-full ${getBudgetWarning(campaign)!.color}`}>
                                {getBudgetWarning(campaign)!.percentage}% • {getBudgetWarning(campaign)!.message}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{campaign.totalClicks} clicks</div>
                        <div className="text-gray-500">{(campaign.ctr || 0).toFixed(1)}% CTR</div>
                        <div className="text-xs text-gray-500">
                          {campaign.totalImpressions} impressions
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {/* Play/Pause icons for campaign control */}
                        {campaign.isApproved && (
                          <button
                            onClick={() => toggleCampaignStatus(campaign.id, campaign.status)}
                            className={`inline-flex items-center p-2 rounded-lg transition-colors ${
                              campaign.status === 'active' 
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                            title={campaign.status === 'active' ? 'Pause Campaign' : 'Resume Campaign'}
                          >
                            {campaign.status === 'active' ? (
                              <PauseIcon className="h-4 w-4" />
                            ) : (
                              <PlayIcon className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {campaigns.length === 0 ? (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Campaigns</h3>
                  <p className="text-gray-600 mb-4">Start by creating your first PPC campaign</p>
                  <Link
                    href="/company-admin/campaigns/manage/create"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create First Campaign
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Campaigns Match Filters</h3>
                  <p className="text-gray-600 mb-4">Try changing the filters or create a new campaign</p>
                  <button
                    onClick={() => {
                      setStatusFilter('all')
                    }}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors mr-3"
                  >
                    Reset Filters
                  </button>
                  <Link
                    href="/company-admin/campaigns/manage/create"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create Campaign
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 