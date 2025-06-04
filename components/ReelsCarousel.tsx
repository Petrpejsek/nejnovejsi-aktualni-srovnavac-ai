'use client'

import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline'
import { HeartIcon, ShareIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartFilledIcon } from '@heroicons/react/24/solid'

// Mockdata pro reels - později to bude z API/databáze
const mockReels = [
  {
    id: 1,
    title: 'AI Tool for Content Generation',
    description: 'See how to create quality content quickly with AI',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=600&fit=crop',
    videoUrl: '#',
    author: 'TechGuru',
    likes: 1250,
    duration: '0:45',
    isLiked: false
  },
  {
    id: 2,
    title: 'Workflow Process Automation',
    description: 'Save time with AI automation',
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=600&fit=crop',
    videoUrl: '#',
    author: 'AutomatePro',
    likes: 987,
    duration: '1:12',
    isLiked: true
  },
  {
    id: 3,
    title: 'AI Assistant for Business',
    description: 'How AI can help your business grow',
    thumbnail: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=600&fit=crop',
    videoUrl: '#',
    author: 'BusinessAI',
    likes: 2150,
    duration: '0:58',
    isLiked: false
  },
  {
    id: 4,
    title: 'Creativity with AI Tools',
    description: 'Discover new creative possibilities',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=600&fit=crop',
    videoUrl: '#',
    author: 'CreativeAI',
    likes: 1543,
    duration: '1:25',
    isLiked: false
  },
  {
    id: 5,
    title: 'Data Analysis with AI',
    description: 'Fast data analysis using artificial intelligence',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=600&fit=crop',
    videoUrl: '#',
    author: 'DataExpert',
    likes: 892,
    duration: '0:37',
    isLiked: true
  },
  {
    id: 6,
    title: 'AI in Marketing',
    description: 'Revolution in digital marketing',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=600&fit=crop',
    videoUrl: '#',
    author: 'MarketingAI',
    likes: 1876,
    duration: '1:03',
    isLiked: false
  }
]

interface Reel {
  id: number
  title: string
  description: string
  thumbnail: string
  videoUrl: string
  author: string
  likes: number
  duration: string
  isLiked: boolean
}

export default function ReelsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [reels, setReels] = useState<Reel[]>(mockReels)
  const [playingId, setPlayingId] = useState<number | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

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
      const containerWidth = scrollRef.current.clientWidth
      const newIndex = direction === 'left' 
        ? Math.max(0, currentIndex - 1)
        : Math.min(reels.length - 1, currentIndex + 1)
      
      scrollRef.current.scrollTo({
        left: newIndex * containerWidth,
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

  const handleLike = (id: number) => {
    setReels(reels.map(reel => 
      reel.id === id 
        ? { ...reel, isLiked: !reel.isLiked, likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1 }
        : reel
    ))
  }

  const handlePlay = (id: number) => {
    setPlayingId(playingId === id ? null : id)
  }

  const formatLikes = (likes: number) => {
    if (likes >= 1000) {
      return `${(likes / 1000).toFixed(1)}k`
    }
    return likes.toString()
  }

  return (
    <section className="py-12">
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
        <div className="relative max-w-sm mx-auto">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-200 ${
              canScrollLeft 
                ? 'hover:bg-black/70 cursor-pointer opacity-100' 
                : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <ChevronLeftIcon className="w-5 h-5 text-white" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-200 ${
              canScrollRight 
                ? 'hover:bg-black/70 cursor-pointer opacity-100' 
                : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <ChevronRightIcon className="w-5 h-5 text-white" />
          </button>

          {/* Reels Container - Každý reel jako samostatný slide */}
          <div
            ref={scrollRef}
            onScroll={checkScrollButtons}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {reels.map((reel, index) => (
              <div
                key={reel.id}
                className="w-full flex-shrink-0 snap-center snap-always"
                style={{ minWidth: '100%' }}
              >
                {/* Single Reel Container */}
                <div className="relative aspect-[9/16] rounded-3xl overflow-hidden bg-gray-900 shadow-2xl mx-auto max-w-xs">
                  {/* Thumbnail/Video */}
                  <img
                    src={reel.thumbnail}
                    alt={reel.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Play Button */}
                  <button
                    onClick={() => handlePlay(reel.id)}
                    className="absolute inset-0 flex items-center justify-center group"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {playingId === reel.id ? (
                        <PauseIcon className="w-8 h-8 text-white" />
                      ) : (
                        <PlayIcon className="w-8 h-8 text-white ml-1" />
                      )}
                    </div>
                  </button>

                  {/* Duration Badge */}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
                    <span className="text-white text-xs font-medium">{reel.duration}</span>
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    {/* Author */}
                    <div className="text-white/80 text-sm font-medium mb-2">
                      @{reel.author}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                      {reel.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-white/90 text-sm line-clamp-2 mb-4">
                      {reel.description}
                    </p>
                  </div>

                  {/* Side Actions */}
                  <div className="absolute right-4 bottom-24 flex flex-col gap-4">
                    {/* Like Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLike(reel.id)
                      }}
                      className="flex flex-col items-center gap-1 group/like"
                    >
                      {reel.isLiked ? (
                        <HeartFilledIcon className="w-8 h-8 text-red-500 group-hover/like:scale-110 transition-transform" />
                      ) : (
                        <HeartIcon className="w-8 h-8 text-white group-hover/like:text-red-500 group-hover/like:scale-110 transition-all" />
                      )}
                      <span className="text-white text-xs font-medium">
                        {formatLikes(reel.likes)}
                      </span>
                    </button>

                    {/* Share Button */}
                    <button className="flex flex-col items-center gap-1 group/share">
                      <ShareIcon className="w-8 h-8 text-white group-hover/share:text-blue-400 group-hover/share:scale-110 transition-all" />
                    </button>

                    {/* Bookmark Button */}
                    <button className="flex flex-col items-center gap-1 group/bookmark">
                      <BookmarkIcon className="w-8 h-8 text-white group-hover/bookmark:text-yellow-400 group-hover/bookmark:scale-110 transition-all" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Indicators */}
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
      </div>
    </section>
  )
} 