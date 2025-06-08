'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  BuildingOfficeIcon,
  CubeIcon,
  CreditCardIcon,
  WalletIcon,
  MegaphoneIcon,
  FilmIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  TrophyIcon,
  UsersIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronUpIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/company-admin', icon: HomeIcon },
  { name: 'Company Profile', href: '/company-admin/profile', icon: BuildingOfficeIcon },
  { name: 'Products', href: '/company-admin/products', icon: CubeIcon },
  { name: 'Billing', href: '/company-admin/billing', icon: CreditCardIcon },
  { name: 'Affiliate', href: '/company-admin/affiliate', icon: WalletIcon },
  { name: 'Promotions', href: '/company-admin/promotions', icon: MegaphoneIcon },
  { name: 'Reels', href: '/company-admin/reels', icon: FilmIcon },
  { name: 'Courses', href: '/company-admin/courses', icon: AcademicCapIcon },
  { name: 'Email Campaigns', href: '/company-admin/email', icon: EnvelopeIcon },
  { name: 'Top Lists', href: '/company-admin/toplists', icon: TrophyIcon },
  { name: 'Team', href: '/company-admin/team', icon: UsersIcon },
  { name: 'Settings', href: '/company-admin/settings', icon: CogIcon },
]

export default function CompanyAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [companyData, setCompanyData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  // Fetch real company data from API
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch('/api/advertiser/billing')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setCompanyData({
              name: data.data.company.name,
              balance: data.data.company.balance,
              logoUrl: "/api/placeholder/company-logo"
            })
          }
        }
      } catch (error) {
        console.error('Error fetching company data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyData()
  }, [])

  // Mock user data - later from auth
  const userData = {
    name: "Company Admin",
    email: "admin@company.com",
    role: "Admin",
    avatar: null // will use initials
  }

  const handleSignOut = () => {
    console.log('Sign out clicked')
    // Add sign out logic here
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setSidebarOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            {/* Mobile sidebar content */}
            <div className="flex-1 pt-4 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4 mb-6">
                <WalletIcon className="h-6 w-6 text-purple-600 mr-2" />
                <div>
                  {loading ? (
                    <>
                      <div className="h-4 bg-gray-300 rounded w-24 mb-1 animate-pulse"></div>
                      <div className="h-3 bg-gray-300 rounded w-16 animate-pulse"></div>
                    </>
                  ) : companyData ? (
                    <>
                      <div className="text-sm font-semibold text-gray-900">{companyData.name}</div>
                      <div className="text-xs text-gray-500">${companyData.balance.toFixed(2)} available</div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-semibold text-gray-900">Loading...</div>
                      <div className="text-xs text-gray-500">$0.00 available</div>
                    </>
                  )}
                </div>
              </div>
              <nav className="space-y-1 px-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-purple-100 text-purple-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar - optimized for single screen */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-60 bg-white border-r border-gray-200 pt-12">
          {/* Company info - compact */}
          <div className="flex-shrink-0 flex items-center px-3 py-2">
            <WalletIcon className="h-5 w-5 text-purple-600 mr-2" />
            <div className="min-w-0 flex-1">
              {loading ? (
                <>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-1 animate-pulse"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2 animate-pulse"></div>
                </>
              ) : companyData ? (
                <>
                  <div className="text-sm font-semibold text-gray-900 truncate">{companyData.name}</div>
                  <div className="text-xs text-gray-500">${companyData.balance.toFixed(2)} available</div>
                </>
              ) : (
                <>
                  <div className="text-sm font-semibold text-gray-900 truncate">Loading...</div>
                  <div className="text-xs text-gray-500">$0.00 available</div>
                </>
              )}
            </div>
          </div>

          {/* Navigation - compact spacing */}
          <nav className="mt-2 flex-1 px-2 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-purple-100 text-purple-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User menu at bottom - compact */}
          <div className="flex-shrink-0 border-t border-gray-200 p-2">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="group w-full flex items-center p-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2">
                  {userData.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-xs font-medium text-gray-900 truncate">{userData.name}</div>
                  <div className="text-xs text-gray-500">{userData.role}</div>
                </div>
                <ChevronUpIcon className={`w-3 h-3 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {userMenuOpen && (
                <div className="absolute bottom-full mb-1 left-0 right-0 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                  <Link
                    href="/company-admin/settings"
                    className="flex items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
                  >
                    <CogIcon className="w-3 h-3 mr-2" />
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
                  >
                    <ArrowRightOnRectangleIcon className="w-3 h-3 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content area - optimized height */}
      <div className="flex-1 min-w-0 pt-12">
        {/* Mobile menu button - only visible on mobile */}
        <div className="lg:hidden fixed top-14 left-4 z-30">
          <button
            type="button"
            className="p-1.5 rounded-md bg-white shadow-md border border-gray-200 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-4 w-4" />
          </button>
        </div>

        {/* Main content - compact padding for single screen view */}
        <main className="flex-1 px-4 py-3 lg:px-6 lg:py-4 h-[calc(100vh-3rem)]">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function getPageTitle(pathname: string): string {
  const routes = {
    '/company-admin': 'Dashboard',
    '/company-admin/profile': 'Company Profile',
    '/company-admin/products': 'Products',
    '/company-admin/billing': 'Credits & Billing',
    '/company-admin/promotions': 'Promotions',
    '/company-admin/reels': 'Reels',
    '/company-admin/courses': 'Courses',
    '/company-admin/email': 'Email Campaigns',
    '/company-admin/toplists': 'Top Lists',
    '/company-admin/team': 'Team',
    '/company-admin/settings': 'Settings',
  }
  return routes[pathname as keyof typeof routes] || 'Admin Panel'
} 