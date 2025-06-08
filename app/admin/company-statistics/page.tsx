'use client'

import React, { useState, useEffect } from 'react'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  ClockIcon,
  CreditCardIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface CompanyStatistics {
  overview: {
    totalCompanies: number
    companiesWithBalance: number
    activeCompanies: number
    recentCompanies: number
    totalBalance: number
    avgBalance: number
  }
  balanceDistribution: Array<{
    range: string
    count: number
  }>
  topSpendingCompanies: Array<{
    id: string
    name: string
    email: string
    balance: number
    autoRecharge: boolean
    autoRechargeThreshold?: number
    autoRechargeAmount?: number
    createdAt: string
  }>
  autoPaymentStats: {
    enabled: number
    disabled: number
    avgThreshold: number
    avgAmount: number
  }
  dailyLimitStats: {
    companiesWithLimits: number
    avgDailyLimit: number
    totalDailyLimitCapacity: number
  }
  latestCompanies: Array<{
    id: string
    name: string
    email: string
    balance: number
    autoRecharge: boolean
    createdAt: string
  }>
  spendingTrends: {
    daily: Array<{date: string, amount: number}>
    weekly: Array<{period: string, amount: number}>
    monthly: Array<{period: string, amount: number}>
  }
  timeframe: string
  generatedAt: string
}

export default function CompanyStatisticsPage() {
  const [statistics, setStatistics] = useState<CompanyStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('month')
  const [error, setError] = useState<string | null>(null)

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/company-statistics?timeframe=${timeframe}`)
      const data = await response.json()

      if (data.success) {
        setStatistics(data.data)
        setError(null)
      } else {
        setError(data.error || 'Chyba při načítání dat')
      }
    } catch (err) {
      setError('Chyba při komunikaci se serverem')
      console.error('Error fetching statistics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatistics()
  }, [timeframe])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Chyba: {error}</p>
        <button 
          onClick={fetchStatistics}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Zkusit znovu
        </button>
      </div>
    )
  }

  if (!statistics) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-600 mr-3" />
            Firemní statistiky
          </h1>
          <p className="text-gray-600 mt-1">
            Komplexní přehled všech firem, kreditů a nastavení
          </p>
        </div>
        
        {/* Timeframe selector */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Období:</label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[120px]"
          >
            <option value="day">Denní</option>
            <option value="week">Týdenní</option>
            <option value="month">Měsíční</option>
            <option value="quarter">Čtvrtletní</option>
            <option value="year">Roční</option>
          </select>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Celkem firem</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics.overview.totalCompanies}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Celkový kredit</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(statistics.overview.totalBalance)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Aktivní firmy</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics.overview.activeCompanies}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Nové firmy (30d)</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics.overview.recentCompanies}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCardIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Auto-payment aktivní</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics.autoPaymentStats.enabled}
              </p>
              <p className="text-xs text-gray-400">
                z {statistics.autoPaymentStats.enabled + statistics.autoPaymentStats.disabled} s kreditem
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Firmy s denními limity</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics.dailyLimitStats.companiesWithLimits}
              </p>
              <p className="text-xs text-gray-400">
                Průměr: {formatCurrency(statistics.dailyLimitStats.avgDailyLimit)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Průměrný kredit</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(statistics.overview.avgBalance)}
              </p>
              <p className="text-xs text-gray-400">
                Na firmu
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowTrendingUpIcon className="h-8 w-8 text-pink-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Firmy s kreditem</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics.overview.companiesWithBalance}
              </p>
              <p className="text-xs text-gray-400">
                {Math.round((statistics.overview.companiesWithBalance / statistics.overview.totalCompanies) * 100)}% ze všech
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuce kreditů</h3>
          <div className="space-y-3">
            {statistics.balanceDistribution.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{item.range}</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(item.count / statistics.overview.totalCompanies) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auto Payment Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Auto-payment statistiky</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Zapnuto</span>
              <span className="text-lg font-semibold text-green-600">
                {statistics.autoPaymentStats.enabled}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Vypnuto</span>
              <span className="text-lg font-semibold text-gray-600">
                {statistics.autoPaymentStats.disabled}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Průměrný práh</span>
                <span className="text-sm font-medium">
                  {formatCurrency(statistics.autoPaymentStats.avgThreshold)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Průměrná částka</span>
                <span className="text-sm font-medium">
                  {formatCurrency(statistics.autoPaymentStats.avgAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Limits */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Denní limity</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Firem s limity</span>
              <span className="text-lg font-semibold text-blue-600">
                {statistics.dailyLimitStats.companiesWithLimits}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Průměrný limit</span>
              <span className="text-sm font-medium">
                {formatCurrency(statistics.dailyLimitStats.avgDailyLimit)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Celková kapacita</span>
              <span className="text-sm font-medium">
                {formatCurrency(statistics.dailyLimitStats.totalDailyLimitCapacity)}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="text-xs text-gray-500">
                <p>Využití limitů: {Math.round((statistics.dailyLimitStats.companiesWithLimits / statistics.overview.totalCompanies) * 100)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Spending Companies */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Firmy s nejvyšším kreditem</h3>
          <p className="text-sm text-gray-600">Top 5 firem podle aktuálního zůstatku</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Firma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kredit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auto-payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nastavení
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registrace
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {statistics.topSpendingCompanies.slice(0, 5).map((company, index) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-purple-600 font-medium text-sm">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{company.name}</div>
                        <div className="text-sm text-gray-500">{company.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(company.balance)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      company.autoRecharge 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {company.autoRecharge ? 'Zapnuto' : 'Vypnuto'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.autoRecharge ? (
                      <div>
                        <div>Práh: {formatCurrency(company.autoRechargeThreshold || 0)}</div>
                        <div>Částka: {formatCurrency(company.autoRechargeAmount || 0)}</div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(company.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Latest Companies */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Nejnovější firmy</h3>
          <p className="text-sm text-gray-600">Posledních 5 registrovaných firem</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {statistics.latestCompanies.map((company) => (
              <div key={company.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{company.name}</p>
                      <p className="text-sm text-gray-500">{company.email}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(company.balance)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {company.autoRecharge ? 'Auto-payment' : 'Manuální'}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 min-w-[80px] text-right">
                    {formatDate(company.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Posledně aktualizováno: {formatDate(statistics.generatedAt)}</span>
            <span>•</span>
            <span>Období: {timeframe}</span>
          </div>
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4" />
            <span>Automatické obnovení každých 5 minut</span>
          </div>
        </div>
      </div>
    </div>
  )
} 