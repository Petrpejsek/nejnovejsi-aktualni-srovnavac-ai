'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const router = useRouter()

  // Pokud není admin session, okamžitě redirect
  useEffect(() => {
    if (status === 'loading') return // Čeká na načtení session
    
    if (status === 'unauthenticated' || !session?.user) {
      console.log('❌ No session in admin layout, redirecting to login')
      router.push('/auth/login?reason=no_session')
      return
    }
    
    const isAdmin = (session.user as any)?.isAdmin
    if (!isAdmin || session.user.email !== 'admin@admin.com') {
      console.log('❌ Non-admin user in admin layout:', { 
        email: session.user.email, 
        isAdmin: isAdmin 
      })
      router.push('/auth/login?reason=not_admin')
      return
    }
    
    console.log('✅ Admin session confirmed in layout:', session.user.email)
  }, [session, status, router])

  const handleLogout = async () => {
    console.log('🚪 Admin logout initiated')
    await signOut({ 
      redirect: true,
      callbackUrl: '/auth/login'
    })
  }

  // Pokud session loading, zobraz loading
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ověřuji admin přístup...</p>
        </div>
      </div>
    )
  }

  // Pokud není admin, nic nezobrazuj (middleware už přesměruje)
  const isAdmin = (session?.user as any)?.isAdmin
  if (!isAdmin || session?.user?.email !== 'admin@admin.com') {
    return null
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: '🏠',
      current: pathname === '/admin'
    },
    {
      name: 'Produkty',
      href: '/admin/products',
      icon: '📦',
      current: pathname.startsWith('/admin/products')
    },
    // URL Upload pouze ve development nebo když je explicitně povoleno
    ...(process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_ADMIN_UPLOAD === 'true' ? [{
      name: 'URL Upload',
      href: '/admin/url-upload',
      icon: '🚀',
      current: pathname.startsWith('/admin/url-upload')
    }] : []),
    {
      name: 'AI Kurzy',
      href: '/admin/courses',
      icon: '🎓',
      current: pathname.startsWith('/admin/courses')
    },
    {
      name: 'Top Listy',
      href: '/admin/top-lists',
      icon: '📋',
      current: pathname.startsWith('/admin/top-lists')
    },
    {
      name: 'Reels',
      href: '/admin/reels',
      icon: '🎬',
      current: pathname.startsWith('/admin/reels')
    },
    {
      name: 'Firmy',
      href: '/admin/companies',
      icon: '🏢',
      current: pathname.startsWith('/admin/companies')
    },
    {
      name: 'Promocní balíčky',
      href: '/admin/promotional-packages',
      icon: '🎁',
      current: pathname.startsWith('/admin/promotional-packages')
    },
    {
      name: 'Firemní statistiky',
      href: '/admin/company-statistics',
      icon: '📈',
      current: pathname.startsWith('/admin/company-statistics')
    },
    {
      name: 'Stránky',
      href: '/admin/pages',
      icon: '📄',
      current: pathname.startsWith('/admin/pages')
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: '📊',
      current: pathname.startsWith('/admin/analytics')
    },
    {
      name: 'Uživatelé',
      href: '/admin/users',
      icon: '👥',
      current: pathname.startsWith('/admin/users')
    },
    {
      name: 'Nastavení',
      href: '/admin/settings',
      icon: '⚙️',
      current: pathname.startsWith('/admin/settings')
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-white text-xl">×</span>
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <Link href="/admin" className="flex items-center">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Admin Panel</span>
              </Link>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-base font-medium rounded-md
                    ${item.current
                      ? 'bg-purple-100 text-purple-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="mr-4 flex-shrink-0 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Link href="/admin" className="flex items-center">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Admin Panel</span>
              </Link>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${item.current
                      ? 'bg-purple-100 text-purple-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <span className="mr-3 flex-shrink-0 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* User info at bottom */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-medium text-sm">
                    ✅
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {session?.user?.name || 'Admin'}
                  </p>
                  <p className="text-xs font-medium text-green-600">
                    ✅ Přihlášený ADMIN ({session?.user?.email})
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                title="Odhlásit se"
              >
                🚪 Odhlásit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="text-xl">☰</span>
          </button>
        </div>
        
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 