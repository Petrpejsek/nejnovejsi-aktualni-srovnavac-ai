'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  ArrowLeftIcon, 
  PhotoIcon, 
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  PlayIcon,
  LinkIcon
} from '@heroicons/react/24/outline'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl: string
  pendingImageUrl?: string | null
  imageApprovalStatus?: 'pending' | 'approved' | 'rejected' | null
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
  createdAt?: string
  updatedAt?: string
}

export default function AdminProductEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProduct, setIsLoadingProduct] = useState(true)
  const [dragActive, setDragActive] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [newTag, setNewTag] = useState('')
  const [newAdvantage, setNewAdvantage] = useState('')
  const [newDisadvantage, setNewDisadvantage] = useState('')
  const [newVideoUrl, setNewVideoUrl] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  
  const [product, setProduct] = useState<Product>({
    id: params.id,
    name: '',
    description: '',
    price: 0,
    category: 'AI Writing',
    imageUrl: '',
    pendingImageUrl: null,
    imageApprovalStatus: null,
    tags: [],
    advantages: [],
    disadvantages: [],
    detailInfo: '',
    pricingInfo: {
      basic: '29',
      pro: '49', 
      enterprise: '99'
    },
    videoUrls: [],
    externalUrl: '',
    hasTrial: false
  })

  // Načtení produktu při načtení stránky
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoadingProduct(true)
        const response = await fetch(`/api/products/${params.id}`)
        if (response.ok) {
          const productData = await response.json()
          
          // Zpracovat JSON pole z databáze
          const processedProduct = {
            ...productData,
            tags: Array.isArray(productData.tags) ? productData.tags : 
                  (typeof productData.tags === 'string' ? JSON.parse(productData.tags || '[]') : []),
            advantages: Array.isArray(productData.advantages) ? productData.advantages : 
                       (typeof productData.advantages === 'string' ? JSON.parse(productData.advantages || '[]') : []),
            disadvantages: Array.isArray(productData.disadvantages) ? productData.disadvantages : 
                          (typeof productData.disadvantages === 'string' ? JSON.parse(productData.disadvantages || '[]') : []),
            videoUrls: Array.isArray(productData.videoUrls) ? productData.videoUrls : 
                      (typeof productData.videoUrls === 'string' ? JSON.parse(productData.videoUrls || '[]') : []),
            pricingInfo: typeof productData.pricingInfo === 'object' ? productData.pricingInfo : 
                        (typeof productData.pricingInfo === 'string' ? JSON.parse(productData.pricingInfo || '{"basic":"29","pro":"49","enterprise":"99"}') : {basic:"29",pro:"49",enterprise:"99"})
          }
          
          setProduct(processedProduct)
          
          // Pokud má produkt čekající fotku, nastavit ji jako preview
          if (productData.pendingImageUrl) {
            setImagePreview(productData.pendingImageUrl)
          }
        } else {
          setErrorMessage('Nepodařilo se načíst produkt')
        }
      } catch (error) {
        console.error('Error loading product:', error)
        setErrorMessage('Chyba při načítání produktu')
      } finally {
        setIsLoadingProduct(false)
      }
    }

    loadProduct()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsLoading(true)
    try {
      // Připravit data pro odeslání
      const dataToSave = {
        ...product,
        // Převést pole na JSON stringy pro databázi
        tags: JSON.stringify(product.tags),
        advantages: JSON.stringify(product.advantages),
        disadvantages: JSON.stringify(product.disadvantages),
        videoUrls: JSON.stringify(product.videoUrls),
        pricingInfo: JSON.stringify(product.pricingInfo)
      }

      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      })

      if (response.ok) {
        const result = await response.json()
        setSuccessMessage(result.message || 'Produkt byl úspěšně uložen!')
        setErrorMessage(null)
        
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setErrorMessage('Chyba při ukládání produktu')
        setSuccessMessage(null)
      }
    } catch (error) {
      console.error('Error saving product:', error)
      setErrorMessage('Chyba při ukládání produktu')
      setSuccessMessage(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Funkce pro správu tagů
  const addTag = () => {
    if (newTag.trim()) {
      setProduct(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setProduct(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // Funkce pro správu výhod
  const addAdvantage = () => {
    if (newAdvantage.trim()) {
      setProduct(prev => ({
        ...prev,
        advantages: [...prev.advantages, newAdvantage.trim()]
      }))
      setNewAdvantage('')
    }
  }

  const removeAdvantage = (advantageToRemove: string) => {
    setProduct(prev => ({
      ...prev,
      advantages: prev.advantages.filter(advantage => advantage !== advantageToRemove)
    }))
  }

  // Funkce pro správu nevýhod
  const addDisadvantage = () => {
    if (newDisadvantage.trim()) {
      setProduct(prev => ({
        ...prev,
        disadvantages: [...prev.disadvantages, newDisadvantage.trim()]
      }))
      setNewDisadvantage('')
    }
  }

  const removeDisadvantage = (disadvantageToRemove: string) => {
    setProduct(prev => ({
      ...prev,
      disadvantages: prev.disadvantages.filter(disadvantage => disadvantage !== disadvantageToRemove)
    }))
  }

  // Funkce pro správu video URL
  const addVideoUrl = () => {
    if (newVideoUrl.trim()) {
      setProduct(prev => ({
        ...prev,
        videoUrls: [...prev.videoUrls, newVideoUrl.trim()]
      }))
      setNewVideoUrl('')
    }
  }

  const removeVideoUrl = (urlToRemove: string) => {
    setProduct(prev => ({
      ...prev,
      videoUrls: prev.videoUrls.filter(url => url !== urlToRemove)
    }))
  }

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
      handleImageUpload(e.dataTransfer.files[0])
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0])
    }
  }

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('productId', params.id)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        setImagePreview(result.url)
        setProduct(prev => ({
          ...prev,
          pendingImageUrl: result.url,
          imageApprovalStatus: 'pending'
        }))
        setSuccessMessage('Obrázek byl nahrán a čeká na schválení')
      } else {
        setErrorMessage('Chyba při nahrávání obrázku')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setErrorMessage('Chyba při nahrávání obrázku')
    } finally {
      setIsUploadingImage(false)
    }
  }

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítám produkt...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/products')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Zpět na produkty
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Editace produktu</h1>
          <p className="mt-2 text-gray-600">Upravte informace o produktu</p>
        </div>

        {/* Zprávy */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
            <CheckIcon className="h-5 w-5 inline mr-2" />
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <XMarkIcon className="h-5 w-5 inline mr-2" />
            {errorMessage}
          </div>
        )}

        {/* Formulář */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Základní informace</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Název produktu *
                </label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => setProduct(prev => ({...prev, name: e.target.value}))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kategorie *
                </label>
                <select
                  value={product.category}
                  onChange={(e) => setProduct(prev => ({...prev, category: e.target.value}))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="AI Writing">AI Writing</option>
                  <option value="AI Video">AI Video</option>
                  <option value="AI Audio">AI Audio</option>
                  <option value="AI Image">AI Image</option>
                  <option value="AI Coding">AI Coding</option>
                  <option value="AI Business">AI Business</option>
                  <option value="AI Analytics">AI Analytics</option>
                  <option value="AI Tools">AI Tools</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cena ($) *
                </label>
                <input
                  type="number"
                  value={product.price}
                  onChange={(e) => setProduct(prev => ({...prev, price: parseFloat(e.target.value) || 0}))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Externí odkaz *
                </label>
                <input
                  type="url"
                  value={product.externalUrl}
                  onChange={(e) => setProduct(prev => ({...prev, externalUrl: e.target.value}))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  placeholder="https://example.com"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">
                Popis produktu *
              </label>
              <textarea
                value={product.description}
                onChange={(e) => setProduct(prev => ({...prev, description: e.target.value}))}
                rows={4}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                placeholder="Stručný popis produktu..."
                required
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">
                Detailní informace
              </label>
              <textarea
                value={product.detailInfo}
                onChange={(e) => setProduct(prev => ({...prev, detailInfo: e.target.value}))}
                rows={6}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                placeholder="Podrobné informace o produktu, funkcích, použití..."
              />
            </div>

            <div className="mt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={product.hasTrial}
                  onChange={(e) => setProduct(prev => ({...prev, hasTrial: e.target.checked}))}
                  className="rounded border-gray-300 text-purple-600 shadow-sm focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">Má bezplatnou zkušební verzi</span>
              </label>
            </div>
          </div>

          {/* Obrázek */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Obrázek produktu</h2>
            
            <div className="space-y-4">
              {/* Aktuální obrázek */}
              {product.imageUrl && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Aktuální obrázek:</p>
                  <div className="relative inline-block">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={200}
                      height={150}
                      className="rounded-lg object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Upload area */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                  dragActive 
                    ? 'border-purple-400 bg-purple-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Nahrát nový obrázek
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        PNG, JPG, GIF do 10MB
                      </span>
                    </label>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isUploadingImage}
                    />
                  </div>
                </div>

                {isUploadingImage && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Nahrávám obrázek...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview čekajícího obrázku */}
              {imagePreview && product.imageApprovalStatus === 'pending' && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Nový obrázek (čeká na schválení):
                  </p>
                  <div className="relative inline-block">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={200}
                      height={150}
                      className="rounded-lg object-cover opacity-75"
                    />
                    <div className="absolute inset-0 bg-yellow-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                        Čeká na schválení
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tagy */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Tagy</h2>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Přidat nový tag..."
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Výhody */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Výhody</h2>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newAdvantage}
                  onChange={(e) => setNewAdvantage(e.target.value)}
                  placeholder="Přidat novou výhodu..."
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAdvantage())}
                />
                <button
                  type="button"
                  onClick={addAdvantage}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                {product.advantages.map((advantage, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                  >
                    <span className="text-green-800">{advantage}</span>
                    <button
                      type="button"
                      onClick={() => removeAdvantage(advantage)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Nevýhody */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Nevýhody</h2>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newDisadvantage}
                  onChange={(e) => setNewDisadvantage(e.target.value)}
                  placeholder="Přidat novou nevýhodu..."
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDisadvantage())}
                />
                <button
                  type="button"
                  onClick={addDisadvantage}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                {product.disadvantages.map((disadvantage, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                  >
                    <span className="text-red-800">{disadvantage}</span>
                    <button
                      type="button"
                      onClick={() => removeDisadvantage(disadvantage)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cenové informace */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Cenové informace</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Basic plán ($)
                </label>
                <input
                  type="text"
                  value={product.pricingInfo.basic}
                  onChange={(e) => setProduct(prev => ({
                    ...prev,
                    pricingInfo: { ...prev.pricingInfo, basic: e.target.value }
                  }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  placeholder="29"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pro plán ($)
                </label>
                <input
                  type="text"
                  value={product.pricingInfo.pro}
                  onChange={(e) => setProduct(prev => ({
                    ...prev,
                    pricingInfo: { ...prev.pricingInfo, pro: e.target.value }
                  }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  placeholder="49"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Enterprise plán ($)
                </label>
                <input
                  type="text"
                  value={product.pricingInfo.enterprise}
                  onChange={(e) => setProduct(prev => ({
                    ...prev,
                    pricingInfo: { ...prev.pricingInfo, enterprise: e.target.value }
                  }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  placeholder="99"
                />
              </div>
            </div>
          </div>

          {/* Video URL */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Video odkazy</h2>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="Přidat video URL..."
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVideoUrl())}
                />
                <button
                  type="button"
                  onClick={addVideoUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                {product.videoUrls.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <PlayIcon className="h-4 w-4 text-blue-600 mr-2" />
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        {url}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVideoUrl(url)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tlačítka */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Ukládám...
                </>
              ) : (
                'Uložit změny'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}