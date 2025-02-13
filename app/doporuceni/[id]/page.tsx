'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  tags?: string[]
  advantages?: string[]
  disadvantages?: string[]
  reviews?: Array<{
    author: string
    rating: number
    text: string
  }>
  detailInfo?: string
  pricingInfo?: {
    basic?: string
    pro?: string
    enterprise?: string
  }
  videoUrls?: string[]
  externalUrl?: string
  hasTrial?: boolean
}

export default function ProductDetail({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          // Převedeme stringy JSON zpět na objekty
          setProduct({
            ...data,
            tags: typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags,
            advantages: typeof data.advantages === 'string' ? JSON.parse(data.advantages) : data.advantages,
            disadvantages: typeof data.disadvantages === 'string' ? JSON.parse(data.disadvantages) : data.disadvantages,
            pricingInfo: typeof data.pricingInfo === 'string' ? JSON.parse(data.pricingInfo) : data.pricingInfo,
            hasTrial: typeof data.hasTrial === 'boolean' ? data.hasTrial : false
          })
        }
      } catch (error) {
        console.error('Chyba při načítání produktu:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  const handleSave = (id: string) => {
    const newSaved = new Set(savedItems)
    if (newSaved.has(id)) {
      newSaved.delete(id)
    } else {
      newSaved.add(id)
    }
    setSavedItems(newSaved)
  }

  const handleVisit = () => {
    if (!product?.externalUrl) {
      console.log('Chybí URL!')
      return
    }

    try {
      window.open(product.externalUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Chyba při otevírání URL:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Produkt nebyl nalezen</h1>
          <Link href="/" className="text-purple-600 hover:text-purple-700">
            Zpět na hlavní stránku
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8">
        <Link 
          href="/doporuceni" 
          className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6 group"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Zpět na přehled
        </Link>

        <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm relative">
          {/* Hlavní informace */}
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Levá část - obrázek */}
            <div className="lg:w-[400px] flex-shrink-0">
              <div className="relative w-full aspect-video rounded-[14px] overflow-hidden bg-gray-50 mb-6">
                <Image
                  src={product.imageUrl || 'https://placehold.co/800x450/f3f4f6/94a3b8?text=No+Image'}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 text-sm text-purple-600/90 bg-purple-50/80 rounded-[14px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="p-4 rounded-[14px] bg-gray-50/80">
                <div className="text-2xl font-medium text-gradient-primary mb-4">${product.price}</div>
                
                {product.pricingInfo && (
                  <div className="space-y-3">
                    {product.pricingInfo.basic && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Basic</span>
                        <span className="font-medium text-gradient-primary">${product.pricingInfo.basic}</span>
                      </div>
                    )}
                    {product.pricingInfo.pro && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Pro</span>
                        <span className="font-medium text-gradient-primary">${product.pricingInfo.pro}</span>
                      </div>
                    )}
                    {product.pricingInfo.enterprise && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Enterprise</span>
                        <span className="font-medium text-gradient-primary">${product.pricingInfo.enterprise}</span>
                      </div>
                    )}
                  </div>
                )}

                <button 
                  onClick={handleVisit}
                  className="w-full mt-6 px-4 py-2.5 text-sm font-medium rounded-[14px] bg-gradient-primary text-white hover-gradient-primary transition-all"
                >
                  Vyzkoušet
                </button>
              </div>
            </div>

            {/* Pravá část - obsah */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-medium text-gray-800 mb-3">{product.name}</h1>
              <p className="text-gray-600 mb-8">{product.description}</p>

              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {product.advantages && product.advantages.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-lg font-medium text-gray-800">Výhody</h2>
                      <ul className="space-y-2">
                        {product.advantages.map((advantage, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-600">{advantage}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {product.disadvantages && product.disadvantages.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-lg font-medium text-gray-800">Nevýhody</h2>
                      <ul className="space-y-2">
                        {product.disadvantages.map((disadvantage, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="text-gray-600">{disadvantage}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {product.detailInfo && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-800 mb-3">Detailní popis</h2>
                    <div className="bg-gray-50/80 rounded-[14px] p-4">
                      <p className="text-gray-600 whitespace-pre-line">{product.detailInfo}</p>
                    </div>
                  </div>
                )}

                {/* Tlačítko Vyzkoušet */}
                <div className="mt-8">
                  <button
                    onClick={handleVisit}
                    className="w-full px-6 py-3 text-base font-medium rounded-[14px] bg-gradient-primary text-white hover-gradient-primary transition-all"
                  >
                    Vyzkoušet
                  </button>
                </div>

                {/* Video sekce */}
                {product.videoUrls && product.videoUrls.length > 0 && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Video ukázky</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {product.videoUrls.map((videoUrl, index) => (
                        <div key={index} className="rounded-[14px] overflow-hidden bg-gray-50">
                          <video
                            src={videoUrl}
                            controls
                            className="w-full aspect-video"
                            poster="/video-thumbnail.jpg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tlačítko Uložit */}
          <div className="absolute bottom-6 right-6">
            <button 
              onClick={() => product && handleSave(product.id)}
              className={`px-4 py-2 text-sm font-medium rounded-[14px] border transition-all duration-300 ${
                savedItems.has(product?.id || '')
                  ? 'border-green-500 text-green-600 bg-green-50 hover:bg-green-100'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {savedItems.has(product?.id || '') ? 'Uloženo ✓' : 'Uložit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 