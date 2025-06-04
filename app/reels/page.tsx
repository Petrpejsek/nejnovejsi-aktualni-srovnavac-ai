'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline'
import { HeartIcon, ShareIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartFilledIcon } from '@heroicons/react/24/solid'

// Rozšířená data pro reels podle kategorií
const reelsByCategory = {
  'Content Creation': [
    {
      id: 1,
      title: 'AI Text Generation Magic',
      description: 'Watch how ChatGPT creates perfect content in seconds',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=600&fit=crop',
      videoUrl: '#',
      author: 'ContentMaster',
      likes: 3420,
      duration: '0:45',
      isLiked: false
    },
    {
      id: 2,
      title: 'Video Creation with AI',
      description: 'From script to video in minutes using AI tools',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=600&fit=crop',
      videoUrl: '#',
      author: 'VideoWizard',
      likes: 2890,
      duration: '1:12',
      isLiked: true
    },
    {
      id: 3,
      title: 'AI Image Generation',
      description: 'Create stunning visuals with DALL-E and Midjourney',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=600&fit=crop',
      videoUrl: '#',
      author: 'PixelAI',
      likes: 4150,
      duration: '0:58',
      isLiked: false
    }
  ],
  'Business Automation': [
    {
      id: 4,
      title: 'Workflow Automation',
      description: 'Automate your daily tasks with AI-powered tools',
      thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=600&fit=crop',
      videoUrl: '#',
      author: 'AutomatePro',
      likes: 1987,
      duration: '1:25',
      isLiked: false
    },
    {
      id: 5,
      title: 'AI Meeting Assistant',
      description: 'Never miss important points with AI note-taking',
      thumbnail: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=600&fit=crop',
      videoUrl: '#',
      author: 'MeetingAI',
      likes: 2654,
      duration: '0:37',
      isLiked: true
    }
  ],
  'Data & Analytics': [
    {
      id: 6,
      title: 'Data Analysis Revolution',
      description: 'Turn raw data into insights with AI analytics',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=600&fit=crop',
      videoUrl: '#',
      author: 'DataGenius',
      likes: 3210,
      duration: '1:03',
      isLiked: false
    },
    {
      id: 7,
      title: 'Predictive Analytics',
      description: 'Forecast trends using machine learning models',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=600&fit=crop',
      videoUrl: '#',
      author: 'PredictAI',
      likes: 1876,
      duration: '0:42',
      isLiked: false
    }
  ],
  'Design & Creative': [
    {
      id: 8,
      title: 'AI Logo Design',
      description: 'Professional logos created in minutes',
      thumbnail: 'https://images.unsplash.com/photo-1626785774625-0b1c2c0d6e60?w=400&h=600&fit=crop',
      videoUrl: '#',
      author: 'DesignBot',
      likes: 4520,
      duration: '0:52',
      isLiked: true
    },
    {
      id: 9,
      title: 'UI/UX with AI',
      description: 'Design beautiful interfaces using AI assistance',
      thumbnail: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=400&h=600&fit=crop',
      videoUrl: '#',
      author: 'UICreator',
      likes: 3890,
      duration: '1:15',
      isLiked: false
    }
  ]
}

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

interface CategoryCarouselProps {
  category: string
  reels: Reel[]
  onLike: (id: number) => void
  onPlay: (id: number) => void
  playingId: number | null
}

function CategoryCarousel({ category, reels, onLike, onPlay, playingId }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScrollButtons()
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
      
      setTimeout(checkScrollButtons, 300)
    }
  }

  const formatLikes = (likes: number) => {
    if (likes >= 1000) {
      return `${(likes / 1000).toFixed(1)}k`
    }
    return likes.toString()
  }

  return (
    <div className="mb-12">
      {/* Category Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{category}</h3>
        <div className="h-1 w-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></div>
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 ${
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
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 ${
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
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-16"
        >
          {reels.map((reel) => (
            <div
              key={reel.id}
              className="flex-shrink-0 w-64 group cursor-pointer"
            >
              <div className="relative aspect-[9/16] rounded-3xl overflow-hidden bg-gray-900 shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <img
                  src={reel.thumbnail}
                  alt={reel.title}
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                <button
                  onClick={() => onPlay(reel.id)}
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

                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
                  <span className="text-white text-xs font-medium">{reel.duration}</span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="text-white/80 text-sm font-medium mb-2">
                    @{reel.author}
                  </div>
                  
                  <h4 className="text-white font-semibold text-base mb-1 line-clamp-2">
                    {reel.title}
                  </h4>
                  
                  <p className="text-white/90 text-sm line-clamp-2 mb-3">
                    {reel.description}
                  </p>
                </div>

                <div className="absolute right-3 bottom-20 flex flex-col gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onLike(reel.id)
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

                  <button className="flex flex-col items-center gap-1 group/share">
                    <ShareIcon className="w-7 h-7 text-white group-hover/share:text-blue-400 group-hover/share:scale-110 transition-all" />
                  </button>

                  <button className="flex flex-col items-center gap-1 group/bookmark">
                    <BookmarkIcon className="w-7 h-7 text-white group-hover/bookmark:text-yellow-400 group-hover/bookmark:scale-110 transition-all" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ReelsPage() {
  const [allReels, setAllReels] = useState(reelsByCategory)
  const [playingId, setPlayingId] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleLike = (id: number) => {
    setAllReels(prev => {
      const updated = { ...prev }
      Object.keys(updated).forEach(category => {
        updated[category as keyof typeof updated] = updated[category as keyof typeof updated].map(reel => 
          reel.id === id 
            ? { ...reel, isLiked: !reel.isLiked, likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1 }
            : reel
        )
      })
      return updated
    })
  }

  const handlePlay = (id: number) => {
    setPlayingId(playingId === id ? null : id)
  }

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category)
  }

  const categories = Object.keys(allReels)
  // Reorganizace pořadí kategorií - vybraná kategorie první, ostatní zachovány
  const getOrderedReels = () => {
    if (!selectedCategory) {
      return allReels
    }
    
    const orderedReels: Record<string, typeof allReels[keyof typeof allReels]> = {}
    
    // Přidat vybranou kategorii jako první
    orderedReels[selectedCategory] = allReels[selectedCategory as keyof typeof allReels]
    
    // Přidat všechny ostatní kategorie
    Object.entries(allReels).forEach(([category, reels]) => {
      if (category !== selectedCategory) {
        orderedReels[category] = reels
      }
    })
    
    return orderedReels
  }

  const displayReels = getOrderedReels()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Discover AI Through Video
            </h1>
            <p className="text-xl text-purple-100 mb-8">
              Watch real AI tools in action and learn from the experts who use them daily
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-white text-purple-900 shadow-lg'
                      : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                  }`}
                >
                  {category}
                </button>
              ))}
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="px-4 py-2 rounded-full font-medium bg-white/10 text-white hover:bg-white/20 transition-all duration-200 border border-white/30"
                >
                  Reset Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {Object.entries(displayReels).map(([category, reels]) => (
            <div key={category}>
              <CategoryCarousel
                category={category}
                reels={reels}
                onLike={handleLike}
                onPlay={handlePlay}
                playingId={playingId}
              />
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Want to create your own AI Reels?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join our community of AI enthusiasts and share your favorite tools and discoveries
          </p>
          <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full hover:shadow-lg transition-all duration-200 hover:scale-105">
            Submit Your Reel
          </button>
        </div>
      </div>
    </div>
  )
} 