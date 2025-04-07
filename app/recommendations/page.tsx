'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import TagFilter from '../../components/TagFilter'
import CompareBar from '../../components/CompareBar'

// Konstanty pro zapnutí/vypnutí funkcí 
const COMPARE_FEATURE_ENABLED = false;
const SAVE_FEATURE_ENABLED = false;

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

interface Recommendation {
  id: string
  matchPercentage: number
  recommendation: string
  product: Product
}

interface DisplayProduct extends Product {
  matchPercentage?: number;
  recommendation?: string;
}

export default function DoporuceniPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('query')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null)
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set())
  const [products, setProducts] = useState<Product[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [recommending, setRecommending] = useState(true)

  // Načtení produktů
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        if (response.ok) {
          const data = await response.json()
          const processedData = data.map((product: Product) => ({
            ...product,
            tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags,
            advantages: typeof product.advantages === 'string' ? JSON.parse(product.advantages) : product.advantages,
            disadvantages: typeof product.disadvantages === 'string' ? JSON.parse(product.disadvantages) : product.disadvantages,
            pricingInfo: typeof product.pricingInfo === 'string' ? JSON.parse(product.pricingInfo) : product.pricingInfo,
            videoUrls: typeof product.videoUrls === 'string' ? JSON.parse(product.videoUrls) : product.videoUrls,
            hasTrial: typeof product.hasTrial === 'boolean' ? product.hasTrial : false,
            price: typeof product.price === 'string' ? parseFloat(product.price) : product.price
          }))
          setProducts(processedData)
          
          // Pokud nemáme dotaz, zobrazíme všechny produkty
          if (!query) {
            setRecommending(false);
          }
        } else {
          console.error('Chyba při načítání:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Chyba při načítání produktů:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [query])

  // Získáme doporučení, pokud máme dotaz
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!query) return;
      
      try {
        setRecommending(true);
        
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query })
        });
        
        if (!response.ok) {
          throw new Error('Nepodařilo se získat doporučení');
        }
        
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } catch (error) {
        console.error('Chyba při získávání doporučení:', error);
        // Při chybě zobrazíme všechny produkty
        setRecommendations([]);
      } finally {
        setRecommending(false);
      }
    };
    
    if (query && products.length > 0) {
      fetchRecommendations();
    }
  }, [query, products]);

  const toggleItem = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  // Získáme produkty pro zobrazení - buď všechny, nebo jen doporučené
  const getDisplayProducts = (): DisplayProduct[] => {
    // Pokud máme doporučení, použijeme je
    if (recommendations.length > 0) {
      // Vrátíme všechna doporučení, bez omezení na počet, seřazena podle matchPercentage
      return recommendations.map(rec => ({
        ...rec.product,
        matchPercentage: rec.matchPercentage,
        recommendation: rec.recommendation
      })).sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
    }
    
    // Jinak filtrujeme podle tagů
    return products.filter(product => {
      if (selectedTags.size === 0) return true
      const productTags = product.tags || []
      return Array.from(selectedTags).some(tag => productTags.includes(tag))
    });
  }

  const displayProducts = getDisplayProducts();

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
    if (!query) return `Choose from our ${products.length} AI solutions`

    return (
      <>
        <span className="text-gradient-primary">We'll help you with </span>
        <span className="text-gray-900">"{query}"</span>
        <span className="text-gradient-primary"> using AI</span>
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
      {/* Introduction section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold mb-4">
          {getPersonalizedHeadline(query)}
        </h1>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-4">
          {query 
            ? `Based on your needs, we found ${displayProducts.length} AI tools that are specifically relevant to your requirements.` 
            : `Choose from our ${products.length} AI solutions that will help you work more efficiently and grow.`
          }
        </p>
        <p className="text-gray-500 text-base">
          {query
            ? "We've filtered out tools that don't match your specific needs to save you time."
            : "Browse through the options and save the ones that interest you. You can compare them in detail later."
          }
        </p>
      </div>

      {/* Loading state pro doporučení */}
      {recommending && (
        <div className="flex justify-center items-center py-8">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-purple-600 font-medium">Generating personalized recommendations...</p>
          </div>
        </div>
      )}

      {/* TagFilter - zobrazit jen pokud nemáme doporučení */}
      {recommendations.length === 0 && !recommending && (
        <div className="mb-8">
          <TagFilter selectedTags={selectedTags} onTagsChange={setSelectedTags} />
        </div>
      )}

      {/* Product list */}
      <div className="space-y-4 mb-12">
        {displayProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative"
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-full md:max-w-[240px] flex flex-col gap-3">
                {/* Přidáváme zobrazení procentuální shody */}
                {product.matchPercentage !== undefined && (
                  <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-center py-2 px-4 rounded-t-[14px] font-medium">
                    {product.matchPercentage}% Match
                  </div>
                )}
                <div 
                  className="w-full aspect-video relative rounded-[14px] overflow-hidden bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleVisit(product.externalUrl)}
                >
                  <Image
                    src={product.imageUrl || 'https://placehold.co/800x450/f3f4f6/94a3b8?text=No+Image'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Checkbox pro srovnávání - skrytý */}
                {COMPARE_FEATURE_ENABLED && (
                  <label className="flex items-center justify-center md:justify-start gap-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(product.id)}
                      onChange={() => toggleItem(product.id)}
                      className="w-4 h-4 text-purple-600/90 rounded-[6px] border-gray-300 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                      Compare
                    </span>
                  </label>
                )}
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
                
                {/* Personalizované doporučení */}
                {product.recommendation && (
                  <div className="mb-4 p-4 bg-purple-50 rounded-[14px] border border-purple-100">
                    <h4 className="text-purple-800 font-medium mb-1">Personalized Recommendation</h4>
                    <p className="text-purple-900">{product.recommendation}</p>
                  </div>
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
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 mb-6">
                    <button
                      onClick={() => handleVisit(product.externalUrl)}
                      className="w-full sm:w-auto px-6 py-3 text-base font-medium rounded-[14px] bg-gradient-primary text-white hover-gradient-primary transition-all"
                    >
                      {product.hasTrial ? 'Try for Free' : 'Try Now'}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-end w-full gap-3">                  
                    <button 
                      onClick={() => toggleExpand(product.id)}
                      className="md:w-auto px-4 py-2 text-sm font-medium rounded-[14px] bg-gradient-primary text-white hover-gradient-primary transition-all flex items-center justify-center gap-2"
                    >
                      <span>{expandedProductId === product.id ? 'Show Less' : 'Show More'}</span>
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
                    {SAVE_FEATURE_ENABLED && (
                      <button 
                        onClick={() => handleSave(product.id)}
                        className={`md:w-auto px-4 py-2 text-sm font-medium rounded-[14px] border transition-all duration-300 ${
                          savedItems.has(product.id)
                            ? 'border-green-500 text-green-600 bg-green-50 hover:bg-green-100'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {savedItems.has(product.id) ? 'Saved ✓' : 'Save'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expandable section */}
                {expandedProductId === product.id && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      {product.advantages && product.advantages.length > 0 && (
                        <div>
                          <h4 className="text-lg font-medium text-gray-800 mb-3">Advantages</h4>
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
                          <h4 className="text-lg font-medium text-gray-800 mb-3">Disadvantages</h4>
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
                        <h4 className="text-lg font-medium text-gray-800 mb-3">Detailed Description</h4>
                        <div className="bg-gray-50/80 rounded-[14px] p-4">
                          <p className="text-gray-600 whitespace-pre-line">{product.detailInfo}</p>
                        </div>
                      </div>
                    )}

                    {/* Pricing information */}
                    <div className="mb-6">
                      <h4 className="text-lg font-medium text-gray-800 mb-3">Pricing</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {product.hasTrial && (
                          <div className="bg-purple-50/80 p-4 rounded-[14px] border-2 border-purple-100">
                            <h5 className="font-medium text-gray-800 mb-2">Free Trial</h5>
                            <p className="text-2xl font-bold text-gradient-primary">$0</p>
                          </div>
                        )}
                        {product.pricingInfo?.basic && (
                          <div className="bg-gray-50/80 p-4 rounded-[14px]">
                            <h5 className="font-medium text-gray-800 mb-2">Basic</h5>
                            <p className="text-2xl font-bold text-gradient-primary">
                              ${parseFloat(product.pricingInfo.basic).toFixed(2)}
                            </p>
                          </div>
                        )}
                        {product.pricingInfo?.pro && (
                          <div className="bg-purple-50/80 p-4 rounded-[14px] border-2 border-purple-100">
                            <h5 className="font-medium text-gray-800 mb-2">Pro</h5>
                            <p className="text-2xl font-bold text-gradient-primary">
                              ${parseFloat(product.pricingInfo.pro).toFixed(2)}
                            </p>
                          </div>
                        )}
                        {product.pricingInfo?.enterprise && (
                          <div className="bg-gray-50/80 p-4 rounded-[14px]">
                            <h5 className="font-medium text-gray-800 mb-2">Enterprise</h5>
                            <p className="text-2xl font-bold text-gradient-primary">
                              {product.pricingInfo.enterprise === 'Custom' ? 'Custom' : `$${parseFloat(product.pricingInfo.enterprise).toFixed(2)}`}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleVisit(product.externalUrl)}
                      className="w-full px-6 py-3 text-base font-medium rounded-[14px] bg-gradient-primary text-white hover-gradient-primary transition-all"
                    >
                      {product.hasTrial ? 'Try for Free' : 'Try Now'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CompareBar */}
      {COMPARE_FEATURE_ENABLED && (
        <CompareBar 
          selectedCount={selectedItems.size}
          onCompare={handleCompare}
          onClear={handleClearSelection}
        />
      )}
    </div>
  )
} 