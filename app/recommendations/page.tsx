'use client'

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import TagFilter from '../../components/TagFilter'
import CompareBar from '../../components/CompareBar'

// Constants for enabling/disabling features 
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

function RecommendationsPageContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('query')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null)
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set())
  const [products, setProducts] = useState<Product[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [recommending, setRecommending] = useState(false)
  const [hasLoadedRecs, setHasLoadedRecs] = useState(false)
  const [isLoadingRecs, setIsLoadingRecs] = useState(false)
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(0)

  const prevQueryRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // TagFilter now loads its own tags optimally, no need for ProductStore initialization

  // Loading messages rotation
  const loadingMessages = [
    "Analyzing and ranking tools based on their relevance to you...",
    "Creating personalized recommendations based on your needs..."
  ];

  // Loading messages rotation
  useEffect(() => {
    if (!recommending) {
      console.log('🔄 Rotation STOPPED - recommending:', recommending);
      return;
    }

    console.log('🔄 Rotation STARTED - recommending:', recommending);
    
    const interval = setInterval(() => {
      setCurrentLoadingMessage(prev => {
        const next = (prev + 1) % 2;
        console.log('🔄 Loading message rotation:', prev, '->', next, 'message:', loadingMessages[next]);
        return next;
      });
    }, 4000); // 4 seconds for each message

    return () => {
      console.log('🔄 Rotation ENDED');
      clearInterval(interval);
    };
  }, [recommending]);

  // Load products - only if we don't have query (for catalog page)
  useEffect(() => {
    // If we have a query, we don't need to load all products!
    if (query) {
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsUrl = '/api/products?pageSize=1000';
        const response = await fetch(productsUrl, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        if (response.ok) {
          const raw = await response.json();
          const list: any[] = Array.isArray(raw)
            ? raw
            : Array.isArray(raw.products)
              ? raw.products
              : [];

          if (!Array.isArray(list) || list.length === 0) {
            console.warn('API returned unexpected structure or empty product array:', raw);
          }

          const processedData = list.map((product: Product) => ({
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
        } else {
          console.error('Error loading:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [query])

  useEffect(() => {
    // If we don't have a query
    if (!query) {
      if (prevQueryRef.current) {
        // Reset state when removing query
        prevQueryRef.current = null;
        isLoadingRef.current = false;
        setRecommendations([]);
        setHasLoadedRecs(false);
        setRecommending(false);
        setIsLoadingRecs(false);
      }
      return;
    }

    // If it's the same query as before, do nothing
    if (query === prevQueryRef.current) {
      return;
    }

    // If we're already loading, skip
    if (isLoadingRef.current) {
      console.log('🔄 Already loading recommendations, skipping...');
      return;
    }

    // Update ref
    prevQueryRef.current = query;
    
          // Reset state for new query
      setRecommendations([]);
      setHasLoadedRecs(false);
      setRecommending(false);
      setIsLoadingRecs(false);
      setCurrentLoadingMessage(0);
    
    // Start loading recommendations
    const fetchRecommendations = async () => {
      if (isLoadingRef.current) return;
      
      console.log('🔍 Loading recommendations for:', query);
      
      isLoadingRef.current = true;
      setIsLoadingRecs(true);
      setRecommending(true);
      console.log('🔄 SETTING recommending to TRUE');
      
      try {
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });

        if (!response.ok) {
          console.error('Error calling API:', response.status, response.statusText);
          return;
        }

        const data = await response.json();
        
        if (!data.recommendations || !Array.isArray(data.recommendations)) {
          console.error('Invalid response structure:', data);
          return;
        }

        console.log(`📦 Loading ${data.recommendations.length} recommended products`);
        
        // Load products from database for all recommendations
        const productIds = data.recommendations.map((rec: any) => rec.id);
        
        const productsResponse = await fetch(`/api/products?ids=${productIds.join(',')}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!productsResponse.ok) {
          console.error('Error loading products:', productsResponse.status);
          return;
        }
        
        const productsData = await productsResponse.json();
        
        const products = Array.isArray(productsData) ? productsData : productsData.products || [];
        
        // Combine recommendations with products from database
        const recommendationsWithProducts = data.recommendations.map((rec: any) => {
          const product = products.find((p: Product) => p.id === rec.id);
          if (!product) {
            console.warn(`⚠️ Product with ID ${rec.id} not found in database`);
            return null;
          }
          return {
            ...rec,
            product: {
              ...product,
              matchPercentage: rec.matchPercentage,
              recommendation: rec.recommendation
            }
          };
        }).filter(Boolean);
        
        if (recommendationsWithProducts.length === 0) {
          console.warn('⚠️ No valid recommendations after combining with products');
        } else {
          console.log(`✅ Successfully loaded ${recommendationsWithProducts.length} recommendations`);
        }
        
        setRecommendations(recommendationsWithProducts);
      } catch (err) {
        console.error('Error loading recommendations:', err);
      } finally {
        isLoadingRef.current = false;
        setRecommending(false);
        console.log('🔄 SETTING recommending to FALSE');
        setHasLoadedRecs(true);
        setIsLoadingRecs(false);
      }
    };
    
    fetchRecommendations();
  }, [query]);

  // Debug state (only for errors)
  useEffect(() => {
    if (query && !recommending && recommendations.length === 0 && hasLoadedRecs) {
      console.log('⚠️ No recommendations for query:', query);
    }
  }, [recommendations, recommending, hasLoadedRecs, query]);

  const toggleItem = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  // Get products for display - either all or just recommended
  const getDisplayProducts = (): DisplayProduct[] => {
    if (!query) {
      return products;
    }
    
    if (recommending) {
      return [];
    }
    
    if (!recommendations || recommendations.length === 0) {
      return [];
    }
    
    const displayProducts = recommendations.map(rec => {
      return {
        ...rec.product,
        matchPercentage: rec.matchPercentage,
        recommendation: rec.recommendation
      };
    });
    
    return displayProducts;
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
    // TODO: Implement comparison logic
    console.log('Comparing products:', Array.from(selectedItems))
  }

  const handleClearSelection = () => {
    setSelectedItems(new Set())
  }

  const handleVisit = (url?: string) => {
    if (!url) {
      console.log('Missing URL!')
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Introduction section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold mb-4">
          {getPersonalizedHeadline(query)}
        </h1>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-4">
          {query 
            ? (recommending 
                ? "We're analyzing your needs and finding the most relevant AI tools for you..."
                : `Based on your needs, we found ${displayProducts.length} AI tools that are specifically relevant to your requirements.`
              )
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

      {/* Loading state for recommendations */}
      {recommending && (
        <div className="flex justify-center items-center py-8">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-purple-600 font-medium">{loadingMessages[currentLoadingMessage]}</p>
          </div>
        </div>
      )}

      {/* TagFilter - show only if we don't have recommendations */}
      {(!query || query.length===0) && recommendations.length === 0 && !recommending && (
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
                {/* Display percentage match */}
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
                {/* Checkbox for comparison - hidden */}
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
                        {product.hasTrial ? '$0' : (typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : 'N/A')}
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
                
                {/* Personalized recommendation */}
                {product.recommendation && (
                  <div className="mb-4 p-4 bg-purple-50 rounded-[14px] border border-purple-100">
                    <h4 className="text-purple-800 font-medium mb-1">Personalized Recommendation</h4>
                    <p className="text-purple-900">{product.recommendation}</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {(typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags || [])?.map((tag: string) => (
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
                      {(() => {
                        try {
                          const advantages = typeof product.advantages === 'string' 
                            ? JSON.parse(product.advantages) 
                            : product.advantages || [];
                          
                          if (Array.isArray(advantages) && advantages.length > 0) {
                            return (
                              <div>
                                <h4 className="text-lg font-medium text-gray-800 mb-3">Advantages</h4>
                                <ul className="space-y-2">
                                  {advantages.map((advantage, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                      </svg>
                                      <span className="text-gray-600">{advantage}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          }
                        } catch (error) {
                          console.warn('Error parsing advantages:', error);
                        }
                        return null;
                      })()}

                      {(() => {
                        try {
                          const disadvantages = typeof product.disadvantages === 'string' 
                            ? JSON.parse(product.disadvantages) 
                            : product.disadvantages || [];
                          
                          if (Array.isArray(disadvantages) && disadvantages.length > 0) {
                            return (
                              <div>
                                <h4 className="text-lg font-medium text-gray-800 mb-3">Disadvantages</h4>
                                <ul className="space-y-2">
                                  {disadvantages.map((disadvantage, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                      <span className="text-gray-600">{disadvantage}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          }
                        } catch (error) {
                          console.warn('Error parsing disadvantages:', error);
                        }
                        return null;
                      })()}
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
                        {(() => {
                          try {
                            const pricingInfo = typeof product.pricingInfo === 'string' 
                              ? JSON.parse(product.pricingInfo) 
                              : product.pricingInfo || {};
                            
                            return (
                              <>
                                {pricingInfo.basic && (
                                  <div className="bg-gray-50/80 p-4 rounded-[14px]">
                                    <h5 className="font-medium text-gray-800 mb-2">Basic</h5>
                                    <p className="text-2xl font-bold text-gradient-primary">
                                      ${parseFloat(pricingInfo.basic).toFixed(2)}
                                    </p>
                                  </div>
                                )}
                                {pricingInfo.pro && (
                                  <div className="bg-purple-50/80 p-4 rounded-[14px] border-2 border-purple-100">
                                    <h5 className="font-medium text-gray-800 mb-2">Pro</h5>
                                    <p className="text-2xl font-bold text-gradient-primary">
                                      ${parseFloat(pricingInfo.pro).toFixed(2)}
                                    </p>
                                  </div>
                                )}
                                {pricingInfo.enterprise && (
                                  <div className="bg-gray-50/80 p-4 rounded-[14px]">
                                    <h5 className="font-medium text-gray-800 mb-2">Enterprise</h5>
                                    <p className="text-2xl font-bold text-gradient-primary">
                                      {pricingInfo.enterprise === 'Custom' ? 'Custom' : `$${parseFloat(pricingInfo.enterprise).toFixed(2)}`}
                                    </p>
                                  </div>
                                )}
                              </>
                            );
                          } catch (error) {
                            console.warn('Error parsing pricing info:', error);
                            return null;
                          }
                        })()}
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

export default function RecommendationsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecommendationsPageContent />
    </Suspense>
  )
} 