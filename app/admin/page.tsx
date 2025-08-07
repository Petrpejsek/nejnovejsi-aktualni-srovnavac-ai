'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useAuth } from '@/hooks/useAuth'

interface AnalyticsData {
  totalClicks: number
  uniqueVisitors: number
}

interface DashboardStats {
  products: {
    total: number
    active: number
    pending: number
    draft: number
  }
  courses: {
    total: number
    published: number
    draft: number
    enrolled: number
  }
  companies: {
    total: number
    active: number
    pending: number
    verified: number
  }
  pages: {
    total: number
    published: number
    draft: number
  }
  users: {
    total: number
    active: number
    companies: number
  }
  analytics: {
    totalClicks: number
    uniqueVisitors: number
  }
  companyApplications?: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
  pendingProductChanges?: {
    total: number
    newProducts: number
    productEdits: number
  }
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalClicks: 0,
    uniqueVisitors: 0
  })
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [previousPendingCount, setPreviousPendingCount] = useState<number>(0)

  // Fetch skutečných dat z API
  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    
    try {
      const response = await fetch('/api/admin-stats', {
        cache: 'no-store', // Zajistíme fresh data
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Detekce nových firemních aplikací
        const currentPendingCount = data.companyApplications?.pending || 0
        if (isRefresh && previousPendingCount > 0 && currentPendingCount > previousPendingCount) {
          // Nová firemní aplikace!
          console.log('🚨 Nová firemní aplikace detekována!', {
            previous: previousPendingCount,
            current: currentPendingCount
          })
          
          // Audio notifikace (pokud browser podporuje)
          try {
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance('Nová firemní aplikace')
              utterance.lang = 'cs-CZ'
              utterance.volume = 0.5
              speechSynthesis.speak(utterance)
            }
          } catch (e) {
            console.log('Audio notifikace není podporována')
          }
          
          // Desktop notifikace
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Comparee.ai Admin', {
              body: `Nová firemní aplikace čeká na schválení! (${currentPendingCount} celkem)`,
              icon: '/favicon.ico'
            })
          }
        }
        
        setPreviousPendingCount(currentPendingCount)
        setDashboardStats(data)
        setAnalytics({
          totalClicks: data.analytics.totalClicks,
          uniqueVisitors: data.analytics.uniqueVisitors
        })
        setLastUpdated(new Date())
        console.log('📊 Dashboard stats aktualizovány:', new Date().toLocaleTimeString())
      } else {
        console.error('Chyba při načítání statistik')
      }
    } catch (error) {
      console.error('Chyba při načítání statistik:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Manuální refresh
  const handleManualRefresh = () => {
    fetchStats(true)
  }

  // Inicializace notifikací
  useEffect(() => {
    // Požádat o povolení desktop notifikací
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Automatické obnovování každých 30 sekund
  useEffect(() => {
    fetchStats() // První načtení
    
    const interval = setInterval(() => {
      fetchStats(true) // Auto refresh každých 30 sekund
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Pokud ještě načítáme data, zobrazíme loading stav
  if (loading || !dashboardStats) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Načítání...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const quickActions = [
    {
      title: 'Správa produktů',
      description: 'Přidej, upravuj a spravuj produkty v katalogu',
      href: '/admin/products',
      icon: '📦',
      color: 'bg-blue-500',
      stats: `${dashboardStats.products.total} produktů`
    },
    {
      title: 'AI Kurzy',
      description: 'Vytvárej a spravuj online kurzy',
      href: '/admin/courses',
      icon: '🎓',
      color: 'bg-purple-500',
      stats: `${dashboardStats.courses.total} kurzů`
    },
    {
      title: 'Top Listy',
      description: 'Správa kategorických seznamů',
      href: '/admin/top-lists',
      icon: '📋',
      color: 'bg-green-500',
      stats: '12 kategorií'
    },
    {
      title: 'Firmy',
      description: 'Spravuj registrované firmy a jejich profily',
      href: '/admin/companies',
      icon: '🏢',
      color: 'bg-orange-500',
      stats: `${dashboardStats.companies.total} firem`
    },
    {
      title: 'Stránky',
      description: 'Editor statických stránek a SEO',
      href: '/admin/pages',
      icon: '📄',
      color: 'bg-indigo-500',
      stats: `${dashboardStats.pages.total} stránek`
    },
    {
      title: 'Uživatelé',
      description: 'Správa uživatelských účtů a oprávnění',
      href: '/admin/users',
      icon: '👥',
      color: 'bg-pink-500',
      stats: `${dashboardStats.users.total} uživatelů`
    }
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'product',
      title: 'Produkty načteny z databáze',
      description: `Celkem ${dashboardStats.products.total} produktů v databázi`,
      time: 'Právě teď',
      icon: '📦',
      iconColor: 'text-blue-500'
    },
    {
      id: 2,
      type: 'analytics',
      title: 'Analytické údaje aktualizovány',
      description: `${dashboardStats.analytics.totalClicks} kliků, ${dashboardStats.analytics.uniqueVisitors} návštěvníků`,
      time: 'Právě teď',
      icon: '📊',
      iconColor: 'text-green-500'
    },
    {
      id: 3,
      type: 'company',
      title: 'Firemní účty',
      description: `${dashboardStats.companies.total} registrovaných firem`,
      time: 'Aktuální stav',
      icon: '🏢',
      iconColor: 'text-orange-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Přehled a správa celého webu AI nástroje
            </p>
            {lastUpdated && (
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <span className="mr-2">📊</span>
                <span>Poslední aktualizace: {lastUpdated.toLocaleTimeString('cs-CZ')}</span>
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Automaticky se obnovuje každých 30s
                </span>
              </div>
            )}
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Admin panel</span>
            
            {/* Refresh Button */}
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className={`${
                refreshing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2`}
              title="Aktualizovat statistiky"
            >
              <span className={refreshing ? 'animate-spin' : ''}>
                {refreshing ? '⟳' : '🔄'}
              </span>
              <span>{refreshing ? 'Načítám...' : 'Obnovit'}</span>
            </button>
            
            {/* Logout Button */}
            <button
              onClick={() => {
                signOut({ callbackUrl: '/' })
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <span>🔓</span>
              <span>Odhlásit se</span>
            </button>
          </div>
        </div>
      </div>


      {/* Upozornění pro pending company applications - zvýrazněné */}
      {dashboardStats.companyApplications && dashboardStats.companyApplications.pending > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 shadow-lg rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-3xl animate-pulse">🔔</span>
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-amber-900">
                  Nové firemní aplikace k vyřízení!
                </h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                  {dashboardStats.companyApplications.pending} čeká na schválení
                </span>
              </div>
              <div className="mt-2 text-sm text-amber-800">
                <p>
                  Máte <strong>{dashboardStats.companyApplications.pending}</strong> {dashboardStats.companyApplications.pending === 1 ? 'firemní aplikaci' : 'firemních aplikací'} čekajících na vaše posouzení a schválení.
                </p>
              </div>
              <div className="mt-4 flex space-x-3">
                <Link
                  href="/admin/companies"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-sm transition-colors"
                >
                  <span className="mr-2">📋</span>
                  Zkontrolovat aplikace
                  <span className="ml-2">→</span>
                </Link>
                <Link
                  href="/admin/companies"
                  className="inline-flex items-center px-4 py-2 border border-amber-300 text-sm font-medium rounded-md text-amber-800 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                >
                  Pouze čekající
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto Refresh Status */}
      {refreshing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-sm text-blue-800 font-medium">
              Obnovuji statistiky...
            </span>
          </div>
        </div>
      )}

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Pending Product Changes */}
        <Link
          href="/admin/pending-changes"
          className="group"
        >
          <div className={`bg-white p-6 rounded-lg shadow-sm border transition-all duration-200 cursor-pointer ${
            dashboardStats.pendingProductChanges && dashboardStats.pendingProductChanges.total > 0 
              ? 'border-red-300 hover:border-red-400 hover:shadow-md bg-red-50' 
              : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">
                  {dashboardStats.pendingProductChanges && dashboardStats.pendingProductChanges.total > 0 ? '🔄' : '✅'}
                </span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className={`text-sm font-medium truncate transition-colors ${
                    dashboardStats.pendingProductChanges && dashboardStats.pendingProductChanges.total > 0 
                      ? 'text-red-700 group-hover:text-red-800' 
                      : 'text-gray-500 group-hover:text-purple-600'
                  }`}>
                    {dashboardStats.pendingProductChanges && dashboardStats.pendingProductChanges.total > 0 
                      ? 'Čeká na schválení' 
                      : 'Pending Changes'}
                  </dt>
                  <dd className={`text-lg font-medium transition-colors ${
                    dashboardStats.pendingProductChanges && dashboardStats.pendingProductChanges.total > 0 
                      ? 'text-red-900 group-hover:text-red-900' 
                      : 'text-gray-900 group-hover:text-purple-700'
                  }`}>
                    {dashboardStats.pendingProductChanges ? dashboardStats.pendingProductChanges.total : 0}
                    {dashboardStats.pendingProductChanges && dashboardStats.pendingProductChanges.total > 0 && (
                      <span className="ml-2 text-sm">produktů</span>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/analytics"
          className="group"
        >
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 cursor-pointer">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">👁️</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate group-hover:text-purple-600 transition-colors">
                    Celkové návštěvy
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                    {analytics.uniqueVisitors}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/analytics"
          className="group"
        >
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 cursor-pointer">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">👆</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate group-hover:text-purple-600 transition-colors">
                    Celkové kliky
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                    {analytics.totalClicks}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/products"
          className="group"
        >
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 cursor-pointer">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📦</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate group-hover:text-purple-600 transition-colors">
                    Produkty v DB
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                    {dashboardStats.products.total}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/companies"
          className="group"
        >
          <div className={`bg-white p-6 rounded-lg shadow-sm border transition-all duration-200 cursor-pointer ${
            dashboardStats.companyApplications && dashboardStats.companyApplications.pending > 0 
              ? 'border-amber-300 hover:border-amber-400 hover:shadow-md bg-amber-50' 
              : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">
                  {dashboardStats.companyApplications && dashboardStats.companyApplications.pending > 0 ? '🔔' : '🏢'}
                </span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className={`text-sm font-medium truncate transition-colors ${
                    dashboardStats.companyApplications && dashboardStats.companyApplications.pending > 0 
                      ? 'text-amber-700 group-hover:text-amber-800' 
                      : 'text-gray-500 group-hover:text-purple-600'
                  }`}>
                    {dashboardStats.companyApplications && dashboardStats.companyApplications.pending > 0 
                      ? 'Čekající žádosti' 
                      : 'Firemní žádosti'}
                  </dt>
                  <dd className={`text-lg font-medium transition-colors ${
                    dashboardStats.companyApplications && dashboardStats.companyApplications.pending > 0 
                      ? 'text-amber-900 group-hover:text-amber-900' 
                      : 'text-gray-900 group-hover:text-purple-700'
                  }`}>
                    {dashboardStats.companyApplications ? dashboardStats.companyApplications.pending : 0}
                    {dashboardStats.companyApplications && dashboardStats.companyApplications.pending > 0 && (
                      <span className="ml-2 text-sm">čeká na schválení</span>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Rychlé akce
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
              >
                <div>
                  <span className={`rounded-lg inline-flex p-3 text-white ${action.color}`}>
                    <span className="text-xl">{action.icon}</span>
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    <span className="absolute inset-0" />
                    {action.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {action.description}
                  </p>
                  <p className="mt-2 text-sm font-medium text-purple-600">
                    {action.stats}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Nedávná aktivita
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivity.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-gray-100">
                            <span className="text-sm">{activity.icon}</span>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-500">{activity.description}</p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time>{activity.time}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Stav systému
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg">🟢</span>
                  <span className="ml-3 text-sm font-medium text-gray-900">API produktů</span>
                </div>
                <span className="text-sm text-gray-500">Aktivní</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg">🟢</span>
                  <span className="ml-3 text-sm font-medium text-gray-900">Databáze</span>
                </div>
                <span className="text-sm text-gray-500">Připojeno</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg">🟢</span>
                  <span className="ml-3 text-sm font-medium text-gray-900">Analytics</span>
                </div>
                <span className="text-sm text-gray-500">Sbírá data</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg">🟡</span>
                  <span className="ml-3 text-sm font-medium text-gray-900">AI asistent</span>
                </div>
                <span className="text-sm text-gray-500">Částečně aktivní</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Přehled využití</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Storage</span>
                    <span className="text-gray-900">45% využito</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 