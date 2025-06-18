'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Modal from '../../../components/Modal'
import RegisterForm from '../../../components/RegisterForm'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  tags?: string[]
  advantages?: string[]
  disadvantages?: string[]
  reviews?: Array<{
    author: string
    rating: number
    text: string
  }>
  detailInfo?: string
  pricingInfo?: {
    basic?: string
    pro?: string
    enterprise?: string
  }
  videoUrls?: string[]
  externalUrl?: string
  hasTrial?: boolean
  createdAt: string
  updatedAt: string
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
  toast.style.transform = 'translateX(100%)'
  
  document.body.appendChild(toast)
  
  // Slide in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)'
  }, 10)
  
  // Slide out and remove
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)'
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast)
      }
    }, 300)
  }, 3000)
}

export default function ProductDetail({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set())
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/products/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch product')
        const data = await response.json()
        setProduct(data)
      } catch (err) {
        console.error('Error fetching product:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  const handleSave = async (id: string) => {
    if (!session) {
      setShowSignUpModal(true)
      return
    }

    // Start animation immediately
    setIsAnimating(true)

    // OPTIMISTIC UPDATE - okamžitě aktualizujeme UI
    const newSaved = new Set(savedItems)
    const isCurrentlySaved = newSaved.has(id)
    
    if (!isCurrentlySaved) {
      newSaved.add(id)
      setSavedItems(newSaved)
      showToast('Saved')
    } else {
      newSaved.delete(id)
      setSavedItems(newSaved)
      showToast('Removed')
    }
    
    // End animation quickly
    setTimeout(() => setIsAnimating(false), 300)

    // API call in background - no await, non-blocking
    try {
      if (!isCurrentlySaved) {
        // Save product in background
        fetch('/api/users/saved-products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: id,
            productName: product?.name || '',
            category: product?.category || 'AI Tool',
            imageUrl: product?.imageUrl,
            price: product?.hasTrial ? 0 : product?.price || 0
          }),
        }).then(response => {
          if (!response.ok && response.status !== 409) {
            // Only revert on real errors (not 409 which means already saved)
            console.error('Error saving product, reverting UI')
            const revertedSaved = new Set(savedItems)
            revertedSaved.delete(id)
            setSavedItems(revertedSaved)
            showToast('Error saving', 'error')
          }
        }).catch(error => {
          // Revert on network errors
          console.error('Network error saving product, reverting UI:', error)
          const revertedSaved = new Set(savedItems)
          revertedSaved.delete(id)
          setSavedItems(revertedSaved)
          showToast('Error saving', 'error')
        })
      } else {
        // Remove product in background
        fetch(`/api/users/saved-products?productId=${id}`, {
          method: 'DELETE'
        }).then(response => {
          if (!response.ok) {
            // Revert on error
            console.error('Error removing product, reverting UI')
            const revertedSaved = new Set(savedItems)
            revertedSaved.add(id)
            setSavedItems(revertedSaved)
            showToast('Error removing', 'error')
          }
        }).catch(error => {
          // Revert on network errors
          console.error('Network error removing product, reverting UI:', error)
          const revertedSaved = new Set(savedItems)
          revertedSaved.add(id)
          setSavedItems(revertedSaved)
          showToast('Error removing', 'error')
        })
      }
    } catch (error) {
      console.error('Unexpected error with save operation:', error)
    }
  }

  const handleVisit = () => {
    if (!product?.externalUrl) {
      console.log('Chybí URL!')
      return
    }

    try {
      // Použijeme dočasný HTML link místo window.open() pro lepší kompatibilitu
      const tempLink = document.createElement('a')
      tempLink.href = product.externalUrl
      tempLink.target = '_blank'
      tempLink.rel = 'noopener,noreferrer'
      document.body.appendChild(tempLink)
      tempLink.click()
      document.body.removeChild(tempLink)
    } catch (error) {
      console.error('Chyba při otevírání URL:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50/50 to-blue-50/50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50/50 to-blue-50/50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 to-blue-50/50">
      <div className="relative">
        {/* Main Content */}
        <div className="relative">
      <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
              {/* Back button */}
              <div className="mb-6">
                <button
                  onClick={() => window.history.back()}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
                  Back to Results
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Left Column - Image and Basic Info */}
                  <div className="p-8">
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6">
                <Image
                  src={product.imageUrl || 'https://placehold.co/800x450/f3f4f6/94a3b8?text=No+Image'}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                      {product.hasTrial && (
                        <div className="absolute top-4 right-4 bg-green-100 text-green-600 text-sm font-medium px-3 py-1 rounded-full">
                          Free Trial
                        </div>
                      )}
              </div>
              
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold text-purple-600">
                  {product.hasTrial ? '$0' : `$${product.price}`}
                </div>
                        {product.category && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                            {product.category}
                          </span>
                        )}
                      </div>
                  </div>
                    
                    <div className="flex gap-4">
                      <a
                        href={product.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-6 py-3 bg-gradient-primary text-white font-medium rounded-lg hover-gradient-primary transition-all text-center"
                >
                        {product.hasTrial ? 'Try for Free' : 'Try it'}
                      </a>
              </div>
            </div>

                  {/* Right Column - Detailed Information */}
                  <div className="p-8 bg-gray-50">
                    <div className="space-y-6">
                <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                        <p className="text-gray-700 leading-relaxed">{product.description}</p>
                      </div>
                      
                      {product.tags && product.tags.length > 0 && (
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 mb-3">Tags</h2>
                          <div className="flex flex-wrap gap-2">
                            {product.tags.map((tag, index) => (
                              <span 
                                key={index}
                                className="px-3 py-1 bg-white text-gray-600 rounded-md text-sm border"
                              >
                                {tag}
                              </span>
                            ))}
                      </div>
                      </div>
                    )}
                    
                  {product.advantages && product.advantages.length > 0 && (
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 mb-3">Advantages</h2>
                      <ul className="space-y-2">
                        {product.advantages.map((advantage, index) => (
                          <li key={index} className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                                <span className="text-gray-700">{advantage}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {product.disadvantages && product.disadvantages.length > 0 && (
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 mb-3">Considerations</h2>
                      <ul className="space-y-2">
                        {product.disadvantages.map((disadvantage, index) => (
                          <li key={index} className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                                <span className="text-gray-700">{disadvantage}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {product.videoUrls && product.videoUrls.length > 0 && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Video Tutorials</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {product.videoUrls.map((videoUrl, index) => (
                        <div key={index} className="rounded-[14px] overflow-hidden bg-gray-50">
                          <video
                            src={videoUrl}
                            controls
                            className="w-full aspect-video"
                            poster="/video-thumbnail.jpg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Save Button with Animation */}
          <div className="absolute bottom-6 right-6">
            <button 
              onClick={() => product && handleSave(product.id)}
              className={`px-4 py-2 text-sm font-medium rounded-[14px] border transition-all duration-300 ${
                savedItems.has(product?.id || '')
                  ? 'border-green-500 text-green-600 bg-green-50 hover:bg-green-100'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              } ${isAnimating ? 'animate-pulse transform -translate-y-1' : ''}`}
            >
              {savedItems.has(product?.id || '') ? 'Uloženo ✓' : 'Uložit'}
            </button>
          </div>
        </div>
      </div>

      {/* Sign Up Modal */}
      <Modal
        isOpen={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        title="Sign Up to Save"
      >
        <RegisterForm
          onSuccess={() => {
            setShowSignUpModal(false)
            window.location.reload()
          }}
          onSwitchToLogin={() => setShowSignUpModal(false)}
        />
      </Modal>
    </div>
  )
} 