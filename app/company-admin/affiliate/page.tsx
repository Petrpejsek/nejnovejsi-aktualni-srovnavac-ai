'use client'

import React, { useState } from 'react'
import {
  WalletIcon,
  LinkIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function AffiliatePage() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [copied, setCopied] = useState<string | null>(null)

  // Mock data pro affiliate programy
  const affiliatePrograms = [
    {
      id: 1,
      name: 'Commission Junction (CJ)',
      type: 'network',
      status: 'active',
      commission: '15%',
      products: 8,
      totalEarnings: 2840,
      lastPayment: '2024-01-15',
      pendingCommission: 420
    },
    {
      id: 2,
      name: 'ShareASale',
      type: 'network',
      status: 'active',
      commission: '12%',
      products: 5,
      totalEarnings: 1650,
      lastPayment: '2024-01-10',
      pendingCommission: 280
    },
    {
      id: 3,
      name: 'Direct Partnership - TechCorp',
      type: 'direct',
      status: 'pending',
      commission: '20%',
      products: 3,
      totalEarnings: 0,
      lastPayment: null,
      pendingCommission: 0
    }
  ]

  const affiliateLinks = [
    {
      id: 1,
      productName: 'ChatGPT Pro Tools',
      program: 'Commission Junction',
      link: 'https://cj.com/ref/chatgpt-pro-tools?affiliate=comp123',
      clicks: 1250,
      conversions: 48,
      earnings: 680,
      ctr: 3.84,
      conversionRate: 2.1
    },
    {
      id: 2,
      productName: 'Midjourney AI Art',
      program: 'ShareASale',
      link: 'https://shareasale.com/ref/midjourney-ai?ref=456',
      clicks: 890,
      conversions: 32,
      earnings: 450,
      ctr: 2.91,
      conversionRate: 3.6
    },
    {
      id: 3,
      productName: 'n8n Automation Pro',
      program: 'Direct Partnership',
      link: 'https://n8n.io/?ref=comparee-ai&code=COMP15',
      clicks: 420,
      conversions: 18,
      earnings: 290,
      ctr: 4.2,
      conversionRate: 4.3
    }
  ]

  const performanceStats = {
    totalClicks: 2560,
    totalConversions: 98,
    totalCosts: 1420,
    averageCTR: 3.65,
    averageConversionRate: 3.0,
    paymentDue: 700
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'links', name: 'Affiliate Links', icon: LinkIcon },
    { id: 'programs', name: 'Partner Programs', icon: BuildingOfficeIcon },
    { id: 'payments', name: 'Invoices', icon: CurrencyDollarIcon }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <WalletIcon className="w-8 h-8 text-purple-600" />
          Affiliate Management
        </h1>
        <p className="text-gray-600 mt-1">
          Manage affiliate programs, track promotional costs, and monitor campaign performance
        </p>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900">
                {performanceStats.totalClicks.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <EyeIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+12.5% this month</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Costs</p>
              <p className="text-2xl font-bold text-gray-900">
                ${performanceStats.totalCosts.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <ArrowUpIcon className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-sm text-red-600">+8.3% this month</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {performanceStats.averageConversionRate.toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+2.1% this month</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  selectedTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-4">
              <button className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <PlusIcon className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-600">Generate New Link</span>
              </button>
              <button className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <GlobeAltIcon className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-600">Join New Network</span>
              </button>
              <button className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <CurrencyDollarIcon className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-600">View Invoice</span>
              </button>
            </div>
          </div>

          {/* Top Performing Links */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Campaigns</h3>
            <div className="space-y-4">
              {affiliateLinks.slice(0, 3).map((link) => (
                <div key={link.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{link.productName}</h4>
                    <p className="text-sm text-gray-500">{link.program}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">-${link.earnings}</p>
                    <p className="text-sm text-gray-500">{link.conversions} conversions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'links' && (
        <div className="space-y-6">
          {/* Generate New Link */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Affiliate Campaigns</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <PlusIcon className="w-4 h-4" />
                Create New Campaign
              </button>
            </div>

            {/* Links Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Program</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Link</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Clicks</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Conversions</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Cost</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliateLinks.map((link) => (
                    <tr key={link.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{link.productName}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{link.program}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded max-w-xs truncate">
                            {link.link}
                          </code>
                          <button
                            onClick={() => copyToClipboard(link.link, link.id.toString())}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {copied === link.id.toString() ? (
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                            ) : (
                              <ClipboardDocumentIcon className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{link.clicks.toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-900">{link.conversions}</td>
                      <td className="py-3 px-4 font-semibold text-red-600">${link.earnings}</td>
                      <td className="py-3 px-4 text-gray-900">{link.ctr.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'programs' && (
        <div className="space-y-6">
          {/* Join New Program */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Partner Programs</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <PlusIcon className="w-4 h-4" />
                Join New Program
              </button>
            </div>

            {/* Programs Grid */}
            <div className="space-y-4">
              {affiliatePrograms.map((program) => (
                <div key={program.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{program.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          program.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : program.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {program.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          program.type === 'network' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {program.type === 'network' ? 'Network' : 'Direct'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-6 mt-4">
                        <div>
                          <p className="text-sm text-gray-500">Commission Rate</p>
                          <p className="font-semibold text-gray-900">{program.commission}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Products</p>
                          <p className="font-semibold text-gray-900">{program.products}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Spent</p>
                          <p className="font-semibold text-red-600">${program.totalEarnings.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Outstanding Balance</p>
                          <p className="font-semibold text-orange-600">${program.pendingCommission}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                        View Details
                      </button>
                      <button className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'payments' && (
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Outstanding Balance</h3>
              <p className="text-3xl font-bold text-orange-600 mb-2">${performanceStats.paymentDue}</p>
              <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                Pay Invoice
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Settings</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium text-gray-900">Credit Card (**** 4242)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Billing Cycle</p>
                  <p className="font-medium text-gray-900">Monthly</p>
                </div>
                <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  Update Settings
                </button>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">January 2024 Invoice</p>
                  <p className="text-sm text-gray-500">Paid on Jan 15, 2024</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">$1,240</p>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Paid</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">December 2023 Invoice</p>
                  <p className="text-sm text-gray-500">Paid on Dec 15, 2023</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">$890</p>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Paid</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 