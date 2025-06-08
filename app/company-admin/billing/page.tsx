'use client'

import { useState, useEffect } from 'react'
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
  BanknotesIcon,
  GiftIcon,
  SparklesIcon,
  FireIcon
} from '@heroicons/react/24/outline'

interface BillingRecord {
  id: string
  type: string
  amount: number
  description: string
  status: string
  createdAt: string
  invoiceNumber?: string
  invoiceUrl?: string
}

interface BillingData {
  company: {
    id: string
    name: string
    balance: number
    totalSpent: number
    autoRecharge: boolean
    autoRechargeAmount?: number
    autoRechargeThreshold?: number
  }
  transactions: BillingRecord[]
  monthlySpend: number
}

interface PromotionalOffer {
  id: string
  title: string
  description: string
  amount: number
  bonus: number
  savings: number
  popular?: boolean
  firstTime?: boolean
  minimumSpend?: number
}

export default function BillingPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Promotional offers - real data with actions for bigger spending
  const promotionalOffers: PromotionalOffer[] = [
    {
      id: 'starter-100',
      title: 'Welcome Bonus',
      description: 'Perfect to get started! Double your first deposit.',
      amount: 100,
      bonus: 100,
      savings: 100,
      firstTime: true
    },
    {
      id: 'growth-500',
      title: 'Growth Package',
      description: 'Scale your campaigns with extra budget.',
      amount: 500,
      bonus: 100,
      savings: 100
    },
    {
      id: 'premium-1000',
      title: 'Premium Package',
      description: 'Maximum impact for serious advertisers.',
      amount: 1000,
      bonus: 200,
      savings: 200,
      popular: true
    },
    {
      id: 'enterprise-2500',
      title: 'Enterprise Package',
      description: 'For high-volume campaigns and maximum reach.',
      amount: 2500,
      bonus: 750,
      savings: 750
    }
  ]

  const servicesPricing = [
    { name: 'Cost per Click (CPC)', price: 'from $0.10', description: 'Pay only for actual clicks to your product' },
    { name: 'Featured Placement', price: '$50/month', description: 'Highlight your product in category listings' },
    { name: 'Homepage Promotion', price: '$2.00 per click', description: 'Premium placement on our homepage' },
    { name: 'Email Campaign', price: '$0.05 per send', description: 'Reach our subscriber base directly' },
    { name: 'Social Media Boost', price: '$100/campaign', description: 'Amplify your reach across social platforms' }
  ]

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/advertiser/billing')
      const result = await response.json()

      if (response.ok && result.success) {
        setBillingData(result.data)
      } else {
        setError(result.error || 'Failed to fetch billing data')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Billing data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (transaction: BillingRecord) => {
    if (transaction.type === 'deposit' || transaction.type === 'recharge') {
      return <ArrowDownIcon className="h-5 w-5 text-green-500" />
    } else if (transaction.type === 'spend' || transaction.type === 'click_charge') {
      return <ArrowUpIcon className="h-5 w-5 text-red-500" />
    } else {
      return <BanknotesIcon className="h-5 w-5 text-blue-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800'
    }
    
    const icons = {
      completed: <CheckCircleIcon className="h-4 w-4" />,
      pending: <ClockIcon className="h-4 w-4" />,
      failed: <XCircleIcon className="h-4 w-4" />,
      processing: <ClockIcon className="h-4 w-4" />
    }

    const statusKey = status as keyof typeof styles
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[statusKey] || styles.completed}`}>
        {icons[statusKey] || icons.completed}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleOfferSelect = async (offer: PromotionalOffer) => {
    try {
      setLoading(true)
      
      // In real implementation, here would be payment processor integration
      const confirmed = confirm(
        `Add funds: ${offer.title}\n\n` +
        `Amount: $${offer.amount}\n` +
        `Bonus: $${offer.bonus}\n` +
        `Total: $${offer.amount + offer.bonus}\n\n` +
        `Proceed with payment?`
      )
      
      if (!confirmed) {
        setLoading(false)
        return
      }

      const response = await fetch('/api/advertiser/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'add-funds',
          offerId: offer.id,
          paymentMethod: 'card'
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        alert(`Success! Added $${result.data.totalAdded} to your account.\n\nBase amount: $${result.data.baseAmount}\nBonus: $${result.data.bonusAmount}\nNew balance: $${result.data.newBalance.toFixed(2)}`)
        
        // Refresh billing data
        await fetchBillingData()
      } else {
        alert(`Error: ${result.error || 'Failed to add funds'}`)
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Network error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <XCircleIcon className="h-6 w-6 text-red-500 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-red-800">Error Loading Billing Data</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button 
              onClick={fetchBillingData}
              className="mt-3 text-sm font-medium text-red-800 hover:text-red-900"
            >
              Try Again →
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!billingData) {
    return <div>No billing data available</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Account Balance & Billing</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your advertising budget and view transaction history
          </p>
        </div>
        <button 
          onClick={() => handleOfferSelect(promotionalOffers[0])}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Funds
        </button>
      </div>

      {/* Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Available Balance</p>
              <p className="text-2xl font-semibold text-gray-900">${billingData.company.balance.toFixed(2)}</p>
              <p className="text-xs text-gray-400">Ready to spend</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-50 rounded-lg">
              <ArrowUpIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Month Spend</p>
              <p className="text-2xl font-semibold text-gray-900">${billingData.monthlySpend.toFixed(2)}</p>
              <p className="text-xs text-gray-400">advertising costs</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CreditCardIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Invested</p>
              <p className="text-2xl font-semibold text-gray-900">${billingData.company.totalSpent.toFixed(2)}</p>
              <p className="text-xs text-gray-400">lifetime spending</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Auto-Recharge</p>
              <p className="text-2xl font-semibold text-gray-900">
                {billingData.company.autoRecharge ? 'ON' : 'OFF'}
              </p>
              <p className="text-xs text-gray-400">
                {billingData.company.autoRecharge && billingData.company.autoRechargeThreshold
                  ? `at $${billingData.company.autoRechargeThreshold}`
                  : 'automated billing'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Special Offers Banner */}
      {billingData.company.totalSpent < 500 && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <GiftIcon className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">🎉 Special Launch Offer!</h3>
                <p className="text-purple-100">
                  Double your first deposit! Add $100 and get $200 total to start advertising.
                </p>
              </div>
            </div>
            <button 
              onClick={() => handleOfferSelect(promotionalOffers[0])}
              className="px-6 py-2 bg-white text-purple-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Claim Offer
            </button>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction History */}
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
              {billingData.transactions.length > 0 ? (
                billingData.transactions.map((transaction) => (
                  <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
                            {transaction.invoiceNumber && (
                              <>
                                <span className="text-xs text-gray-300">•</span>
                                <span className="text-xs text-purple-600">#{transaction.invoiceNumber}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${
                            transaction.type === 'deposit' || transaction.type === 'recharge' 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {transaction.type === 'deposit' || transaction.type === 'recharge' ? '+' : '-'}
                            ${Math.abs(transaction.amount).toFixed(2)}
                          </span>
                          {getStatusBadge(transaction.status)}
                        </div>
                        {transaction.invoiceUrl && (
                          <a
                            href={transaction.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-purple-600 hover:text-purple-700 mt-1 inline-block"
                          >
                            Download Invoice →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <BanknotesIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                  <p className="text-gray-500 mb-4">Start advertising to see your transaction history here.</p>
                  <button 
                    onClick={() => handleOfferSelect(promotionalOffers[0])}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Add your first funds →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Promotional Packages */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-medium text-gray-900">Promotional Packages</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {promotionalOffers.map((offer) => (
                <div key={offer.id} className={`relative p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                  offer.popular 
                    ? 'border-purple-500 bg-purple-50' 
                    : offer.firstTime
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => handleOfferSelect(offer)}>
                  {offer.popular && (
                    <div className="absolute -top-2 left-4">
                      <span className="bg-purple-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1">
                        <FireIcon className="h-3 w-3" />
                        <span>Most Popular</span>
                      </span>
                    </div>
                  )}
                  {offer.firstTime && (
                    <div className="absolute -top-2 left-4">
                      <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1">
                        <GiftIcon className="h-3 w-3" />
                        <span>Welcome Bonus</span>
                      </span>
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{offer.title}</h4>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">${offer.amount}</p>
                        <p className="text-sm text-green-600 font-medium">+${offer.bonus} bonus</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{offer.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-600 font-medium">
                        Total: ${offer.amount + offer.bonus} (Save ${offer.savings})
                      </span>
                      <span className="text-xs text-purple-600 font-medium hover:text-purple-700">
                        Select →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Services Pricing */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Advertising Costs</h3>
            </div>
            <div className="p-6 space-y-4">
              {servicesPricing.map((service, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{service.name}</p>
                    <p className="text-xs text-gray-500">{service.description}</p>
                  </div>
                  <span className="text-sm font-semibold text-purple-600">
                    {service.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Low Balance Warning */}
          {billingData.company.balance < 50 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Low Balance Warning</h4>
                  <p className="text-xs text-yellow-700 mt-1">
                    Your balance is ${billingData.company.balance.toFixed(2)}. Add funds to keep your campaigns running.
                  </p>
                  <button 
                    onClick={() => handleOfferSelect(promotionalOffers[0])}
                    className="mt-2 text-xs font-medium text-yellow-800 hover:text-yellow-900"
                  >
                    Add Funds →
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