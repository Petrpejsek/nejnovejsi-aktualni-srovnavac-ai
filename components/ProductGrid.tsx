'use client'

import React, { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import { useSession } from 'next-auth/react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  tags?: string[]
  externalUrl?: string
  hasTrial?: boolean
  isBookmarked?: boolean
}

interface ProductGridProps {
  selectedTags?: Set<string>;
}

const IconTwoColumns = () => (
  <svg width="20" height="20" viewBox="0 0 26 24" fill="none" stroke="currentColor" strokeWidth="2">
    {/* První sloupec vlevo */}
    <rect x="3" y="4" width="7" height="16" rx="2" />
    {/* Druhý sloupec posunutý víc doprava → +3px mezera */}
    <rect x="14" y="4" width="7" height="16" rx="2" />
  </svg>
);

const IconOneColumn = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="16" rx="2" />
  </svg>
);

export default function ProductGrid({ selectedTags }: ProductGridProps = {}) {
  const { data: session, status } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalProducts, setTotalProducts] = useState(0)
  const [savedProducts, setSavedProducts] = useState<Set<string>>(new Set())
  const [compactView, setCompactView] = useState(false)
  const PAGE_SIZE = 12

  const handleBookmarkChange = (productId: string, isBookmarked: boolean) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, isBookmarked }
        : product
    ))
    
    // Update saved products set
    if (isBookmarked) {
      setSavedProducts(prev => {
        const newSet = new Set(prev)
        newSet.add(productId)
        return newSet
      })
    } else {
      setSavedProducts(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  // Persist and restore user layout preference (mobile/desktop)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('homepage_compact_view')
      if (stored !== null) {
        setCompactView(stored === 'true')
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('homepage_compact_view', String(compactView))
    } catch {}
  }, [compactView])

  // Load saved products for authenticated users
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      const loadSavedProducts = async () => {
        try {
          const response = await fetch('/api/users/saved-products')
          if (response.ok) {
            const savedProductsData = await response.json()
            const savedProductIds = new Set<string>(
              savedProductsData.map((sp: any) => sp.productId as string)
            )
            setSavedProducts(savedProductIds)
            
            // Update existing products with bookmark status
            setProducts(prev => prev.map(product => ({
              ...product,
              isBookmarked: savedProductIds.has(product.id)
            })))
          }
        } catch (error) {
          console.error('Error loading saved products:', error)
        }
      }
      
      loadSavedProducts()
    }
  }, [status, session])

  useEffect(() => {
    let isMounted = true
    
    const loadProducts = async () => {
      try {
        const response = await fetch(`${window.location.origin}/api/products?page=1&pageSize=${PAGE_SIZE}&forHomepage=true`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (isMounted && data.products && Array.isArray(data.products)) {
          const simpleProducts = data.products.map((product: any) => {
            // Parse tags from JSON string if needed
            let tags = [];
            try {
              if (typeof product.tags === 'string') {
                tags = JSON.parse(product.tags);
              } else if (Array.isArray(product.tags)) {
                tags = product.tags;
              }
            } catch (e) {
              console.warn('Failed to parse tags for product:', product.name, product.id, 'raw tags:', product.tags, e);
              tags = [];
            }
            
            // Tags parsed successfully

            return {
              id: product.id,
              name: product.name,
              description: product.description || '',
              price: product.price || 0,
              category: product.category || '',
              imageUrl: product.imageUrl,
              tags: tags,
              externalUrl: product.externalUrl,
              hasTrial: Boolean(product.hasTrial),
              isBookmarked: false // Will be updated after loading saved products
            };
          })
          
          setProducts(simpleProducts)
          setCurrentPage(1)
          setHasMore(data.pagination.totalPages > 1)
          setTotalProducts(data.pagination.totalProducts || 0)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load products')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadProducts()
    
    return () => {
      isMounted = false
    }
  }, [])

  const loadMoreProducts = async () => {
    if (!hasMore || loadingMore) return

    try {
      setLoadingMore(true)
      setError(null)
      
      const nextPage = currentPage + 1
      const response = await fetch(`/api/products?page=${nextPage}&pageSize=${PAGE_SIZE}&forHomepage=true`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.products && Array.isArray(data.products)) {
        const newProducts = data.products.map((product: any) => {
          // Parse tags from JSON string if needed
          let tags = [];
          try {
            if (typeof product.tags === 'string') {
              tags = JSON.parse(product.tags);
            } else if (Array.isArray(product.tags)) {
              tags = product.tags;
            }
          } catch (e) {
            console.warn('Failed to parse tags for product:', product.name, product.id, 'raw tags:', product.tags, e);
            tags = [];
          }
          
          // Tags parsed successfully for loadMore

          return {
            id: product.id,
            name: product.name,
            description: product.description || '',
            price: product.price || 0,
            category: product.category || '',
            imageUrl: product.imageUrl,
            tags: tags,
            externalUrl: product.externalUrl,
            hasTrial: Boolean(product.hasTrial),
            isBookmarked: savedProducts.has(product.id)
          };
        })
        
        setProducts(prev => [...prev, ...newProducts])
        setCurrentPage(nextPage)
        setHasMore(nextPage < data.pagination.totalPages)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more products')
    } finally {
      setLoadingMore(false)
    }
  }

  // Filtrování podle tagů
  const filteredProducts = selectedTags && selectedTags.size > 0 
    ? products.filter(product => 
        product.tags?.some(tag => selectedTags.has(tag))
      )
    : products

  // Skeleton loader pro lepší UX během prvního načítání
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        
        <div className={`grid gap-4 md:gap-6 items-stretch min-w-0 ${
          compactView
            ? 'grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            : 'grid-cols-1 xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4'
        }`}>
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden min-w-0">
              <div className="aspect-[16/9] bg-gray-200 animate-pulse"></div>
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-20">
      {/* Header: title vlevo + layout toggle vpravo */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">AI Tools</h2>
        <div className="flex space-x-2 border rounded p-1 bg-white">
          <button
            onPointerUp={() => setCompactView(true)}
            onClick={() => setCompactView(true)}
            onTouchStart={(e) => {
              e.preventDefault()
              setCompactView(true)
            }}
            className={`p-2 rounded transition ${
              compactView
                ? 'bg-gray-100 text-gray-800'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            title="Compact View (více karet v řadě na desktopu; mobil 1 v řadě)"
            aria-pressed={compactView}
            style={{ touchAction: 'manipulation' }}
            role="button"
            tabIndex={0}
          >
            <IconTwoColumns />
          </button>
          <button
            onPointerUp={() => setCompactView(false)}
            onClick={() => setCompactView(false)}
            onTouchStart={(e) => {
              e.preventDefault()
              setCompactView(false)
            }}
            className={`p-2 rounded transition ${
              !compactView
                ? 'bg-gray-100 text-gray-800'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            title="Large View (větší karty; mobil 1 v řadě, desktop 3–4)"
            aria-pressed={!compactView}
            style={{ touchAction: 'manipulation' }}
            role="button"
            tabIndex={0}
          >
            <IconOneColumn />
          </button>
        </div>
      </div>

      {/* Optimalizovaný CSS Grid s responsive breakpointy */}
      <div className={`grid gap-4 md:gap-6 items-stretch min-w-0 ${
        compactView
          ? 'grid-compact-mobile grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          : 'grid-cols-1 xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4'
      }`}>
        {filteredProducts.map((product, index) => {
          // Optimalizace pro first meaningful paint - první 6 produktů s priority loading
          const isPriority = index < 6;
          
          // Responsive sizes prop odpovídající CSS Grid breakpointům
          const sizes = compactView 
            ? "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            : "(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw";
          
          return (
            <div key={product.id} className="min-w-0">
              <ProductCard
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                imageUrl={product.imageUrl}
                tags={product.tags}
                externalUrl={product.externalUrl}
                hasTrial={product.hasTrial}
                isBookmarked={product.isBookmarked}
                onBookmarkChange={handleBookmarkChange}
                priority={isPriority}
                sizes={sizes}
              />
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          {selectedTags && selectedTags.size > 0 
            ? 'No products match the selected filters.'
            : 'No products to display.'
          }
        </div>
      )}

      {/* Load more button */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMoreProducts}
            disabled={loadingMore}
            className={`px-6 py-3 bg-gradient-primary text-white rounded-full font-medium transition-all ${
              loadingMore ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:scale-105'
            }`}
          >
            {loadingMore ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              `Load More (${products.length} of ${totalProducts} products)`
            )}
          </button>
        </div>
      )}
    </div>
  )
} 