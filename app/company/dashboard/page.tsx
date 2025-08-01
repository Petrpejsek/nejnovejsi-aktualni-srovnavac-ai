'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useAuth } from '@/hooks/useAuth'
import {
  CreditCardIcon,
  ChartBarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface DashboardData {
  company: {
    id: string
    name: string
    balance: number
    totalSpent: number
    autoRecharge: boolean
    autoRechargeAmount?: number
    autoRechargeThreshold?: number
  }
  transactions: Array<{
    id: string
    type: string
    amount: number
    description: string
    status: string
    createdAt: string
  }>
  monthlySpend: number
  campaigns?: Array<{
    id: string
    name: string
    status: string
    isApproved: boolean
    totalClicks: number
    totalImpressions: number
    totalSpent: number
  }>
}

export default function CompanyDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isCompany, isAuthenticated, isLoading: authLoading } = useAuth()

  console.log('🔍 COMPANY DASHBOARD - Auth status:', { 
    isAuthenticated, 
    isCompany, 
    user: user?.email,
    role: user?.role || 'unknown'
  })

  // 🔐 AUTHENTICATION CHECK
  if (authLoading) {
    return <div className="p-4">Načítám session...</div>
  }

  if (!isAuthenticated || !isCompany) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold text-red-600">Přístup zamítnut</h1>
        <p>Tato stránka je pouze pro přihlášené company účty.</p>
        <p>Aktuální role: {user?.role || 'žádná'}</p>
      </div>
    )
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      console.log('🚀 NAČÍTÁM COMPANY DASHBOARD DATA pro:', user?.email)
      
      try {
        setLoading(true)
        
        // 🔥 TEMPORARY - používáme mock data místo starých API endpointů
        console.log('⚠️ POUŽÍVÁM MOCK DATA - starý JWT systém je vypnutý')
        
        const mockData = {
          company: {
            id: 'company1',
            name: user?.name || 'Test Company',
            balance: 1500.00,
            totalSpent: 3240.50,
            autoRecharge: true,
            autoRechargeAmount: 500,
            autoRechargeThreshold: 100
          },
          transactions: [
            {
              id: '1',
              type: 'charge',
              amount: 500,
              description: 'Credit top-up',
              status: 'completed',
              createdAt: new Date().toISOString()
            }
          ],
          monthlySpend: 890.25,
          campaigns: [
            {
              id: '1',
              name: 'Test kampaň',
              status: 'active',
              isApproved: true,
              totalClicks: 150,
              totalImpressions: 5000,
              totalSpent: 285.50
            }
          ]
        }

        setDashboardData(mockData)

      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && isCompany) {
      fetchDashboardData()
    }
  }, [isAuthenticated, isCompany, user?.email])

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return null
  }

  // Calculate metrics
  const totalCampaigns = dashboardData.campaigns?.length || 0
  const activeCampaigns = dashboardData.campaigns?.filter(c => c.status === 'active' && c.isApproved).length || 0
  const pendingCampaigns = dashboardData.campaigns?.filter(c => !c.isApproved).length || 0
  const totalClicks = dashboardData.campaigns?.reduce((sum, c) => sum + c.totalClicks, 0) || 0
  const totalImpressions = dashboardData.campaigns?.reduce((sum, c) => sum + c.totalImpressions, 0) || 0
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

  return (
    <div className="h-full flex flex-col">
      {/* Page header - compact */}
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600">Overview of your account and performance</p>
      </div>

      {/* Stats grid - optimized for single screen */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {/* Credits Card */}
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Balance</p>
              <div className="flex items-baseline">
                <p className="text-xl font-semibold text-gray-900">${dashboardData.company.balance.toFixed(2)}</p>
                <div className="ml-2 flex items-center text-xs text-gray-500">
                  <span>Available</span>
                </div>
              </div>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <CreditCardIcon className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Campaigns Card */}
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Campaigns</p>
              <p className="text-xl font-semibold text-gray-900">{activeCampaigns}/{totalCampaigns}</p>
              <p className="text-xs text-gray-500">{pendingCampaigns} pending</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Impressions Card */}
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Impressions</p>
              <p className="text-xl font-semibold text-gray-900">{totalImpressions.toLocaleString()}</p>
              <p className="text-xs text-gray-500">all time</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <EyeIcon className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* Clicks Card */}
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Clicks</p>
              <p className="text-xl font-semibold text-gray-900">{totalClicks}</p>
              <p className="text-xs text-green-600">{ctr.toFixed(1)}% CTR</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <CursorArrowRaysIcon className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content grid - optimized for remaining space */}
      <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
        {/* Recent Activity - takes 2 columns */}
        <div className="col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {dashboardData.transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      transaction.type === 'spend' ? 'bg-red-100' :
                      transaction.type === 'charge' ? 'bg-green-100' :
                      'bg-blue-100'
                    }`}>
                      {transaction.type === 'spend' && <CreditCardIcon className="w-3 h-3 text-red-600" />}
                      {transaction.type === 'charge' && <PlusIcon className="w-3 h-3 text-green-600" />}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium ${
                    transaction.type === 'charge' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'charge' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </span>
                </div>
              ))}
              
              {dashboardData.transactions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No recent transactions</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions - takes 1 column */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="flex-1 p-4 space-y-3">
            <button className="w-full flex items-center justify-center px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium rounded-md hover:from-purple-700 hover:to-pink-700 transition-colors">
              <PlusIcon className="w-3 h-3 mr-2" />
              Add Funds
            </button>
            <button className="w-full flex items-center justify-center px-3 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors">
              <PlusIcon className="w-3 h-3 mr-2" />
              New Product
            </button>
            <button className="w-full flex items-center justify-center px-3 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors">
              <ChartBarIcon className="w-3 h-3 mr-2" />
              View Analytics
            </button>
          </div>
          
          {/* Upcoming charges preview */}
          <div className="p-4 border-t border-gray-200">
            <h4 className="text-xs font-medium text-gray-900 mb-2">Upcoming Charges</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Top listing</span>
                <span className="font-medium text-gray-900">-$50.00</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Promotion boost</span>
                <span className="font-medium text-gray-900">-$25.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}