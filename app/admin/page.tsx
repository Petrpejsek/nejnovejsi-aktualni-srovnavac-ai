'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

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
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalClicks: 0,
    uniqueVisitors: 0
  })
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch skutečných dat z API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin-stats')
        if (response.ok) {
          const data = await response.json()
          setDashboardStats(data)
          setAnalytics({
            totalClicks: data.analytics.totalClicks,
            uniqueVisitors: data.analytics.uniqueVisitors
          })
        } else {
          console.error('Chyba při načítání statistik')
        }
      } catch (error) {
        console.error('Chyba při načítání statistik:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
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
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Přehled a správa celého webu AI nástroje
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">👁️</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Celkové návštěvy
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {analytics.uniqueVisitors}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">👆</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Celkové kliky
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {analytics.totalClicks}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">📦</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Produkty v DB
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {dashboardStats.products.total}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Celkové hodnocení
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  4.8
                </dd>
              </dl>
            </div>
          </div>
        </div>
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