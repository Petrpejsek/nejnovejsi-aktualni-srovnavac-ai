'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  CubeIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  StarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ListBulletIcon,
  PlusIcon,
  BellIcon
} from '@heroicons/react/24/outline'

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
      icon: CubeIcon,
      color: 'bg-blue-500',
      stats: `${dashboardStats.products.total} produktů`
    },
    {
      title: 'AI Kurzy',
      description: 'Vytvárej a spravuj online kurzy',
      href: '/admin/courses',
      icon: AcademicCapIcon,
      color: 'bg-purple-500',
      stats: `${dashboardStats.courses.total} kurzů`
    },
    {
      title: 'Top Listy',
      description: 'Správa kategorických seznamů',
      href: '/admin/top-lists',
      icon: ListBulletIcon,
      color: 'bg-green-500',
      stats: '12 kategorií'
    },
    {
      title: 'Firmy',
      description: 'Spravuj registrované firmy a jejich profily',
      href: '/admin/companies',
      icon: BuildingOfficeIcon,
      color: 'bg-orange-500',
      stats: `${dashboardStats.companies.total} firem`
    },
    {
      title: 'Stránky',
      description: 'Editor statických stránek a SEO',
      href: '/admin/pages',
      icon: DocumentTextIcon,
      color: 'bg-indigo-500',
      stats: `${dashboardStats.pages.total} stránek`
    },
    {
      title: 'Uživatelé',
      description: 'Správa uživatelských účtů a oprávnění',
      href: '/admin/users',
      icon: UserGroupIcon,
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
      icon: CubeIcon,
      iconColor: 'text-blue-500'
    },
    {
      id: 2,
      type: 'analytics',
      title: 'Analytické údaje aktualizovány',
      description: `${dashboardStats.analytics.totalClicks} kliků, ${dashboardStats.analytics.uniqueVisitors} návštěvníků`,
      time: 'Právě teď',
      icon: ChartBarIcon,
      iconColor: 'text-green-500'
    },
    {
      id: 3,
      type: 'company',
      title: 'Firemní účty',
      description: `${dashboardStats.companies.total} registrovaných firem`,
      time: 'Aktuální stav',
      icon: BuildingOfficeIcon,
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
              <EyeIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Celkové kliky</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics.totalClicks.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CursorArrowRaysIcon className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Unikátní návštěvníci</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics.uniqueVisitors.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CubeIcon className="h-6 w-6 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Produkty v databázi</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardStats.products.total}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AcademicCapIcon className="h-6 w-6 text-indigo-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Zapsaní studenti</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardStats.courses.enrolled.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Rychlé akce</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center mb-4">
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500">{action.stats}</p>
                </div>
              </div>
              <p className="text-gray-600">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Nedávná aktivita</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Status & Pending Tasks */}
        <div className="space-y-6">
          {/* System Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Stav systému</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-700">API server běží</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-700">Databáze připojena</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-700">CDN aktivní</span>
              </div>
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Čekající úkoly</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Produkty ke schválení</span>
                <span className="text-sm font-medium text-orange-600">{dashboardStats.products.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Firmy k ověření</span>
                <span className="text-sm font-medium text-orange-600">{dashboardStats.companies.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Koncepty kurzů</span>
                <span className="text-sm font-medium text-blue-600">{dashboardStats.courses.draft}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Nepublikované stránky</span>
                <span className="text-sm font-medium text-blue-600">{dashboardStats.pages.draft}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 