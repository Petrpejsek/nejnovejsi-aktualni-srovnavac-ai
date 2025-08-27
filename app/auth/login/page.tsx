'use client'

import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const { status } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Revert: bez rememberMe na této stránce (řeší se v modalu/komponentě pokud je potřeba)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Pokud je uživatel již přihlášen (např. cookie nastavena), automaticky přesměruj
  if (typeof window !== 'undefined' && status === 'authenticated') {
    router.replace('/admin')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // ✅ ADMIN LOGIN – NextAuth Credentials bez přesměrování, zpracujeme výsledek sami
      console.log('🔐 Admin login attempt with role: admin')

      const result = await signIn('credentials', {
        email,
        password,
        role: 'admin',
        redirect: false,
        callbackUrl: '/admin'
      })

      // Pokud NextAuth vrátil chybu, zobraz ji jako neplatné údaje (nevyhazuj výjimku)
      if (result?.error) {
        console.log('❌ Admin signIn error:', result.error)
        setError('Neplatné přihlašovací údaje')
        return
      }

      // Úspěch – NextAuth vrací url (a obvykle ok=true). Preferuj URL z response.
      if (result?.ok || result?.url) {
        const target = result?.url || '/admin'
        console.log('✅ Admin signed in, redirecting to', target)
        router.replace(target)
        return
      }

      // Ochranná větev – pokud není url/ok, ale k přihlášení došlo, přejdi na /admin
      console.log('ℹ️ Admin signIn ambiguous result, redirecting to /admin')
      router.replace('/admin')
    } catch (error) {
      console.log('❌ Admin signIn threw:', (error as Error)?.message)
      setError('Chyba při přihlašování')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-12 w-auto flex justify-center">
          <div className="text-2xl font-bold text-indigo-600">Admin Panel</div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Přihlášení administrátora
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Pouze pro administrátory systému
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Heslo
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Remember me odebrán */}

            {error && status !== 'authenticated' && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Přihlašuji...' : 'Přihlásit se'}
              </button>
            </div>
          </form>



          <div className="mt-6 text-center">
            <Link href="/" className="text-indigo-600 hover:text-indigo-500">
              ← Zpět na hlavní stránku
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 