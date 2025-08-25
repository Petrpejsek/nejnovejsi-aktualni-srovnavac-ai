'use client'

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { getImageUrl } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  tags: string[]
  advantages: string[]
  disadvantages: string[]
  detailInfo: string
  pricingInfo: {
    basic: string
    pro: string
    enterprise: string
  }
  videoUrls: string[]
  externalUrl: string
  hasTrial: boolean
}

// SearchParamsHandler component to handle URL search params
// Wrap handler in Suspense boundary – Next 14 dev requires Suspense when using useSearchParams
function SearchParamsHandler({ onSearchTermChange }: { onSearchTermChange: (term: string) => void }) {
  const searchParams = useSearchParams()
  useEffect(() => {
    const searchQuery = searchParams?.get('search') || null
    if (searchQuery) {
      onSearchTermChange(searchQuery)
      const url = new URL(window.location.href)
      url.searchParams.delete('search')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams, onSearchTermChange])
  return null
}

// Stats interface
interface AdminStats {
  products: {
    total: number
  }
  pendingProductChanges: {
    count: number
  }
}

function ProductsAdminPageContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    imageUrl: '',
    tags: [],
    advantages: [],
    disadvantages: [],
    detailInfo: '',
    pricingInfo: { basic: '0', pro: '0', enterprise: '0' },
    videoUrls: [],
    externalUrl: '',
    hasTrial: false
  })
  
  // Search states
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  // Delete states
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load admin stats
  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await fetch('/api/admin-stats')
        if (response.ok) {
          const data = await response.json()
          setAdminStats({
            products: {
              total: data.products.total
            },
            pendingProductChanges: {
              count: data.pendingProductChanges.count
            }
          })
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error)
      }
    }

    fetchAdminStats()
  }, [])

  // Search function
  const performSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setProducts([])
      setHasSearched(false)
      return
    }

    setIsSearching(true)
    setHasSearched(true)
    
    try {
      const response = await fetch(`/api/admin-products/search?q=${encodeURIComponent(term)}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Search error:', error)
      setProducts([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Suggestions function
  const loadSuggestions = useCallback(async (term: string) => {
    if (!term.trim() || term.length < 2) {
      setSuggestions([])
      return
    }

    setLoadingSuggestions(true)
    try {
      const response = await fetch(`/api/admin-products/suggestions?q=${encodeURIComponent(term)}`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.products || [])
      }
    } catch (error) {
      setSuggestions([])
    } finally {
      setLoadingSuggestions(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => performSearch(searchTerm), 500)
    return () => clearTimeout(timer)
  }, [searchTerm, performSearch])

  // Debounced suggestions
  useEffect(() => {
    const timer = setTimeout(() => loadSuggestions(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm, loadSuggestions])

  // Delete product function
  const handleDeleteProduct = async (product: Product) => {
    setProductToDelete(product)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        const data = await response.json()
        setSuccessMessage(`✅ ${data.message}`)
        setError('')
        
        // Refresh search results
        if (searchTerm) {
          performSearch(searchTerm)
        }
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        const errorData = await response.json()
        setError(`❌ Chyba při mazání: ${errorData.error}`)
        setSuccessMessage('')
      }
    } catch (error) {
      console.error('Delete error:', error)
      setError('❌ Chyba při mazání produktu')
      setSuccessMessage('')
    } finally {
      setIsDeleting(false)
      setProductToDelete(null)
    }
  }

  const cancelDelete = () => {
    setProductToDelete(null)
  }

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <SearchParamsHandler onSearchTermChange={setSearchTerm} />
      </Suspense>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Správa produktů</h1>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
            {successMessage}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Pending Product Changes */}
          <div className={`bg-white p-6 rounded-lg shadow-sm border transition-all duration-200 cursor-pointer ${
            adminStats?.pendingProductChanges && adminStats.pendingProductChanges.count > 0 
              ? 'border-red-300 hover:border-red-400 hover:shadow-md bg-red-50' 
              : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
          }`}
          onClick={() => window.location.href = '/admin/pending-changes'}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">
                  {adminStats?.pendingProductChanges && adminStats.pendingProductChanges.count > 0 ? '🔄' : '✅'}
                </span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className={`text-sm font-medium truncate transition-colors ${
                    adminStats?.pendingProductChanges && adminStats.pendingProductChanges.count > 0 
                      ? 'text-red-700 hover:text-red-800' 
                      : 'text-gray-500 hover:text-purple-600'
                  }`}>
                    {adminStats?.pendingProductChanges && adminStats.pendingProductChanges.count > 0 
                      ? 'Čeká na schválení' 
                      : 'Pending Changes'}
                  </dt>
                  <dd className={`text-lg font-medium transition-colors ${
                    adminStats?.pendingProductChanges && adminStats.pendingProductChanges.count > 0 
                      ? 'text-red-900 hover:text-red-900' 
                      : 'text-gray-900 hover:text-purple-700'
                  }`}>
                    {adminStats?.pendingProductChanges ? adminStats.pendingProductChanges.count : '...'}
                    {adminStats?.pendingProductChanges && adminStats.pendingProductChanges.count > 0 && (
                      <span className="ml-2 text-sm">produktů</span>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 cursor-pointer"
          onClick={() => window.location.href = '/admin/products'}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📦</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate hover:text-purple-600 transition-colors">
                    Celkem produktů v DB
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 hover:text-purple-700 transition-colors">
                    {adminStats?.products ? adminStats.products.total : '...'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Vyhledat produkty
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Vyhledat podle názvu, kategorie, popisu nebo tagů..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
              {isSearching && (
                <div className="absolute right-3 top-2.5">
                  <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white shadow rounded-lg">
          {isSearching ? (
            <div className="p-8 text-center">
              <div className="text-gray-400">
                <svg className="animate-spin mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-lg text-gray-500">Vyhledávání produktů...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-6">
                {hasSearched ? (
                  <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ) : (
                  <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
              {hasSearched ? (
                <>
                  <p className="text-xl text-gray-500 mb-2">Žádné produkty nenalezeny</p>
                  <p className="text-gray-400 mb-4">
                    Pro hledaný termín "{searchTerm}" nebyly nalezeny žádné produkty
                  </p>
                  <p className="text-sm text-gray-400">
                    Zkuste změnit vyhledávací termín
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xl text-gray-500 mb-2">Vyhledejte produkty</p>
                  <p className="text-gray-400 mb-6">
                    Pro zobrazení produktů použijte vyhledávací pole výše.<br/>
                    Můžete hledat podle názvu, kategorie, popisu nebo tagů.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <button
                      onClick={() => document.querySelector<HTMLInputElement>('input[placeholder*="Vyhledat"]')?.focus()}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Začít vyhledávání
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Nalezené produkty ({products.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div 
                    key={product.id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => window.location.href = `/admin/products/${product.id}/edit`}
                  >
                    {product.imageUrl && (
                      <img 
                        src={getImageUrl(product.imageUrl)} 
                        alt={product.name}
                        className="w-full h-32 object-cover rounded mb-3"
                        onError={(e)=>{(e.currentTarget as HTMLImageElement).src = '/img/placeholder.svg'}}
                      />
                    )}
                    <h4 className="font-medium text-gray-900 mb-2">{product.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                    <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-lg font-bold text-purple-600">${product.price}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            window.location.href = `/admin/products/${product.id}/edit`
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                        >
                          ✏️ Upravit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteProduct(product)
                          }}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                        >
                          🗑️ Smazat
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              Potvrdit smazání produktu
            </h3>
            
            <p className="text-sm text-gray-500 text-center mb-2">
              Opravdu chcete smazat tento produkt?
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                {productToDelete.imageUrl && (
                  <img 
                    src={productToDelete.imageUrl} 
                    alt={productToDelete.name}
                    className="w-12 h-12 object-cover rounded mr-3"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900">{productToDelete.name}</p>
                  <p className="text-sm text-gray-600">{productToDelete.category}</p>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-red-600 text-center mb-6">
              ⚠️ Tato akce je nevratná! Produkt bude trvale smazán z databáze.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Zrušit
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mazání...
                  </>
                ) : (
                  '🗑️ Smazat produkt'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function ProductsAdminPage() {
  return (
    <Suspense fallback={<div className="p-6">Načítání...</div>}>
      <ProductsAdminPageContent />
    </Suspense>
  )
} 