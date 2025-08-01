'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isCompanyAdmin = pathname?.startsWith('/company/')
  const isAdmin = pathname?.startsWith('/admin')
  const isCompanyPage = pathname === '/company' || pathname?.startsWith('/company/')

  // Pokud jsme v admin sekci, nezobrazujeme Header ani Footer
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-white">
        {children}
      </div>
    )
  }

  // Na company stránce nezobrazujeme Header (pouze pro firmy)
  if (isCompanyPage) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <main className="flex-grow bg-white">
          {children}
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow bg-white">
        {children}
      </main>
      {!isCompanyAdmin && <Footer />}
    </div>
  )
} 