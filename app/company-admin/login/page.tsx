'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function CompanyLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      console.log('🚀 LOGIN CLICKED (Company)', { email, password: password ? '***' : 'missing' })
      console.log('🔍 Company login attempt:', { email, loginType: 'company' })
      
      const result = await signIn('credentials', {
        email,
        password,
        loginType: 'company', // KRITICKÉ: označuje company login
        redirect: false,
        callbackUrl: '/company-admin', // EXPLICIT callback
      })

      console.log('🔍 SignIn result (Company):', { ok: result?.ok, error: result?.error, status: result?.status })

      if (result?.error) {
        console.log('❌ Company login failed:', result?.error)
        setError('Neplatné přihlašovací údaje')
      } else {
        // Redirect immediately after successful signIn - don't check session
        console.log('✅ Company signIn successful, redirecting to company-admin...')
        router.push('/company-admin')
      }
    } catch (error) {
      console.error('Company login error:', error)
      setError('Došlo k chybě při přihlašování')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-12 w-auto flex justify-center">
          <div className="text-2xl font-bold text-purple-600">Company Portal</div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Company Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          For registered companies and advertisers
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Company Email
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Test Credentials</span>
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-600 bg-purple-50 p-4 rounded-md">
              <p><strong>Test Company:</strong></p>
              <p>Email: firma@firma.cz</p>
              <p>Password: firma123</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a href="/" className="text-purple-600 hover:text-purple-500">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 