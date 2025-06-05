import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
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

export default function ProductCard({ id, name, description, price, imageUrl, tags, externalUrl, hasTrial, isBookmarked, onBookmarkChange }: ProductCardProps) {
  const [visibleTags, setVisibleTags] = useState<string[]>(tags || [])
  const [hiddenTagsCount, setHiddenTagsCount] = useState(0)
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [localBookmarked, setLocalBookmarked] = useState(isBookmarked || false)
  const tagsContainerRef = useRef<HTMLDivElement>(null)
  const measurementDivRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()

  // Get reviews for this product
  const productReviews = getProductReviews(name)

  useEffect(() => {
    if (!tags || !tagsContainerRef.current || !measurementDivRef.current) return

    // Počkáme na vykreslení DOM
    setTimeout(() => {
      if (!tagsContainerRef.current || !measurementDivRef.current) return

      const containerWidth = tagsContainerRef.current.offsetWidth
      const tagElements = Array.from(measurementDivRef.current.children) as HTMLElement[]
      let currentWidth = 0
      let currentRow = 1
      let visibleCount = 0
      let rowStartIndex = 0

      // Procházíme všechny tagy a počítáme jejich šířky
      for (let i = 0; i < tagElements.length; i++) {
        const tagWidth = tagElements[i].getBoundingClientRect().width + 8 // 8px pro margin
        
        // Pokud se tag nevejde do aktuálního řádku
        if (currentWidth + tagWidth > containerWidth) {
          currentRow++
          currentWidth = tagWidth
          rowStartIndex = i
        } else {
          currentWidth += tagWidth
        }

        // Pokud jsme stále v rámci dvou řádků, přidáme tag
        if (currentRow <= 2) {
          visibleCount = i + 1
        } else {
          // Pokud začínáme třetí řádek, vrátíme se na začátek řádku
          visibleCount = rowStartIndex
          break
        }
      }

      setVisibleTags(tags.slice(0, visibleCount))
      setHiddenTagsCount(Math.max(0, tags.length - visibleCount))
    }, 0)
  }, [tags])

  const handleVisit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!externalUrl) {
      console.log('Chybí URL!')
      return
    }

    try {
      window.open(externalUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Chyba při otevírání URL:', error)
    }
  }

  const handleClick = async (productId: string) => {
    try {
      // Odešleme klik na server
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

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Check if user is authenticated
    if (!session) {
      setShowSignUpModal(true)
      return
    }
    
    // Toggle bookmark
    const newBookmarkedState = !localBookmarked
    setLocalBookmarked(newBookmarkedState)
    
    // Call parent callback if provided
    if (onBookmarkChange) {
      onBookmarkChange(id, newBookmarkedState)
    }
    
    // Here you would typically save to backend
    console.log(`Product ${id} bookmark status: ${newBookmarkedState}`)
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
      <div className="bg-gradient-to-b from-white to-gray-50 rounded-lg shadow-lg hover:shadow-2xl border border-gray-200 transition-all duration-300 hover:scale-[1.02] hover:border-purple-300 h-full min-h-[400px] flex flex-col relative overflow-hidden">
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
        
        {/* Bookmark button */}
        <button
          onClick={handleBookmark}
          className="absolute top-2 left-2 w-8 h-8 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110"
        >
          {localBookmarked ? (
            <BookmarkFilledIcon className="w-4 h-4 text-purple-600" />
          ) : (
            <BookmarkIcon className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>
      
      {/* Content section - původní layout */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          {/* Decentní rating nad názvem */}
          {renderDecentRating(productReviews.rating, productReviews.reviewsCount)}
          
          {/* Název produktu */}
          <h2 className="text-lg font-semibold text-gray-800 mb-2">{name}</h2>
          
          {/* Popis - původní */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
          
          {/* Tagy - původní implementace */}
          {tags && tags.length > 0 && (
            <>
              {/* Skrytý div pro měření šířky tagů */}
              <div 
                ref={measurementDivRef} 
                className="absolute opacity-0 pointer-events-none"
                style={{ display: 'flex', gap: '0.5rem', maxWidth: '100%' }}
              >
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-600 whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Viditelné tagy */}
              <div ref={tagsContainerRef} className="flex flex-wrap gap-2 mb-4 max-h-[4.5rem] overflow-hidden">
                {visibleTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-600 whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
                {hiddenTagsCount > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600">
                    +{hiddenTagsCount} more
                  </span>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* Cena a tlačítko - původní */}
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
          {hasTrial ? (
            <div className="text-lg font-bold text-purple-600">$0</div>
          ) : (
            <div className="text-lg font-bold text-purple-600">${price}</div>
          )}
          <button 
            onClick={(e) => {
              e.stopPropagation()
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