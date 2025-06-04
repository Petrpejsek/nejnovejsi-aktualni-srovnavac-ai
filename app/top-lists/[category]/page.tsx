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
  ShareIcon
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
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
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
      stars.push(<StarFilledIcon key={i} className="w-4 h-4 text-yellow-400" />)
    }
    
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="w-4 h-4 relative">
          <StarIcon className="w-4 h-4 text-gray-300 absolute" />
          <div className="overflow-hidden w-1/2">
            <StarFilledIcon className="w-4 h-4 text-yellow-400" />
          </div>
        </div>
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<StarIcon key={`empty-${i}`} className="w-4 h-4 text-gray-300" />)
    }

    return stars
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
            <Link href="/" className="hover:text-purple-600">Home</Link>
            <span>/</span>
            <Link href="/top-lists" className="hover:text-purple-600">TOP Lists</Link>
            <span>/</span>
            <span className="text-gray-900">{category.title}</span>
          </div>

          {/* Header */}
          <div className={`${category.gradient} rounded-2xl p-8 mb-8 border border-gray-200`}>
            <div className="flex items-start gap-6">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${category.color} text-white flex items-center justify-center`}>
                {category.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold text-gray-900">
                    🏆 TOP 20 {category.title}
                  </h1>
                  <div className="flex items-center gap-1 bg-amber-100 px-3 py-1 rounded-full">
                    <TrophyFilledIcon className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">2024 Edition</span>
                  </div>
                </div>
                <p className="text-lg text-gray-700 mb-4">
                  {category.detailedDescription}
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FireIcon className="w-4 h-4 text-red-500" />
                    <span>Updated January 2024</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-500" />
                    <span>Expert Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarIcon className="w-4 h-4 text-blue-500" />
                    <span>Community Voted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tools List */}
          <div className="space-y-6">
            {videoEditingTools.map((tool) => (
              <div
                key={tool.rank}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex gap-6">
                  {/* Rank */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${category.color} text-white flex items-center justify-center font-bold text-lg`}>
                      #{tool.rank}
                    </div>
                  </div>

                  {/* Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={tool.image}
                      alt={tool.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{tool.name}</h3>
                          {tool.badge && (
                            <span className={`px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${category.color}`}>
                              {tool.badge}
                            </span>
                          )}
                          {tool.verified && (
                            <CheckIcon className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-1">
                            {renderStars(tool.rating)}
                            <span className="ml-2 text-sm font-medium text-gray-900">{tool.rating}</span>
                            <span className="text-sm text-gray-500">({tool.reviewsCount} reviews)</span>
                          </div>
                          <span className="text-sm font-medium text-purple-600">{tool.pricing}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
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

                    <p className="text-gray-600 mb-4">
                      {tool.description}
                    </p>

                    {/* Features */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features:</h4>
                      <div className="flex flex-wrap gap-2">
                        {tool.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Pros and Cons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="text-sm font-medium text-green-800 mb-2">✓ Pros:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {tool.pros.map((pro, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckIcon className="w-3 h-3 text-green-500 flex-shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-red-800 mb-2">⚠ Cons:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {tool.cons.map((con, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-3 h-3 text-red-500 flex-shrink-0">×</span>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-4">
                      <a
                        href={tool.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-6 py-2 bg-gradient-to-r ${category.color} text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium flex items-center gap-2`}
                      >
                        Visit Website
                        <span className="text-sm">↗️</span>
                      </a>
                      <span className="text-sm text-gray-500">
                        Ranking based on features, user reviews, and expert analysis
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coming Soon */}
          <div className="mt-12 text-center p-8 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">More Tools Coming Soon!</h3>
            <p className="text-gray-600 mb-4">
              We're constantly updating our lists with the latest AI tools. The remaining 15 tools will be added soon.
            </p>
            <Link
              href="/top-lists"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <span>Explore Other Categories</span>
              <span className="text-sm">↗️</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
} 