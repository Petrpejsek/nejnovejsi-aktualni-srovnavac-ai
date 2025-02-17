'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useCompareStore } from '../../store/compareStore'
import Link from 'next/link'

interface Product {
  id: string
  title: string
  description: string
  imageUrl: string
  price: string
  rating: number
  externalUrl: string
  category?: string
  tags?: string[]
  advantages?: string[]
  disadvantages?: string[]
  detailInfo?: string
  pricingInfo?: {
    basic?: string
    pro?: string
    enterprise?: string
  }
  videoUrls?: string[]
  hasTrial?: boolean
}

type AICategory = 'text' | 'image' | 'code' | 'audio' | 'other'
type FeatureSupport = 'full' | 'partial' | 'none'

interface CategoryItem {
  id: AICategory
  name: string
}

const AI_CATEGORIES: CategoryItem[] = [
  { id: 'text', name: 'Text AI' },
  { id: 'image', name: 'Image AI' },
  { id: 'code', name: 'Code AI' },
  { id: 'audio', name: 'Audio AI' },
  { id: 'other', name: 'Other' }
]

const getProductCategory = (product: Product): AICategory => {
  if (!product.category) return 'other'
  
  switch (product.category.toLowerCase()) {
    case 'text-generation':
    case 'text':
      return 'text'
    case 'image-generation':
    case 'image':
      return 'image'
    case 'code-generation':
    case 'code':
      return 'code'
    case 'audio-generation':
    case 'audio':
      return 'audio'
    default:
      return 'other'
  }
}

const getFeatureSupport = (product: Product, feature: string): FeatureSupport => {
  // Implementace podle potřeby
  return 'none'
}

export default function ComparisonPage() {
  const { selectedProducts } = useCompareStore()
  const [products, setProducts] = useState<Product[]>([])
  const [activeCategory, setActiveCategory] = useState<AICategory | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (response.ok) {
          const data = await response.json() as Product[]
          setProducts(selectedProducts)
        }
      } catch (error) {
        console.error('Chyba při načítání produktů:', error)
      }
    }

    fetchProducts()
  }, [selectedProducts])

  const filteredProducts = useMemo(() => {
    if (!activeCategory) return products
    return products.filter(p => getProductCategory(p) === activeCategory)
  }, [products, activeCategory])

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-semibold mb-8 bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
              Compare AI Tools
            </h1>
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                No Products Selected
              </h2>
              <p className="text-gray-600 mb-8">
                Please select some products to compare first.
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-semibold mb-8 bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
            Compare AI Tools
          </h1>

          <div className="space-y-8">
            <div className="flex flex-wrap gap-3 mb-8">
              {AI_CATEGORIES.map((category) => {
                const count = products.filter(p => getProductCategory(p) === category.id).length
                if (count === 0) return null
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium transition-all
                      ${activeCategory === category.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                      }
                    `}
                  >
                    {category.name} ({count})
                  </button>
                )
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="relative aspect-video">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    {product.hasTrial && (
                      <div className="absolute top-2 right-2 bg-purple-100 text-purple-600 text-xs font-medium px-2 py-1 rounded-full">
                        Free Trial
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {product.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {product.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {product.tags?.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-purple-600">
                          {product.price}
                        </span>
                        <Link
                          href={product.externalUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Visit Website
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 