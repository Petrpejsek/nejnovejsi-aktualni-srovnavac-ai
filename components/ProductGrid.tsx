'use client'

import React, { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import CompareBar from './CompareBar'
import { useCompareStore } from '../store/compareStore'
import { useProductStore } from '../store/productStore'

// Konstanta pro zapnutí/vypnutí funkcí srovnávání
const COMPARE_FEATURE_ENABLED = false;

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
  externalUrl?: string
  videoUrls?: string[]
  hasTrial?: boolean
}

interface Pagination {
  page: number
  pageSize: number
  totalProducts: number
  totalPages: number
}

interface ProductGridProps {
  selectedTags?: Set<string>;
}

export default function ProductGrid({ selectedTags: propSelectedTags }: ProductGridProps = {}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const { selectedProducts, clearProducts } = useCompareStore()
  const storeValues = useProductStore()
  
  // Použijeme buď prop selectedTags nebo hodnotu ze store
  const selectedTags = propSelectedTags !== undefined ? propSelectedTags : storeValues.selectedTags
  const { products, pagination, loading, error, fetchProducts } = storeValues

  useEffect(() => {
    fetchProducts(1)
  }, [fetchProducts])

  const handleLoadMore = async () => {
    if (currentPage < pagination.totalPages && !loadingMore) {
      setLoadingMore(true)
      try {
        await fetchProducts(currentPage + 1)
        setCurrentPage(prev => prev + 1)
      } catch (error) {
        console.error('Chyba při načítání dalších produktů:', error)
      } finally {
        setLoadingMore(false)
      }
    }
  }

  const handleCompare = () => {
    // Logika pro srovnání je nyní v CompareBar komponentě
  }

  // Filtrování produktů podle vybraných tagů
  const filteredProducts = products.filter(product => {
    if (selectedTags.size === 0) return true
    const productTags = product.tags || []
    return Array.from(selectedTags).some(tag => productTags.includes(tag))
  })

  const hasMorePages = currentPage < pagination.totalPages

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => fetchProducts(1)}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Zkusit znovu
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-20">
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            description={product.description || ''}
            price={product.price}
            imageUrl={product.imageUrl}
            tags={product.tags}
            externalUrl={product.externalUrl}
            hasTrial={product.hasTrial}
          />
        ))}
      </div>
      
      {loadingMore && (
        <div className="flex justify-center mt-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      )}
      
      {hasMorePages && !loadingMore && (
        <div className="text-center mt-6">
          <button 
            onClick={handleLoadMore}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-purple-600/90 hover:text-purple-700/90 hover:bg-purple-50 rounded-md transition-colors"
          >
            Načíst další
          </button>
        </div>
      )}

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          Žádné produkty neodpovídají vybraným filtrům.
        </div>
      )}

      {/* CompareBar - skrytý */}
      {COMPARE_FEATURE_ENABLED && (
        <CompareBar 
          selectedCount={selectedProducts.length}
          onCompare={handleCompare}
          onClear={clearProducts}
        />
      )}
    </div>
  )
} 