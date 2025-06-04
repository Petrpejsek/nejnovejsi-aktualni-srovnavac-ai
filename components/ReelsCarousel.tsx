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

  // Kontrola možnosti scrollování
  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
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
      const isMobile = window.innerWidth < 768
      const scrollAmount = isMobile ? 240 : 280 // Adjust for responsive card width
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
      
      setTimeout(checkScrollButtons, 300)
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
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 hidden md:flex ${
              canScrollLeft 
                ? 'hover:bg-gray-50 hover:shadow-xl cursor-pointer opacity-100' 
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 hidden md:flex ${
              canScrollRight 
                ? 'hover:bg-gray-50 hover:shadow-xl cursor-pointer opacity-100' 
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <ChevronRightIcon className="w-6 h-6 text-gray-700" />
          </button>

          {/* Reels Container */}
          <div
            ref={scrollRef}
            onScroll={checkScrollButtons}
            className="flex gap-4 overflow-x-auto scrollbar-hide px-2 md:px-16 snap-x snap-mandatory"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth'
            }}
          >
            {reels.map((reel) => (
              <div
                key={reel.id}
                className="flex-shrink-0 w-56 md:w-64 snap-center snap-always group cursor-pointer"
              >
                {/* Video Container */}
                <div className="relative aspect-[9/16] rounded-3xl overflow-hidden bg-gray-900 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
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
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
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
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {/* Author */}
                    <div className="text-white/80 text-sm font-medium mb-2">
                      @{reel.author}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-white font-semibold text-base mb-1 line-clamp-2">
                      {reel.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-white/90 text-sm line-clamp-2 mb-3">
                      {reel.description}
                    </p>
                  </div>

                  {/* Side Actions */}
                  <div className="absolute right-3 bottom-20 flex flex-col gap-3">
                    {/* Like Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLike(reel.id)
                      }}
                      className="flex flex-col items-center gap-1 group/like"
                    >
                      {reel.isLiked ? (
                        <HeartFilledIcon className="w-7 h-7 text-red-500 group-hover/like:scale-110 transition-transform" />
                      ) : (
                        <HeartIcon className="w-7 h-7 text-white group-hover/like:text-red-500 group-hover/like:scale-110 transition-all" />
                      )}
                      <span className="text-white text-xs font-medium">
                        {formatLikes(reel.likes)}
                      </span>
                    </button>

                    {/* Share Button */}
                    <button className="flex flex-col items-center gap-1 group/share">
                      <ShareIcon className="w-7 h-7 text-white group-hover/share:text-blue-400 group-hover/share:scale-110 transition-all" />
                    </button>

                    {/* Bookmark Button */}
                    <button className="flex flex-col items-center gap-1 group/bookmark">
                      <BookmarkIcon className="w-7 h-7 text-white group-hover/bookmark:text-yellow-400 group-hover/bookmark:scale-110 transition-all" />
                    </button>
                  </div>
                </div>
              </div>
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