'use client'

import { useState } from 'react'
import {
  CreditCardIcon,
  PlusIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'

interface Transaction {
  id: string
  type: 'credit_purchase' | 'credit_usage' | 'refund'
  description: string
  amount: number
  credits: number
  status: 'completed' | 'pending' | 'failed'
  date: string
  service?: string
}

export default function BillingPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  
  // Mock data
  const billingData = {
    currentCredits: 245,
    creditValue: 1, // 1 USD per credit
    monthlyUsage: 125,
    monthlySpend: 125,
    nextBilling: '2024-02-15'
  }

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'credit_usage',
      description: 'Product promotion - AI Content Generator',
      amount: -25,
      credits: -25,
      status: 'completed',
      date: '2024-01-20',
      service: 'Product Promotion'
    },
    {
      id: '2',
      type: 'credit_usage',
      description: 'Top List placement - January',
      amount: -50,
      credits: -50,
      status: 'completed',
      date: '2024-01-15',
      service: 'Top List'
    },
    {
      id: '3',
      type: 'credit_purchase',
      description: 'Credit purchase - 100 credits',
      amount: 100,
      credits: 100,
      status: 'completed',
      date: '2024-01-10'
    },
    {
      id: '4',
      type: 'credit_usage',
      description: 'Reel promotion campaign',
      amount: -30,
      credits: -30,
      status: 'completed',
      date: '2024-01-08',
      service: 'Reel Promotion'
    },
    {
      id: '5',
      type: 'credit_purchase',
      description: 'Initial credit purchase',
      amount: 200,
      credits: 200,
      status: 'completed',
      date: '2024-01-01'
    }
  ]

  const creditPackages = [
    { credits: 50, price: 49, popular: false, savings: 0 },
    { credits: 100, price: 89, popular: true, savings: 11 },
    { credits: 250, price: 199, popular: false, savings: 51 },
    { credits: 500, price: 349, popular: false, savings: 151 }
  ]

  const servicesPricing = [
    { name: 'Product Promotion', credits: 25, description: 'Boost your product visibility' },
    { name: 'Top List Placement', credits: 50, description: 'Featured in category top 20' },
    { name: 'Reel Promotion', credits: 30, description: 'Promote your company reel' },
    { name: 'Course Listing', credits: 40, description: 'List your course on our platform' },
    { name: 'Email Campaign', credits: 20, description: 'Send targeted emails to our users' }
  ]

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === 'credit_purchase') {
      return <ArrowDownIcon className="h-5 w-5 text-green-500" />
    } else if (transaction.type === 'credit_usage') {
      return <ArrowUpIcon className="h-5 w-5 text-red-500" />
    } else {
      return <BanknotesIcon className="h-5 w-5 text-blue-500" />
    }
  }

  const getStatusBadge = (status: Transaction['status']) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    }
    
    const icons = {
      completed: <CheckCircleIcon className="h-4 w-4" />,
      pending: <ClockIcon className="h-4 w-4" />,
      failed: <XCircleIcon className="h-4 w-4" />
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Credits & Billing</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your credits and view billing history
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all">
          <PlusIcon className="h-4 w-4 mr-2" />
          Buy Credits
        </button>
      </div>

      {/* Credits Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <CreditCardIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Available Credits</p>
              <p className="text-2xl font-semibold text-gray-900">{billingData.currentCredits}</p>
              <p className="text-xs text-gray-400">≈ ${billingData.currentCredits * billingData.creditValue}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-50 rounded-lg">
              <ArrowUpIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Month Usage</p>
              <p className="text-2xl font-semibold text-gray-900">{billingData.monthlyUsage}</p>
              <p className="text-xs text-gray-400">credits used</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Month Spend</p>
              <p className="text-2xl font-semibold text-gray-900">${billingData.monthlySpend}</p>
              <p className="text-xs text-gray-400">total amount</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Next Billing</p>
              <p className="text-2xl font-semibold text-gray-900">Feb 15</p>
              <p className="text-xs text-gray-400">auto-renewal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Transaction History */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as any)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(transaction)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-gray-500">{transaction.date}</p>
                          {transaction.service && (
                            <>
                              <span className="text-xs text-gray-300">•</span>
                              <span className="text-xs text-purple-600">{transaction.service}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${
                          transaction.credits > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.credits > 0 ? '+' : ''}{transaction.credits} credits
                        </span>
                        {getStatusBadge(transaction.status)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Credit Packages */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Credit Packages</h3>
            </div>
            <div className="p-6 space-y-4">
              {creditPackages.map((pkg, index) => (
                <div key={index} className={`relative p-4 rounded-lg border-2 transition-colors ${
                  pkg.popular 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  {pkg.popular && (
                    <div className="absolute -top-2 left-4">
                      <span className="bg-purple-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{pkg.credits} Credits</p>
                      <p className="text-sm text-gray-500">${(pkg.price / pkg.credits).toFixed(2)} per credit</p>
                      {pkg.savings > 0 && (
                        <p className="text-xs text-green-600 font-medium">Save ${pkg.savings}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">${pkg.price}</p>
                      <button className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium">
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Services Pricing */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Services Pricing</h3>
            </div>
            <div className="p-6 space-y-4">
              {servicesPricing.map((service, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{service.name}</p>
                    <p className="text-xs text-gray-500">{service.description}</p>
                  </div>
                  <span className="text-sm font-semibold text-purple-600">
                    {service.credits} credits
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Low Credit Warning */}
          {billingData.currentCredits < 50 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Low Credit Balance</h4>
                  <p className="text-xs text-yellow-700 mt-1">
                    You have {billingData.currentCredits} credits remaining. Consider purchasing more to avoid service interruption.
                  </p>
                  <button className="mt-2 text-xs font-medium text-yellow-800 hover:text-yellow-900">
                    Buy Credits →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 