'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlayIcon, PauseIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { HeartIcon, ShareIcon, BookmarkIcon, FireIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartFilledIcon, BookmarkIcon as BookmarkFilledIcon } from '@heroicons/react/24/solid'
import { useSession } from 'next-auth/react'
import Modal from '../../components/Modal'
import RegisterForm from '../../components/RegisterForm'
import ReelEmbed from '../../components/ReelEmbed'
import VideoModal from '../../components/VideoModal'

// Načítám data z API místo mockdata

interface Reel {
  id: number
  title: string
  description: string
  embedUrl: string
  thumbnailUrl: string
  platform: 'tiktok' | 'instagram'
  author: string
  authorHandle: string
  likes: number
  duration: string
  isLiked: boolean
  category: string
  tags: string[]
  trending: boolean
  isBookmarked?: boolean
}

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([])
  const [filteredReels, setFilteredReels] = useState<Reel[]>([])
  const [categories, setCategories] = useState<{name: string, count: number}[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [playingId, setPlayingId] = useState<number | null>(null)
  const [showTrendingOnly, setShowTrendingOnly] = useState(false)
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null)
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  // Fetch reels from API
  useEffect(() => {
    const fetchReels = async () => {
      try {
        setLoading(true)
        const url = new URL('/api/reels', window.location.origin)

    if (selectedCategory !== 'All') {
          url.searchParams.set('category', selectedCategory)
    }
    if (searchQuery) {
          url.searchParams.set('search', searchQuery)
        }
        if (showTrendingOnly) {
          url.searchParams.set('trending', 'true')
        }

        const response = await fetch(url.toString())
        const data = await response.json()
        
        const reelsWithBookmarks = data.reels?.map((reel: Reel) => ({
          ...reel,
          isBookmarked: false
        })) || []
        
        setReels(reelsWithBookmarks)
        setFilteredReels(reelsWithBookmarks)
        setCategories(data.categories || [])
      } catch (error) {
        console.error('Error fetching reels:', error)
        setReels([])
        setFilteredReels([])
      } finally {
        setLoading(false)
      }
    }

    fetchReels()
  }, [selectedCategory, searchQuery, showTrendingOnly])

  // Filtering is now handled by API

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

  const handleBookmark = (id: number) => {
    // Check if user is authenticated
    if (!session) {
      setShowSignUpModal(true)
      return
    }
    
    setReels(reels.map(reel => 
      reel.id === id 
        ? { ...reel, isBookmarked: !reel.isBookmarked }
        : reel
    ))
  }

  const handleVideoClick = (reel: Reel) => {
    setSelectedReel(reel)
    setShowVideoModal(true)
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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI Reels <span className="text-gradient-primary">Discovery</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Learn AI tools through engaging short videos. Discover, learn, and master AI in bite-sized content.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="relative mb-6">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reels, tools, topics, or authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.name
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>

            {/* Trending Toggle */}
            <div className="flex items-center gap-4">
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
              <span className="text-sm text-gray-500">
                {filteredReels.length} reels found
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reels Grid by Categories */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="space-y-12">
            {categories
              .filter(category => category.name !== 'All')
              .map(category => {
                const categoryReels = filteredReels.filter(reel => reel.category === category.name);
                if (categoryReels.length === 0) return null;
                
                return (
                  <div key={category.name} className="space-y-6">
                    {/* Category Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                          {categoryReels.length} {categoryReels.length === 1 ? 'reel' : 'reels'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Reels Grid for this category */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-x-1 gap-y-4">
                      {categoryReels.map((reel) => (
            <div
              key={reel.id}
              className="relative group cursor-pointer"
            >
              {/* Reel Card */}
              <div className="relative h-72 w-40 rounded-2xl overflow-hidden bg-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                   style={{ height: '288px', width: '160px' }}
              >
                            {/* Reel Embed */}
                            <ReelEmbed
                              embedUrl={reel.embedUrl}
                              thumbnailUrl={reel.thumbnailUrl}
                              platform={reel.platform}
                              title={reel.title}
                              className="w-full h-full"
                              onClick={() => handleVideoClick(reel)}
                />
                
                {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                
                {/* Trending Badge */}
                {reel.trending && (
                              <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 pointer-events-none">
                    <FireIcon className="w-3 h-3" />
                    Trending
                  </div>
                )}

                {/* Duration Badge */}
                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 pointer-events-none">
                  <span className="text-white text-xs font-medium">{reel.duration}</span>
                </div>

                            {/* Platform Badge */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <PlayIcon className="w-6 h-6 text-white ml-0.5" />
                              </div>
                  </div>

                {/* Content Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
                  {/* Author */}
                  <div className="text-white/80 text-xs font-medium mb-1">
                                {reel.authorHandle}
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
                            <div className="absolute right-2 bottom-16 flex flex-col gap-2 pointer-events-none">
                  {/* Like Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLike(reel.id)
                    }}
                                className="flex flex-col items-center gap-1 group/like pointer-events-auto"
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
                              <button className="flex flex-col items-center gap-1 group/share pointer-events-auto">
                    <ShareIcon className="w-6 h-6 text-white group-hover/share:text-blue-400 group-hover/share:scale-110 transition-all" />
                  </button>

                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBookmark(reel.id)
                    }}
                                className="flex flex-col items-center gap-1 group/bookmark pointer-events-auto"
                  >
                    {reel.isBookmarked ? (
                      <BookmarkFilledIcon className="w-6 h-6 text-yellow-400 group-hover/bookmark:scale-110 transition-transform" />
                    ) : (
                      <BookmarkIcon className="w-6 h-6 text-white group-hover/bookmark:text-yellow-400 group-hover/bookmark:scale-110 transition-all" />
                    )}
                  </button>
                </div>
              </div>

              {/* Tags - below card */}
              <div className="flex flex-wrap gap-1 mt-2">
                {reel.tags.slice(0, 2).map((tag, index) => (
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
                  </div>
                );
              })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredReels.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <FunnelIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No reels found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filters to find more content.
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('All')
                setShowTrendingOnly(false)
              }}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Create Your Own AI Reels</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Share your AI knowledge with the community. Create engaging reels and help others discover amazing AI tools.
          </p>
          <Link 
            href="/create-reel"
            className="inline-flex items-center px-8 py-3 bg-white text-purple-600 font-semibold rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-105"
          >
            Start Creating
          </Link>
        </div>
      </div>
      
      {/* Video Modal */}
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        reel={selectedReel}
      />
      
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
    </div>
  );
} 