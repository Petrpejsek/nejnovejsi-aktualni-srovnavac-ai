'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Zde můžete přidat logování chyby do služby pro sledování chyb
    console.error('Chyba:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Něco se pokazilo!</h2>
        <p className="text-gray-600 mb-4">Omlouváme se, ale vyskytla se chyba při načítání stránky.</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Zkusit znovu
        </button>
      </div>
    </div>
  )
} 