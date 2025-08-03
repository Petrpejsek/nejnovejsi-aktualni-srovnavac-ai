'use client'

import { useSession } from 'next-auth/react'

export default function DebugSessionPage() {
  const { data: session, status } = useSession()

  console.log('🔍 DEBUG SESSION PAGE:', { status, session })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Session Debug Page</h1>
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold">Status:</h2>
        <p>{status}</p>
      </div>

      <div className="bg-gray-100 p-4 rounded mt-4">
        <h2 className="font-bold">Session:</h2>
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>

      <div className="bg-gray-100 p-4 rounded mt-4">
        <h2 className="font-bold">Role Info:</h2>
        <p>Role: {(session?.user as any)?.role || 'null'}</p>
        <p>IsAdmin: {String((session?.user as any)?.isAdmin || false)}</p>
      </div>
    </div>
  )
}