'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ChartBarIcon,
  CursorArrowRaysIcon,
  ShoppingBagIcon,
  ChartPieIcon,
  CreditCardIcon,
  PlusIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline'

interface Campaign {
  id: number
  name: string
  status: string
  budget: number
  spent: number
  clicks: number
  impressions: number
  ctr: number
}

export default function PPCCampaignsDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalSpend: 0,
    totalClicks: 0,
    averageCTR: 0
  })
  const [loading, setLoading] = useState(true)

  // Quick navigation cards data
  const quickActions = [
    {
      title: 'Manage Campaigns',
      description: 'Create, edit and manage your advertising campaigns',
      href: '/company-admin/campaigns/manage',
      icon: CursorArrowRaysIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Advertised Products',
      description: 'View and manage products in your campaigns',
      href: '/company-admin/campaigns/products',
      icon: ShoppingBagIcon,
      color: 'bg-green-500'
    },
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

  // Mock data - později z API
  useEffect(() => {
    const fetchCampaignData = async () => {
      // Simulace API volání
      setTimeout(() => {
        setStats({
          totalCampaigns: 8,
          activeCampaigns: 5,
          totalSpend: 2450.50,
          totalClicks: 12450,
          averageCTR: 3.2
        })

        setCampaigns([
          {
            id: 1,
            name: 'AI Tools Summer Campaign',
            status: 'active',
            budget: 500,
            spent: 245.30,
            clicks: 1240,
            impressions: 45600,
            ctr: 2.7
          },
          {
            id: 2,
            name: 'Video Editing Promotion',
            status: 'active',
            budget: 300,
            spent: 187.50,
            clicks: 890,
            impressions: 32100,
            ctr: 2.8
          },
          {
            id: 3,
            name: 'Design Tools Campaign',
            status: 'paused',
            budget: 400,
            spent: 98.20,
            clicks: 450,
            impressions: 18200,
            ctr: 2.5
          }
        ])
        setLoading(false)
      }, 1000)
    }

    fetchCampaignData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PPC Campaigns</h1>
          <p className="text-gray-600">Manage your pay-per-click advertising campaigns</p>
        </div>
        <Link
          href="/company-admin/campaigns/manage/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Campaign
        </Link>
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
            {loading ? <div className="h-8 bg-gray-200 rounded animate-pulse"></div> : `$${stats.totalSpend.toFixed(2)}`}
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
            {loading ? <div className="h-8 bg-gray-200 rounded animate-pulse"></div> : `${stats.averageCTR}%`}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group"
            >
              <div className="flex items-center mb-3">
                <div className={`p-2 rounded-lg ${action.color} text-white mr-3`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                  {action.title}
                </h3>
              </div>
              <p className="text-sm text-gray-600">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Campaigns */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Campaigns</h2>
          <Link
            href="/company-admin/campaigns/manage"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All Campaigns →
          </Link>
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
          ) : campaigns.length > 0 ? (
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
                      Budget / Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                                     {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                        <div className="text-sm text-gray-500">Campaign #{campaign.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          campaign.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {campaign.status === 'active' ? (
                            <PlayIcon className="h-3 w-3 mr-1" />
                          ) : (
                            <PauseIcon className="h-3 w-3 mr-1" />
                          )}
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>${campaign.spent.toFixed(2)} / ${campaign.budget}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{campaign.clicks} clicks</div>
                        <div className="text-gray-500">{campaign.ctr}% CTR</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link
                          href={`/company-admin/campaigns/manage/${campaign.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4 inline" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Campaigns Yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first PPC campaign</p>
              <Link
                href="/company-admin/campaigns/manage?action=create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Your First Campaign
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 