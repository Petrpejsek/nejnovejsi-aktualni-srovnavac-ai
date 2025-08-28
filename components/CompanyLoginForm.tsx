'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { signIn, useSession } from 'next-auth/react'

interface CompanyLoginFormProps {
  onSuccess: () => void
  onSwitchToRegister: () => void
}

export default function CompanyLoginForm({ onSuccess, onSwitchToRegister }: CompanyLoginFormProps) {
  const { status } = useSession()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [forgotPasswordDone, setForgotPasswordDone] = useState(false)
  const [forgotPasswordEmailExists, setForgotPasswordEmailExists] = useState(false)

  // Reset state when component mounts (when key changes)
  useEffect(() => {
    setFormData({
      email: '',
      password: '',
      rememberMe: false,
    })
    setShowPassword(false)
    setIsLoading(false)
    setErrors({})
    setIsForgotPassword(false)
    setForgotPasswordDone(false)
    setForgotPasswordEmailExists(false)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // NextAuth provede redirect sám; při chybě přidá ?error do URL
      await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        role: 'company',
        redirect: true,
        callbackUrl: '/company-admin'
      })
    } catch (error) {
      console.error('Login failed:', error)
      setErrors({ general: 'Došlo k chybě při přihlašování' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    try {
      const response = await fetch('/api/auth/password/reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })
      
      if (response.ok) {
        const data = await response.json()
        setForgotPasswordDone(true)
        setForgotPasswordEmailExists(data.exists)
      } else {
        setErrors({ general: 'Chyba při odesílání emailu' })
      }
    } catch (e: any) {
      setErrors({ general: 'Chyba při odesílání emailu' })
    }
  }

  // Auto-close on existing session a zobraz ?error z URL od NextAuth
  useEffect(() => {
    if (status === 'authenticated') {
      setErrors({})
      onSuccess()
    }
  }, [status, onSuccess])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('error')) {
        setErrors({ general: 'Invalid email or password. Please try again.' })
      }
    }
  }, [])

  // Forgot password view
  if (isForgotPassword) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Forgot Password</h2>
          <button
            onClick={() => {
              setIsForgotPassword(false)
              setForgotPasswordDone(false)
              setErrors({})
              setForgotPasswordEmailExists(false)
            }}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Back
          </button>
        </div>

        {forgotPasswordDone ? (
          forgotPasswordEmailExists ? (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              <p className="text-sm">
                Email <strong>{formData.email}</strong> existuje v databázi. Poslali jsme instrukce na reset hesla.
              </p>
              <p className="text-xs mt-2 text-green-600">
                Zkontrolujte email a spam složku.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <p className="text-sm">
                Email <strong>{formData.email}</strong> neexistuje v databázi.
              </p>
            </div>
          )
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            <div>
              <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
                Business Email
              </label>
              <input
                type="email"
                id="forgot-email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all font-medium"
            >
              Send Reset Link
            </button>
          </form>
        )}
      </div>
    )
  }

  // Normal login view
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Log In</h2>
        <p className="text-gray-600 text-sm">
          Access your company dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {errors.general}
          </div>
        )}

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Business Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="your@company.com"
            onFocus={(e) => { e.currentTarget.placeholder = '' }}
            onBlur={(e) => { if (!e.currentTarget.value) e.currentTarget.placeholder = 'your@company.com' }}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
              onFocus={(e) => { e.currentTarget.placeholder = '' }}
              onBlur={(e) => { if (!e.currentTarget.value) e.currentTarget.placeholder = 'Enter your password' }}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between">
          <label className="flex items-center group cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
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

          {/* Forgot Password */}
          <button
            type="button"
            onClick={() => setIsForgotPassword(true)}
            className="text-sm text-purple-600 hover:text-purple-700"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? 'Logging In...' : 'Log In'}
        </button>

        {/* Switch to Register */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Join as AI Company
            </button>
          </p>
        </div>

        {/* Note about approval */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          <p className="text-blue-700 text-xs text-center">
            <strong>Note:</strong> Company accounts require approval before activation. 
            You'll receive an email once your account is approved.
          </p>
        </div>
      </form>
    </div>
  )
} 