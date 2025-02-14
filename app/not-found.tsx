import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Stránka nenalezena</h2>
        <p className="text-gray-600 mb-4">Omlouváme se, ale požadovaná stránka neexistuje.</p>
        <Link
          href="/"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-block"
        >
          Zpět na hlavní stránku
        </Link>
      </div>
    </div>
  )
} 