'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BookmarkIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkFilledIcon } from '@heroicons/react/24/solid'
import { useSession } from 'next-auth/react'
import { trackProductClick } from '../../../lib/utils'
import Modal from '../../../components/Modal'
import RegisterForm from '../../../components/RegisterForm'

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
  hasCredit?: boolean
  isActive?: boolean
}

interface Props {
  slug: string
}

// Lokální CategoryProductCard komponenta jen pro category stránky
interface CategoryProductCardProps {
  product: Product
  onVisit: (product: Product) => void
  isBookmarked?: boolean
  onBookmarkChange?: (productId: string, isBookmarked: boolean) => void
}

// Toast notification helper
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const toast = document.createElement('div')
  toast.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
    type === 'success' 
      ? 'bg-green-500 text-white' 
      : 'bg-red-500 text-white'
  }`
  toast.textContent = message
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.style.transform = 'translateX(0)'
  }, 10)
  setTimeout(() => {
    toast.style.transform = 'translateX(400px)'
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast)
      }
    }, 300)
  }, 3000)
}

const CategoryProductCard: React.FC<CategoryProductCardProps> = ({ product, onVisit, isBookmarked = false, onBookmarkChange }) => {
  const { data: session } = useSession()
  const [localBookmarked, setLocalBookmarked] = useState(isBookmarked)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showSignUpModal, setShowSignUpModal] = useState(false)

  useEffect(() => {
    setLocalBookmarked(isBookmarked)
  }, [isBookmarked])

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!session) {
      setShowSignUpModal(true)
      return
    }
    setIsAnimating(true)
    const newBookmarkedState = !localBookmarked
    setLocalBookmarked(newBookmarkedState)
    showToast(newBookmarkedState ? 'Saved!' : 'Removed!', 'success')
    if (onBookmarkChange) {
      onBookmarkChange(product.id, newBookmarkedState)
    }

    try {
      let response: Response
      if (newBookmarkedState) {
        response = await fetch('/api/users/saved-products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            productId: product.id,
            productName: product.name,
            category: product.category,
            imageUrl: product.imageUrl,
            price: product.price
          }),
        })
      } else {
        response = await fetch(`/api/users/saved-products?productId=${encodeURIComponent(product.id)}`, {
          method: 'DELETE'
        })
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      setLocalBookmarked(!newBookmarkedState)
      if (onBookmarkChange) {
        onBookmarkChange(product.id, !newBookmarkedState)
      }
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="aspect-video relative bg-gray-50">
        {product.imageUrl ? (
          <Image
            src={`${product.imageUrl}${product.imageUrl?.includes('?') ? '&' : '?'}v=${encodeURIComponent((product as any).updatedAt || '')}`}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {product.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.price === 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {product.price === 0 ? 'Free' : `$${product.price}`}
          </span>
        </div>
        {product.hasTrial && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Free Trial
            </span>
          </div>
        )}
        <button
          onClick={handleBookmark}
          className={`absolute top-2 left-2 w-8 h-8 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 hover:scale-110 ${
            isAnimating ? 'animate-pulse transform -translate-y-1' : ''
          }`}
        >
          {localBookmarked ? (
            <BookmarkFilledIcon className="w-4 h-4 text-purple-600" />
          ) : (
            <BookmarkIcon className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      <div className="p-6 flex flex-col justify-between flex-grow">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {product.description || 'No description available'}
          </p>
          {product.tags && (
            <div className="flex flex-wrap gap-1 mb-4">
              {(() => {
                if (!product.tags) return []
                if (typeof product.tags === 'string') {
                  const trimmed = product.tags.trim()
                  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
                    try {
                      return JSON.parse(trimmed)
                    } catch {
                      return []
                    }
                  }
                  return trimmed.split(',').map(t => t.trim())
                }
                return Array.isArray(product.tags) ? product.tags : []
              })()?.slice(0, 3).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="mt-auto">
          <button
            onClick={() => onVisit(product)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            View Tool
          </button>
        </div>
      </div>

      <Modal 
        isOpen={showSignUpModal} 
        onClose={() => setShowSignUpModal(false)}
        title="Save to Favorites"
      >
        <div className="mb-4">
          <p className="text-gray-600 mb-4">
            Create an account to save your favorite tools and access them anytime.
          </p>
        </div>
        <RegisterForm 
          onSuccess={() => {
            setShowSignUpModal(false)
            setLocalBookmarked(true)
            if (onBookmarkChange) {
              onBookmarkChange(product.id, true)
            }
          }}
        />
      </Modal>
    </div>
  )
}

function slugToName(slug: string): string {
  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

export default function ClientCategoryPage({ slug }: Props) {
  const { data: session } = useSession()
  const categoryName = slugToName(slug)

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [savedProducts, setSavedProducts] = useState<Set<string>>(new Set())

  const PAGE_SIZE = 12

  useEffect(() => {
    const loadSavedProducts = async () => {
      if (!session) {
        setSavedProducts(new Set())
        return
      }
      try {
        const response = await fetch('/api/users/saved-products')
        if (response.ok) {
          const data = await response.json()
          const savedProductIds = new Set<string>(data.map((product: any) => product.id))
          setSavedProducts(savedProductIds)
        }
      } catch {}
    }
    loadSavedProducts()
  }, [session])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        let allProducts: Product[] = []
        // Use slug-based filtering on API to reliably include both primary and additional categories
        const response = await fetch(`/api/products?categorySlug=${encodeURIComponent(slug)}&page=1&pageSize=100&forHomepage=true`)
        if (response.ok) {
          const data = await response.json()
          if (data.products && data.products.length > 0) {
            allProducts = data.products
          }
        }
        const uniqueProducts = allProducts.filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id)
        )
        const startIndex = (currentPage - 1) * PAGE_SIZE
        const endIndex = startIndex + PAGE_SIZE
        const paginatedProducts = uniqueProducts.slice(startIndex, endIndex)
        setProducts(paginatedProducts)
        setTotalPages(Math.ceil(uniqueProducts.length / PAGE_SIZE))
        setTotalProducts(uniqueProducts.length)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setProducts([])
        setTotalPages(1)
        setTotalProducts(0)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [slug, categoryName, currentPage])

  const handleVisit = (product: Product) => {
    trackProductClick({
      id: product.id,
      name: product.name,
      externalUrl: product.externalUrl,
      category: product.category,
      imageUrl: product.imageUrl,
      price: product.price,
      tags: product.tags
    })
  }

  const handleBookmarkChange = (productId: string, isBookmarked: boolean) => {
    setSavedProducts(prev => {
      const newSavedProducts = new Set(prev)
      if (isBookmarked) {
        newSavedProducts.add(productId)
      } else {
        newSavedProducts.delete(productId)
      }
      return newSavedProducts
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <nav className="flex mb-6" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/" className="text-gray-500 hover:text-gray-700">
                    Home
                  </Link>
                </li>
                <li>
                  <span className="text-gray-400">/</span>
                </li>
                <li>
                  <span className="text-gray-500">Categories</span>
                </li>
                <li>
                  <span className="text-gray-400">/</span>
                </li>
                <li>
                  <span className="text-gray-900 font-medium">{categoryName}</span>
                </li>
              </ol>
            </nav>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Best {categoryName} AI Tools
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl">
              Discover top {categoryName.toLowerCase()} tools and software.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-[16/9] bg-gray-200 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
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

  // Compute strength: strong when count >= 3
  const isStrong = totalProducts >= 3

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <nav className="flex mb-6" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/" className="text-gray-500 hover:text-gray-700">
                    Home
                  </Link>
                </li>
                <li>
                  <span className="text-gray-400">/</span>
                </li>
                <li>
                  <span className="text-gray-500">Categories</span>
                </li>
                <li>
                  <span className="text-gray-400">/</span>
                </li>
                <li>
                  <span className="text-gray-900 font-medium">{categoryName}</span>
                </li>
              </ol>
            </nav>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {isStrong ? (
                <>Best {categoryName} AI Tools</>
              ) : (
                <>{categoryName}</>
              )}
            </h1>
            {isStrong ? (
              <p className="text-xl text-gray-600 max-w-3xl">
                Discover top {categoryName.toLowerCase()} tools and software.
              </p>
            ) : null}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {products.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {totalProducts} {categoryName} Tools
                </h2>
                <div className="text-sm text-gray-500">
                  Showing {products.length} results
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {products.map((product) => (
                  <CategoryProductCard
                    key={product.id}
                    product={product}
                    onVisit={handleVisit}
                    isBookmarked={savedProducts.has(product.id)}
                    onBookmarkChange={handleBookmarkChange}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mb-16">
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
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No tools found</h3>
              <p className="text-gray-600 mb-6">
                We don't have any {categoryName.toLowerCase()} tools in our database yet.
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Browse All Tools
              </Link>
            </div>
          )}

          {isStrong ? (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-12">
              <h2 className="text-3xl font-semibold text-gray-900 mb-6">
                Best {categoryName} AI Tools
              </h2>
              <div className="prose prose-gray max-w-none">
                <div className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
                  Explore the best {categoryName.toLowerCase()} tools available today. Compare features, pricing, and user reviews to find the right fit for your needs.
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </>
  )
}


