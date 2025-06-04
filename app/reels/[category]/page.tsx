'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { PlayIcon, PauseIcon, ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { HeartIcon, ShareIcon, FireIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartFilledIcon } from '@heroicons/react/24/solid'

// Reuse same data as main page
const allReels = [
  {
    id: 1,
    title: 'AI Tool for Content Generation',
    description: 'See how to create quality content quickly with AI',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=600&fit=crop',
    videoUrl: '#',
    author: 'TechGuru',
    likes: 1250,
    duration: '0:45',
    isLiked: false,
    category: 'Content Creation',
    tags: ['AI Writing', 'Content', 'Productivity'],
    trending: true
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
    isLiked: true,
    category: 'Automation',
    tags: ['Workflow', 'Automation', 'Efficiency'],
    trending: false
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
    isLiked: false,
    category: 'Business',
    tags: ['Business', 'AI Assistant', 'Growth'],
    trending: true
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
    isLiked: false,
    category: 'Design',
    tags: ['Design', 'Art', 'Creativity'],
    trending: false
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
    isLiked: true,
    category: 'Analytics',
    tags: ['Data', 'Analytics', 'AI'],
    trending: false
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
    isLiked: false,
    category: 'Marketing',
    tags: ['Marketing', 'Digital', 'Strategy'],
    trending: true
  },
  {
    id: 7,
    title: 'ChatGPT Advanced Tips',
    description: 'Pro tips for better ChatGPT prompts',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=600&fit=crop',
    videoUrl: '#',
    author: 'ChatGPTExpert',
    likes: 3200,
    duration: '2:15',
    isLiked: false,
    category: 'Content Creation',
    tags: ['ChatGPT', 'Prompts', 'AI Writing'],
    trending: true
  },
  {
    id: 8,
    title: 'Midjourney Masterclass',
    description: 'Create stunning AI art with Midjourney',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=600&fit=crop',
    videoUrl: '#',
    author: 'AIArtist',
    likes: 2890,
    duration: '1:45',
    isLiked: true,
    category: 'Design',
    tags: ['Midjourney', 'AI Art', 'Visual'],
    trending: true
  }
]

const categoryDescriptions: Record<string, string> = {
  'content-creation': 'Master AI tools for writing, content generation, and creative production',
  'design': 'Explore AI-powered design tools for art, graphics, and visual content',
  'business': 'Discover how AI can transform your business operations and growth strategies',
  'marketing': 'Learn cutting-edge AI marketing tools and techniques for better results',
  'automation': 'Streamline your workflow with powerful AI automation solutions',
  'analytics': 'Harness AI for data analysis, insights, and predictive modeling'
}

const categoryNames: Record<string, string> = {
  'content-creation': 'Content Creation',
  'design': 'Design & Art',
  'business': 'Business',
  'marketing': 'Marketing',
  'automation': 'Automation',
  'analytics': 'Analytics'
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
  category: string
  tags: string[]
  trending: boolean
}

export default function CategoryReelsPage() {
  const params = useParams()
  const categorySlug = params.category as string
  const categoryName = categoryNames[categorySlug] || 'Unknown Category'
  const categoryDescription = categoryDescriptions[categorySlug] || ''

  const [reels, setReels] = useState<Reel[]>([])
  const [filteredReels, setFilteredReels] = useState<Reel[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [playingId, setPlayingId] = useState<number | null>(null)
  const [showTrendingOnly, setShowTrendingOnly] = useState(false)

  // Filter reels for this category
  useEffect(() => {
    const categoryReels = allReels.filter(reel => 
      reel.category.toLowerCase().replace(/ & | /g, '-') === categorySlug
    )
    setReels(categoryReels)
  }, [categorySlug])

  // Apply search and trending filters
  useEffect(() => {
    let filtered = reels

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(reel => 
        reel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reel.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reel.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Trending filter
    if (showTrendingOnly) {
      filtered = filtered.filter(reel => reel.trending)
    }

    setFilteredReels(filtered)
  }, [searchQuery, showTrendingOnly, reels])

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link 
              href="/reels"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to All Reels
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {categoryName} <span className="text-gradient-primary">Reels</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
              {categoryDescription}
            </p>
            <div className="text-sm text-gray-500">
              {filteredReels.length} reels in this category
            </div>
          </div>

          {/* Search and Filters */}
          <div className="max-w-2xl mx-auto">
            {/* Search Bar */}
            <div className="relative mb-6">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${categoryName.toLowerCase()} reels...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            {/* Trending Toggle */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setShowTrendingOnly(!showTrendingOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  showTrendingOnly
                    ? 'bg-orange-100 text-orange-700 border border-orange-300'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <FireIcon className="w-4 h-4" />
                Trending Only
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reels Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5">
          {filteredReels.map((reel) => (
            <div
              key={reel.id}
              className="relative group cursor-pointer"
            >
              {/* Reel Card */}
              <div className="relative h-72 w-40 rounded-2xl overflow-hidden bg-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] mx-auto"
                   style={{ height: '288px', width: '160px' }}
              >
                {/* Thumbnail */}
                <img
                  src={reel.thumbnail}
                  alt={reel.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Trending Badge */}
                {reel.trending && (
                  <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <FireIcon className="w-3 h-3" />
                    Trending
                  </div>
                )}

                {/* Duration Badge */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
                  <span className="text-white text-xs font-medium">{reel.duration}</span>
                </div>

                {/* Play Button */}
                <button
                  onClick={() => handlePlay(reel.id)}
                  className="absolute inset-0 flex items-center justify-center group/play"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 group/play:opacity-100 transition-opacity duration-200">
                    {playingId === reel.id ? (
                      <PauseIcon className="w-6 h-6 text-white" />
                    ) : (
                      <PlayIcon className="w-6 h-6 text-white ml-0.5" />
                    )}
                  </div>
                </button>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  {/* Author */}
                  <div className="text-white/80 text-xs font-medium mb-1">
                    @{reel.author}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                    {reel.title}
                  </h3>
                  
                  {/* Description - only on larger screens */}
                  <p className="text-white/90 text-xs line-clamp-1 mb-2 hidden md:block">
                    {reel.description}
                  </p>
                </div>

                {/* Side Actions */}
                <div className="absolute right-2 bottom-16 flex flex-col gap-2">
                  {/* Like Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLike(reel.id)
                    }}
                    className="flex flex-col items-center gap-1 group/like"
                  >
                    {reel.isLiked ? (
                      <HeartFilledIcon className="w-6 h-6 text-red-500 group-hover/like:scale-110 transition-transform" />
                    ) : (
                      <HeartIcon className="w-6 h-6 text-white group-hover/like:text-red-500 group-hover/like:scale-110 transition-all" />
                    )}
                    <span className="text-white text-xs font-medium">
                      {formatLikes(reel.likes)}
                    </span>
                  </button>

                  {/* Share Button */}
                  <button className="flex flex-col items-center gap-1 group/share">
                    <ShareIcon className="w-6 h-6 text-white group-hover/share:text-blue-400 group-hover/share:scale-110 transition-all" />
                  </button>
                </div>
              </div>

              {/* Tags - below card */}
              <div className="flex flex-wrap gap-1 mt-2">
                {reel.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredReels.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <PlayIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No reels found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || showTrendingOnly 
                ? "Try adjusting your search or filters to find more content."
                : `No reels available in the ${categoryName} category yet.`
              }
            </p>
            <div className="flex gap-4 justify-center">
              {(searchQuery || showTrendingOnly) && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setShowTrendingOnly(false)
                  }}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
              <Link
                href="/reels"
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Browse All Categories
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Related Categories */}
      {filteredReels.length > 0 && (
        <div className="bg-white border-t border-gray-200 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Explore Other Categories
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {Object.entries(categoryNames)
                .filter(([slug]) => slug !== categorySlug)
                .map(([slug, name]) => (
                <Link
                  key={slug}
                  href={`/reels/${slug}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors font-medium"
                >
                  {name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 