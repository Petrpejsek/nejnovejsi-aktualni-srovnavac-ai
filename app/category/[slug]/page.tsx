'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  imageUrl: string | null
  tags: string | null
  externalUrl: string | null
  hasTrial: boolean
}

export default function CategoryPage() {
  const params = useParams()
  const category = decodeURIComponent(params.slug as string)
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  
  const PAGE_SIZE = 12

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/products?category=${encodeURIComponent(category)}&page=${currentPage}&pageSize=${PAGE_SIZE}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products)
          setTotalPages(data.pagination.totalPages)
          setTotalProducts(data.pagination.totalProducts)
        } else {
          setError('Invalid data structure')
        }
      } catch (err) {
        console.error('Error loading products:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [category, currentPage])

  const handleVisit = (url: string | null) => {
    if (url) {
      // Použijeme dočasný HTML link místo window.open() pro lepší kompatibilitu
      const tempLink = document.createElement('a')
      tempLink.href = url
      tempLink.target = '_blank'
      tempLink.rel = 'noopener,noreferrer'
      document.body.appendChild(tempLink)
      tempLink.click()
      document.body.removeChild(tempLink)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <span className="ml-3">Loading products...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-red-600 mb-4">Loading Error</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Link
              href="/"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Homepage
            </Link>
            
            <h1 className="text-4xl font-semibold mb-4 bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
              {category}
            </h1>
            <p className="text-gray-600 text-lg">
              Found {totalProducts} {totalProducts === 1 ? 'product' : 'products'} in this category
            </p>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                No Products Found
              </h2>
              <p className="text-gray-600 mb-8">
                There are currently no products in the "{category}" category.
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Browse All Products
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-[20px] shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group"
                  >
                    {/* Product Image */}
                    <div className="relative h-48 bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={200}
                          height={120}
                          className="object-contain max-h-32"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-medium text-gray-800 mb-1 group-hover:text-purple-600 transition-colors">
                            {product.name}
                          </h3>
                          {product.category && (
                            <span className="text-sm text-gray-500">{product.category}</span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-purple-600 font-medium">
                            {product.hasTrial ? '$0' : (typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : 'N/A')}
                          </p>
                          {product.hasTrial && (
                            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                              Free Trial
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {product.description || 'Description not available'}
                      </p>
                      
                      {/* Tags */}
                      {product.tags && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags || [])?.slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Action Button */}
                      <button
                        onClick={() => handleVisit(product.externalUrl)}
                        className="w-full px-4 py-3 text-base font-medium rounded-[14px] bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600 transition-all"
                      >
                        {product.hasTrial ? 'Try for Free' : 'Try Now'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
} 