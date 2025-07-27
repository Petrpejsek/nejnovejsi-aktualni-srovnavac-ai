'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function UserAreaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push('/user-area/login')
      return
    }

    // Kontrola, že to není admin session
    if ((session.user as any)?.isAdmin || (session.user as any)?.loginType !== 'user') {
      console.log('❌ Admin session detected in user area, redirecting to admin login')
      signOut({ redirect: false }).then(() => {
        router.push('/user-area/login')
      })
    }
  }, [session, status, router])

  const handleLogout = async () => {
    await signOut({ 
      redirect: true,
      callbackUrl: '/user-area/login'
    })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || (session.user as any)?.isAdmin) {
    return null // Redirect will handle this
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">User Dashboard</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Přihlášen jako: <span className="font-medium">{session.user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Odhlásit se
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Vítejte v uživatelské oblasti!
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Toto je chráněná oblast pro registrované uživatele.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Session Info:</h3>
                <div className="text-sm text-blue-700">
                  <p><strong>Email:</strong> {session.user?.email}</p>
                  <p><strong>Jméno:</strong> {session.user?.name || 'Není nastaveno'}</p>
                  <p><strong>User Type:</strong> {(session.user as any)?.userType}</p>
                  <p><strong>Login Type:</strong> {(session.user as any)?.loginType}</p>
                  <p><strong>Is Admin:</strong> {(session.user as any)?.isAdmin ? 'Ano' : 'Ne'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600">
                  Admin účet (admin@admin.com) <strong>NEMŮŽE</strong> přistupovat do této oblasti.
                </p>
                <p className="text-gray-600">
                  Pro admin přístup použijte:{' '}
                  <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 font-medium">
                    Admin přihlášení
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 