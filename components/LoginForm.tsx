import React, { useEffect, useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
}

export default function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const { status } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)

  const router = useRouter()

  // Pokud už existuje session, zavři modal a případné chyby skryj
  useEffect(() => {
    if (status === 'authenticated') {
      setError(null)
      onSuccess?.()
    }
  }, [status, onSuccess])

  // Čti NextAuth ?error z query (např. CredentialsSignin)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('error')) {
        setError('Neplatné přihlašovací údaje')
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // 🔍 Detekce kontextu: pokud jsme v /admin, přihlašujeme jako admin; jinak user
      const isAdminContext = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')
      const role = isAdminContext ? 'admin' : 'user'
      console.log(`🔍 LoginForm: Detected role '${role}' for email: ${email}`)

      // Nech NextAuth provést redirect; při chybě přidá ?error do URL
      await signIn('credentials', {
        email,
        password,
        role,
        rememberMe,
        redirect: true,
        callbackUrl: role === 'admin' ? '/admin' : '/user-area'
      })
    } catch (error) {
      console.error('Login error:', error)
      setError('Chyba při přihlašování')
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: window.location.origin
      })
      
      if (result?.ok) {
        onSuccess?.()
        window.location.reload()
      } else if (result?.error) {
        console.error('Google sign in error:', result.error)
        alert('Google sign in failed. Please try again.')
      }
    } catch (error) {
      console.error('Google sign in error:', error)
      alert('Google sign in failed. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Google login */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-[14px] text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500">or</span>
        </div>
      </div>

      {/* Email login */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-[14px] border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 outline-none transition-all"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 pr-12 rounded-[14px] border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 outline-none transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center group cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
              Stay logged in
            </span>
            <div className="ml-1 group relative">
              <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-sm z-10 whitespace-nowrap">
                Extends login session to 30 days instead of 7 days
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            </div>
          </label>

          <button
            type="button"
            onClick={() => {}} // TODO: Implement password reset
            className="text-sm text-gradient-primary hover:opacity-80 transition-opacity"
          >
            Forgot password?
          </button>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full px-4 py-2 text-sm font-medium rounded-[14px] bg-gradient-primary text-white hover-gradient-primary transition-all"
        >
          Log In
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Don't have an account? <span className="text-gradient-primary">Sign Up</span>
          </button>
        </div>
      </form>
    </div>
  )
} 