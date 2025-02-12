'use client'

import React, { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import CompareBar from './CompareBar'
import { useCompareStore } from '../store/compareStore'

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
}

interface ProductGridProps {
  selectedTags: Set<string>
  showCompare?: boolean
}

export default function ProductGrid({ selectedTags, showCompare = false }: ProductGridProps) {
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
          const processedData = data.map((product: any) => ({
            ...product,
            tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags,
            advantages: typeof product.advantages === 'string' ? JSON.parse(product.advantages) : product.advantages,
            disadvantages: typeof product.disadvantages === 'string' ? JSON.parse(product.disadvantages) : product.disadvantages,
            pricingInfo: typeof product.pricingInfo === 'string' ? JSON.parse(product.pricingInfo) : product.pricingInfo
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
  }, [])

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 3, products.length))
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
      <div className="flex items-center justify-end gap-2 md:hidden mb-4">
        <button
          onClick={() => setIsCompactView(false)}
          className={`p-2 text-sm rounded-lg transition-colors ${
            !isCompactView 
              ? 'bg-purple-100 text-purple-700' 
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </button>
        <button
          onClick={() => setIsCompactView(true)}
          className={`p-2 text-sm rounded-lg transition-colors ${
            isCompactView 
              ? 'bg-purple-100 text-purple-700' 
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        </button>
      </div>

      <div className={`grid gap-3 md:gap-4 ${
        isCompactView 
          ? 'grid-cols-2' 
          : 'grid-cols-1'
      } sm:grid-cols-2 lg:grid-cols-3`}>
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
            isSelected={showCompare && selectedProducts.some(p => p.id === product.id)}
            onCompareToggle={showCompare ? () => {
              if (selectedProducts.some(p => p.id === product.id)) {
                removeProduct(product.id)
              } else {
                addProduct(product)
              }
            } : undefined}
          />
        ))}
      </div>
      
      {hasMoreProducts && (
        <div className="text-center mt-6">
          <button 
            onClick={handleLoadMore}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-purple-600/90 hover:text-purple-700/90 hover:bg-purple-50 rounded-md transition-colors"
          >
            Načíst další
          </button>
        </div>
      )}

      {showCompare && selectedProducts.length > 0 && (
        <CompareBar 
          selectedCount={selectedProducts.length}
          onCompare={handleCompare}
          onClear={clearProducts}
        />
      )}
    </div>
  )
} 