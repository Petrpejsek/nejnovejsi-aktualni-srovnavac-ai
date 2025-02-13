'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import TagFilter from '../../components/TagFilter'
import CompareBar from '../../components/CompareBar'

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

export default function DoporuceniPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('query')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null)
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set())
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (response.ok) {
          const data = await response.json()
          // Převedeme stringy JSON zpět na objekty
          const processedData = data.map((product: Product) => ({
            ...product,
            tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags,
            advantages: typeof product.advantages === 'string' ? JSON.parse(product.advantages) : product.advantages,
            disadvantages: typeof product.disadvantages === 'string' ? JSON.parse(product.disadvantages) : product.disadvantages,
            pricingInfo: typeof product.pricingInfo === 'string' ? JSON.parse(product.pricingInfo) : product.pricingInfo,
            videoUrls: typeof product.videoUrls === 'string' ? JSON.parse(product.videoUrls) : product.videoUrls,
            hasTrial: typeof product.hasTrial === 'boolean' ? product.hasTrial : false
          }))
          setProducts(processedData)
        }
      } catch (error) {
        console.error('Chyba při načítání produktů:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()

    // Automatické obnovení dat každých 5 sekund
    const interval = setInterval(fetchProducts, 5000)
    return () => clearInterval(interval)
  }, [])

  const toggleItem = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  // Filtrování produktů podle vybraných tagů
  const filteredProducts = products.filter(product => {
    if (selectedTags.size === 0) return true
    const productTags = product.tags || []
    return Array.from(selectedTags).some(tag => productTags.includes(tag))
  })

  const toggleExpand = (id: string) => {
    setExpandedProductId(expandedProductId === id ? null : id)
  }

  const handleSave = (id: string) => {
    const newSaved = new Set(savedItems)
    if (newSaved.has(id)) {
      newSaved.delete(id)
    } else {
      newSaved.add(id)
    }
    setSavedItems(newSaved)
  }

  const getPersonalizedHeadline = (query: string | null) => {
    if (!query) return 'Vyberte, kde potřebujete pomoci'

    return (
      <>
        <span className="text-gradient-primary">Pomůžeme vám s </span>
        <span className="text-gray-900">"{query}"</span>
        <span className="text-gradient-primary"> pomocí AI</span>
      </>
    )
  }

  const handleCompare = () => {
    // TODO: Implementovat logiku pro srovnání
    console.log('Srovnávám produkty:', Array.from(selectedItems))
  }

  const handleClearSelection = () => {
    setSelectedItems(new Set())
  }

  const handleVisit = (url?: string) => {
    if (!url) {
      console.log('Chybí URL!')
      return
    }

    try {
      window.open(url, '_blank', 'noopener,noreferrer')
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Úvodní sekce */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold mb-4">
          {getPersonalizedHeadline(query)}
        </h1>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-4">
          {query 
            ? 'Na základě vašich potřeb jsme připravili seznam AI nástrojů, které vám pomohou růst a být efektivnější.' 
            : 'Vyberte si z našich AI řešení, která vám pomohou zefektivnit vaši práci a růst.'
          }
        </p>
        <p className="text-gray-500 text-base">
          Procházejte jednotlivé možnosti a uložte si ty, které vás zaujmou. Později si je můžete detailně porovnat.
        </p>
      </div>

      {/* TagFilter */}
      <div className="mb-8">
        <TagFilter selectedTags={selectedTags} onTagsChange={setSelectedTags} />
      </div>

      {/* Seznam produktů */}
      <div className="space-y-4 mb-12">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative"
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-full md:max-w-[240px] flex flex-col gap-3">
                <div className="w-full aspect-video relative rounded-[14px] overflow-hidden bg-gray-50">
                  <Image
                    src={product.imageUrl || 'https://placehold.co/800x450/f3f4f6/94a3b8?text=No+Image'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <label className="flex items-center justify-center md:justify-start gap-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(product.id)}
                    onChange={() => toggleItem(product.id)}
                    className="w-4 h-4 text-purple-600/90 rounded-[6px] border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    Porovnat
                  </span>
                </label>
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-medium text-gray-800">
                      {product.name}
                    </h3>
                    {product.category && (
                      <span className="text-sm text-gray-500">{product.category}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <div>
                      <p className="text-gradient-primary font-medium">
                        ${product.price}
                      </p>
                      {product.hasTrial && (
                        <span className="text-xs text-purple-600/90 bg-purple-50/80 px-2 py-1 rounded-full">
                          Free Trial
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-2">
                  {product.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-center md:justify-end gap-3 flex-wrap">                  
                  <button 
                    onClick={() => toggleExpand(product.id)}
                    className="w-full md:w-auto px-4 py-2 text-sm font-medium rounded-[14px] bg-gradient-primary text-white hover-gradient-primary transition-all flex items-center justify-center gap-2"
                  >
                    <span>{expandedProductId === product.id ? 'Méně informací' : 'Více informací'}</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      className={`w-4 h-4 transition-transform ${expandedProductId === product.id ? 'rotate-180' : ''}`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleSave(product.id)}
                    className={`w-full md:w-auto px-4 py-2 text-sm font-medium rounded-[14px] border transition-all duration-300 ${
                      savedItems.has(product.id)
                        ? 'border-green-500 text-green-600 bg-green-50 hover:bg-green-100'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {savedItems.has(product.id) ? 'Uloženo ✓' : 'Uložit'}
                  </button>
                </div>

                {/* Rozbalovací sekce */}
                {expandedProductId === product.id && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      {product.advantages && product.advantages.length > 0 && (
                        <div>
                          <h4 className="text-lg font-medium text-gray-800 mb-3">Výhody</h4>
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
                        <div>
                          <h4 className="text-lg font-medium text-gray-800 mb-3">Nevýhody</h4>
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
                      <div className="mb-6">
                        <h4 className="text-lg font-medium text-gray-800 mb-3">Detailní popis</h4>
                        <div className="bg-gray-50/80 rounded-[14px] p-4">
                          <p className="text-gray-600 whitespace-pre-line">{product.detailInfo}</p>
                        </div>
                      </div>
                    )}

                    {/* Cenové informace */}
                    <div className="mb-6">
                      <h4 className="text-lg font-medium text-gray-800 mb-3">Cenové podmínky</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {product.pricingInfo?.basic && (
                          <div className="bg-gray-50/80 p-4 rounded-[14px]">
                            <h5 className="font-medium text-gray-800 mb-2">Basic</h5>
                            <p className="text-2xl font-bold text-gradient-primary">${product.pricingInfo.basic}</p>
                          </div>
                        )}
                        {product.pricingInfo?.pro && (
                          <div className="bg-purple-50/80 p-4 rounded-[14px] border-2 border-purple-100">
                            <h5 className="font-medium text-gray-800 mb-2">Pro</h5>
                            <p className="text-2xl font-bold text-gradient-primary">${product.pricingInfo.pro}</p>
                          </div>
                        )}
                        {product.pricingInfo?.enterprise && (
                          <div className="bg-gray-50/80 p-4 rounded-[14px]">
                            <h5 className="font-medium text-gray-800 mb-2">Enterprise</h5>
                            <p className="text-2xl font-bold text-gradient-primary">${product.pricingInfo.enterprise}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleVisit(product.externalUrl)}
                      className="w-full px-6 py-3 text-base font-medium rounded-[14px] bg-gradient-primary text-white hover-gradient-primary transition-all"
                    >
                      Vyzkoušet
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CompareBar */}
      <CompareBar 
        selectedCount={selectedItems.size}
        onCompare={handleCompare}
        onClear={handleClearSelection}
      />
    </div>
  )
} 