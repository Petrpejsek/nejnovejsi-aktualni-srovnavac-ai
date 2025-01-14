'use client'

import React from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      <h2 className="text-xl font-medium text-gray-900 mb-4">Něco se pokazilo</h2>
      <button
        onClick={reset}
        className="px-4 py-2 bg-purple-600/90 text-white rounded-[14px] hover:bg-purple-700/90 transition-colors"
      >
        Zkusit znovu
      </button>
    </div>
  )
} 