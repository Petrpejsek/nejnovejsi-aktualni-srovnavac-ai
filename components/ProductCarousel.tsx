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

interface ProductCarouselProps {
  title?: string
  subtitle?: string
  maxProducts?: number
  className?: string
}

export default function ProductCarousel({ 
  title = "🚀 Recommended AI Tools", 
  subtitle = "Discover tools that can help you achieve your goals",
  maxProducts = 6,
  className = "" 
}: ProductCarouselProps) {
  const { data: session, status } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savedProducts, setSavedProducts] = useState<Set<string>>(new Set())

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

  // Load products using same algorithm as homepage
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/products?page=1&pageSize=${maxProducts}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.products && Array.isArray(data.products)) {
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
          
          setProducts(simpleProducts)
          console.log(`🎯 ProductCarousel: Loaded ${simpleProducts.length} products using credit+random algorithm`)
        } else {
          console.error('ProductCarousel: Invalid data structure received', data)
          setError('Invalid data structure received from server')
        }
      } catch (error) {
        console.error('ProductCarousel: Error loading products:', error)
        setError('Failed to load products. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [maxProducts, savedProducts])

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-8 ${className}`}>
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">{subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-gray-100 rounded-xl h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-8 ${className}`}>
        <div className="text-center text-red-600">
          <p>⚠️ {error}</p>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return null // Don't render anything if no products
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-8 ${className}`}>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
      </div>
      
      {/* Desktop: 3 columns, Mobile: 1-2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            isBookmarked={product.isBookmarked}
            onBookmarkChange={handleBookmarkChange}
          />
        ))}
      </div>
      
      {/* Call to action */}
      <div className="text-center mt-8">
        <a 
          href="/" 
          className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <span>View All AI Tools</span>
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  )
}