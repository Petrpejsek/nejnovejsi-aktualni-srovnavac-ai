'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  TrophyIcon,
  StarIcon,
  FireIcon,
  CheckIcon,
  HeartIcon,
  ShareIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'
import { TrophyIcon as TrophyFilledIcon, StarIcon as StarFilledIcon, HeartIcon as HeartFilledIcon } from '@heroicons/react/24/solid'

interface AITool {
  rank: number
  name: string
  description: string
  category: string
  pricing: string
  rating: number
  reviewsCount: number
  features: string[]
  pros: string[]
  cons: string[]
  website: string
  image: string
  badge?: string
  verified: boolean
}

// Demo data pro Video Editing Tools
const videoEditingTools: AITool[] = [
  {
    rank: 1,
    name: 'Runway ML',
    description: 'Advanced AI video editing platform with text-to-video generation, background removal, and professional editing tools.',
    category: 'Video Editing',
    pricing: 'Free - $35/month',
    rating: 4.8,
    reviewsCount: 2341,
    features: ['Text-to-Video', 'Background Removal', 'Motion Tracking', 'AI Effects'],
    pros: ['Excellent AI features', 'Professional quality', 'Easy to use'],
    cons: ['Expensive pro plans', 'Limited free tier'],
    website: 'https://runwayml.com',
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop',
    badge: 'EDITOR\'S CHOICE',
    verified: true
  },
  {
    rank: 2,
    name: 'Luma AI',
    description: 'AI-powered video generation and 3D capture technology for creating stunning video content.',
    category: 'Video Generation',
    pricing: 'Free - $29/month',
    rating: 4.7,
    reviewsCount: 1876,
    features: ['3D Video Capture', 'AI Video Generation', 'Real-time Rendering'],
    pros: ['Amazing 3D capabilities', 'High quality output', 'Innovation'],
    cons: ['Learning curve', 'Resource intensive'],
    website: 'https://lumalabs.ai',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop',
    badge: 'TRENDING',
    verified: true
  },
  {
    rank: 3,
    name: 'Pika Labs',
    description: 'Text-to-video AI that creates high-quality video content from simple text prompts.',
    category: 'Text-to-Video',
    pricing: 'Free - $25/month',
    rating: 4.6,
    reviewsCount: 1543,
    features: ['Text-to-Video', 'Style Transfer', 'Video Enhancement'],
    pros: ['Great text-to-video', 'Multiple styles', 'Good pricing'],
    cons: ['Limited video length', 'Queue times'],
    website: 'https://pikalabs.ai',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop',
    verified: true
  },
  {
    rank: 4,
    name: 'Synthesia',
    description: 'AI video platform for creating professional videos with AI avatars and text-to-speech.',
    category: 'AI Avatars',
    pricing: '$30 - $90/month',
    rating: 4.5,
    reviewsCount: 3210,
    features: ['AI Avatars', 'Text-to-Speech', 'Multi-language Support'],
    pros: ['Professional avatars', 'Multiple languages', 'Business-focused'],
    cons: ['Expensive', 'Limited customization'],
    website: 'https://synthesia.io',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=200&fit=crop',
    badge: 'BUSINESS',
    verified: true
  },
  {
    rank: 5,
    name: 'InVideo AI',
    description: 'AI video editor that transforms ideas into professional videos with intelligent automation.',
    category: 'Video Editor',
    pricing: 'Free - $60/month',
    rating: 4.4,
    reviewsCount: 2876,
    features: ['Smart Templates', 'AI Voice-over', 'Auto-editing'],
    pros: ['Great templates', 'User-friendly', 'Good pricing'],
    cons: ['Limited advanced features', 'Watermark on free'],
    website: 'https://invideo.io',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop',
    verified: true
  }
]

const categoryInfo = {
  'video-editing': {
    title: 'Video Editing Tools',
    description: 'Best AI tools for video creation, editing and post-production',
    detailedDescription: 'Discover the most powerful AI video editing tools that will revolutionize your video creation workflow. From automated editing to smart effects, these tools combine cutting-edge artificial intelligence with professional video editing capabilities.',
    icon: <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    color: 'from-red-500 to-pink-500',
    gradient: 'bg-gradient-to-br from-red-50 to-pink-50'
  }
}

export default function CategoryListPage() {
  const params = useParams()
  const categoryId = params.category as string
  const [favorites, setFavorites] = useState<number[]>([])
  
  const category = categoryInfo[categoryId as keyof typeof categoryInfo] || categoryInfo['video-editing']
  
  const toggleFavorite = (rank: number) => {
    setFavorites(prev => 
      prev.includes(rank) 
        ? prev.filter(r => r !== rank)
        : [...prev, rank]
    )
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarFilledIcon key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />)
    }
    
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="w-3 h-3 sm:w-4 sm:h-4 relative">
          <StarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 absolute" />
          <div className="overflow-hidden w-1/2">
            <StarFilledIcon className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
          </div>
        </div>
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<StarIcon key={`empty-${i}`} className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300" />)
    }

    return stars
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Breadcrumb - mobilní optimalizace */}
          <div className="flex items-center gap-1 sm:gap-2 mb-4 sm:mb-6 text-xs sm:text-sm text-gray-600 overflow-x-auto">
            <Link href="/" className="hover:text-purple-600 whitespace-nowrap">Home</Link>
            <span className="text-gray-400">/</span>
            <Link href="/top-lists" className="hover:text-purple-600 whitespace-nowrap">TOP Lists</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 whitespace-nowrap">{category.title}</span>
          </div>

          {/* Header - mobilní optimalizace */}
          <div className={`${category.gradient} rounded-xl sm:rounded-2xl p-4 sm:p-8 mb-6 sm:mb-8 border border-gray-200`}>
            <div className="flex items-start gap-3 sm:gap-6">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-gradient-to-r ${category.color} text-white flex items-center justify-center flex-shrink-0`}>
                {category.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                    🏆 TOP 20 {category.title}
                  </h1>
                  <div className="flex items-center gap-1 bg-amber-100 px-2 sm:px-3 py-1 rounded-full self-start">
                    <TrophyFilledIcon className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />
                    <span className="text-xs sm:text-sm font-medium text-amber-800">2024 Edition</span>
                  </div>
                </div>
                <p className="text-sm sm:text-base lg:text-lg text-gray-700 mb-3 sm:mb-4 leading-relaxed">
                  {category.detailedDescription}
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-6 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <FireIcon className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                    <span>Updated January 2024</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    <span>Expert Verified</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <StarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                    <span>Community Voted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tools List - mobilní optimalizace */}
          <div className="space-y-4 sm:space-y-6">
            {videoEditingTools.map((tool) => (
              <div
                key={tool.rank}
                className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-all duration-300"
              >
                {/* Redesigned layout - better use of left space */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  
                  {/* Left section - rank, image and key info */}
                  <div className="flex flex-col sm:flex-col sm:items-center gap-3 sm:gap-4 sm:w-48 flex-shrink-0">
                    {/* Rank badge - larger */}
                    <div className="flex items-center justify-center sm:justify-center">
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-r ${category.color} text-white flex items-center justify-center font-bold text-xl sm:text-2xl shadow-lg`}>
                        #{tool.rank}
                      </div>
                    </div>

                    {/* Image - larger */}
                    <div className="flex justify-center sm:justify-center">
                      <img
                        src={tool.image}
                        alt={tool.name}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover shadow-md"
                      />
                    </div>

                    {/* Quick stats in left column */}
                    <div className="flex flex-col items-center sm:items-center text-center space-y-2">
                      <div className="flex items-center gap-1">
                        {renderStars(tool.rating)}
                        <span className="ml-1 text-sm font-bold text-gray-900">{tool.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500">({tool.reviewsCount} reviews)</span>
                      <span className="text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">{tool.pricing}</span>
                    </div>
                  </div>

                  {/* Right section - main content */}
                  <div className="flex-1 min-w-0">
                    {/* Header with title and action buttons */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-2">{tool.name}</h3>
                        <div className="flex items-center gap-3 mb-3">
                          {tool.badge && (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${category.color}`}>
                              {tool.badge}
                            </span>
                          )}
                          {tool.verified && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckIcon className="w-4 h-4" />
                              <span className="text-xs font-medium">Verified</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleFavorite(tool.rank)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          {favorites.includes(tool.rank) ? (
                            <HeartFilledIcon className="w-5 h-5 text-red-500" />
                          ) : (
                            <HeartIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                          <ShareIcon className="w-5 h-5 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* Content sections */}
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                      {tool.description}
                    </p>

                    {/* Features */}
                    <div className="mb-3 sm:mb-4">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2">Key Features:</h4>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {tool.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs sm:text-sm font-medium"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Pros and Cons - optimalizace pro mobil */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div>
                        <h5 className="text-xs sm:text-sm font-medium text-green-800 mb-2">✓ Pros:</h5>
                        <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                          {tool.pros.map((pro, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckIcon className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-xs sm:text-sm font-medium text-red-800 mb-2">⚠ Cons:</h5>
                        <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                          {tool.cons.map((con, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5 text-center">×</span>
                              <span className="leading-relaxed">{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action Button - mobilní optimalizace */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <a
                        href={tool.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-4 sm:px-6 py-2 bg-gradient-to-r ${category.color} text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium flex items-center justify-center gap-2 text-sm sm:text-base`}
                      >
                        Visit Website
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      </a>
                      <span className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                        Ranking based on features, user reviews, and expert analysis
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coming Soon - mobilní optimalizace */}
          <div className="mt-8 sm:mt-12 text-center p-6 sm:p-8 bg-gray-50 rounded-xl">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">More Tools Coming Soon!</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              We're constantly updating our lists with the latest AI tools. The remaining 15 tools will be added soon.
            </p>
            <Link
              href="/top-lists"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base"
            >
              <span>Explore Other Categories</span>
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
} 