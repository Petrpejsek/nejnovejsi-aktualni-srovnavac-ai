import React from 'react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Stránka nenalezena
        </h2>
        <p className="text-gray-600 mb-4">
          Omlouváme se, ale požadovaná stránka neexistuje.
        </p>
        <Link
          href="/"
          className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Zpět na hlavní stránku
        </Link>
      </div>
    </div>
  )
} 