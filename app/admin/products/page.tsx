'use client'

import React, { useState, useEffect } from 'react'
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

  useEffect(() => {
    fetchProducts(1)
  }, [])

  const fetchProducts = async (page: number = 1) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      console.log("Admin: Loading products from API...");
      
      // Používáme nový API endpoint s paginací
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/admin-products?page=${page}&limit=30&t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
      
      console.log("Admin: API response status:", response.status, response.statusText);
      
      if (!response.ok) {
        console.error('Admin: Error loading products. Status:', response.status, response.statusText);
        setError(`Chyba při načítání produktů: ${response.status} ${response.statusText}`);
        return;
      }
      
      try {
        // Získáme text odpovědi
        const responseText = await response.text();
        
        if (!responseText || responseText.trim() === '') {
          setError('API vrátila prázdnou odpověď');
          return;
        }
        
        // Zparsujeme JSON
        const data = JSON.parse(responseText);
        console.log("Admin: API response data received");
        
        if (!data.products || !Array.isArray(data.products)) {
          setError('API vrátila neplatnou strukturu dat');
          return;
        }
        
        const productsList = data.products;
        
        if (productsList.length === 0 && page === 1) {
          console.warn("Admin: Received empty products array from API");
          setError("API vrátila prázdné pole produktů. Zkontrolujte připojení k databázi nebo jestli jsou nějaké produkty v databázi.");
          return;
        }
        
        // Řazení produktů
        const sortedData = productsList.sort((a: Product, b: Product) => {
          if (a.imageUrl && !b.imageUrl) return -1
          if (!a.imageUrl && b.imageUrl) return 1
          return 0
        });
        
        // Přidáme nové produkty k existujícím nebo nahradíme všechny
        if (page === 1) {
          setProducts(sortedData);
        } else {
          setProducts(prev => [...prev, ...sortedData]);
        }
        
        // Nastavíme paginaci
        if (data.pagination) {
          setPagination(data.pagination);
          setCurrentPage(page);
        }
        
        console.log("Admin: Processed products:", sortedData.length);
      } catch (parseError) {
        console.error('Admin: Error parsing API response:', parseError);
        setError(`Chyba při zpracování odpovědi z API: ${parseError instanceof Error ? parseError.message : 'Neznámá chyba'}`);
      }
    } catch (error) {
      console.error('Admin: Error loading products:', error);
      setError(`Chyba: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  // Funkce pro načtení další stránky
  const handleLoadMore = () => {
    if (pagination && currentPage < pagination.totalPages) {
      fetchProducts(currentPage + 1);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingProduct 
        ? `/api/products/${editingProduct.id}`
        : '/api/products'
      
      const method = editingProduct ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        fetchProducts()
        setEditingProduct(null)
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
      }
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const handleEdit = (product: Product) => {
    try {
      // Použijeme safeProcessProduct pro zajištění bezpečného zpracování dat
      const safeProduct = safeProcessProduct(product);
      setEditingProduct(safeProduct);
      setFormData(safeProduct);
    } catch (error) {
      console.error("Admin: Error setting up edit form:", error);
      alert("Nastala chyba při úpravě produktu. Zkuste to prosím znovu.");
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => {
        const parentObj = prev[parent as keyof Product] as Record<string, string>
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: value
          }
        }
      })
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' 
          ? (e.target as HTMLInputElement).checked 
          : type === 'number' 
            ? parseFloat(value) 
            : value
      }))
    }
  }

  const handleArrayInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'tags' | 'advantages' | 'disadvantages' | 'videoUrls') => {
    const value = e.target.value
    setFormData(prev => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim())
    }))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
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
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags || [], newTag.trim()]
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
    if (newAdvantage.trim()) {
      setFormData(prev => ({
        ...prev,
        advantages: [...prev.advantages || [], newAdvantage.trim()]
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
    if (newDisadvantage.trim()) {
      setFormData(prev => ({
        ...prev,
        disadvantages: [...prev.disadvantages || [], newDisadvantage.trim()]
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
      <div className="mt-6 text-center">
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          {loadingMore ? 'Načítání...' : `Načíst další produkty (${currentPage}/${pagination.totalPages})`}
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Products Administration</h1>
        <div className="p-6 bg-gray-100 rounded-lg">
          <p className="text-lg">Načítám produkty...</p>
        </div>
      </div>
    )
  }

  if (error && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Products Administration</h1>
          <Link 
            href="/admin"
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
          >
            Back to Admin
          </Link>
        </div>
        
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Chyba!</p>
          <p>{error}</p>
        </div>
        
        <button 
          onClick={() => fetchProducts(1)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
        >
          Zkusit znovu
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Products Administration</h1>
        <div className="space-x-2">
          <Link 
            href="/admin"
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
          >
            Back to Admin
          </Link>
          <button 
            onClick={() => fetchProducts(1)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Products
          </button>
        </div>
      </div>

      {/* Přidáme info o paginaci zde */}
      {pagination && (
        <div className="mb-4 text-gray-600">
          Zobrazeno {products.length} produktů z celkových {pagination.totalCount} 
          (Stránka {currentPage} z {pagination.totalPages})
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Chyba!</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8 space-y-4 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price || 0}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image
            </label>
            <div 
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
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
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none"
                  >
                    <span>Upload file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
              </div>
            </div>
            {imagePreview && (
              <div className="mt-2 relative">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={200}
                  height={200}
                  className="rounded-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview("")
                    setFormData(prev => ({ ...prev, imageUrl: '' }))
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newTag.trim()) {
                    e.preventDefault()
                    addTag()
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter tag and press Enter"
              />
            </div>
            <div className="flex flex-wrap gap-2 min-h-[50px] p-2 border border-gray-200 rounded-md">
              {formData.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full flex items-center gap-2 group hover:bg-purple-200 transition-colors"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-purple-600 hover:text-purple-800 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">External URL</label>
            <input
              type="text"
              name="externalUrl"
              value={formData.externalUrl || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Advantages
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newAdvantage}
                onChange={(e) => setNewAdvantage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newAdvantage.trim()) {
                    e.preventDefault()
                    addAdvantage()
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Enter advantage and press Enter"
              />
            </div>
            <div className="space-y-2 min-h-[50px] p-2 border border-gray-200 rounded-md">
              {formData.advantages?.map((advantage, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2 bg-green-50 p-2 rounded-md group hover:bg-green-100 transition-colors"
                >
                  <span className="text-green-800 flex-1">{advantage}</span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => {
                        if (index > 0 && formData.advantages?.length) {
                          const newAdvantages = [...formData.advantages]
                          const temp = newAdvantages[index]
                          newAdvantages[index] = newAdvantages[index - 1]
                          newAdvantages[index - 1] = temp
                          setFormData(prev => ({ ...prev, advantages: newAdvantages }))
                        }
                      }}
                      className="text-green-600 hover:text-green-800 disabled:opacity-50"
                      disabled={!formData?.advantages || index === 0}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (index < (formData.advantages?.length ?? 0) - 1) {
                          const newAdvantages = [...(formData.advantages ?? [])]
                          const temp = newAdvantages[index]
                          newAdvantages[index] = newAdvantages[index + 1]
                          newAdvantages[index + 1] = temp
                          setFormData(prev => ({ ...prev, advantages: newAdvantages }))
                        }
                      }}
                      className="text-green-600 hover:text-green-800 disabled:opacity-50"
                      disabled={!formData?.advantages || index === formData.advantages.length - 1}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAdvantage(advantage)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Disadvantages
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newDisadvantage}
                onChange={(e) => setNewDisadvantage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newDisadvantage.trim()) {
                    e.preventDefault()
                    addDisadvantage()
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                placeholder="Enter disadvantage and press Enter"
              />
            </div>
            <div className="space-y-2 min-h-[50px] p-2 border border-gray-200 rounded-md">
              {formData.disadvantages?.map((disadvantage, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2 bg-red-50 p-2 rounded-md group hover:bg-red-100 transition-colors"
                >
                  <span className="text-red-800 flex-1">{disadvantage}</span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => {
                        if (index > 0 && formData.disadvantages?.length) {
                          const newDisadvantages = [...formData.disadvantages]
                          const temp = newDisadvantages[index]
                          newDisadvantages[index] = newDisadvantages[index - 1]
                          newDisadvantages[index - 1] = temp
                          setFormData(prev => ({ ...prev, disadvantages: newDisadvantages }))
                        }
                      }}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      disabled={!formData?.disadvantages || index === 0}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (index < (formData.disadvantages?.length ?? 0) - 1) {
                          const newDisadvantages = [...(formData.disadvantages ?? [])]
                          const temp = newDisadvantages[index]
                          newDisadvantages[index] = newDisadvantages[index + 1]
                          newDisadvantages[index + 1] = temp
                          setFormData(prev => ({ ...prev, disadvantages: newDisadvantages }))
                        }
                      }}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      disabled={!formData?.disadvantages || index === formData.disadvantages.length - 1}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeDisadvantage(disadvantage)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Detail Information</label>
            <textarea
              name="detailInfo"
              value={formData.detailInfo || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Basic Price</label>
            <input
              type="text"
              name="pricingInfo.basic"
              value={formData.pricingInfo?.basic || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Pro Price</label>
            <input
              type="text"
              name="pricingInfo.pro"
              value={formData.pricingInfo?.pro || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Enterprise Price</label>
            <input
              type="text"
              name="pricingInfo.enterprise"
              value={formData.pricingInfo?.enterprise || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="hasTrial"
                checked={formData.hasTrial || false}
                onChange={(e) => setFormData(prev => ({ ...prev, hasTrial: e.target.checked }))}
                className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">Has Trial Version</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          {editingProduct && (
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null)
                setFormData({})
              }}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            {editingProduct ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative w-16 h-16">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover rounded-md"
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{product.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">${product.price}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-purple-600 hover:text-purple-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pro ladění - výpis JSON s produkty */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Debug - JSON data</h2>
        <pre className="text-xs overflow-auto max-h-96">
          {(() => {
            try {
              // Použijeme normalizovaná data z fetchProducts
              return JSON.stringify(products, null, 2);
            } catch (error) {
              return `Chyba při vykreslování JSON dat: ${error}`;
            }
          })()}
        </pre>
      </div>

      {/* Add pagination at the bottom */}
      {renderPagination()}
    </div>
  )
} 