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

export default function ProductGrid({ selectedTags }: { selectedTags: Set<string> }) {
  const [products, setProducts] = useState<Product[]>([])
  const [visibleCount, setVisibleCount] = useState(6)
  const [isCompactView, setIsCompactView] = useState(false)
  const [loading, setLoading] = useState(true)
  const { selectedProducts, addProduct, removeProduct, clearProducts } = useCompareStore()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (response.ok) {
          const data = await response.json()
          // Převedeme stringy JSON zpět na objekty
          const processedData = data.map((product: Product) => ({
            ...product,
            tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags || [],
            advantages: typeof product.advantages === 'string' ? JSON.parse(product.advantages) : product.advantages || [],
            disadvantages: typeof product.disadvantages === 'string' ? JSON.parse(product.disadvantages) : product.disadvantages || [],
            pricingInfo: typeof product.pricingInfo === 'string' ? JSON.parse(product.pricingInfo) : product.pricingInfo || {},
            videoUrls: typeof product.videoUrls === 'string' ? JSON.parse(product.videoUrls) : product.videoUrls || [],
            hasTrial: typeof product.hasTrial === 'boolean' ? product.hasTrial : false
          }))
          console.log('Zpracovaná data:', processedData)
          setProducts(processedData)
        }
      } catch (error) {
        console.error('Chyba při načítání produktů:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 6, products.length))
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

  const visibleProducts = filteredProducts.slice(0, visibleCount)
  const hasMoreProducts = visibleCount < filteredProducts.length

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-20">
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProducts.map((product) => (
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
      
      {hasMoreProducts && (
        <div className="text-center mt-6">
          <button 
            onClick={handleLoadMore}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-purple-600/90 hover:text-purple-700/90 hover:bg-purple-50 rounded-md transition-colors"
          >
            Load More
          </button>
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