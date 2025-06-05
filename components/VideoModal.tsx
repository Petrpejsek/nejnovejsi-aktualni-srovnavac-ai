'use client'

import React, {useState, useRef} from 'react'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  reel: {
    id: number
    title: string
    description: string
    thumbnailUrl: string
    platform: 'tiktok' | 'instagram'
    author: string
    authorHandle: string
    likes: number
    duration: string
    embedUrl: string
  } | null
}

const getEmbedSrc = (url: string, platform: 'tiktok' | 'instagram') => {
  if (platform === 'tiktok') {
    const match = url.match(/video\/(\d+)/)
    if (match && match[1]) {
      return `https://www.tiktok.com/embed/v2/${match[1]}`
    }
    return url
  }
  // instagram
  const match = url.match(/\/reel\/([\w-]+)/)
  if (match && match[1]) {
    return `https://www.instagram.com/reel/${match[1]}/embed`
  }
  return url + (url.endsWith('/') ? 'embed' : '/embed')
}

export default function VideoModal({ isOpen, onClose, reel }: VideoModalProps) {
  if (!isOpen || !reel) return null

  const embedSrc = getEmbedSrc(reel.embedUrl, reel.platform)
  const [showOverlay, setShowOverlay] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleUnmuteClick = () => {
    setShowOverlay(false)
    // po skrytí overlayu předáme klik pod něj
    iframeRef.current?.focus()
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-black rounded-2xl overflow-hidden max-w-sm w-full aspect-[9/16] shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Overlay Tap to unmute */}
        {showOverlay && (
          <div
            className="absolute inset-0 z-20 bg-black/50 flex flex-col items-center justify-center gap-4 text-white text-center cursor-pointer"
            onClick={handleUnmuteClick}
          >
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 9 9 9 13 5 13 19 9 15 3 15 3 9"/><line x1="17" y1="9" x2="23" y2="15"/><line x1="23" y1="9" x2="17" y2="15"/></svg>
            <span className="text-lg font-medium">Tap video to unmute 🔊</span>
          </div>
        )}

        {/* Video Embed */}
        <iframe
          ref={iframeRef}
          src={embedSrc}
          className="w-full h-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />

        {/* Bottom Overlay with info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-sm space-y-1 pointer-events-none">
          <div className="font-semibold text-base pointer-events-auto line-clamp-2">
            {reel.title}
          </div>
          <div className="opacity-80 pointer-events-auto">{reel.authorHandle}</div>
        </div>
      </div>
    </div>
  )
} 