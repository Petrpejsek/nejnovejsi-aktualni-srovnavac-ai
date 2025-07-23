'use client'

import React, { useState, useMemo, useEffect } from 'react'
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
  createdAt: Date
  updatedAt: Date
}

interface Category {
  name: string
  count: number
}

interface ProductsClientProps {
  initialProducts: Product[]
  initialTotalProducts: number
  categories: Category[]
}

const ProductCard: React.FC<{ product: Product; onVisit: (url: string | null) => void }> = ({ product, onVisit }) => {
  const tags = product.tags ? (typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags) : []

  return (
    <div className="group bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200 overflow-hidden h-full flex flex-col">
      {/* Product Image */}
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/screenshots/default-product.png'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
            <span className="text-4xl">🤖</span>
          </div>
        )}
        
        {product.hasTrial && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
              Free Trial
            </span>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col justify-between flex-grow">
        {/* Content */}
        <div>
          <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
            {product.name}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {product.description || 'No description available'}
          </p>
          
          {/* Category */}
          {product.category && (
            <div className="mb-3">
              <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-md">
                {product.category}
              </span>
            </div>
          )}

          {/* Tags */}
          {Array.isArray(tags) && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {tags.slice(0, 3).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Price */}
          <div className="mb-4">
            {product.price > 0 ? (
              <span className="text-lg font-semibold text-gray-900">${product.price}</span>
            ) : (
              <span className="text-lg font-semibold text-green-600">Free</span>
            )}
          </div>
        </div>
        
        {/* Button at bottom */}
        <div className="mt-auto">
          <button
            onClick={() => onVisit(product.externalUrl)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {product.hasTrial ? 'Try for Free' : 'View Tool'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProductsClient({ initialProducts, initialTotalProducts, categories }: ProductsClientProps) {
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasLoadedAll, setHasLoadedAll] = useState(false)

  const ITEMS_PER_PAGE = 24

  // Load more products when needed
  const loadMoreProducts = async () => {
    if (loading || hasLoadedAll) return

    setLoading(true)
    try {
      const response = await fetch(`/api/products?page=${Math.ceil(allProducts.length / 24) + 1}&pageSize=24`)
      if (response.ok) {
        const data = await response.json()
        if (data.products && data.products.length > 0) {
          setAllProducts(prev => [...prev, ...data.products])
          if (data.products.length < 24) {
            setHasLoadedAll(true)
          }
        } else {
          setHasLoadedAll(true)
        }
      }
    } catch (error) {
      console.error('Error loading more products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = allProducts

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(term) ||
        (product.description && product.description.toLowerCase().includes(term)) ||
        (product.category && product.category.toLowerCase().includes(term)) ||
        (product.tags && product.tags.toLowerCase().includes(term))
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Sort products
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [allProducts, searchTerm, selectedCategory, sortBy])

  // Paginated products
  const paginatedProducts = filteredProducts.slice(0, currentPage * ITEMS_PER_PAGE)

  const handleVisit = (url: string | null) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleLoadMore = () => {
    if (paginatedProducts.length < filteredProducts.length) {
      setCurrentPage(prev => prev + 1)
    } else if (!hasLoadedAll && allProducts.length < initialTotalProducts) {
      loadMoreProducts()
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search AI tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.name} value={category.name}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="text-gray-600">
          Showing {paginatedProducts.length} of {filteredProducts.length} tools
          {searchTerm && ` for "${searchTerm}"`}
          {selectedCategory !== 'all' && ` in ${selectedCategory}`}
        </div>
      </div>

      {/* Products Grid */}
      {paginatedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onVisit={handleVisit}
              />
            ))}
          </div>

          {/* Load More Button */}
          {(paginatedProducts.length < filteredProducts.length || (!hasLoadedAll && allProducts.length < initialTotalProducts)) && (
            <div className="text-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  `Load More Tools (${Math.min(filteredProducts.length - paginatedProducts.length, ITEMS_PER_PAGE)} more)`
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        /* No Results */
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No tools found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedCategory('all')
              setSortBy('name')
            }}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
} 