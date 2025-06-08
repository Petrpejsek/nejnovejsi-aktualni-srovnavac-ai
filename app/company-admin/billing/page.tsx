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
  FireIcon,
  DocumentArrowDownIcon,
  Cog6ToothIcon,
  ShieldCheckIcon
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

interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  status: string
  issuedAt: string
  dueAt: string
  paidAt?: string
  downloadUrl: string
}

interface BillingData {
  company: {
    id: string
    name: string
    balance: number
    autoRecharge: boolean
    autoRechargeAmount?: number
    autoRechargeThreshold?: number
    dailySpendLimit?: number
    currentDailySpend: number
  }
  transactions: BillingRecord[]
  invoices: Invoice[]
  periodSpend: {
    today: number
    week: number
    month: number
  }
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

type SpendPeriod = 'today' | 'week' | 'month'

export default function BillingPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [spendPeriod, setSpendPeriod] = useState<SpendPeriod>('today')
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDailyLimitModal, setShowDailyLimitModal] = useState(false)
  const [newDailyLimit, setNewDailyLimit] = useState<number>(0)
  const [showAutoRechargeModal, setShowAutoRechargeModal] = useState(false)
  const [autoRechargeSettings, setAutoRechargeSettings] = useState({
    enabled: false,
    threshold: 50,
    amount: 100
  })
  
  const [promotionalOffers, setPromotionalOffers] = useState<PromotionalOffer[]>([])
  const [couponCode, setCouponCode] = useState('')
  const [customAmount, setCustomAmount] = useState<number>(100)
  const [couponDiscount, setCouponDiscount] = useState<{type: 'percent' | 'amount', value: number} | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [availableCoupons, setAvailableCoupons] = useState<Array<{
    code: string
    description: string
    active: boolean
  }>>([])
  const [customPaymentEnabled, setCustomPaymentEnabled] = useState(true)

  // Načtení promocních balíčků s targeting
  const fetchPromotionalOffers = async () => {
    try {
      // Používáme nový endpoint s target status logikou
      const response = await fetch('/api/promotional-packages')
      if (response.ok) {
        const data = await response.json()
        setPromotionalOffers(data.packages || [])
        console.log('Loaded packages for user:', data.packages?.length, 'of', data.totalAvailable)
        console.log('User statuses:', data.userStatuses)
      }
    } catch (error) {
      console.error('Error fetching promotional offers:', error)
      // Fallback na původní data při chybě
      setPromotionalOffers([
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
          id: 'premium-1000',
          title: 'Premium Package',
          description: 'Maximum impact for serious advertisers.',
          amount: 1000,
          bonus: 200,
          savings: 200,
          popular: true
        }
      ])
    }
  }

  const servicesPricing = [
    { name: 'Cost per Click (CPC)', price: 'from $0.10', description: 'Pay only for actual clicks to your product' },
    { name: 'Featured Placement', price: '$50/month', description: 'Highlight your product in category listings' },
    { name: 'Homepage Promotion', price: '$2.00 per click', description: 'Premium placement on our homepage' },
    { name: 'Email Campaign', price: '$0.05 per send', description: 'Reach our subscriber base directly' },
    { name: 'Social Media Boost', price: '$100/campaign', description: 'Amplify your reach across social platforms' }
  ]

  const spendPeriodLabels = {
    today: 'Today Spend',
    week: 'This Week Spend', 
    month: 'This Month Spend'
  }

  useEffect(() => {
    fetchBillingData()
    fetchPromotionalOffers()
    fetchCustomPaymentSettings()
  }, [])

  const fetchCustomPaymentSettings = async () => {
    try {
      const response = await fetch('/api/admin/custom-payment-settings')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.settings) {
          // Zkontroluj jestli má uživatel přístup na základě target groups
          const userCanSeeCustomPayment = checkUserTargetGroupAccess(data.settings.targetGroups)
          
          setCustomPaymentEnabled(data.settings.enabled && userCanSeeCustomPayment)
          setCustomAmount(data.settings.defaultAmount)
          setAvailableCoupons(data.settings.availableCoupons.filter((c: any) => c.active))
        }
      }
    } catch (error) {
      console.error('Error fetching custom payment settings:', error)
    }
  }

  // Mock logika pro kontrolu přístupu na základě target groups
  const checkUserTargetGroupAccess = (targetGroups: string[]): boolean => {
    // Momentálně vrací true pro všechny - v produkci by se implementovala skutečná logika
    if (targetGroups.includes('all')) return true
    
    // Mock user status pro testování
    const mockUserStatus = {
      isNew: false,  // uživatel není nový (více než 7 dní)
      isActive: true, // má běžící kampaně
      hasLowBalance: billingData?.company?.balance ? billingData.company.balance < 20 : false,
      isHighSpender: true, // výdaje > $500/měsíc  
      isTrial: false,
      isEnterprise: false
    }
    
    return targetGroups.some(group => {
      switch (group) {
        case 'new': return mockUserStatus.isNew
        case 'active': return mockUserStatus.isActive
        case 'low_balance': return mockUserStatus.hasLowBalance
        case 'high_spender': return mockUserStatus.isHighSpender
        case 'trial': return mockUserStatus.isTrial
        case 'enterprise': return mockUserStatus.isEnterprise
        default: return false
      }
    })
  }

  useEffect(() => {
    // Dočasně vypnuto kvůli missing dailySpendLimit v databázi
    /*
    if (billingData?.company.dailySpendLimit) {
      setNewDailyLimit(billingData.company.dailySpendLimit)
    }
    */
    if (billingData?.company) {
      setAutoRechargeSettings({
        enabled: billingData.company.autoRecharge,
        threshold: billingData.company.autoRechargeThreshold || 50,
        amount: billingData.company.autoRechargeAmount || 100
      })
    }
  }, [billingData])

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

  const handleDailyLimitUpdate = async () => {
    try {
      if (newDailyLimit < 10) {
        alert('Minimum daily limit is $10')
        return
      }

      const response = await fetch('/api/advertiser/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'update-daily-limit',
          dailyLimit: newDailyLimit
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        await fetchBillingData()
        setShowDailyLimitModal(false)
        alert('Daily spend limit updated successfully!')
      } else {
        alert(`Error: ${result.error || 'Failed to update daily limit'}`)
      }
    } catch (error) {
      console.error('Daily limit update error:', error)
      alert('Network error occurred. Please try again.')
    }
  }

  const handleAutoRechargeUpdate = async () => {
    try {
      if (autoRechargeSettings.enabled) {
        if (autoRechargeSettings.threshold < 10) {
          alert('Minimum threshold is $10')
          return
        }
        if (autoRechargeSettings.amount < 20) {
          alert('Minimum recharge amount is $20')
          return
        }
      }

      const response = await fetch('/api/advertiser/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'auto-recharge',
          autoRecharge: autoRechargeSettings.enabled,
          autoRechargeAmount: autoRechargeSettings.enabled ? autoRechargeSettings.amount : null,
          autoRechargeThreshold: autoRechargeSettings.enabled ? autoRechargeSettings.threshold : null
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        await fetchBillingData()
        setShowAutoRechargeModal(false)
        alert('Auto-recharge settings updated successfully!')
      } else {
        alert(`Error: ${result.error || 'Failed to update auto-recharge settings'}`)
      }
    } catch (error) {
      console.error('Auto-recharge update error:', error)
      alert('Network error occurred. Please try again.')
    }
  }

  const downloadInvoice = async (invoice: Invoice) => {
    try {
      const response = await fetch(`/api/advertiser/billing/invoice/${invoice.id}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${invoice.invoiceNumber}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        alert('Failed to download invoice')
      }
    } catch (error) {
      console.error('Invoice download error:', error)
      alert('Error downloading invoice')
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

  const validateCouponCode = async (code: string) => {
    if (!code.trim()) {
      setCouponDiscount(null)
      setCouponError(null)
      return
    }

    try {
      // Zavolá API endpoint pro validaci kupónu
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      })

      const result = await response.json()
      
      if (response.ok && result.valid) {
        setCouponDiscount({
          type: result.coupon.type,
          value: result.coupon.value
        })
        setCouponError(null)
      } else {
        setCouponDiscount(null)
        setCouponError(result.error || 'Neplatný slevový kód')
      }
    } catch (error) {
      setCouponError('Chyba při ověřování kódu')
      setCouponDiscount(null)
    }
  }

  const calculateDiscountedAmount = () => {
    if (!couponDiscount) return customAmount
    
    if (couponDiscount.type === 'percent') {
      return customAmount * (1 - couponDiscount.value / 100)
    } else {
      return Math.max(0, customAmount - couponDiscount.value)
    }
  }

  const handleCustomPayment = async () => {
    if (customAmount < 10) {
      alert('Minimální částka je $10')
      return
    }

    const finalAmount = calculateDiscountedAmount()
    const discount = customAmount - finalAmount

    try {
      setLoading(true)
      
      const confirmed = confirm(
        `Dobití účtu se slevovým kódem\n\n` +
        `Původní částka: $${customAmount}\n` +
        (discount > 0 ? `Sleva: $${discount}\n` : '') +
        `Konečná částka: $${finalAmount}\n\n` +
        `Pokračovat s platbou?`
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
          action: 'add-funds-with-coupon',
          amount: finalAmount,
          couponCode: couponCode || null,
          originalAmount: customAmount,
          discount: discount
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        const message = discount > 0 
          ? `Úspěšně přidáno $${finalAmount} na váš účet!\n\nPůvodní: $${customAmount}\nSleva: $${discount}\nNový zůstatek: $${result.data.newBalance.toFixed(2)}`
          : `Úspěšně přidáno $${finalAmount} na váš účet!\n\nNový zůstatek: $${result.data.newBalance.toFixed(2)}`
        
        alert(message)
        await fetchBillingData()
        setCouponCode('')
        setCouponDiscount(null)
        setCustomAmount(100)
      } else {
        alert(`Chyba: ${result.error || 'Platba se nezdařila'}`)
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Chyba při zpracování platby')
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

  const getCurrentPeriodSpend = () => {
    return billingData?.periodSpend?.[spendPeriod] || 0
  }

  const getDailySpendStatus = () => {
    // Dočasně vrácíme null, protože dailySpendLimit není v databázi
    return null
    
    /* Původní kód pro později:
    if (!billingData?.company?.dailySpendLimit) return null
    
    const percentage = (billingData.company.currentDailySpend / billingData.company.dailySpendLimit) * 100
    
    if (percentage >= 90) return 'danger'
    if (percentage >= 70) return 'warning'
    return 'safe'
    */
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white shadow rounded-lg p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-red-900 mb-2">Error Loading Billing Data</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={fetchBillingData}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Data not loaded
  if (!billingData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-500">No billing data available</p>
        </div>
      </div>
    )
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

      {/* Account Overview - 3 cards instead of 4 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Available Balance */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-green-100 rounded-lg">
                <BanknotesIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Available Balance</h3>
              <p className="text-2xl font-bold text-gray-900">${billingData.company.balance.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Ready to spend</p>
            </div>
          </div>
        </div>

        {/* Period Spend with flexible selection */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-red-100 rounded-lg">
                <ArrowUpIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">{spendPeriodLabels[spendPeriod]}</h3>
                <div className="relative">
                  <select 
                    value={spendPeriod}
                    onChange={(e) => setSpendPeriod(e.target.value as SpendPeriod)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 pr-8 bg-white cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] shadow-sm text-gray-700 font-medium"
                    style={{
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      backgroundImage: 'none'
                    }}
                  >
                    <option value="today">Today</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                  </select>
                  {/* Custom dropdown arrow */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">${getCurrentPeriodSpend().toFixed(2)}</p>
              <p className="text-xs text-gray-500">advertising costs</p>
            </div>
          </div>
        </div>

        {/* Auto-Recharge */}
        <div 
          className="bg-white shadow rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow border border-gray-200 hover:border-purple-300"
          onClick={() => setShowAutoRechargeModal(true)}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-purple-100 rounded-lg">
                {billingData.company.autoRecharge ? (
                  <CheckCircleIcon className="h-6 w-6 text-purple-600" />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-purple-600" />
                )}
              </div>
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">Auto-Recharge</h3>
                <Cog6ToothIcon className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {billingData.company.autoRecharge ? 'ON' : 'OFF'}
              </p>
              <p className="text-xs text-gray-500">
                {billingData.company.autoRecharge 
                  ? `Add $${billingData.company.autoRechargeAmount} when below $${billingData.company.autoRechargeThreshold}`
                  : 'Click to set up automatic billing'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Spend Control */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Daily Spend Control</h3>
          </div>
          <button
            onClick={() => setShowDailyLimitModal(true)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <Cog6ToothIcon className="h-4 w-4 mr-1" />
            Configure
          </button>
        </div>
        
        {/* Today's Spending Display */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Today's Spending</p>
              <p className="text-2xl font-bold text-gray-900">${billingData.company.currentDailySpend.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Daily Budget</p>
              <p className="text-lg font-semibold text-gray-900">
                {billingData.company.dailySpendLimit ? 
                  `$${billingData.company.dailySpendLimit.toFixed(2)}` : 
                  'Unlimited'
                }
              </p>
            </div>
          </div>

          {billingData.company.dailySpendLimit ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progress</span>
                <span>{Math.round((billingData.company.currentDailySpend / billingData.company.dailySpendLimit) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${
                    getDailySpendStatus() === 'danger' ? 'bg-red-500' :
                    getDailySpendStatus() === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, (billingData.company.currentDailySpend / billingData.company.dailySpendLimit) * 100)}%` 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">$0</span>
                <span className="text-gray-500">${billingData.company.dailySpendLimit.toFixed(0)}</span>
              </div>
              {getDailySpendStatus() === 'danger' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 mt-3">
                  <p className="text-xs text-red-700 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    Warning: You're approaching your daily spend limit (90%+)
                  </p>
                </div>
              )}
              {getDailySpendStatus() === 'warning' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-3">
                  <p className="text-xs text-yellow-700 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    Notice: You've used 70%+ of your daily budget
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>No daily limit set.</strong> Consider setting a spending limit for better budget control and campaign optimization.
              </p>
              <div className="mt-2 flex items-center text-xs text-blue-600">
                <ShieldCheckIcon className="h-4 w-4 mr-1" />
                Recommended: Set daily budget based on your monthly advertising goals
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Daily Limit Modal */}
      {showDailyLimitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Set Daily Spend Limit</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Limit (USD)
              </label>
              <input
                type="number"
                min="10"
                step="10"
                value={newDailyLimit}
                onChange={(e) => setNewDailyLimit(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g., 100"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum: $10</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDailyLimitModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDailyLimitUpdate}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save Limit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Recharge Modal */}
      {showAutoRechargeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <CheckCircleIcon className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Auto-Recharge Settings</h3>
            </div>
            
            <div className="space-y-4">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Enable Auto-Recharge</p>
                  <p className="text-xs text-gray-500">Automatically add funds when balance is low</p>
                </div>
                <button
                  onClick={() => setAutoRechargeSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoRechargeSettings.enabled ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoRechargeSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {autoRechargeSettings.enabled && (
                <>
                  {/* Threshold Setting */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trigger When Balance Falls Below (USD)
                    </label>
                    <input
                      type="number"
                      min="10"
                      step="5"
                      value={autoRechargeSettings.threshold}
                      onChange={(e) => setAutoRechargeSettings(prev => ({ ...prev, threshold: Number(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="e.g., 50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum: $10</p>
                  </div>

                  {/* Amount Setting */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recharge Amount (USD)
                    </label>
                    <input
                      type="number"
                      min="20"
                      step="10"
                      value={autoRechargeSettings.amount}
                      onChange={(e) => setAutoRechargeSettings(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="e.g., 100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum: $20</p>
                  </div>

                  {/* Summary */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-sm text-purple-800">
                      <strong>Summary:</strong> When your balance drops below ${autoRechargeSettings.threshold}, 
                      we'll automatically add ${autoRechargeSettings.amount} to your account.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAutoRechargeModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAutoRechargeUpdate}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Transactions and Invoices */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Invoices Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <DocumentArrowDownIcon className="h-5 w-5 text-gray-500 mr-2" />
                Invoices
              </h3>
              <span className="text-sm text-gray-500">Last 12 months</span>
            </div>
            <div className="p-6">
              {billingData.invoices && billingData.invoices.length > 0 ? (
                <div className="space-y-3">
                  {billingData.invoices.slice(0, 5).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <DocumentArrowDownIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
                          <p className="text-xs text-gray-500">
                            Issued: {formatDate(invoice.issuedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">${invoice.amount.toFixed(2)}</p>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <button
                          onClick={() => downloadInvoice(invoice)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentArrowDownIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No invoices available</p>
                  <p className="text-xs text-gray-400">Invoices will appear here after your first transaction</p>
                </div>
              )}
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
              <div className="relative">
                <select 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as any)}
                  className="text-sm border border-gray-300 rounded-lg px-4 py-2 pr-10 bg-white cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px] shadow-sm"
                  style={{
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    backgroundImage: 'none'
                  }}
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-6">
              {billingData.transactions.length > 0 ? (
                <div className="space-y-4">
                  {billingData.transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {getTransactionIcon(transaction)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(transaction.createdAt)}
                            {transaction.invoiceNumber && (
                              <span className="ml-2 text-blue-600">#{transaction.invoiceNumber}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            transaction.type === 'deposit' || transaction.type === 'bonus' 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {transaction.type === 'deposit' || transaction.type === 'bonus' ? '+' : '-'}
                            ${transaction.amount.toFixed(2)}
                          </p>
                        </div>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BanknotesIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No transactions yet</p>
                  <p className="text-xs text-gray-400">Start advertising to see your transaction history here.</p>
                  <button 
                    onClick={() => handleOfferSelect(promotionalOffers[0])}
                    className="mt-3 text-sm font-medium text-purple-600 hover:text-purple-800"
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
          {/* Custom Amount with Coupon Code */}
          {customPaymentEnabled && (
            <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <CreditCardIcon className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">Vlastní částka</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Částka ($)
                </label>
                <input
                  type="number"
                  min="10"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100"
                />
                <p className="text-xs text-gray-500 mt-1">Minimální částka je $10</p>
              </div>

              {/* Coupon Code Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slevový kód (volitelné)
                </label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value)
                    validateCouponCode(e.target.value)
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="např. WELCOME20"
                />
                
                {/* Coupon validation feedback */}
                {couponError && (
                  <p className="text-xs text-red-600 mt-1 flex items-center">
                    <XCircleIcon className="h-3 w-3 mr-1" />
                    {couponError}
                  </p>
                )}
                
                {couponDiscount && (
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    {couponDiscount.type === 'percent' 
                      ? `${couponDiscount.value}% sleva aplikována!`
                      : `$${couponDiscount.value} sleva aplikována!`
                    }
                  </p>
                )}
              </div>

              {/* Price Summary */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Původní částka:</span>
                  <span className="font-medium">${customAmount}</span>
                </div>
                
                {couponDiscount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sleva:</span>
                    <span className="font-medium text-green-600">
                      -{couponDiscount.type === 'percent' 
                        ? `$${(customAmount * couponDiscount.value / 100).toFixed(2)}` 
                        : `$${Math.min(couponDiscount.value, customAmount).toFixed(2)}`
                      }
                    </span>
                  </div>
                )}
                
                <hr className="border-gray-200" />
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-gray-900">Celkem k platbě:</span>
                  <span className="text-blue-600">${calculateDiscountedAmount().toFixed(2)}</span>
                </div>
              </div>

              {/* Example Coupon Codes */}
              {availableCoupons.length > 0 && (
                <div className="text-xs text-gray-500">
                  <p className="font-medium mb-1">Zkuste tyto kódy:</p>
                  <div className="space-y-1">
                    {availableCoupons.slice(0, 4).map((coupon, index) => (
                      <p key={index}>
                        <span className="bg-gray-100 px-2 py-1 rounded font-mono">{coupon.code}</span> - {coupon.description}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Button */}
              <button
                onClick={handleCustomPayment}
                disabled={customAmount < 10 || loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                )}
                Zaplatit ${calculateDiscountedAmount().toFixed(2)}
              </button>
            </div>
          </div>
        )}

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