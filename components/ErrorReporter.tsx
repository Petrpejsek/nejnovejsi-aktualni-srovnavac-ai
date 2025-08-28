'use client'

import { useEffect } from 'react'

function safeString(value: unknown, max = 1000): string {
  try {
    const s = String(value ?? '')
    return s.length > max ? s.slice(0, max) + '…' : s
  } catch {
    return ''
  }
}

async function report(payload: Record<string, unknown>) {
  try {
    await fetch('/api/diagnostics/client-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
      cache: 'no-store'
    })
  } catch {}
}

export default function ErrorReporter() {
  useEffect(() => {
    const onError = (ev: ErrorEvent) => {
      const href = typeof location !== 'undefined' ? location.href : ''
      const path = href.replace(/([?&]token)=([^&#]+)/gi, '$1=***')
      void report({
        type: 'error',
        message: safeString(ev.error?.message || ev.message, 300),
        name: safeString((ev.error as any)?.name, 100),
        stack: safeString((ev.error as any)?.stack, 1000),
        path,
        ua: safeString(typeof navigator !== 'undefined' ? navigator.userAgent : '', 200)
      })
    }
    const onRejection = (ev: PromiseRejectionEvent) => {
      const reason: any = ev.reason
      const href = typeof location !== 'undefined' ? location.href : ''
      const path = href.replace(/([?&]token)=([^&#]+)/gi, '$1=***')
      void report({
        type: 'unhandledrejection',
        message: safeString(reason?.message || String(reason), 300),
        name: safeString(reason?.name, 100),
        stack: safeString(reason?.stack, 1000),
        path,
        ua: safeString(typeof navigator !== 'undefined' ? navigator.userAgent : '', 200)
      })
    }
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])
  return null
}
