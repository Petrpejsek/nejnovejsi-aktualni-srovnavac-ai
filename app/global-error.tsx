'use client'

import React, { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    try {
      // eslint-disable-next-line no-console
      console.error('global-error', { message: error?.message, digest: (error as any)?.digest })
      fetch('/api/diagnostics/client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'global', message: error?.message || '', name: (error as any)?.name || '', stack: (error as any)?.stack || '', path: typeof location !== 'undefined' ? location.href : '', ua: typeof navigator !== 'undefined' ? navigator.userAgent : '' }),
        keepalive: true
      }).catch(() => {})
    } catch {}
  }, [error])

  return (
    <html>
      <body>
        <div className="p-6">
          <h1 className="text-xl font-semibold mb-2">Application error</h1>
          <p className="text-sm text-gray-600">A client error occurred. Please try again.</p>
          <button className="mt-3 px-3 py-2 border rounded" onClick={() => reset()}>Try again</button>
        </div>
      </body>
    </html>
  )
}
