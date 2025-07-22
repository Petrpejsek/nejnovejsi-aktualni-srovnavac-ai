'use client'

import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline'
import { HeartIcon, ShareIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartFilledIcon, BookmarkIcon as BookmarkFilledIcon } from '@heroicons/react/24/solid'
import { useSession } from 'next-auth/react'
import Modal from './Modal'
import RegisterForm from './RegisterForm'

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

interface Reel {
  id: string
  title: string
  description: string | null
  videoUrl: string
  thumbnailUrl: string | null
  createdAt: string
  updatedAt: string
}

export default function ReelsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [reels, setReels] = useState<Reel[]>([])
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [favoriteReels, setFavoriteReels] = useState<Set<string>>(new Set())
  const { data: session } = useSession()

  // Load reels from API
  useEffect(() => {
    const loadReels = async () => {
      try {
        const response = await fetch('/api/reels')
        if (response.ok) {
          const data = await response.json()
          setReels(data)
        }
      } catch (error) {
        console.error('Error loading reels:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadReels()
  }, [])

  // Kontrola možnosti scrollování
  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
      
      // Vypočítej aktuální index
      const reelWidth = clientWidth
      const newIndex = Math.round(scrollLeft / reelWidth)
      setCurrentIndex(newIndex)
    }
  }

  useEffect(() => {
    checkScrollButtons()
    const handleResize = () => checkScrollButtons()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const reelWidth = 216 + 24 // 216px width + 24px gap
      const scrollAmount = reelWidth * 2 // Scroll 2 reels at a time
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
      
      setTimeout(checkScrollButtons, 300)
    }
  }

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const containerWidth = scrollRef.current.clientWidth
      scrollRef.current.scrollTo({
        left: index * containerWidth,
        behavior: 'smooth'
      })
    }
  }

  const handlePlay = (id: string) => {
    setPlayingId(playingId === id ? null : id)
  }

  const handleFavorite = async (reelId: string) => {
    if (!session) {
      setShowSignUpModal(true)
      return
    }

    // Optimistic update
    const newFavorites = new Set(favoriteReels)
    const isCurrentlyFavorited = newFavorites.has(reelId)
    
    if (isCurrentlyFavorited) {
      newFavorites.delete(reelId)
    } else {
      newFavorites.add(reelId)
    }
    
    setFavoriteReels(newFavorites)
    showToast(isCurrentlyFavorited ? 'Removed!' : 'Saved!', 'success')

    // Background API call to save favorite
    try {
      const reel = reels.find(r => r.id === reelId)
      if (!reel) return
      
      if (!isCurrentlyFavorited) {
        // Add to favorites
        fetch('/api/users/saved-products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: reelId,
            productName: reel.title,
            category: 'Reel',
            imageUrl: reel.thumbnailUrl || reel.videoUrl,
            price: 0
          }),
        }).catch(error => {
          console.error('Error saving reel:', error)
          // Revert on error
          const revertedFavorites = new Set(favoriteReels)
          revertedFavorites.delete(reelId)
          setFavoriteReels(revertedFavorites)
          showToast('Error saving', 'error')
        })
      } else {
        // Remove from favorites
        fetch(`/api/users/saved-products?productId=${reelId}`, {
          method: 'DELETE'
        }).catch(error => {
          console.error('Error removing reel:', error)
        })
      }
    } catch (error) {
      console.error('Error with favorite operation:', error)
    }
  }

  const handleShare = async (reel: Reel) => {
    const shareUrl = `${window.location.origin}/reels/${reel.id}`
    
    if (navigator.share) {
      // Native sharing on mobile
      try {
        await navigator.share({
          title: reel.title,
          url: shareUrl
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Copy to clipboard on desktop
      try {
        await navigator.clipboard.writeText(shareUrl)
        showToast('Link copied!', 'success')
      } catch (error) {
        console.error('Error copying to clipboard:', error)
        showToast('Error copying link', 'error')
      }
    }
  }



  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Scroll. Learn. Discover AI
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            powerful reels that show real AI tools in action
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Left Arrow - Hidden on mobile */}
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hidden md:flex ${
              canScrollLeft 
                ? 'hover:bg-black/70 cursor-pointer opacity-100' 
                : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <ChevronLeftIcon className="w-6 h-6 text-white" />
          </button>

          {/* Right Arrow - Hidden on mobile */}
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hidden md:flex ${
              canScrollRight 
                ? 'hover:bg-black/70 cursor-pointer opacity-100' 
                : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <ChevronRightIcon className="w-6 h-6 text-white" />
          </button>

          {/* Reels Container */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : reels.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">🎬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reels yet</h3>
              <p className="text-gray-500">Check back soon for amazing AI content!</p>
            </div>
          ) : (
          <div
            ref={scrollRef}
            onScroll={checkScrollButtons}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 md:px-16"
            style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {reels.map((reel, index) => (
              <div
                key={reel.id}
                  className="flex-shrink-0 snap-center snap-always"
                >
                  {/* Single Reel Container */}
                  <div className="relative h-96 w-54 rounded-3xl overflow-hidden bg-gray-900"
                     style={{ height: '384px', width: '216px' }}
                >
                    {/* Video/Thumbnail Display */}
                    {playingId === reel.id ? (
                      <video
                        src={reel.videoUrl}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        preload="metadata"
                        controls
                        playsInline
                      />
                    ) : (
                      <div className="w-full h-full relative">
                        {reel.thumbnailUrl ? (
                          <img
                            src={reel.thumbnailUrl}
                    alt={reel.title}
                    className="w-full h-full object-cover"
                  />
                        ) : (
                          <video
                            src={reel.videoUrl}
                            className="w-full h-full object-cover"
                            muted
                            preload="metadata"
                          />
                        )}
                        
                        {/* Play Icon Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                            <PlayIcon className="w-10 h-10 text-white ml-1" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Interactive Overlay */}
                    <button
                      onClick={() => handlePlay(reel.id)}
                      className={`absolute inset-0 ${playingId === reel.id ? 'flex items-center justify-center group' : ''}`}
                    >
                      {playingId === reel.id && (
                        <div className="w-16 h-16 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <PauseIcon className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </button>

                    {/* Favorite Button */}
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFavorite(reel.id)
                        }}
                        className="w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                      >
                        {favoriteReels.has(reel.id) ? (
                          <HeartFilledIcon className="w-6 h-6 text-red-500" />
                        ) : (
                          <HeartIcon className="w-6 h-6 text-white" />
                        )}
                      </button>
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">                      
                      {/* Title */}
                    <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                      {reel.title}
                    </h3>
                      
                      {/* Description */}
                      {reel.description && (
                    <p className="text-white/90 text-sm line-clamp-2 mb-4">
                      {reel.description}
                    </p>
                      )}
                  </div>

                    {/* Share Button */}
                    <div className="absolute right-4 bottom-24">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleShare(reel)
                        }}
                        className="flex flex-col items-center gap-1 group/share"
                      >
                        <ShareIcon className="w-8 h-8 text-white group-hover/share:text-blue-400 group-hover/share:scale-110 transition-all" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              </div>
          )}

          {/* Progress Indicators */}
          {!loading && reels.length > 0 && (
            <div className="flex justify-center mt-4 gap-2">
              {reels.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentIndex 
                      ? 'bg-purple-600 w-6' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
            ))}
          </div>
          )}
        </div>

        {/* Mobile tip */}
        <div className="mt-6 text-center md:hidden">
          <p className="text-sm text-gray-500">
            💡 Tip: Swipe left and right to browse reels
          </p>
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Link 
            href="/reels" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            Explore All AI Reels
            <ChevronRightIcon className="w-5 h-5 ml-2" />
          </Link>
        </div>
        
        {/* Sign Up Modal */}
        <Modal
          isOpen={showSignUpModal}
          onClose={() => setShowSignUpModal(false)}
          title="Sign Up"
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
    </section>
  )
} 