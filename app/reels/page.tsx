'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlayIcon, PauseIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'
import { HeartIcon, ShareIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartFilledIcon } from '@heroicons/react/24/solid'
import { useSession } from 'next-auth/react'
import Modal from '../../components/Modal'
import RegisterForm from '../../components/RegisterForm'
import { getReelThumbnail } from '../../lib/videoUtils'

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

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([])
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [favoriteReels, setFavoriteReels] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const { data: session } = useSession()

  // Filter reels based on search and favorites
  const filteredReels = reels.filter(reel => {
    const matchesSearch = !searchQuery || 
      reel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reel.description && reel.description.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesFavorites = !showFavoritesOnly || favoriteReels.has(reel.id)
    
    return matchesSearch && matchesFavorites
  })

  // Load reels from API (same as ReelsCarousel)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      month: 'short',
      day: 'numeric'
    })
  }

  // Komponenta pro jednotlivý reel item s thumbnail logikou
  const ReelGridItem = ({ reel }: { reel: Reel }) => {
    const finalThumbnail = getReelThumbnail(reel.thumbnailUrl, null)
    
    return (
      <div className="flex justify-center">
        {/* Single Reel Container - Same Style as Homepage */}
        <div className="relative h-96 w-54 rounded-3xl overflow-hidden bg-gray-900 shadow-2xl"
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
               {/* Thumbnail Display */}
               {reel.thumbnailUrl ? (
                 // Použij vlastní thumbnail pokud existuje
                 <img
                   src={finalThumbnail}
                   alt={reel.title}
                   className="w-full h-full object-cover"
                   loading="lazy"
                   onError={(e) => {
                     // Fallback na video preview při chybě
                     e.currentTarget.style.display = 'none'
                     const video = e.currentTarget.parentElement?.querySelector('video')
                     if (video) video.style.display = 'block'
                   }}
                 />
               ) : null}
               
               {/* Video fallback preview - zobrazí se pouze pokud není thumbnail */}
               <video
                 src={reel.videoUrl}
                 className={`w-full h-full object-cover ${reel.thumbnailUrl ? 'hidden' : 'block'}`}
                 preload="metadata"
                 muted
                 playsInline
                 style={{ display: reel.thumbnailUrl ? 'none' : 'block' }}
                 onError={() => {
                   // Ultimate fallback na placeholder
                   const placeholder = document.createElement('img')
                   placeholder.src = '/img/reel-placeholder.svg'
                   placeholder.className = 'w-full h-full object-cover'
                   placeholder.alt = reel.title
                 }}
               />
               
               {/* Play Icon Overlay */}
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                   <PlayIcon className="w-10 h-10 text-white ml-1" />
                 </div>
               </div>
             </div>
           )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
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
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          {/* Back to home */}
          <div className="mb-6">
            <Link 
              href="/"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI Reels <span className="text-gradient-primary">Collection</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover powerful AI tools through engaging video content. Learn, explore, and master AI in bite-sized format.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-2xl mx-auto">
            {/* Search Bar */}
            <div className="relative mb-6">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search reels by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            {/* Filter Options */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  showFavoritesOnly
                    ? 'bg-red-100 text-red-700 border border-red-300'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <HeartIcon className="w-4 h-4" />
                Favorites Only
              </button>
              <span className="text-sm text-gray-500">
                {filteredReels.length} reels found
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reels Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {filteredReels.map((reel) => (
              <ReelGridItem key={reel.id} reel={reel} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredReels.length === 0 && reels.length > 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matching reels found</h3>
            <p className="text-gray-500">Try adjusting your search terms or filters</p>
          </div>
        )}

        {/* Empty State - No reels at all */}
        {!loading && reels.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🎬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reels yet</h3>
            <p className="text-gray-600 mb-4">
              Check back later for new content or visit our main page to discover AI tools.
            </p>
            <Link
              href="/"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Explore AI Tools
            </Link>
          </div>
        )}
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
  );
} 