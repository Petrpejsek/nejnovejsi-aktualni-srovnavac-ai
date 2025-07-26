'use client'

import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline'
import { HeartIcon, ShareIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartFilledIcon, BookmarkIcon as BookmarkFilledIcon } from '@heroicons/react/24/solid'
import { useSession } from 'next-auth/react'
import Modal from './Modal'
import RegisterForm from './RegisterForm'
import { getReelThumbnail, isMobile } from '../lib/videoUtils'

// Helper funkce pro sestavení správného video URL
const getVideoUrl = (videoUrl: string): string => {
  if (!videoUrl) {
    console.error('🚨 Empty videoUrl provided to getVideoUrl')
    return ''
  }

  // Pokud už je absolutní URL, vrátíme ji
  if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
    console.log('🔗 Using absolute video URL:', videoUrl)
    return videoUrl
  }

  // Fallback pro base URL
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  
  // Pokud je relativní URL (začíná '/uploads/' nebo '/')
  if (videoUrl.startsWith('/')) {
    const finalUrl = `${baseURL}${videoUrl}`
    console.log('🎬 Generated video URL:', finalUrl, 'from original:', videoUrl)
    return finalUrl
  }
  
  // Ujistíme se, že cesta začíná lomítkem pro ostatní případy
  const normalizedPath = `/${videoUrl}`
  const finalUrl = `${baseURL}${normalizedPath}`
  
  console.log('🎬 Generated video URL:', finalUrl, 'from original:', videoUrl)
  return finalUrl
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

interface Reel {
  id: string
  title: string
  description: string | null
  videoUrl: string
  thumbnailUrl: string | null
  createdAt: string
  updatedAt: string
  adText?: string | null
  adLink?: string | null
  adEnabled?: boolean
}

export default function ReelsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({})
  const overlayTimeouts = useRef<{ [key: string]: NodeJS.Timeout | null }>({})
  const adTimeouts = useRef<{ [key: string]: NodeJS.Timeout | null }>({})
  
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [reels, setReels] = useState<Reel[]>([])
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [favoriteReels, setFavoriteReels] = useState<Set<string>>(new Set())
  const [showOverlay, setShowOverlay] = useState<{ [key: string]: boolean }>({})
  const [showAdBanner, setShowAdBanner] = useState<{ [key: string]: boolean }>({})
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const [isInFullscreen, setIsInFullscreen] = useState(false)
  
  const { data: session } = useSession()

  // Detect mobile on mount
  useEffect(() => {
    setIsMobileDevice(isMobile())
    const handleResize = () => setIsMobileDevice(isMobile())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement
      setIsInFullscreen(isFullscreen)
      
      // If exiting fullscreen, pause current video and reset state
      if (!isFullscreen && playingId) {
        const video = videoRefs.current[playingId]
        if (video) {
          video.pause()
        }
        setPlayingId(null)
        setShowOverlay({ ...showOverlay, [playingId]: true })
        setShowAdBanner({ ...showAdBanner, [playingId]: false })
        
        // Clear timeouts
        if (overlayTimeouts.current[playingId]) {
          clearTimeout(overlayTimeouts.current[playingId])
          overlayTimeouts.current[playingId] = null
        }
        if (adTimeouts.current[playingId]) {
          clearTimeout(adTimeouts.current[playingId])
          adTimeouts.current[playingId] = null
        }
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [playingId, showOverlay, showAdBanner])

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

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(overlayTimeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout)
      })
      Object.values(adTimeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout)
      })
    }
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

  const handlePlay = async (id: string) => {
    const video = videoRefs.current[id]
    const reel = reels.find(r => r.id === id)
    
    console.log(`🎯 handlePlay called for ${reel?.title} (${id})`)
    console.log('🎥 Video element:', video)
    console.log('📱 Is mobile device:', isMobileDevice)
    
    if (!video) {
      console.error('❌ No video element found for:', id)
      return
    }

    if (!reel) {
      console.error('❌ No reel data found for:', id)
      return
    }

    console.log('🎬 Video details:', {
      src: video.src,
      readyState: video.readyState,
      networkState: video.networkState,
      duration: video.duration,
      currentTime: video.currentTime
    })

    // If currently playing, pause
    if (playingId === id) {
      console.log('⏸️ Pausing video:', reel.title)
      video.pause()
      setPlayingId(null)
      setShowOverlay({ ...showOverlay, [id]: true })
      setShowAdBanner({ ...showAdBanner, [id]: false })
      
      // Clear timeouts
      if (overlayTimeouts.current[id]) {
        clearTimeout(overlayTimeouts.current[id])
        overlayTimeouts.current[id] = null
      }
      if (adTimeouts.current[id]) {
        clearTimeout(adTimeouts.current[id])
        adTimeouts.current[id] = null
      }
      return
    }

    // Stop any other playing video
    if (playingId) {
      console.log('⏹️ Stopping other video:', playingId)
      const prevVideo = videoRefs.current[playingId]
      if (prevVideo) {
        prevVideo.pause()
      }
      setShowOverlay({ ...showOverlay, [playingId]: true })
      setShowAdBanner({ ...showAdBanner, [playingId]: false })
      
      // Clear previous timeouts
      if (overlayTimeouts.current[playingId]) {
        clearTimeout(overlayTimeouts.current[playingId])
        overlayTimeouts.current[playingId] = null
      }
      if (adTimeouts.current[playingId]) {
        clearTimeout(adTimeouts.current[playingId])
        adTimeouts.current[playingId] = null
      }
    }

    // Start playing new video
    console.log('▶️ Starting video:', reel.title)
    setPlayingId(id)
    setShowOverlay({ ...showOverlay, [id]: true })
    setShowAdBanner({ ...showAdBanner, [id]: false })

    try {
      if (isMobileDevice) {
        // Mobile: Enter fullscreen
        console.log('📱 Trying to enter fullscreen on mobile')
        try {
          if (video.requestFullscreen) {
            console.log('🔳 Using requestFullscreen')
            await video.requestFullscreen()
          } else if ((video as any).webkitEnterFullscreen) {
            console.log('🍎 Using webkitEnterFullscreen for iOS')
            // iOS Safari fallback
            await (video as any).webkitEnterFullscreen()
          }
        } catch (error) {
          console.warn('⚠️ Fullscreen failed, playing inline:', error)
        }
      }
      
      console.log('▶️ Calling video.play()')
      await video.play()
      console.log('✅ Video.play() successful')
      
      // Hide overlay after 1.5 seconds (podle requirements)
      overlayTimeouts.current[id] = setTimeout(() => {
        console.log('👻 Hiding overlay for:', reel.title)
        setShowOverlay(prev => ({ ...prev, [id]: false }))
      }, 1500)
      
      // Show ad banner after 5 seconds if enabled
      if (reel.adEnabled && reel.adText && reel.adLink) {
        console.log('🎯 Ad banner will show after 5s for:', reel.title)
        adTimeouts.current[id] = setTimeout(() => {
          console.log('📺 Showing ad banner for:', reel.title)
          setShowAdBanner(prev => ({ ...prev, [id]: true }))
        }, 5000)
      }
      
    } catch (error) {
      console.error('❌ Error playing video:', error)
      console.error('🎬 Video error details:', {
        name: (error as Error)?.name || 'Unknown',
        message: (error as Error)?.message || 'Unknown error',
        videoSrc: video.src,
        videoReadyState: video.readyState,
        videoNetworkState: video.networkState
      })
      setPlayingId(null)
    }
  }

  const handleVideoEnded = (id: string) => {
    // Reset state when video ends
    setPlayingId(null)
    setShowOverlay({ ...showOverlay, [id]: true })
    setShowAdBanner({ ...showAdBanner, [id]: false })
    
    // Clear timeouts
    if (overlayTimeouts.current[id]) {
      clearTimeout(overlayTimeouts.current[id])
      overlayTimeouts.current[id] = null
    }
    if (adTimeouts.current[id]) {
      clearTimeout(adTimeouts.current[id])
      adTimeouts.current[id] = null
    }
    
    // Exit fullscreen if needed
    if (isMobileDevice && document.fullscreenElement) {
      document.exitFullscreen()
    }
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

  // Komponenta pro jednotlivý reel s inteligentní thumbnail logikou
  const ReelItem = ({ reel, index }: { reel: Reel, index: number }) => {
    const finalThumbnail = getReelThumbnail(reel.thumbnailUrl, null)
    const finalVideoUrl = getVideoUrl(reel.videoUrl)
    
    // Debug logování pro každý reel
    console.log(`🎬 ReelItem ${index} (${reel.id}):`, {
      title: reel.title,
      originalVideoUrl: reel.videoUrl,
      finalVideoUrl: finalVideoUrl,
      thumbnailUrl: reel.thumbnailUrl,
      finalThumbnail: finalThumbnail,
      isPlaying: playingId === reel.id
    })
    
    return (
      <div className="flex-shrink-0 snap-center snap-always">
        {/* Single Reel Container */}
        <div className="relative h-96 w-54 rounded-3xl overflow-hidden bg-gray-900"
             style={{ height: '384px', width: '216px' }}
        >
          {/* Video/Thumbnail Display */}
          {playingId === reel.id ? (
            <>
              <video
                ref={(el) => {
                  videoRefs.current[reel.id] = el
                  if (el) {
                    console.log(`🎥 Video element created for ${reel.title}:`, {
                      src: el.src,
                      readyState: el.readyState,
                      networkState: el.networkState
                    })
                  }
                }}
                src={finalVideoUrl}
                poster={finalThumbnail}
                className="w-full h-full object-cover"
                autoPlay={!isMobileDevice}
                loop={!isMobileDevice}
                preload="metadata"
                controls={isMobileDevice && isInFullscreen}
                playsInline
                muted={!isMobileDevice}
                onLoadStart={() => console.log(`📥 Video load started: ${reel.title}`)}
                onLoadedData={() => console.log(`✅ Video loaded: ${reel.title}`)}
                onError={(e) => console.error(`❌ Video error for ${reel.title}:`, e.currentTarget.error)}
                onEnded={() => handleVideoEnded(reel.id)}
              />
              
              {/* Ad Banner - appears after 5 seconds */}
              {showAdBanner[reel.id] && reel.adEnabled && reel.adText && reel.adLink && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-r from-black/80 via-black/70 to-black/80 backdrop-blur-sm flex items-center justify-between px-4 z-30">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {reel.adText}
                    </p>
                  </div>
                  <a
                    href={reel.adLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 px-3 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white text-xs font-semibold transition-colors duration-200 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Learn More
                  </a>
                </div>
              )}
            </>
                     ) : (
             <>
               {/* Thumbnail Display */}
               <div className="w-full h-full relative">
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
                   src={finalVideoUrl}
                   className={`w-full h-full object-cover ${reel.thumbnailUrl ? 'hidden' : 'block'}`}
                   preload="metadata"
                   muted
                   playsInline
                   style={{ display: reel.thumbnailUrl ? 'none' : 'block' }}
                   onError={(e) => {
                     console.error(`❌ Thumbnail video error for ${reel.title}:`, e.currentTarget.error)
                     // Ultimate fallback na placeholder
                     const placeholder = document.createElement('img')
                     placeholder.src = '/img/reel-placeholder.svg'
                     placeholder.className = 'w-full h-full object-cover'
                     placeholder.alt = reel.title
                   }}
                 />
                 
                 {/* Play Icon Overlay */}
                 <div className="absolute inset-0 flex items-center justify-center">
                   <div className={`rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center ${
                     isMobileDevice ? 'w-24 h-24' : 'w-20 h-20'
                   }`}>
                     <PlayIcon className={`text-white ml-1 ${
                       isMobileDevice ? 'w-12 h-12' : 'w-10 h-10'
                     }`} />
                   </div>
                 </div>
               </div>
             </>
           )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          
          {/* Interactive Overlay for Play/Pause */}
          <button
            onClick={() => handlePlay(reel.id)}
            className={`absolute inset-0 ${playingId === reel.id ? 'flex items-center justify-center group' : ''}`}
          >
            {playingId === reel.id && showOverlay[reel.id] && (
              <div className={`w-16 h-16 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center transition-opacity duration-200 ${
                isMobileDevice ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}>
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
          <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">                      
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
                <ReelItem key={reel.id} reel={reel} index={index} />
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
        {isMobileDevice && (
          <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
              Tap to play in fullscreen
          </p>
        </div>
        )}

        {/* Sign up modal */}
        <Modal isOpen={showSignUpModal} onClose={() => setShowSignUpModal(false)}>
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