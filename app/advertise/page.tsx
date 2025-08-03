'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdvertisePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to new /company URL for consistency
    router.replace('/company')
  }, [router])

  // Show loading message while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to company portal...</p>
      </div>
    </div>
  )
}