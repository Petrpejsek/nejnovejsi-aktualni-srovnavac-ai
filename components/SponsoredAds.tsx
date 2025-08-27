'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface SponsoredAd {
  campaignId: string
  companyId: string
  companyName: string
  productId: string
  productName: string
  productDescription?: string
  productImage?: string
  targetUrl: string
  bidAmount: number
  position: number
  isSponsored: boolean
}

interface SponsoredAdsProps {
  pageType?: string // 'homepage', 'category', 'search'
  category?: string
  searchQuery?: string
  maxAds?: number
  className?: string
}

export default function SponsoredAds({ 
  pageType = 'homepage', 
  category, 
  searchQuery, 
  maxAds = 3,
  className = '' 
}: SponsoredAdsProps) {
  const [ads, setAds] = useState<SponsoredAd[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true)
        setError(null)

        // Sestavit query parametry
        const params = new URLSearchParams({
          pageType,
          maxAds: maxAds.toString()
        })

        if (category) params.set('category', category)
        if (searchQuery) params.set('q', searchQuery)

        const response = await fetch(`/api/ads/auction?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch ads')
        }

        const result = await response.json()
        
        if (result.success) {
          setAds(result.data.ads || [])
        } else {
          throw new Error(result.error || 'Unknown error')
        }
      } catch (err) {
        console.error('Error fetching ads:', err)
        setError(err instanceof Error ? err.message : 'Failed to load ads')
        setAds([]) // Fallback na prázdné reklamy
      } finally {
        setLoading(false)
      }
    }

    fetchAds()
  }, [pageType, category, searchQuery, maxAds])

  const handleAdClick = async (ad: SponsoredAd) => {
    try {
      // Zaznamenej klik serverově a nechej server přesměrovat
      const url = `/api/monetization/out/product/${encodeURIComponent(ad.productId)}`
      if (typeof window !== 'undefined') {
        window.location.assign(url)
      }
    } catch (error) {
      console.error('Error handling ad click:', error)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(maxAds)].map((_, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Error state - skrýt reklamy při chybě
  if (error) {
    return null
  }

  // Žádné reklamy k zobrazení
  if (ads.length === 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Nadpis sekce */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Doporučené produkty</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          Sponzorováno
        </span>
      </div>

      {/* Seznam reklam */}
      <div className="space-y-3">
        {ads.map((ad, index) => (
          <div
            key={ad.campaignId}
            className={`
              bg-gradient-to-r from-blue-50 to-indigo-50 
              border border-blue-200 rounded-lg p-4 cursor-pointer 
              hover:shadow-md transition-shadow duration-200
              ${ad.position === 1 ? 'ring-2 ring-blue-300' : ''}
            `}
            onClick={() => handleAdClick(ad)}
          >
            <div className="flex items-center space-x-4">
              {/* Product image */}
              <div className="flex-shrink-0">
                {ad.productImage ? (
                  <Image
                    src={ad.productImage}
                    alt={ad.productName}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">AI</span>
                  </div>
                )}
              </div>

              {/* Ad content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {ad.productName}
                    </h4>
                    
                    {ad.productDescription && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {ad.productDescription}
                      </p>
                    )}
                    
                    <div className="flex items-center mt-2 space-x-2">
                      <span className="text-xs text-blue-600 font-medium">
                        od {ad.companyName}
                      </span>
                      
                      {ad.position === 1 && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                          #1 Doporučeno
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sponsored badge */}
                  <div className="flex-shrink-0 ml-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      📢 Reklama
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Click indicator */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Klikněte pro více informací
              </span>
              
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="text-xs text-gray-400 mt-4 text-center">
        Reklamy jsou označeny jako "Sponzorováno" a jsou zobrazeny na základě relevance a nabídkové ceny.
      </div>
    </div>
  )
} 