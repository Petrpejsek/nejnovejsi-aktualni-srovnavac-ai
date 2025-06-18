'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeftIcon,
  PhotoIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface ProductForm {
  name: string
  description: string
  price: number
  category: string
  tags: string[]
  externalUrl: string
  hasTrial: boolean
  imageFile: File | null
  imageUrl: string
  advantages: string[]
  disadvantages: string[]
}

const categories = [
  'AI Tools',
  'Video Editing',
  'Text Editing',
  'Image Generation',
  'Audio Tools',
  'Productivity',
  'Design Tools',
  'Marketing',
  'Other'
]

const MAX_TAGS = 5
const MAX_ADVANTAGES = 5
const MAX_DISADVANTAGES = 5

export default function AddProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [advantageInput, setAdvantageInput] = useState('')
  const [disadvantageInput, setDisadvantageInput] = useState('')
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [loadingTags, setLoadingTags] = useState(true)
  
  const [form, setForm] = useState<ProductForm>({
    name: '',
    description: '',
    price: 0,
    category: '',
    tags: [],
    externalUrl: '',
    hasTrial: false,
    imageFile: null,
    imageUrl: '',
    advantages: [],
    disadvantages: []
  })

  // Load available tags on component mount
  useEffect(() => {
    const loadTags = async () => {
      try {
        const response = await fetch('/api/products?tagsOnly=true')
        if (response.ok) {
          const data = await response.json()
          setAvailableTags(data.tags || [])
        }
      } catch (error) {
        console.error('Error loading tags:', error)
      } finally {
        setLoadingTags(false)
      }
    }
    
    loadTags()
  }, [])

  const handleInputChange = (field: keyof ProductForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (2MB limit for Vercel)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image is too large. Maximum size is 2MB for Vercel deployment.')
        return
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.')
        return
      }
      
      setError(null)
      setForm(prev => ({ ...prev, imageFile: file }))
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setForm(prev => ({ ...prev, imageUrl: e.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleTag = (tag: string) => {
    setForm(prev => {
      const isSelected = prev.tags.includes(tag)
      
      if (isSelected) {
        // Remove tag
        return {
          ...prev,
          tags: prev.tags.filter(t => t !== tag)
        }
      } else {
        // Add tag only if under limit
        if (prev.tags.length >= MAX_TAGS) {
          return prev // Don't add if at limit
        }
        return {
          ...prev,
          tags: [...prev.tags, tag]
        }
      }
    })
  }

  const removeTag = (tag: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const addAdvantage = () => {
    if (advantageInput.trim() && !form.advantages.includes(advantageInput.trim()) && form.advantages.length < MAX_ADVANTAGES) {
      setForm(prev => ({
        ...prev,
        advantages: [...prev.advantages, advantageInput.trim()]
      }))
      setAdvantageInput('')
    }
  }

  const removeAdvantage = (index: number) => {
    setForm(prev => ({
      ...prev,
      advantages: prev.advantages.filter((_, i) => i !== index)
    }))
  }

  const addDisadvantage = () => {
    if (disadvantageInput.trim() && !form.disadvantages.includes(disadvantageInput.trim()) && form.disadvantages.length < MAX_DISADVANTAGES) {
      setForm(prev => ({
        ...prev,
        disadvantages: [...prev.disadvantages, disadvantageInput.trim()]
      }))
      setDisadvantageInput('')
    }
  }

  const removeDisadvantage = (index: number) => {
    setForm(prev => ({
      ...prev,
      disadvantages: prev.disadvantages.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    if (!form.name.trim()) return 'Product name is required'
    if (!form.description.trim()) return 'Product description is required'
    if (!form.category) return 'Category is required'
    if (!form.externalUrl.trim()) return 'Product URL is required'
    if (form.price < 0) return 'Price cannot be negative'
    if (!form.imageFile && !form.imageUrl) return 'Product image is required'
    if (form.tags.length > MAX_TAGS) return `Maximum ${MAX_TAGS} tags allowed`
    if (form.advantages.length > MAX_ADVANTAGES) return `Maximum ${MAX_ADVANTAGES} advantages allowed`
    if (form.disadvantages.length > MAX_DISADVANTAGES) return `Maximum ${MAX_DISADVANTAGES} disadvantages allowed`
    
    // Validate URL format - automatically add https:// if missing
    try {
      let urlToValidate = form.externalUrl.trim()
      
      // If URL doesn't start with protocol, add https://
      if (!urlToValidate.match(/^https?:\/\//)) {
        urlToValidate = 'https://' + urlToValidate
      }
      
      new URL(urlToValidate)
    } catch {
      return 'Product URL must be in correct format (e.g., example.com or www.example.com)'
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      
      // Normalize URL - add https:// if missing
      let normalizedUrl = form.externalUrl.trim()
      if (!normalizedUrl.match(/^https?:\/\//)) {
        normalizedUrl = 'https://' + normalizedUrl
      }
      
      formData.append('name', form.name)
      formData.append('description', form.description)
      formData.append('price', form.price.toString())
      formData.append('category', form.category)
      formData.append('tags', JSON.stringify(form.tags))
      formData.append('externalUrl', normalizedUrl)
      formData.append('hasTrial', form.hasTrial.toString())
      formData.append('advantages', JSON.stringify(form.advantages))
      formData.append('disadvantages', JSON.stringify(form.disadvantages))
      
      if (form.imageFile) {
        formData.append('image', form.imageFile)
      }

      const response = await fetch('/api/company-admin/products/add', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Chyba při přidávání produktu')
      }

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/company-admin/products')
        }, 2000)
      } else {
        throw new Error(data.error || 'Neočekávaná chyba')
      }
          } catch (err) {
        console.error('Error adding product:', err)
        setError(err instanceof Error ? err.message : 'Unexpected error')
      } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Successfully Submitted!</h2>
          <p className="text-gray-600 mb-4">
            Your product has been sent for approval to the super admin.
            <br />
            You will be notified of the review result by email.
          </p>
          <p className="text-sm text-gray-500">Redirecting in a moment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Back
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Add New Product</h1>
          <p className="text-sm text-gray-600">
            Fill in your product information. After submission, the product will be sent for approval.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 bg-white rounded-lg border border-gray-200 p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g. AI Content Generator"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Describe what your product does and its benefits..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">Enter 0 for free product</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product URL *
                </label>
                <input
                  type="text"
                  value={form.externalUrl}
                  onChange={(e) => handleInputChange('externalUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="example.com or www.example.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.hasTrial}
                    onChange={(e) => handleInputChange('hasTrial', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Product has free trial version
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Tags</h3>
              <span className={`text-sm font-medium ${
                form.tags.length >= MAX_TAGS ? 'text-red-600' : 'text-gray-500'
              }`}>
                {form.tags.length}/{MAX_TAGS} maximum
              </span>
            </div>
            
            {loadingTags ? (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                <span>Loading available tags...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selected tags */}
                {form.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {form.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-purple-600 hover:text-purple-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available tags */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Available tags:</h4>
                  {availableTags.length === 0 ? (
                    <p className="text-sm text-gray-500">No tags available</p>
                  ) : (
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {availableTags.map((tag) => {
                          const isSelected = form.tags.includes(tag)
                          const isDisabled = !isSelected && form.tags.length >= MAX_TAGS
                          
                          return (
                            <label
                              key={tag}
                              className={`flex items-center space-x-2 text-sm px-2 py-1 rounded ${
                                isDisabled 
                                  ? 'cursor-not-allowed opacity-50' 
                                  : 'cursor-pointer hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isDisabled}
                                onChange={() => toggleTag(tag)}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:cursor-not-allowed"
                              />
                              <span className={`${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
                                {tag}
                              </span>
                            </label>
                          )
                        })}
                      </div>
                                          </div>
                    )}
                    
                    {form.tags.length >= MAX_TAGS && (
                      <p className="text-sm text-red-600 mt-2">
                        Maximum {MAX_TAGS} tags allowed. Remove a tag to select a different one.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

          {/* Advantages */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Advantages</h3>
              <span className={`text-sm font-medium ${
                form.advantages.length >= MAX_ADVANTAGES ? 'text-red-600' : 'text-gray-500'
              }`}>
                {form.advantages.length}/{MAX_ADVANTAGES} maximum
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={advantageInput}
                  onChange={(e) => setAdvantageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAdvantage())}
                  disabled={form.advantages.length >= MAX_ADVANTAGES}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter product advantage..."
                />
                <button
                  type="button"
                  onClick={addAdvantage}
                  disabled={form.advantages.length >= MAX_ADVANTAGES || !advantageInput.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
              
              {form.advantages.length > 0 && (
                <div className="space-y-2">
                  {form.advantages.map((advantage, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-2 bg-green-50 border border-green-200 rounded-md"
                    >
                      <span className="text-sm text-green-800">{advantage}</span>
                      <button
                        type="button"
                        onClick={() => removeAdvantage(index)}
                        className="text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {form.advantages.length >= MAX_ADVANTAGES && (
                <p className="text-sm text-red-600">
                  Maximum {MAX_ADVANTAGES} advantages allowed. Remove an advantage to add a different one.
                </p>
              )}
            </div>
          </div>

          {/* Disadvantages */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Disadvantages</h3>
              <span className={`text-sm font-medium ${
                form.disadvantages.length >= MAX_DISADVANTAGES ? 'text-red-600' : 'text-gray-500'
              }`}>
                {form.disadvantages.length}/{MAX_DISADVANTAGES} maximum
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={disadvantageInput}
                  onChange={(e) => setDisadvantageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDisadvantage())}
                  disabled={form.disadvantages.length >= MAX_DISADVANTAGES}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter product disadvantage..."
                />
                <button
                  type="button"
                  onClick={addDisadvantage}
                  disabled={form.disadvantages.length >= MAX_DISADVANTAGES || !disadvantageInput.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
              
              {form.disadvantages.length > 0 && (
                <div className="space-y-2">
                  {form.disadvantages.map((disadvantage, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-2 bg-red-50 border border-red-200 rounded-md"
                    >
                      <span className="text-sm text-red-800">{disadvantage}</span>
                      <button
                        type="button"
                        onClick={() => removeDisadvantage(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {form.disadvantages.length >= MAX_DISADVANTAGES && (
                <p className="text-sm text-red-600">
                  Maximum {MAX_DISADVANTAGES} disadvantages allowed. Remove a disadvantage to add a different one.
                </p>
              )}
            </div>
          </div>

          {/* Image */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Image *</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  {form.imageUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={form.imageUrl}
                        alt="Product preview"
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <PhotoIcon className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 2MB for Vercel)</p>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </div>
      </form>
    </div>
  )
}