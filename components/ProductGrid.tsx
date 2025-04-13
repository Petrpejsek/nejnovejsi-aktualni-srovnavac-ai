'use client'

import React, { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import CompareBar from './CompareBar'
import { useCompareStore } from '../store/compareStore'

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

export default function ProductGrid({ selectedTags }: { selectedTags: Set<string> }) {
  const [products, setProducts] = useState<Product[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 30,
    totalProducts: 0,
    totalPages: 0
  })
  const [isCompactView, setIsCompactView] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const { selectedProducts, addProduct, removeProduct, clearProducts } = useCompareStore()

  const fetchProducts = async (page: number) => {
    try {
      const isFirstPage = page === 1
      if (isFirstPage) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      // Vytvoření URL s parametry
      const url = new URL('/api/products', window.location.origin)
      url.searchParams.set('page', page.toString())
      url.searchParams.set('pageSize', '30')
      
      const response = await fetch(url.toString())
      if (response.ok) {
        const data = await response.json()
        
        // Zpracování produktů
        const processedData = data.products.map((product: Product) => ({
          ...product,
          tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags || [],
          advantages: typeof product.advantages === 'string' ? JSON.parse(product.advantages) : product.advantages || [],
          disadvantages: typeof product.disadvantages === 'string' ? JSON.parse(product.disadvantages) : product.disadvantages || [],
          pricingInfo: typeof product.pricingInfo === 'string' ? JSON.parse(product.pricingInfo) : product.pricingInfo || {},
          videoUrls: typeof product.videoUrls === 'string' ? JSON.parse(product.videoUrls) : product.videoUrls || [],
          hasTrial: typeof product.hasTrial === 'boolean' ? product.hasTrial : false
        }))
        
        if (isFirstPage) {
          setProducts(processedData)
        } else {
          setProducts(prev => [...prev, ...processedData])
        }
        
        setPagination(data.pagination)
        setCurrentPage(data.pagination.page)
      }
    } catch (error) {
      console.error('Chyba při načítání produktů:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchProducts(1)
  }, [])

  const handleLoadMore = () => {
    if (currentPage < pagination.totalPages) {
      fetchProducts(currentPage + 1)
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