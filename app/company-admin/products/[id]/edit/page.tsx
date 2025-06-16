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
  hasPendingChanges?: boolean
  changesStatus?: 'pending' | 'approved' | 'rejected' | null
  changesSubmittedAt?: string
  pendingChanges?: string | null
  adminNotes?: string | null
}

// Helper function to compare changes
const getChangeSummary = (currentProduct: Product, pendingChanges: string | null) => {
  if (!pendingChanges) return null;
  
  try {
    const pending = JSON.parse(pendingChanges);
    const changes: string[] = [];
    
    // Normalize values for comparison
    const normalizeValue = (value: any) => {
      if (value === null || value === undefined) return ""
      if (typeof value === 'string') return value.trim()
      return value
    }
    
    // Compare main fields
    if (normalizeValue(pending.name) !== normalizeValue(currentProduct.name)) {
      changes.push(`Name: "${currentProduct.name}" → "${pending.name}"`);
    }
    if (normalizeValue(pending.description) !== normalizeValue(currentProduct.description)) {
      changes.push(`Description: Updated`);
    }
    if (pending.price !== currentProduct.price) {
      changes.push(`Price: $${currentProduct.price} → $${pending.price}`);
    }
    if (normalizeValue(pending.category) !== normalizeValue(currentProduct.category)) {
      changes.push(`Category: "${currentProduct.category}" → "${pending.category}"`);
    }
    if (normalizeValue(pending.externalUrl) !== normalizeValue(currentProduct.externalUrl)) {
      changes.push(`External URL: Updated`);
    }
    if (pending.hasTrial !== currentProduct.hasTrial) {
      changes.push(`Trial version: ${currentProduct.hasTrial ? 'Yes' : 'No'} → ${pending.hasTrial ? 'Yes' : 'No'}`);
    }
    
    // Compare arrays (order-independent)
    const currentAdvantages = (currentProduct.advantages || []).sort()
    const pendingAdvantages = (pending.advantages ? JSON.parse(pending.advantages) : []).sort()
    if (JSON.stringify(currentAdvantages) !== JSON.stringify(pendingAdvantages)) {
      const newItems = pendingAdvantages.filter((item: string) => !currentAdvantages.includes(item))
      const removedItems = currentAdvantages.filter((item: string) => !pendingAdvantages.includes(item))
      
      if (newItems.length > 0 || removedItems.length > 0) {
        let changeText = `Advantages:`
        if (newItems.length > 0) {
          changeText += ` Added "${newItems.join('", "')}"`
        }
        if (removedItems.length > 0) {
          changeText += `${newItems.length > 0 ? ', ' : ''} Removed "${removedItems.join('", "')}"`
        }
        changes.push(changeText);
      }
    }
    
    const currentDisadvantages = (currentProduct.disadvantages || []).sort()
    const pendingDisadvantages = (pending.disadvantages ? JSON.parse(pending.disadvantages) : []).sort()
    if (JSON.stringify(currentDisadvantages) !== JSON.stringify(pendingDisadvantages)) {
      const newItems = pendingDisadvantages.filter((item: string) => !currentDisadvantages.includes(item))
      const removedItems = currentDisadvantages.filter((item: string) => !pendingDisadvantages.includes(item))
      
      if (newItems.length > 0 || removedItems.length > 0) {
        let changeText = `Disadvantages:`
        if (newItems.length > 0) {
          changeText += ` Added "${newItems.join('", "')}"`
        }
        if (removedItems.length > 0) {
          changeText += `${newItems.length > 0 ? ', ' : ''} Removed "${removedItems.join('", "')}"`
        }
        changes.push(changeText);
      }
    }
    
    const currentTags = (currentProduct.tags || []).sort()
    const pendingTags = (pending.tags ? JSON.parse(pending.tags) : []).sort()
    if (JSON.stringify(currentTags) !== JSON.stringify(pendingTags)) {
      const newItems = pendingTags.filter((item: string) => !currentTags.includes(item))
      const removedItems = currentTags.filter((item: string) => !pendingTags.includes(item))
      
      if (newItems.length > 0 || removedItems.length > 0) {
        let changeText = `Tags:`
        if (newItems.length > 0) {
          changeText += ` Added "${newItems.join('", "')}"`
        }
        if (removedItems.length > 0) {
          changeText += `${newItems.length > 0 ? ', ' : ''} Removed "${removedItems.join('", "')}"`
        }
        changes.push(changeText);
      }
    }
    
    if (normalizeValue(pending.detailInfo) !== normalizeValue(currentProduct.detailInfo)) {
      changes.push(`Detailed information: Updated`);
    }
    
    return changes;
  } catch (error) {
    console.error('Error parsing pending changes:', error);
    return null;
  }
};

export default function ProductEditPage({ params }: { params: { id: string } }) {
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

  // Load product on page load
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoadingProduct(true)
        const response = await fetch(`/api/products/${params.id}`)
        if (response.ok) {
          const productData = await response.json()
          
          // Process JSON arrays from database
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
          
          // If product has pending image, set it as preview
          if (productData.pendingImageUrl) {
            setImagePreview(productData.pendingImageUrl)
          }
        } else {
          setErrorMessage('Failed to load product')
        }
      } catch (error) {
        console.error('Error loading product:', error)
        setErrorMessage('Error loading product')
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
      // Prepare data for submission
      const dataToSave = {
        ...product,
        // Convert arrays to JSON strings for database
        tags: JSON.stringify(product.tags),
        advantages: JSON.stringify(product.advantages),
        disadvantages: JSON.stringify(product.disadvantages),
        videoUrls: JSON.stringify(product.videoUrls),
        pricingInfo: JSON.stringify(product.pricingInfo)
      }

      const response = await fetch(`/api/company-admin/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      })

      if (response.ok) {
        const result = await response.json()
        
        if (result.isPending) {
          // Changes submitted for approval
          setSuccessMessage('Changes submitted for approval! Redirecting to products page...')
          setProduct(prev => ({
            ...prev,
            hasPendingChanges: true,
            changesStatus: 'pending'
          }))
          
          // Redirect to products page after 2 seconds
          setTimeout(() => {
            router.push('/company-admin/products')
          }, 2000)
        } else {
          // Direct save (shouldn't happen for company admin, but handle it)
          setSuccessMessage(result.message || 'Product saved successfully!')
        }
        
        setErrorMessage(null)
      } else {
        const errorData = await response.json()
        setErrorMessage(errorData.error || 'Error saving product')
        setSuccessMessage(null)
      }
    } catch (error) {
      console.error('Error saving product:', error)
      setErrorMessage('Error saving product')
      setSuccessMessage(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Tag management functions
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

  // Advantage management functions
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

  // Disadvantage management functions
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

  // Video URL management functions
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
      const syntheticEvent = {
        target: {
          files: e.dataTransfer.files
        }
      } as React.ChangeEvent<HTMLInputElement>
      
      handleImageChange(syntheticEvent)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('File is too large. Please select an image smaller than 10MB.')
        setSuccessMessage(null)
        return
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select an image file.')
        setSuccessMessage(null)
        return
      }
      
      setIsUploadingImage(true)
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setImagePreview(imageUrl)
        setProduct(prev => ({ 
          ...prev, 
          imageUrl,
          pendingImageUrl: imageUrl,
          imageApprovalStatus: 'pending'
        }))
        
        setSuccessMessage('Image uploaded! It will be displayed after approval.')
        setErrorMessage(null)
        setIsUploadingImage(false)
        setTimeout(() => setSuccessMessage(null), 3000)
      }
      reader.onerror = () => {
        setErrorMessage('Error reading file. Please try again.')
        setSuccessMessage(null)
        setIsUploadingImage(false)
      }
      reader.readAsDataURL(file)
    }
  }

  // Show loading state
  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Get display image - prioritize preview or pending image
  const displayImage = imagePreview || product.pendingImageUrl || product.imageUrl

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Products
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-sm text-gray-600">Complete editing of all product information</p>
            </div>
          </div>
        </div>

        {/* Toast Notifications */}
        {(successMessage || errorMessage) && (
          <div className="fixed top-4 right-4 z-50 space-y-2">
            {successMessage && (
              <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-in slide-in-from-right duration-300">
                <CheckIcon className="w-5 h-5 mr-2" />
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-in slide-in-from-right duration-300">
                <XMarkIcon className="w-5 h-5 mr-2" />
                <div className="flex-1">{errorMessage}</div>
                <button 
                  onClick={() => setErrorMessage(null)}
                  className="ml-2 text-white hover:text-gray-200"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-8">
              
              {/* Pending Changes Status */}
              {product.hasPendingChanges && product.changesStatus === 'pending' && (() => {
                const changes = getChangeSummary(product, (product as any).pendingChanges);
                return (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Changes Pending Approval
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            Your recent changes have been submitted and are waiting for admin approval. 
                            You can continue editing, but new changes will replace the pending ones.
                          </p>
                          {product.changesSubmittedAt && (
                            <p className="mt-1">
                              <strong>Submitted:</strong> {new Date(product.changesSubmittedAt).toLocaleString()}
                            </p>
                          )}
                          {changes && changes.length > 0 && (
                            <div className="mt-3">
                              <p className="font-medium text-yellow-800 mb-2">Pending changes:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {changes.map((change, index) => (
                                  <li key={index} className="text-sm">{change}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product Name *</label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => setProduct(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={product.category}
                      onChange={(e) => setProduct(prev => ({ ...prev, category: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    >
                      <option value="AI Writing">AI Writing</option>
                      <option value="AI Design">AI Design</option>
                      <option value="AI Marketing">AI Marketing</option>
                      <option value="AI Analytics">AI Analytics</option>
                      <option value="AI Development">AI Development</option>
                      <option value="AI Automation">AI Automation</option>
                      <option value="AI Customer Service">AI Customer Service</option>
                      <option value="AI Finance">AI Finance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={product.price}
                      onChange={(e) => setProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">External URL</label>
                    <input
                      type="url"
                      value={product.externalUrl}
                      onChange={(e) => setProduct(prev => ({ ...prev, externalUrl: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      id="hasTrial"
                      type="checkbox"
                      checked={product.hasTrial}
                      onChange={(e) => setProduct(prev => ({ ...prev, hasTrial: e.target.checked }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="hasTrial" className="ml-2 block text-sm text-gray-900">
                      Has trial version
                    </label>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Short Description</label>
                    <textarea
                      value={product.description}
                      onChange={(e) => setProduct(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      placeholder="Briefly describe your product..."
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Detailed Information</label>
                    <textarea
                      value={product.detailInfo}
                      onChange={(e) => setProduct(prev => ({ ...prev, detailInfo: e.target.value }))}
                      rows={6}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      placeholder="Detailed description of the product, its features and use cases..."
                    />
                  </div>
                </div>
              </div>

              {/* Product Image */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Product Image</h4>
                <div className="space-y-4">
                  {displayImage && (
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <Image
                          src={displayImage}
                          alt="Product preview"
                          width={250}
                          height={250}
                          className="rounded-lg object-cover border"
                        />
                        {/* Image status indicator */}
                        {product.imageApprovalStatus === 'pending' && (
                          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                            Pending approval
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null)
                            setProduct(prev => ({ 
                              ...prev, 
                              imageUrl: '', 
                              pendingImageUrl: null,
                              imageApprovalStatus: null 
                            }))
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div 
                    className={`flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-all duration-200 ${
                      dragActive 
                        ? 'border-purple-600 bg-purple-50 scale-105 shadow-lg' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-1 text-center">
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
                          <span>Upload file</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      {isUploadingImage && (
                        <div className="flex items-center justify-center mt-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                          <span className="ml-2 text-sm text-gray-600">Uploading...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Pricing Plans</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Basic Plan ($)</label>
                    <input
                      type="text"
                      value={product.pricingInfo.basic}
                      onChange={(e) => setProduct(prev => ({ 
                        ...prev, 
                        pricingInfo: { ...prev.pricingInfo, basic: e.target.value }
                      }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      placeholder="29"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pro Plan ($)</label>
                    <input
                      type="text"
                      value={product.pricingInfo.pro}
                      onChange={(e) => setProduct(prev => ({ 
                        ...prev, 
                        pricingInfo: { ...prev.pricingInfo, pro: e.target.value }
                      }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      placeholder="49"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Enterprise Plan ($)</label>
                    <input
                      type="text"
                      value={product.pricingInfo.enterprise}
                      onChange={(e) => setProduct(prev => ({ 
                        ...prev, 
                        pricingInfo: { ...prev.pricingInfo, enterprise: e.target.value }
                      }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      placeholder="99"
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Tags</h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  {product.tags.map((tag, index) => (
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
                    placeholder="Add new tag"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Advantages */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Advantages</h4>
                <div className="space-y-2 mb-2">
                  {product.advantages.map((advantage, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md"
                    >
                      <span className="text-sm text-green-800">{advantage}</span>
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
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAdvantage}
                    onChange={(e) => setNewAdvantage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAdvantage())}
                    placeholder="Add advantage"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={addAdvantage}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Disadvantages */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Disadvantages</h4>
                <div className="space-y-2 mb-2">
                  {product.disadvantages.map((disadvantage, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-md"
                    >
                      <span className="text-sm text-red-800">{disadvantage}</span>
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
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDisadvantage}
                    onChange={(e) => setNewDisadvantage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDisadvantage())}
                    placeholder="Add disadvantage"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={addDisadvantage}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Video URLs */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Reels and videos</h4>
                <div className="space-y-2 mb-2">
                  {product.videoUrls.map((videoUrl, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md"
                    >
                      <div className="flex items-center">
                        <PlayIcon className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm text-blue-800 truncate">{videoUrl}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVideoUrl(videoUrl)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVideoUrl())}
                    placeholder="Add video URL (YouTube, Vimeo, TikTok...)"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={addVideoUrl}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Status Information */}
              {product.imageApprovalStatus === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Image pending approval
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          New image was uploaded and is waiting for administrator approval. 
                          It will be displayed on the public product page after approval.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting for Approval...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Submit Changes for Approval
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 