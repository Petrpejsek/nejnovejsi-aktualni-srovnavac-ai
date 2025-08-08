'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get token or error from URL parameters
    const token = searchParams?.get('token') || null
    const error = searchParams?.get('error') || null

    if (token) {
      // Save token and redirect to main page
      localStorage.setItem('token', token)
      router.push('/')
    } else if (error) {
      // Redirect back to login with error message
      router.push(`/login?error=${encodeURIComponent(error)}`)
    } else {
      // Unexpected state, redirect to login
      router.push('/login?error=Something went wrong')
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-medium text-gray-700">Signing you in...</h2>
      </div>
    </div>
  )
}

export default function GoogleCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-700">Loading...</h2>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  )
} 