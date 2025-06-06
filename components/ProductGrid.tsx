'use client'

import React, { useState, useEffect } from 'react'
import ProductCard from './ProductCard'

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

export default function ProductGrid({ selectedTags }: ProductGridProps = {}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalProducts, setTotalProducts] = useState(0)
  const PAGE_SIZE = 6

  const handleBookmarkChange = (productId: string, isBookmarked: boolean) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, isBookmarked }
        : product
    ))
  }

  useEffect(() => {
    let isMounted = true
    
    const loadProducts = async () => {
      try {
        const response = await fetch(`/api/products?page=1&pageSize=${PAGE_SIZE}`)
        
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
              isBookmarked: false // Default to false, would be loaded from user data
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
      const response = await fetch(`/api/products?page=${nextPage}&pageSize=${PAGE_SIZE}`)
      
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
            isBookmarked: false // Default to false, would be loaded from user data
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3">Loading products...</span>
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
      {/* Použití CSS Grid s align-items-stretch pro rovnoměrné výšky */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
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
          />
        ))}
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