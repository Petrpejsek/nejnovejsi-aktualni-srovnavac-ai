'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  StarIcon,
  ShieldCheckIcon,
  CheckBadgeIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarFilledIcon, BookmarkIcon as BookmarkFilledIcon } from '@heroicons/react/24/solid'
import { useSession } from 'next-auth/react'
import Modal from './Modal'
import RegisterForm from './RegisterForm'

interface Review {
  id: number
  userName: string
  rating: number
  comment: string
  date: string
  verified: boolean
}

interface ProductCardProps {
  id: string
  name: string
  description: string
  price: number
  imageUrl?: string
  tags?: string[]
  externalUrl?: string
  hasTrial?: boolean
  isBookmarked?: boolean
  onBookmarkChange?: (productId: string, isBookmarked: boolean) => void
}

declare global {
  interface Window {
    open(url?: string, target?: string, features?: string): Window | null;
  }
}

// Sample reviews data for different products
const getProductReviews = (productId: string): { rating: number; reviewsCount: number; reviews: Review[] } => {
  const reviewsData: Record<string, { rating: number; reviewsCount: number; reviews: Review[] }> = {
    // Default high-quality reviews for any product
    default: {
      rating: 4.6,
      reviewsCount: 127,
      reviews: []
    },
    // High-rated products
    '10web': {
      rating: 4.8,
      reviewsCount: 892,
      reviews: []
    },
    'academy-of-robotics': {
      rating: 4.9,
      reviewsCount: 234,
      reviews: []
    },
    'accounting-prose': {
      rating: 4.7,
      reviewsCount: 456,
      reviews: []
    }
  }

  // Try to find specific product reviews, fallback to default
  const productKey = productId.toLowerCase().replace(/\s+/g, '-')
  return reviewsData[productKey] || reviewsData.default
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

export default function ProductCard({ id, name, description, price, imageUrl, tags, externalUrl, hasTrial, isBookmarked, onBookmarkChange }: ProductCardProps) {
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [localBookmarked, setLocalBookmarked] = useState(isBookmarked || false)
  const [isAnimating, setIsAnimating] = useState(false)
  const { data: session } = useSession()

  // Get reviews for this product
  const productReviews = getProductReviews(name)

  useEffect(() => {
    setLocalBookmarked(isBookmarked || false)
  }, [isBookmarked])

  const handleVisit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!externalUrl) {
      console.log('❌ Chybí externí URL!')
      return
    }

    console.log('🚀 Přímé přesměrování přes tracking endpoint na:', externalUrl)
    
    // Místo async fetch + window.open (které prohlížeče blokují),
    // přesměrujeme přímo na náš GET endpoint který udělá tracking a redirect
    const trackingUrl = `/api/redirect?productId=${encodeURIComponent(id)}&externalUrl=${encodeURIComponent(externalUrl)}`
    
    // Toto prohlížeče NEblokují - je to přímé uživatelské kliknutí
    window.open(trackingUrl, '_blank', 'noopener,noreferrer')
  }

  const handleClick = async (productId: string) => {
    try {
      await fetch('/api/clicks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })
    } catch (error) {
      console.error('Error tracking click:', error)
    }
  }

  const recordClickHistory = async () => {
    // Only record if user is logged in
    if (!session) return

    try {
      await fetch('/api/users/click-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: id,
          productName: name,
          category: tags?.[0] || 'AI Tool',
          imageUrl: imageUrl,
          price: hasTrial ? 0 : price,
          externalUrl: externalUrl
        }),
      })
    } catch (error) {
      console.error('Error recording click history:', error)
    }
  }

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Check if user is authenticated
    if (!session) {
      setShowSignUpModal(true)
      return
    }
    
    // Start animation immediately
    setIsAnimating(true)
    
    // OPTIMISTIC UPDATE - update UI immediately
    const newBookmarkedState = !localBookmarked
    setLocalBookmarked(newBookmarkedState)
    
    // Show immediate visual feedback
    showToast(newBookmarkedState ? 'Saved' : 'Removed')
    
    // Call parent callback immediately for UI consistency
    if (onBookmarkChange) {
      onBookmarkChange(id, newBookmarkedState)
    }
    
    // End animation quickly
    setTimeout(() => setIsAnimating(false), 300)
    
    // API call in background - no await, non-blocking
    try {
      if (newBookmarkedState) {
        // Save product in background
        fetch('/api/users/saved-products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: id,
            productName: name,
            category: tags?.[0] || 'AI Tool',
            imageUrl: imageUrl,
            price: hasTrial ? 0 : price
          }),
        }).then(response => {
          if (!response.ok && response.status !== 409) {
            // Only revert on real errors (not 409 which means already saved)
            console.error('Error saving product, reverting UI')
            setLocalBookmarked(false)
            showToast('Error saving', 'error')
            if (onBookmarkChange) {
              onBookmarkChange(id, false)
            }
          }
        }).catch(error => {
          // Revert on network errors
          console.error('Network error saving product, reverting UI:', error)
          setLocalBookmarked(false)
          showToast('Error saving', 'error')
          if (onBookmarkChange) {
            onBookmarkChange(id, false)
          }
        })
      } else {
        // Remove product in background
        fetch(`/api/users/saved-products?productId=${id}`, {
          method: 'DELETE'
        }).then(response => {
          if (!response.ok) {
            // Revert on error
            console.error('Error removing product, reverting UI')
            setLocalBookmarked(true)
            showToast('Error removing', 'error')
            if (onBookmarkChange) {
              onBookmarkChange(id, true)
            }
          }
        }).catch(error => {
          // Revert on network errors
          console.error('Network error removing product, reverting UI:', error)
          setLocalBookmarked(true)
          showToast('Error removing', 'error')
          if (onBookmarkChange) {
            onBookmarkChange(id, true)
          }
        })
      }
    } catch (error) {
      // This should not happen since we're not awaiting, but just in case
      console.error('Unexpected error with bookmark operation:', error)
    }
  }

  // Malé hvězdičky pro decentní rating
  const renderSmallStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    const emptyStars = 5 - Math.ceil(rating)

    // Plné hvězdičky
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarFilledIcon key={`full-${i}`} className="w-3 h-3 text-yellow-400" />
      )
    }

    // Půl hvězdička
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="w-3 h-3 relative">
          <StarIcon className="w-3 h-3 text-gray-300 absolute" />
          <div className="overflow-hidden w-1/2">
            <StarFilledIcon className="w-3 h-3 text-yellow-400" />
          </div>
        </div>
      )
    }

    // Prázdné hvězdičky
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="w-3 h-3 text-gray-300" />
      )
    }

    return stars
  }

  // Decentní rating badge
  const renderDecentRating = (rating: number, reviewsCount: number) => {
    const isTopRated = rating >= 4.8

    return (
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5">
            {renderSmallStars(rating)}
          </div>
          <span className="text-xs font-medium text-gray-700">{rating}</span>
          <span className="text-xs text-gray-500">({reviewsCount})</span>
        </div>
        {isTopRated && (
          <div className="flex items-center gap-1">
            <CheckBadgeIcon className="w-3 h-3 text-yellow-500" />
            <span className="text-xs font-medium text-yellow-600">Top Choice</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div 
        className="bg-gradient-to-b from-white to-gray-50 rounded-lg shadow-lg hover:shadow-2xl border border-gray-200 transition-all duration-300 hover:scale-[1.02] hover:border-purple-300 h-full min-h-[400px] flex flex-col relative overflow-hidden cursor-pointer"
        onClick={(e) => {
          // Pokud klik není na bookmark tlačítku nebo "Try it" tlačítku, otevři externí URL
          const target = e.target as HTMLElement;
          if (!target.closest('button')) {
            console.log('🎯 Klik na product card:', name)
            recordClickHistory()
            handleVisit(e);
            handleClick(id);
          }
        }}
      >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Image section - původní aspect ratio */}
      <div className="relative w-full aspect-[1.91/1]">
        <Image
          src={imageUrl || 'https://placehold.co/800x450/f3f4f6/94a3b8?text=No+Image'}
          alt={name}
          fill
          className="object-cover rounded-t-lg"
        />
        {hasTrial && (
          <div className="absolute top-2 right-2 bg-purple-100 text-purple-600 text-xs font-medium px-2 py-1 rounded-full">
            Free Trial
          </div>
        )}
        
        {/* Bookmark button with gentle animation */}
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
      
      {/* Content section - původní layout */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Rating - pouze pokud má recenze */}
        {productReviews.reviews.length > 0 && renderDecentRating(productReviews.rating, productReviews.reviews.length)}
        
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight line-clamp-2">{name}</h3>
        
        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-3 flex-1 line-clamp-3">{description}</p>
        
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-md font-medium"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-gray-400 flex items-center">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* Price and action */}
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
          {hasTrial ? (
            <div className="text-lg font-bold text-purple-600">$0</div>
          ) : (
            <div className="text-lg font-bold text-purple-600">${price}</div>
          )}
          <button 
            onClick={(e) => {
              e.stopPropagation()
              console.log('🎯 Klik na Try it button:', name)
              recordClickHistory()
              handleVisit(e)
              handleClick(id)
            }}
            className="px-2 py-1.5 bg-gradient-primary text-white text-sm font-medium rounded-[14px] hover:opacity-90 transition-opacity"
          >
            {hasTrial ? 'Try for Free' : 'Try it'}
          </button>
        </div>
              </div>
      </div>
      
      {/* Sign Up Modal */}
      <Modal
        isOpen={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        title="Sign Up to Bookmark"
      >
        <RegisterForm
          onSuccess={() => {
            setShowSignUpModal(false)
            window.location.reload()
          }}
          onSwitchToLogin={() => setShowSignUpModal(false)}
        />
      </Modal>
    </>
  )
} 