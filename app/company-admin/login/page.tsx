'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'

export default function CompanyLoginPage() {
  const { status } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // 🧹 Vyčisti všechny staré cookies při načtení stránky
  useEffect(() => {
    console.log('🔍 COMPANY LOGIN PAGE LOADED - vyčišťuji staré cookies')
    console.log('📊 Initial state:', { email, password: password ? '***' : 'empty' })
    
    document.cookie = 'company-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'advertiser-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    
    // Vyčisti localStorage
    const oldLocalAuth = localStorage.getItem('company-auth')
    const oldSessionAuth = sessionStorage.getItem('company-auth')
    
    if (oldLocalAuth) console.log('🗑️ Removing old localStorage auth')
    if (oldSessionAuth) console.log('🗑️ Removing old sessionStorage auth')
    
    localStorage.removeItem('company-auth')
    sessionStorage.removeItem('company-auth')
    
    console.log('✅ COMPANY LOGIN PAGE - cookies cleaned')
  }, [])

  // Pokud už je session aktivní, přesměruj do /company-admin
  useEffect(() => {
    if (status === 'authenticated') {
      setError('')
      router.replace('/company-admin')
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      console.log('🚀 FORM SUBMIT TRIGGERED (Company)', { 
        email, 
        password: password ? '***' : 'missing',
        emailLength: email.length,
        passwordLength: password.length 
      })
      
      if (!email || !password) {
        console.log('❌ PRÁZDNÉ POLE - zastavuji submit')
        setError('Please fill in email and password')
        setIsLoading(false)
        return
      }
      
      console.log('🔍 Company login attempt:', { email, role: 'company' })
      
      // NextAuth provede redirect sám; při chybě vrátí ?error=
      await signIn('credentials', {
        email,
        password,
        role: 'company',
        redirect: true,
        callbackUrl: '/company-admin'
      })
    } catch (error) {
      console.error('Company login error:', error)
      // Zobraz obecnou chybu jen pokud session nevznikla
              setError('An error occurred during login')
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
                  autoComplete="off"
                  required
                  value={email}
                  onChange={(e) => {
                    console.log('📧 Email changed:', e.target.value)
                    setEmail(e.target.value)
                  }}
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
                  autoComplete="off"
                  required
                  value={password}
                  onChange={(e) => {
                    console.log('🔐 Password changed:', e.target.value ? '***' : 'empty')
                    setPassword(e.target.value)
                  }}
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