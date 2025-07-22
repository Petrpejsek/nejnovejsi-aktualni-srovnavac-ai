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
  const isCompanyAdmin = pathname?.startsWith('/company-admin')
  const isAdmin = pathname?.startsWith('/admin')
  const isAdvertisePage = pathname === '/advertise'

  // Pokud jsme v admin sekci, nezobrazujeme Header ani Footer
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-white">
        {children}
      </div>
    )
  }

  // Na advertise stránce nezobrazujeme Header (pouze pro firmy)
  if (isAdvertisePage) {
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