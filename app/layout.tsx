import React from 'react'
import type { Metadata } from 'next'
import type { Session } from 'next-auth'
import { Inter } from 'next/font/google'
import './globals.css'
import './landing-pages.css'
import { Providers } from './providers'
import ClientLayout from '../components/ClientLayout'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PUBLIC_BASE_URL } from '@/lib/env'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Comparee.ai - Compare AI Tools',
  description: 'Compare features, prices, and reviews of the most popular AI tools.',
  // Použij předepsané PUBLIC_BASE_URL bez fallbacků
  metadataBase: new URL(PUBLIC_BASE_URL),
  other: {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
}

// Disable static export for entire app to ensure server runtime (prevents export errors on dynamic routes)
export const dynamic = 'force-dynamic'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session: Session | null = null
  try {
    session = await getServerSession(authOptions)
  } catch (error) {
    console.log('⚠️ getServerSession failed, continuing as guest:', (error as Error)?.message)
    session = null
  }

  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className={inter.className}>
        <Providers session={session}>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  )
} 