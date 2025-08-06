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

interface SidebarProductsProps {
  className?: string
}

export default function SidebarProducts({ className = "" }: SidebarProductsProps) {
  const { data: session, status } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savedProducts, setSavedProducts] = useState<Set<string>>(new Set())
  const [showMore, setShowMore] = useState(false)

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

  // Load products for sidebar (smaller number)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/products?page=1&pageSize=12`, {
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
          console.log(`📋 SidebarProducts: Loaded ${simpleProducts.length} products using credit+random algorithm`)
        } else {
          console.error('SidebarProducts: Invalid data structure received', data)
          setError('Invalid data structure received from server')
        }
      } catch (error) {
        console.error('SidebarProducts: Error loading products:', error)
        setError('Failed to load products. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [savedProducts])

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 ${className}`}>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">🔥 Top AI Tools</h3>
          <p className="text-gray-600 text-sm">Hand-picked recommendations</p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-gray-100 rounded-lg h-32 animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 ${className}`}>
        <div className="text-center text-red-600 text-sm">
          <p>⚠️ {error}</p>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return null // Don't render anything if no products
  }

  const displayProducts = showMore ? products.slice(0, 8) : products.slice(0, 4)

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-2">🔥 Top AI Tools</h3>
        <p className="text-gray-600 text-sm">Hand-picked recommendations</p>
      </div>
      
      {/* Product List */}
      <div className="p-4 space-y-4">
        {displayProducts.map((product) => (
          <div key={product.id} className="transform scale-95 origin-top">
            <ProductCard
              {...product}
              isBookmarked={product.isBookmarked}
              onBookmarkChange={handleBookmarkChange}
            />
          </div>
        ))}
      </div>
      
      {/* Show More/Less */}
      {products.length > 4 && (
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => setShowMore(!showMore)}
            className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
          >
            {showMore ? '▲ Show Less' : '▼ Show More'}
          </button>
        </div>
      )}
      
      {/* Footer CTA */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
        <a 
          href="/products" 
          className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          View All Tools →
        </a>
      </div>
    </div>
  )
}