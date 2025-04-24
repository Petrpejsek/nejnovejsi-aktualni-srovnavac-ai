'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

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

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log("Admin: Načítám produkty z API...");
      const response = await fetch('/api/products?pageSize=100')
      if (response.ok) {
        const data = await response.json()
        const products = data.products || [];
        const sortedData = products.sort((a: Product, b: Product) => {
          if (a.imageUrl && !b.imageUrl) return -1
          if (!a.imageUrl && b.imageUrl) return 1
          return 0
        })
        setProducts(sortedData)
        console.log("Admin: Načteno produktů:", sortedData.length, "z celkových", data.pagination?.totalProducts || 0);
      } else {
        console.error('Admin: Chyba při načítání produktů:', response.statusText);
      }
    } catch (error) {
      console.error('Admin: Chyba při načítání produktů:', error)
    } finally {
      setLoading(false)
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
      console.error('Chyba při ukládání produktu:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tento produkt?')) return

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error('Chyba při mazání produktu:', error)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      ...product,
      tags: Array.isArray(product.tags) ? product.tags : [],
      advantages: Array.isArray(product.advantages) ? product.advantages : [],
      disadvantages: Array.isArray(product.disadvantages) ? product.disadvantages : [],
      pricingInfo: typeof product.pricingInfo === 'object' ? product.pricingInfo : { basic: '0', pro: '0', enterprise: '0' },
      videoUrls: Array.isArray(product.videoUrls) ? product.videoUrls : []
    })
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

  if (loading) {
    return <div>Načítání...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Správa produktů</h1>
        <Link 
          href="/admin"
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
        >
          Zpět do administrace
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          {editingProduct ? 'Upravit produkt' : 'Přidat nový produkt'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Název</label>
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
            <label className="block text-sm font-medium text-gray-700">Kategorie</label>
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
            <label className="block text-sm font-medium text-gray-700">Cena</label>
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
              Obrázek produktu
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
                    <span>Nahrát soubor</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="pl-1">nebo přetáhněte sem</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG až do 10MB</p>
              </div>
            </div>
            {imagePreview && (
              <div className="mt-2 relative">
                <Image
                  src={imagePreview}
                  alt="Náhled"
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
            <label className="block text-sm font-medium text-gray-700">Popis</label>
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
              Tagy
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
                placeholder="Zadejte tag a stiskněte Enter"
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
            <label className="block text-sm font-medium text-gray-700">Externí URL</label>
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
              Výhody
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
                placeholder="Zadejte výhodu a stiskněte Enter"
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
              Nevýhody
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
                placeholder="Zadejte nevýhodu a stiskněte Enter"
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
            <label className="block text-sm font-medium text-gray-700">Detailní informace</label>
            <textarea
              name="detailInfo"
              value={formData.detailInfo || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Základní cena</label>
            <input
              type="text"
              name="pricingInfo.basic"
              value={formData.pricingInfo?.basic || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Pro cena</label>
            <input
              type="text"
              name="pricingInfo.pro"
              value={formData.pricingInfo?.pro || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Enterprise cena</label>
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
              <span className="text-sm font-medium text-gray-700">Má trial verzi</span>
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
              Zrušit
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            {editingProduct ? 'Uložit změny' : 'Přidat produkt'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Náhled</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Název</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cena</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Akce</th>
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
                    Upravit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Smazat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 