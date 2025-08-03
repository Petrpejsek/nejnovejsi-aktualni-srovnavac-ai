'use client'

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import TagFilter from '../../components/TagFilter'
import CompareBar from '../../components/CompareBar'
import { openInNewTab, trackProductClick } from '../../lib/utils'

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
  const [initialRecommendations, setInitialRecommendations] = useState<Recommendation[]>([]) // AI doporučené
  const [moreRecommendations, setMoreRecommendations] = useState<Recommendation[]>([]) // Category-based
  const [loading, setLoading] = useState(true)
  const [recommending, setRecommending] = useState(false)
  const [hasLoadedRecs, setHasLoadedRecs] = useState(false)
  const [isLoadingRecs, setIsLoadingRecs] = useState(false)
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(0)
  const [animatedPercentage, setAnimatedPercentage] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)

  const prevQueryRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const animatedPercentageRef = useRef(0);
  
  // TagFilter now loads its own tags optimally, no need for ProductStore initialization

  // Advanced loading messages with steps and dynamic percentages
  const loadingSteps = [
    {
      text: "Analyzing your requirements...",
      percentage: 15,
      duration: 4000
    },
    {
      text: "Scanning our database of AI tools...",
      percentage: 35,
      duration: 5000
    },
    {
      text: "Calculating match percentages...",
      percentage: 60,
      duration: 6000
    },
    {
      text: "Creating personalized recommendations...",
      percentage: 85,
      duration: 7000
    },
    {
      text: "Finalizing your perfect matches...",
      percentage: 100,
      duration: 4000
    }
  ];

  // Advanced loading messages rotation with animated progress
  useEffect(() => {
    if (!recommending) {
      setCurrentLoadingMessage(0);
      setAnimatedPercentage(0);
      animatedPercentageRef.current = 0;
      return;
    }

    let currentStep = 0;
    setCurrentLoadingMessage(0);
    setAnimatedPercentage(0);
    animatedPercentageRef.current = 0;
    
    // Start percentage animation immediately
    const animatePercentage = (targetPercentage: number, duration: number) => {
      const startPercentage = animatedPercentageRef.current;
      const startTime = Date.now();
      
      const updatePercentage = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth easing function (ease-out)
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentPercentage = Math.round(startPercentage + (targetPercentage - startPercentage) * easedProgress);
        
        setAnimatedPercentage(currentPercentage);
        animatedPercentageRef.current = currentPercentage;
        
        if (progress < 1) {
          requestAnimationFrame(updatePercentage);
        }
      };
      
      requestAnimationFrame(updatePercentage);
    };
    
    const rotateSteps = () => {
      const currentStepData = loadingSteps[currentStep];
      
      // Animate to current step's percentage
      animatePercentage(currentStepData.percentage, currentStepData.duration);
      
      if (currentStep < loadingSteps.length - 1) {
        setTimeout(() => {
          currentStep++;
          setCurrentLoadingMessage(currentStep);
          rotateSteps();
        }, currentStepData.duration);
      }
    };

    rotateSteps();
  }, [recommending]);

  // Load products - only if we don't have query (for catalog page)
  useEffect(() => {
    // If we have a query, we don't need to load all products!
    if (query) {
      console.log('🎯 Máme query, přeskakuji načítání všech produktů');
      setLoading(false);
      return;
    }

    console.log('🎯 Nemáme query, načítám všechny produkty pro katalog');
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
          console.log(`🎯 Načteno ${processedData.length} produktů pro katalog`);
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
        setInitialRecommendations([]);
        setMoreRecommendations([]);
        setHasLoadedRecs(false);
        setRecommending(false);
        setIsLoadingRecs(false);
        setOffset(0);
        console.log("🗑️ Reset state při mazání query");
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
      setInitialRecommendations([]);
      setMoreRecommendations([]);
      setHasLoadedRecs(false);
      setRecommending(false);
      setIsLoadingRecs(false);
      setCurrentLoadingMessage(0);
      setOffset(0);
      console.log("🔄 Reset state pro nový dotaz");
    
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

        console.log(`📦 Received ${data.recommendations.length} recommended products with complete data`);
        
        // API už vrací kompletní produkty, nemusíme je načítat znovu!
        const recommendationsWithProducts = data.recommendations.filter((rec: any) => {
          if (!rec.product) {
            console.warn(`⚠️ Recommendation ${rec.id} missing product data`);
            return false;
          }
          return true;
        });
        
        if (recommendationsWithProducts.length === 0) {
          console.warn('⚠️ No valid recommendations received from API');
        } else {
          console.log(`✅ Successfully received ${recommendationsWithProducts.length} complete recommendations`);
        }
        
        setRecommendations(recommendationsWithProducts);
        setInitialRecommendations(recommendationsWithProducts); // Uložit AI doporučení
        console.log(`🤖 Nastaveno ${recommendationsWithProducts.length} AI doporučených produktů`);
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

  // Získáme unikátní kategorie z aktuálních AI doporučených produktů
  const getSelectedCategories = () => {
    if (!initialRecommendations || initialRecommendations.length === 0) return [];
    
    const categories = new Set<string>();
    initialRecommendations.forEach(rec => {
      if (rec.product.category) {
        categories.add(rec.product.category);
      }
    });
    
    return Array.from(categories);
  }

  const loadMore = async () => {
    if (!query || initialRecommendations.length === 0) return;
    
    setLoadingMore(true);
    const selectedCategories = getSelectedCategories();
    
    // nasbíráme ID všech už zobrazených (AI + podobné)
    const excludeIds = [
      ...initialRecommendations.map(rec => rec.product.id),
      ...moreRecommendations.map(rec => rec.product.id)
    ];
    
    console.log("🔍 DIAGNOSTIKA SHOW MORE:");
    console.log("Selected categories:", selectedCategories);
    console.log("Offset (moreRecommendations.length):", moreRecommendations.length);
    console.log("Initial products count:", initialRecommendations.length);
    console.log("Exclude IDs:", excludeIds);
    
    if (selectedCategories.length === 0) {
      console.log("❌ Žádné kategorie k načtení");
      setLoadingMore(false);
      return;
    }

    try {
      const queryParams = new URLSearchParams({
        categories: selectedCategories.join(','),
        offset: moreRecommendations.length.toString(),
        limit: '5',
        exclude: excludeIds.join(',')
      });
      
      console.log("📡 Volám API:", `/api/recommendations?${queryParams}`);
      
      const response = await fetch(`/api/recommendations?${queryParams}`);
      
      if (!response.ok) {
        console.error('❌ API Error:', response.status);
        return;
      }
      
      const data = await response.json();
      console.log("📦 API Response:", data);
      
      if (data.products && data.products.length > 0) {
        console.log(`✅ Načteno ${data.products.length} nových produktů`);
        
        // Převedeme produkty na doporučení s 0% match (jelikož nejsou z AI)
        const newRecommendations = data.products.map((product: any) => ({
          id: `similar-${product.id}`,
          matchPercentage: 0, // Podobné produkty nemají AI match percentage
          recommendation: "Similar product based on category",
          product: product
        }));
        
        setMoreRecommendations(prev => [...prev, ...newRecommendations]);
        console.log("🎯 Nový stav moreRecommendations:", moreRecommendations.length + newRecommendations.length);
      } else {
        console.log("⚠️ API vrátilo prázdné pole nebo žádné produkty");
      }
    } catch (error) {
      console.error('❌ Network error loading more products:', error);
    } finally {
      setLoadingMore(false);
    }
  }

  // Get products for display - either all or just recommended
  const getDisplayProducts = () => {
    if (!query) {
      return { products, initialProducts: [], moreProducts: [] };
    }
    
    if (recommending) {
      return { products: [], initialProducts: [], moreProducts: [] };
    }
    
    if (!initialRecommendations || initialRecommendations.length === 0) {
      return { products: [], initialProducts: [], moreProducts: [] };
    }
    
    const initialProducts = initialRecommendations.map(rec => {
      return {
        ...rec.product,
        matchPercentage: rec.matchPercentage,
        recommendation: rec.recommendation
      };
    });
    
    const moreProducts = moreRecommendations.map(rec => {
      return {
        ...rec.product,
        matchPercentage: rec.matchPercentage,
        recommendation: rec.recommendation
      };
    });
    
    return {
      products: [...initialProducts, ...moreProducts],
      initialProducts,
      moreProducts
    };
  }

  const { products: displayProducts, initialProducts, moreProducts } = getDisplayProducts();

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

  const handleVisit = (product: Product) => {
    // Use shared tracking function for consistency
    trackProductClick({
      id: product.id,
      name: product.name,
      externalUrl: product.externalUrl || null,
      category: product.category,
      imageUrl: product.imageUrl || null,
      price: product.price,
      tags: product.tags || null
    })
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
            ? ""
            : "Browse through the options and save the ones that interest you. You can compare them in detail later."
          }
        </p>
      </div>

      {/* Enhanced Loading state for recommendations */}
      {recommending && (
        <div className="flex justify-center items-center py-12">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex flex-col items-center text-center">
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${animatedPercentage}%` }}
                  ></div>
                </div>
                
                {/* Dynamic percentage display */}
                <div className="relative mb-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-2 shadow-lg">
                    <span className="text-white text-xl font-bold">
                      {animatedPercentage}%
                    </span>
                  </div>
                </div>
                
                {/* Current step text */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {loadingSteps[currentLoadingMessage].text}
                </h3>
                
                {/* Step counter */}
                <p className="text-sm text-gray-500 mb-4">
                  Step {currentLoadingMessage + 1} of {loadingSteps.length}
                </p>
                
                {/* Animated dots */}
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
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
        {/* AI doporučené produkty - s % Match a Personalized Recommendation */}
        {initialProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative"
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-full md:max-w-[240px] flex flex-col gap-3">
                {/* Display percentage match - pouze pro AI doporučené */}
                {product.matchPercentage !== undefined && product.matchPercentage > 0 && (
                  <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-center py-2 px-4 rounded-t-[14px] font-medium">
                    {product.matchPercentage}% Match
                  </div>
                )}
                <div 
                  className="w-full aspect-video relative rounded-[14px] overflow-hidden bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleVisit(product)}
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
                
                {/* Personalized recommendation - pouze pro AI doporučené */}
                {product.recommendation && (
                  <div className="mb-4 p-4 bg-purple-50 rounded-[14px] border border-purple-100">
                    <h4 className="text-purple-800 font-medium mb-1">Personalized Recommendation</h4>
                    <p className="text-purple-900">{product.recommendation}</p>
                  </div>
                )}
                
                <p className="text-gray-600 mb-4">
                  {product.description}
                </p>
                
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
                      onClick={() => handleVisit(product)}
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
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="space-y-6">
                      {/* Advantages and Disadvantages Grid */}
                      <div className="grid md:grid-cols-2 gap-6">
                        {(() => {
                          try {
                            const advantages = typeof product.advantages === 'string' 
                              ? JSON.parse(product.advantages) 
                              : product.advantages || [];
                            
                            if (Array.isArray(advantages) && advantages.length > 0) {
                              return (
                                <div className="bg-green-50 p-5 rounded-lg border border-green-100">
                                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Advantages</h4>
                                  <ul className="space-y-3">
                                    {advantages.slice(0, 5).map((advantage, index) => (
                                      <li key={index} className="flex items-start gap-3">
                                        <span className="text-green-600 font-black text-lg mt-0.5 w-5 flex-shrink-0">✓</span>
                                        <span className="text-gray-700 leading-relaxed">{advantage}</span>
                                      </li>
                                    ))}
                                    {advantages.length > 5 && (
                                      <li className="text-sm text-gray-500 italic pl-5">+{advantages.length - 5} more advantages</li>
                                    )}
                                  </ul>
                                </div>
                              );
                            } else {
                              return (
                                <div className="bg-green-50 p-5 rounded-lg border border-green-100">
                                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Advantages</h4>
                                  <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                      <span className="text-green-600 font-black text-lg mt-0.5 w-5 flex-shrink-0">✓</span>
                                      <span className="text-gray-700 leading-relaxed">User-friendly interface</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                      <span className="text-green-600 font-black text-lg mt-0.5 w-5 flex-shrink-0">✓</span>
                                      <span className="text-gray-700 leading-relaxed">AI-powered features</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                      <span className="text-green-600 font-black text-lg mt-0.5 w-5 flex-shrink-0">✓</span>
                                      <span className="text-gray-700 leading-relaxed">Good customer support</span>
                                    </li>
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
                                <div className="bg-red-50 p-5 rounded-lg border border-red-100">
                                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Disadvantages</h4>
                                  <ul className="space-y-3">
                                    {disadvantages.slice(0, 5).map((disadvantage, index) => (
                                      <li key={index} className="flex items-start gap-3">
                                        <span className="text-red-600 font-black text-lg mt-0.5 w-5 flex-shrink-0">✗</span>
                                        <span className="text-gray-700 leading-relaxed">{disadvantage}</span>
                                      </li>
                                    ))}
                                    {disadvantages.length > 5 && (
                                      <li className="text-sm text-gray-500 italic pl-5">+{disadvantages.length - 5} more considerations</li>
                                    )}
                                  </ul>
                                </div>
                              );
                            } else {
                              return (
                                <div className="bg-red-50 p-5 rounded-lg border border-red-100">
                                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Disadvantages</h4>
                                  <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                      <span className="text-red-600 font-black text-lg mt-0.5 w-5 flex-shrink-0">✗</span>
                                      <span className="text-gray-700 leading-relaxed">Learning curve for beginners</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                      <span className="text-red-600 font-black text-lg mt-0.5 w-5 flex-shrink-0">✗</span>
                                      <span className="text-gray-700 leading-relaxed">Higher price than alternatives</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                      <span className="text-red-600 font-black text-lg mt-0.5 w-5 flex-shrink-0">✗</span>
                                      <span className="text-gray-700 leading-relaxed">Limited customization options</span>
                                    </li>
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

                      {/* Reviews Section */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">User Reviews</h4>
                        <div className="space-y-4">
                          {product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0 ? (
                            <>
                              {product.reviews.slice(0, 2).map((review, index) => (
                                <div key={index} className="border-l-2 border-gray-200 pl-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-900">{review.author}</span>
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                                      ))}
                                      <span className="ml-2 text-sm text-gray-600">{review.rating}/5</span>
                                    </div>
                                  </div>
                                  <p className="text-gray-700 leading-relaxed italic">"{review.text}"</p>
                                </div>
                              ))}
                              {product.reviews.length > 2 && (
                                <p className="text-sm text-gray-500">+{product.reviews.length - 2} more reviews</p>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="border-l-2 border-gray-200 pl-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-gray-900">Sarah M.</span>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <span key={i} className="text-sm text-yellow-500">★</span>
                                    ))}
                                    <span className="ml-2 text-sm text-gray-600">5/5</span>
                                  </div>
                                </div>
                                <p className="text-gray-700 leading-relaxed italic">"Excellent tool! Very intuitive and saves me a lot of time."</p>
                              </div>
                              <div className="border-l-2 border-gray-200 pl-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-gray-900">David K.</span>
                                  <div className="flex items-center gap-1">
                                    {[...Array(4)].map((_, i) => (
                                      <span key={i} className="text-sm text-yellow-500">★</span>
                                    ))}
                                    <span className="text-sm text-gray-300">★</span>
                                    <span className="ml-2 text-sm text-gray-600">4/5</span>
                                  </div>
                                </div>
                                <p className="text-gray-700 leading-relaxed italic">"Great features, though the learning curve can be steep initially."</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Pricing Plans */}
                      {(() => {
                        const hasAnyPricing = product.hasTrial || 
                          (product.pricingInfo && Object.keys(typeof product.pricingInfo === 'string' ? JSON.parse(product.pricingInfo) : product.pricingInfo || {}).length > 0);
                        
                        if (!hasAnyPricing) return null;
                        
                        return (
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {product.hasTrial && (
                                <div className="border border-gray-200 rounded-lg p-4 text-center">
                                  <h5 className="font-semibold text-gray-900 mb-2">Free Trial</h5>
                                  <div className="text-2xl font-bold text-gray-900 mb-1">$0</div>
                                  <p className="text-sm text-gray-600">Try before you buy</p>
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
                                        <div className="border border-gray-200 rounded-lg p-4 text-center">
                                          <h5 className="font-semibold text-gray-900 mb-2">Basic</h5>
                                          <div className="text-2xl font-bold text-gray-900 mb-1">
                                            ${parseFloat(pricingInfo.basic).toFixed(0)}
                                          </div>
                                          <p className="text-sm text-gray-600">Essential features</p>
                                        </div>
                                      )}
                                      {pricingInfo.pro && (
                                        <div className="border-2 border-purple-200 rounded-lg p-4 text-center relative">
                                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                            <span className="bg-purple-600 text-white text-xs font-medium px-2 py-1 rounded">Most Popular</span>
                                          </div>
                                          <h5 className="font-semibold text-gray-900 mb-2">Pro</h5>
                                          <div className="text-2xl font-bold text-gray-900 mb-1">
                                            ${parseFloat(pricingInfo.pro).toFixed(0)}
                                          </div>
                                          <p className="text-sm text-gray-600">Advanced features</p>
                                        </div>
                                      )}
                                      {pricingInfo.enterprise && (
                                        <div className="border border-gray-200 rounded-lg p-4 text-center">
                                          <h5 className="font-semibold text-gray-900 mb-2">Enterprise</h5>
                                          <div className="text-2xl font-bold text-gray-900 mb-1">
                                            {pricingInfo.enterprise === 'Custom' ? 'Custom' : `$${parseFloat(pricingInfo.enterprise).toFixed(0)}`}
                                          </div>
                                          <p className="text-sm text-gray-600">Full solution</p>
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
                        );
                      })()}

                      {/* Call to Action */}
                      <div className="text-center pt-4">
                        <button
                          onClick={() => handleVisit(product)}
                          className="px-6 py-2 text-sm font-medium rounded-lg bg-gradient-primary text-white hover-gradient-primary transition-all"
                        >
                          {product.hasTrial ? 'Start Free Trial' : 'Try Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Podobné produkty z Show More - bez % Match a s Similar product label */}
        {moreProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative"
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-full md:max-w-[240px] flex flex-col gap-3">
                {/* Žádný % Match badge pro podobné produkty */}
                <div 
                  className="w-full aspect-video relative rounded-[14px] overflow-hidden bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleVisit(product)}
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
                
                {/* Similar product label - pro category-based produkty */}
                <div className="mb-4 p-4 bg-gray-50 rounded-[14px] border border-gray-200">
                  <h4 className="text-gray-700 font-medium mb-1">Similar product based on category</h4>
                </div>
                
                <p className="text-gray-600 mb-4">
                  {product.description}
                </p>
                
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
                      onClick={() => handleVisit(product)}
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
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show More button - only for recommendations with query */}
      {query && !recommending && initialProducts.length > 0 && (
        <div className="flex justify-center mt-8 mb-12">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-gradient-primary text-white rounded-[14px] hover-gradient-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loadingMore ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </div>
            ) : (
              'Show More Similar Products'
            )}
          </button>
        </div>
      )}

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