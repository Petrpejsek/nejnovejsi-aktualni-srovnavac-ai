'use client'

import React, { useState, useRef, useEffect } from 'react'
import { PlayIcon, PauseIcon } from '@heroicons/react/24/outline'
import { HeartIcon, ShareIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartFilledIcon } from '@heroicons/react/24/solid'
import { getReelThumbnail } from '../lib/videoUtils'

// Types
interface ReelCardProps {
  id: string
  title: string
  description?: string
  videoUrl: string
  thumbnailUrl?: string
  isPlaying?: boolean
  isFavorited?: boolean
  onPlay?: (id: string) => void
  onFavorite?: (id: string) => void
  onShare?: (reel: any) => void
  className?: string
}

// Mobile detection helper - Updated according to user requirements
const isMobile = () => {
  return typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

export default function ReelCard({
  id,
  title,
  description,
  videoUrl,
  thumbnailUrl,
  isPlaying = false,
  isFavorited = false,
  onPlay,
  onFavorite,
  onShare,
  className = ''
}: ReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showOverlay, setShowOverlay] = useState(true)
  const [overlayTimeout, setOverlayTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const [isInFullscreen, setIsInFullscreen] = useState(false)

  // Detect mobile on mount
  useEffect(() => {
    setIsMobileDevice(isMobile())
    const handleResize = () => setIsMobileDevice(isMobile())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (overlayTimeout) {
        clearTimeout(overlayTimeout)
      }
    }
  }, [overlayTimeout])

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsInFullscreen(!!document.fullscreenElement)
      
      // If exiting fullscreen, pause video and reset state
      if (!document.fullscreenElement && videoRef.current) {
        videoRef.current.pause()
        setShowOverlay(true)
        if (onPlay) onPlay(id) // Reset playing state
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [id, onPlay])

  // Použití thumbnail logiky
  const finalThumbnail = getReelThumbnail(thumbnailUrl || null, null)

  // Handle video ended
  const handleVideoEnded = () => {
    if (isMobileDevice && (isInFullscreen || document.fullscreenElement)) {
      // Exit fullscreen podle user requirements
      if (document.fullscreenElement) {
        document.exitFullscreen()
      }
    }
    setShowOverlay(true)
    if (onPlay) onPlay(id) // Reset playing state
  }

  // Setup video event listeners
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Add ended event listener podle user requirements
    video.addEventListener('ended', () => {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      }
      setShowOverlay(true)
      if (onPlay) onPlay(id) // Reset playing state
    })

    return () => {
      if (video) {
        video.removeEventListener('ended', handleVideoEnded)
      }
    }
  }, [id, onPlay, isMobileDevice])

  // Handle play/pause click
  const handlePlayClick = async () => {
    if (!videoRef.current) return

    if (isPlaying) {
      // Pause video
      videoRef.current.pause()
      setShowOverlay(true)
      if (overlayTimeout) {
        clearTimeout(overlayTimeout)
        setOverlayTimeout(null)
      }
    } else {
      // Play video
      if (isMobileDevice) {
        // Mobile: Enter fullscreen podle user requirements
        try {
          if (videoRef.current.requestFullscreen) {
            await videoRef.current.requestFullscreen()
          } else if ((videoRef.current as any).webkitEnterFullscreen) {
            // iOS Safari fallback
            (videoRef.current as any).webkitEnterFullscreen()
          }
          await videoRef.current.play()
        } catch (error) {
          // Fallback if fullscreen fails
          console.warn('Fullscreen failed, playing inline:', error)
          videoRef.current.play()
        }
      } else {
        // Desktop: Play inline - zachování původního chování
        videoRef.current.play()
      }
      
      setShowOverlay(true)
      
      // Hide overlay after 3 seconds on desktop, immediately on mobile
      const timeout = setTimeout(() => {
        setShowOverlay(false)
      }, isMobileDevice ? 100 : 3000)
      
      setOverlayTimeout(timeout)
    }

    if (onPlay) onPlay(id)
  }

  // Handle share
  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onShare) {
      onShare({ id, title, description, videoUrl, thumbnailUrl })
    }
  }

  // Handle favorite
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onFavorite) onFavorite(id)
  }

  return (
    <div className={`relative h-96 w-54 rounded-3xl overflow-hidden bg-gray-900 shadow-2xl ${className}`}
         style={{ height: '384px', width: '216px' }}>
      
      {/* Video/Thumbnail Display */}
      {isPlaying ? (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={finalThumbnail}
          className="w-full h-full object-cover"
          autoPlay={!isMobileDevice} // Autoplay pouze na desktopu
          loop={!isMobileDevice}
          preload="metadata"
          controls={isMobileDevice && isInFullscreen} // Controls pouze na mobilu ve fullscreen
          playsInline
          muted={!isMobileDevice} // Muted pouze na desktopu
          onEnded={handleVideoEnded}
        />
      ) : (
        <div className="w-full h-full relative">
          {/* Thumbnail Display */}
          {thumbnailUrl ? (
            // Použij vlastní thumbnail pokud existuje
            <img
              src={finalThumbnail}
              alt={title}
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
            src={videoUrl}
            className={`w-full h-full object-cover ${thumbnailUrl ? 'hidden' : 'block'}`}
            preload="metadata"
            muted
            playsInline
            style={{ display: thumbnailUrl ? 'none' : 'block' }}
            onError={() => {
              // Ultimate fallback na placeholder
              const placeholder = document.createElement('img')
              placeholder.src = '/img/reel-placeholder.svg'
              placeholder.className = 'w-full h-full object-cover'
              placeholder.alt = title
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
      )}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      {/* Interactive Overlay for Play/Pause */}
      <button
        onClick={handlePlayClick}
        className={`absolute inset-0 ${isPlaying ? 'flex items-center justify-center group' : ''}`}
      >
        {isPlaying && showOverlay && (
          <div className={`w-16 h-16 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center transition-opacity duration-200 ${
            isMobileDevice ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            <PauseIcon className="w-8 h-8 text-white" />
          </div>
        )}
      </button>

      {/* Favorite Button */}
      {onFavorite && (
        <div className="absolute top-4 right-4">
          <button
            onClick={handleFavoriteClick}
            className="w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            {isFavorited ? (
              <HeartFilledIcon className="w-6 h-6 text-red-500" />
            ) : (
              <HeartIcon className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      )}

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6">                      
        {/* Title */}
        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
          {title}
        </h3>
        
        {/* Description */}
        {description && (
          <p className="text-white/90 text-sm line-clamp-2 mb-4">
            {description}
          </p>
        )}
      </div>

      {/* Share Button */}
      {onShare && (
        <div className="absolute right-4 bottom-24">
          <button 
            onClick={handleShareClick}
            className="flex flex-col items-center gap-1 group/share"
          >
            <ShareIcon className="w-8 h-8 text-white group-hover/share:text-blue-400 group-hover/share:scale-110 transition-all" />
          </button>
        </div>
      )}
    </div>
  )
} 