'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Revert: bez rememberMe na této stránce (řeší se v modalu/komponentě pokud je potřeba)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // ✅ ADMIN LOGIN - používáme unifikovaný NextAuth s role
      console.log('🔐 Admin login attempt with role: admin')
      
      const result = await signIn('credentials', {
        email,
        password,
        role: 'admin', // NOVÝ ROLE SYSTÉM
        redirect: false,
        callbackUrl: '/admin'
      })

      // Důsledně se řiď podle result.ok (stejně jako u user loginu)
      if (result?.ok) {
        console.log('🔐 Admin signIn successful, redirecting to /admin', {
          ok: result?.ok, error: result?.error, status: result?.status
        })
        router.push('/admin')
      } else {
        console.log('❌ Admin signIn failed', { ok: result?.ok, error: result?.error, status: result?.status })
        setError('Neplatné přihlašovací údaje')
      }
    } catch (error) {
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

            {error && (
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