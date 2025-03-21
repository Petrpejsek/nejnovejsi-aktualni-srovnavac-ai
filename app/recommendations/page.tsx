'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import TagFilter from '@/components/TagFilter'

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
  matchScore?: number
  matchReason?: string
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

export default function RecommendationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('query')
  const [searchInput, setSearchInput] = useState(query || '')
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        let url = '/api/products'
        
        if (query) {
          const response = await fetch('/api/recommend', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
          })
          
          if (!response.ok) throw new Error('Failed to get recommendations')
          const data = await response.json()
          setProducts(data.map((product: Product) => ({
            ...product,
            tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags || [],
            advantages: typeof product.advantages === 'string' ? JSON.parse(product.advantages) : product.advantages || [],
            disadvantages: typeof product.disadvantages === 'string' ? JSON.parse(product.disadvantages) : product.disadvantages || [],
            pricingInfo: typeof product.pricingInfo === 'string' ? JSON.parse(product.pricingInfo) : product.pricingInfo || {},
            videoUrls: typeof product.videoUrls === 'string' ? JSON.parse(product.videoUrls) : product.videoUrls || [],
            hasTrial: typeof product.hasTrial === 'boolean' ? product.hasTrial : false,
            price: typeof product.price === 'string' ? parseFloat(product.price) : product.price
          })))
        } else {
          const response = await fetch(url)
          if (!response.ok) throw new Error('Failed to load products')
          const data = await response.json()
          setProducts(data.map((product: Product) => ({
            ...product,
            tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags || [],
            advantages: typeof product.advantages === 'string' ? JSON.parse(product.advantages) : product.advantages || [],
            disadvantages: typeof product.disadvantages === 'string' ? JSON.parse(product.disadvantages) : product.disadvantages || [],
            pricingInfo: typeof product.pricingInfo === 'string' ? JSON.parse(product.pricingInfo) : product.pricingInfo || {},
            videoUrls: typeof product.videoUrls === 'string' ? JSON.parse(product.videoUrls) : product.videoUrls || [],
            hasTrial: typeof product.hasTrial === 'boolean' ? product.hasTrial : false,
            price: typeof product.price === 'string' ? parseFloat(product.price) : product.price
          })))
        }
        setError(null)
      } catch (err) {
        console.error('Error loading products:', err)
        setError('An error occurred while loading products')
      } finally {
        setLoading(false)
        setIsSearching(false)
      }
    }

    fetchProducts()
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchInput.trim()) return
    setIsSearching(true)
    router.push(`/recommendations?query=${encodeURIComponent(searchInput.trim())}`)
  }

  const filteredProducts = products.filter(product => {
    if (selectedTags.size === 0) return true
    const productTags = product.tags || []
    return Array.from(selectedTags).some(tag => productTags.includes(tag))
  })

  const toggleExpand = (id: string) => {
    setExpandedProductId(expandedProductId === id ? null : id)
  }

  const handleVisit = (url?: string) => {
    if (!url) {
      console.log('URL is missing!')
      return
    }

    try {
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Error opening URL:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-semibold mb-4">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold mb-4">
          {query ? (
            <>
              <span className="text-gradient-primary">Let us help you with </span>
              <span className="text-gray-900">"{query}"</span>
              <span className="text-gradient-primary"> using AI</span>
            </>
          ) : (
            `Choose from our ${products.length} AI Solutions`
          )}
        </h1>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-4">
          {query 
            ? 'Based on your needs, we have prepared a list of AI tools to help you grow and be more efficient.' 
            : 'Describe your needs and we will recommend the most suitable AI tools.'
          }
        </p>
        
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Describe your needs and we'll recommend suitable AI tools..."
              className="flex-1 px-4 py-3 rounded-full border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-3 bg-gradient-primary text-white rounded-full font-medium hover-gradient-primary transition-all disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Find Solutions'}
            </button>
          </div>
        </form>
      </div>

      <div className="mb-8">
        <TagFilter selectedTags={selectedTags} onTagsChange={setSelectedTags} />
      </div>

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
                    width={800}
                    height={450}
                    className="object-cover"
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-medium text-gray-800">
                      {product.name}
                      {product.matchScore && (
                        <span className="ml-2 text-sm font-bold text-white bg-purple-600 px-3 py-1 rounded-full">
                          {Math.round(product.matchScore * 100)}% match
                        </span>
                      )}
                    </h3>
                    {product.category && (
                      <span className="text-sm text-gray-500">{product.category}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <div>
                      <p className="text-gradient-primary font-medium">
                        {product.hasTrial ? '$0' : `$${product.price.toFixed(2)}`}
                      </p>
                      {product.hasTrial && (
                        <span className="text-xs text-purple-600/90 bg-purple-50/80 px-2 py-1 rounded-full">
                          Free Trial
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">
                  {product.description}
                </p>

                {product.matchReason && (
                  <p className="text-sm text-purple-600 bg-purple-50/50 px-3 py-2 rounded-[10px] mb-4">
                    {product.matchReason}
                  </p>
                )}
                
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {product.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-end w-full gap-3">                  
                    <button 
                      onClick={() => toggleExpand(product.id)}
                      className="md:w-auto px-4 py-2 text-sm font-medium rounded-[14px] bg-gradient-primary text-white hover-gradient-primary transition-all flex items-center justify-center gap-2"
                    >
                      <span>{expandedProductId === product.id ? 'Less' : 'More'}</span>
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
                      onClick={() => handleVisit(product.externalUrl)}
                      className="md:w-auto px-4 py-2 text-sm font-medium rounded-[14px] bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                    >
                      Try it
                    </button>
                  </div>
                </div>

                {expandedProductId === product.id && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      {product.advantages && product.advantages.length > 0 && (
                        <div>
                          <h4 className="text-lg font-medium text-gray-800 mb-3">Advantages</h4>
                          <ul className="space-y-2">
                            {product.advantages.map((advantage, index) => (
                              <li key={index} className="flex items-start gap-2 text-green-600">
                                <span className="mt-1">✓</span>
                                <span>{advantage}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {product.disadvantages && product.disadvantages.length > 0 && (
                        <div>
                          <h4 className="text-lg font-medium text-gray-800 mb-3">Disadvantages</h4>
                          <ul className="space-y-2">
                            {product.disadvantages.map((disadvantage, index) => (
                              <li key={index} className="flex items-start gap-2 text-red-600">
                                <span className="mt-1">✗</span>
                                <span>{disadvantage}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {product.pricingInfo && (
                      <div className="border-t border-gray-100 pt-6">
                        <h4 className="text-lg font-medium text-gray-800 mb-4">Pricing Plans</h4>
                        <div className="grid md:grid-cols-3 gap-4">
                          {product.pricingInfo.basic && (
                            <div className="p-4 rounded-lg border border-gray-200 bg-white">
                              <h5 className="font-medium text-gray-800 mb-2">Basic</h5>
                              <p className="text-sm text-gray-600">{product.pricingInfo.basic}</p>
                              <button 
                                onClick={() => handleVisit(product.externalUrl)}
                                className="mt-3 w-full px-3 py-2 text-sm font-medium rounded-[14px] bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                              >
                                Start with Basic
                              </button>
                            </div>
                          )}
                          
                          {product.pricingInfo.pro && (
                            <div className="p-4 rounded-lg border-2 border-purple-400 bg-white relative">
                              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                <span className="px-3 py-1 bg-purple-100 text-purple-600 text-xs font-medium rounded-full">
                                  Most Popular
                                </span>
                              </div>
                              <h5 className="font-medium text-gray-800 mb-2">Pro</h5>
                              <p className="text-sm text-gray-600">{product.pricingInfo.pro}</p>
                              <button 
                                onClick={() => handleVisit(product.externalUrl)}
                                className="mt-3 w-full px-3 py-2 text-sm font-medium rounded-[14px] bg-gradient-primary text-white hover-gradient-primary transition-all"
                              >
                                Try Pro
                              </button>
                            </div>
                          )}
                          
                          {product.pricingInfo.enterprise && (
                            <div className="p-4 rounded-lg border border-gray-200 bg-white">
                              <h5 className="font-medium text-gray-800 mb-2">Enterprise</h5>
                              <p className="text-sm text-gray-600">{product.pricingInfo.enterprise}</p>
                              <button 
                                onClick={() => handleVisit(product.externalUrl)}
                                className="mt-3 w-full px-3 py-2 text-sm font-medium rounded-[14px] bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                              >
                                Contact Sales
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 