'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Získat token nebo chybu z URL parametrů
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (token) {
      // Uložit token a přesměrovat na hlavní stránku
      localStorage.setItem('token', token)
      router.push('/')
    } else if (error) {
      // Přesměrovat zpět na přihlášení s chybovou zprávou
      router.push(`/login?error=${encodeURIComponent(error)}`)
    } else {
      // Neočekávaný stav, přesměrovat na přihlášení
      router.push('/login?error=Něco se pokazilo')
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