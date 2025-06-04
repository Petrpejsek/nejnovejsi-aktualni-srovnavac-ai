'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { safeProcessProduct } from './safe-parser'

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

interface Pagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasMore: boolean
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [savingProductId, setSavingProductId] = useState<string | null>(null)
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
    pricingInfo: {
      basic: '0',
      pro: '0',
      enterprise: '0'
    },
    videoUrls: [],
    externalUrl: '',
    hasTrial: false
  })
  const [dragActive, setDragActive] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [newTag, setNewTag] = useState('')
  const [newAdvantage, setNewAdvantage] = useState('')
  const [newDisadvantage, setNewDisadvantage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    fetchProducts(1)
  }, [])

  // Optimalizovaná funkce pro načítání produktů
  const fetchProducts = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1 && !append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/admin-products?page=${page}&limit=30&t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
      
      if (!response.ok) {
        setError(`Chyba při načítání produktů: ${response.status} ${response.statusText}`);
        return;
      }
      
      const responseText = await response.text();
      
      if (!responseText || responseText.trim() === '') {
        setError('API vrátila prázdnou odpověď');
        return;
      }
      
      const data = JSON.parse(responseText);
      
      if (!data.products || !Array.isArray(data.products)) {
        setError('API vrátila neplatnou strukturu dat');
        return;
      }
      
      const productsList = data.products;
      
      // Řazení produktů
      const sortedData = productsList.sort((a: Product, b: Product) => {
        if (a.imageUrl && !b.imageUrl) return -1
        if (!a.imageUrl && b.imageUrl) return 1
        return 0
      });
      
      if (page === 1 && !append) {
        setProducts(sortedData);
      } else {
        setProducts(prev => [...prev, ...sortedData]);
      }
      
      if (data.pagination) {
        setPagination(data.pagination);
        setCurrentPage(page);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error loading products:', error);
      setError(`Chyba: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [])

  // Optimistic update pro lokální aktualizaci produktu
  const updateProductLocally = useCallback((updatedProduct: Product) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      )
    )
  }, [])

  // Funkce pro načtení další stránky
  const handleLoadMore = () => {
    if (pagination && currentPage < pagination.totalPages) {
      fetchProducts(currentPage + 1, true);
    }
  }

  // Optimalizovaná funkce pro ukládání změn
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingProduct) return;
    
    const productId = editingProduct.id;
    setSavingProductId(productId);
    
    try {
      // Optimistic update - okamžitě zobrazíme změny
      const optimisticProduct = { ...editingProduct, ...formData } as Product;
      updateProductLocally(optimisticProduct);
      
      // Zobrazíme loading indikátor
      setSuccessMessage('Ukládání změn...');
      
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const updatedProduct = await response.json();
        
        // Aktualizujeme s daty ze serveru
        updateProductLocally({
          ...updatedProduct,
          tags: JSON.parse(updatedProduct.tags || '[]'),
          advantages: JSON.parse(updatedProduct.advantages || '[]'),
          disadvantages: JSON.parse(updatedProduct.disadvantages || '[]'),
          videoUrls: JSON.parse(updatedProduct.videoUrls || '[]'),
          pricingInfo: JSON.parse(updatedProduct.pricingInfo || '{"basic":"0","pro":"0","enterprise":"0"}')
        });
        
        setSuccessMessage('Změny byly úspěšně uloženy!');
        setTimeout(() => setSuccessMessage(null), 3000);
        
        setEditingProduct(null);
        resetForm();
      } else {
        // V případě chyby vrátíme původní stav
        updateProductLocally(editingProduct);
        setError('Chyba při ukládání produktu');
      }
    } catch (error) {
      // V případě chyby vrátíme původní stav
      updateProductLocally(editingProduct);
      console.error('Error saving product:', error);
      setError(`Chyba: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSavingProductId(null);
    }
  }

  // Optimalizovaná funkce pro smazání
  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tento produkt?')) return;
    
    try {
      // Optimistic update - okamžitě odstraníme z UI
      const originalProducts = products;
      setProducts(prev => prev.filter(product => product.id !== id));
      
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setSuccessMessage('Produkt byl úspěšně smazán!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        // V případě chyby vrátíme původní stav
        setProducts(originalProducts);
        setError('Chyba při mazání produktu');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(`Chyba: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      tags: product.tags,
      advantages: product.advantages,
      disadvantages: product.disadvantages,
      detailInfo: product.detailInfo,
      pricingInfo: product.pricingInfo,
      videoUrls: product.videoUrls,
      externalUrl: product.externalUrl,
      hasTrial: product.hasTrial
    })
    setImagePreview(product.imageUrl || null)
    setError(null)
    
    // Plynule přejeď nahoru k formuláři
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }
    }, 100)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      imageUrl: '',
      tags: [],
      advantages: [],
      disadvantages: [],
      detailInfo: '',
      pricingInfo: {
        basic: '0',
        pro: '0',
        enterprise: '0'
      },
      videoUrls: [],
      externalUrl: '',
      hasTrial: false
    })
    setImagePreview(null)
    setNewTag('')
    setNewAdvantage('')
    setNewDisadvantage('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (name === 'price') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
    } else if (name.startsWith('pricing.')) {
      const pricingField = name.split('.')[1] as 'basic' | 'pro' | 'enterprise'
      setFormData(prev => ({
        ...prev,
        pricingInfo: {
          ...prev.pricingInfo!,
          [pricingField]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  // Zbývající helper funkce zůstávají stejné...
  const handleArrayInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'tags' | 'advantages' | 'disadvantages' | 'videoUrls') => {
    const value = e.target.value
    const array = value.split(',').map(item => item.trim()).filter(item => item.length > 0)
    setFormData(prev => ({ ...prev, [field]: array }))
  }

  // ... zbytek helper funkcí zůstává stejný

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange({ target: { files: e.dataTransfer.files } } as any)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        setImagePreview(result)
        setFormData(prev => ({ ...prev, imageUrl: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }))
  }

  const addAdvantage = () => {
    if (newAdvantage.trim() && !formData.advantages?.includes(newAdvantage.trim())) {
      setFormData(prev => ({
        ...prev,
        advantages: [...(prev.advantages || []), newAdvantage.trim()]
      }))
      setNewAdvantage('')
    }
  }

  const removeAdvantage = (advantage: string) => {
    setFormData(prev => ({
      ...prev,
      advantages: prev.advantages?.filter(a => a !== advantage) || []
    }))
  }

  const addDisadvantage = () => {
    if (newDisadvantage.trim() && !formData.disadvantages?.includes(newDisadvantage.trim())) {
      setFormData(prev => ({
        ...prev,
        disadvantages: [...(prev.disadvantages || []), newDisadvantage.trim()]
      }))
      setNewDisadvantage('')
    }
  }

  const removeDisadvantage = (disadvantage: string) => {
    setFormData(prev => ({
      ...prev,
      disadvantages: prev.disadvantages?.filter(d => d !== disadvantage) || []
    }))
  }

  // Přidáme tlačítko pro načtení dalších produktů na konec komponenty
  const renderPagination = () => {
    if (!pagination || currentPage >= pagination.totalPages) {
      return null;
    }
    
    return (
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow mt-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMore ? 'Načítání...' : 'Načíst další'}
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Zobrazeno <span className="font-medium">{products.length}</span> z celkových{' '}
              <span className="font-medium">{pagination.totalCount}</span> produktů
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:z-10 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                    Načítání...
                  </>
                ) : (
                  `Načíst další (${currentPage}/${pagination.totalPages})`
                )}
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Správa produktů</h1>
        <div className="p-6 bg-gray-100 rounded-lg">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error && products.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Správa produktů</h1>
          <Link 
            href="/admin"
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Zpět na dashboard
          </Link>
        </div>
        
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Chyba!</p>
          <p>{error}</p>
        </div>
        
        <button 
          onClick={() => fetchProducts(1)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Zkusit znovu
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Správa produktů</h1>
          <p className="mt-1 text-sm text-gray-600">
            Spravujte a upravujte AI nástroje a produkty v databázi
          </p>
        </div>
        <div className="flex space-x-3">
          <Link 
            href="/admin"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Zpět na dashboard
          </Link>
          <button 
            onClick={() => fetchProducts(1)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Aktualizovat produkty
          </button>
        </div>
      </div>

      {/* Toast container */}
      {(successMessage || error) && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {successMessage && (
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-in slide-in-from-right duration-300">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {successMessage}
            </div>
          )}
          {error && (
            <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-in slide-in-from-right duration-300">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <div className="flex-1">{error}</div>
              <button 
                onClick={() => setError(null)}
                className="ml-2 text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}

      {/* Statistics */}
      {pagination && (
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Celkem produktů v databázi
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {pagination.totalCount} produktů
                  </dd>
                </dl>
              </div>
              <div className="ml-5 flex-shrink-0">
                <span className="text-sm text-gray-500">
                  Zobrazeno {products.length} (Stránka {currentPage}/{pagination.totalPages})
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {editingProduct ? 'Upravit produkt' : 'Přidat nový produkt'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {editingProduct ? 'Upravte informace o produktu' : 'Přidejte nový AI nástroj do databáze'}
              </p>
            </div>
            {editingProduct && (
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  resetForm();
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Zrušit úpravu
              </button>
            )}
          </div>

          <div className="space-y-8">
            {/* Základní informace */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Základní informace</h4>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Název produktu</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Kategorie</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Cena (USD)</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      value={formData.price || 0}
                      onChange={handleInputChange}
                      className="block w-full pl-7 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Externí URL</label>
                  <input
                    type="url"
                    name="externalUrl"
                    value={formData.externalUrl || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            {/* Popis */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Popis produktu</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Krátký popis</label>
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Detailní informace</label>
                  <textarea
                    name="detailInfo"
                    value={formData.detailInfo || ''}
                    onChange={handleInputChange}
                    rows={4}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Obrázek */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Obrázek produktu</h4>
              <div className="space-y-4">
                {imagePreview && (
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={200}
                        height={200}
                        className="rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null)
                          setFormData(prev => ({ ...prev, imageUrl: '' }))
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
                
                <div 
                  className={`flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${
                    dragActive ? 'border-purple-600 bg-purple-50' : 'border-gray-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
                        <span>Nahrát soubor</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">nebo přetáhněte sem</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF do 10MB</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Nebo URL obrázku</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Pricing Info */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Cena produktu</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Základní cena</label>
                  <input
                    type="text"
                    name="pricing.basic"
                    value={formData.pricingInfo?.basic || '0'}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pro cena</label>
                  <input
                    type="text"
                    name="pricing.pro"
                    value={formData.pricingInfo?.pro || '0'}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Enterprise cena</label>
                  <input
                    type="text"
                    name="pricing.enterprise"
                    value={formData.pricingInfo?.enterprise || '0'}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Tagy</h4>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-purple-100 text-purple-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Přidat nový tag"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                >
                  Přidat
                </button>
              </div>
            </div>

            {/* Advantages */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Výhody</h4>
              <div className="space-y-2 mb-2">
                {formData.advantages?.map((advantage, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-md"
                  >
                    <span className="text-sm text-green-800">{advantage}</span>
                    <button
                      type="button"
                      onClick={() => removeAdvantage(advantage)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAdvantage}
                  onChange={(e) => setNewAdvantage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAdvantage())}
                  placeholder="Přidat novou výhodu"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={addAdvantage}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                >
                  Přidat
                </button>
              </div>
            </div>

            {/* Disadvantages */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Nevýhody</h4>
              <div className="space-y-2 mb-2">
                {formData.disadvantages?.map((disadvantage, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded-md"
                  >
                    <span className="text-sm text-red-800">{disadvantage}</span>
                    <button
                      type="button"
                      onClick={() => removeDisadvantage(disadvantage)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDisadvantage}
                  onChange={(e) => setNewDisadvantage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDisadvantage())}
                  placeholder="Přidat novou nevýhodu"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={addDisadvantage}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                  Přidat
                </button>
              </div>
            </div>

            {/* Has Trial */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="hasTrial"
                checked={formData.hasTrial || false}
                onChange={handleInputChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Má zkušební verzi
              </label>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="submit"
            disabled={!editingProduct || savingProductId === editingProduct?.id}
            className="w-full flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors sm:ml-3 sm:w-auto sm:text-sm"
          >
            {savingProductId === editingProduct?.id ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Ukládání...
              </div>
            ) : editingProduct ? (
              'Uložit změny'
            ) : (
              'Přidat produkt'
            )}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Seznam produktů</h3>
        </div>
        
        {products.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m14 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m14 0H6m14 0l-3-3m3 3l-3 3" />
              </svg>
            </div>
            <p className="text-lg text-gray-500">Žádné produkty k zobrazení</p>
            <p className="text-sm text-gray-400 mt-2">Přidejte první produkt pomocí formuláře výše</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Náhled</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Název</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategorie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cena</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tagy</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Akce</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative w-16 h-16">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover rounded-md"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">{product.name}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate" title={product.description}>
                        {product.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${product.price}</div>
                      {product.hasTrial && (
                        <span className="text-xs text-green-600 font-medium">Má trial</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {product.tags?.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                        {product.tags?.length > 3 && (
                          <span className="text-xs text-gray-500">+{product.tags.length - 3} další</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleEdit(product)}
                          disabled={savingProductId === product.id}
                          className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {savingProductId === product.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-700 mr-1"></div>
                              Ukládá se...
                            </>
                          ) : (
                            'Upravit'
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          Smazat
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Loading state for infinite scroll */}
      {loadingMore && (
        <div className="mt-6 flex justify-center">
          <div className="flex items-center text-gray-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mr-2"></div>
            Načítání dalších produktů...
          </div>
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}
    </div>
  )
} 