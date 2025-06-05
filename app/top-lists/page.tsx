'use client'

import React from 'react'
import Link from 'next/link'
import { 
  TrophyIcon,
  StarIcon,
  FireIcon,
  SparklesIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'
import { TrophyIcon as TrophyFilledIcon } from '@heroicons/react/24/solid'

interface TopListCategory {
  id: string
  title: string
  description: string
  detailedDescription: string
  icon: React.ReactNode
  color: string
  gradient: string
  toolsCount: number
  trending?: boolean
  popular?: boolean
  badge?: string
  lastUpdated: string
}

// Extended data pro TOP 20 kategorie
const topListCategories: TopListCategory[] = [
  {
    id: 'video-editing',
    title: 'Video Editing Tools',
    description: 'Best AI tools for video creation, editing and post-production',
    detailedDescription: 'Comprehensive list of the most powerful AI video editing tools that will transform your video creation workflow. From automated editing to smart effects, these tools will save you hours of work.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    color: 'from-red-500 to-pink-500',
    gradient: 'bg-gradient-to-br from-red-50 to-pink-50',
    toolsCount: 20,
    trending: true,
    badge: 'HOT',
    lastUpdated: 'January 2024'
  },
  {
    id: 'social-media',
    title: 'Social Media Tools',
    description: 'AI-powered content creation and social media management',
    detailedDescription: 'Ultimate collection of AI tools for social media managers, content creators and marketers. Automate posting, create engaging content and grow your social presence.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" /></svg>,
    color: 'from-blue-500 to-cyan-500',
    gradient: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    toolsCount: 20,
    popular: true,
    badge: 'POPULAR',
    lastUpdated: 'January 2024'
  },
  {
    id: 'writing-content',
    title: 'Writing & Content',
    description: 'AI writing assistants and content creation tools',
    detailedDescription: 'Perfect collection for writers, bloggers and content creators. These AI tools will help you write better, faster and more engaging content across all formats.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
    color: 'from-green-500 to-emerald-500',
    gradient: 'bg-gradient-to-br from-green-50 to-emerald-50',
    toolsCount: 20,
    badge: 'NEW',
    lastUpdated: 'December 2023'
  },
  {
    id: 'design-graphics',
    title: 'Design & Graphics',
    description: 'AI tools for graphic design, logos and visual content',
    detailedDescription: 'Essential AI design tools for creating stunning graphics, logos, presentations and visual content. No design experience required!',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v14a2 2 0 01-2 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 7v10a2 2 0 01-2 2h-4a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2z" /></svg>,
    color: 'from-purple-500 to-indigo-500',
    gradient: 'bg-gradient-to-br from-purple-50 to-indigo-50',
    toolsCount: 20,
    lastUpdated: 'January 2024'
  },
  {
    id: 'chatbots-assistants',
    title: 'Chatbots & AI Assistants',
    description: 'Conversational AI and virtual assistant platforms',
    detailedDescription: 'Top AI chatbots and virtual assistants for customer service, productivity and personal use. Transform how you communicate and work.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    color: 'from-orange-500 to-red-500',
    gradient: 'bg-gradient-to-br from-orange-50 to-red-50',
    toolsCount: 20,
    trending: true,
    lastUpdated: 'January 2024'
  },
  {
    id: 'automation-workflow',
    title: 'Automation & Workflow',
    description: 'AI-powered automation and business process tools',
    detailedDescription: 'Streamline your workflows and automate repetitive tasks with these powerful AI automation tools. Boost productivity and save time.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    color: 'from-teal-500 to-green-500',
    gradient: 'bg-gradient-to-br from-teal-50 to-green-50',
    toolsCount: 20,
    lastUpdated: 'December 2023'
  },
  {
    id: 'data-analytics',
    title: 'Data & Analytics',
    description: 'AI data analysis, visualization and business intelligence',
    detailedDescription: 'Advanced AI tools for data analysis, visualization and business intelligence. Turn your data into actionable insights.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    color: 'from-indigo-500 to-purple-500',
    gradient: 'bg-gradient-to-br from-indigo-50 to-purple-50',
    toolsCount: 20,
    popular: true,
    lastUpdated: 'January 2024'
  },
  {
    id: 'music-audio',
    title: 'Music & Audio',
    description: 'AI music generation, audio editing and voice synthesis',
    detailedDescription: 'Revolutionary AI tools for music creation, audio editing and voice synthesis. Create professional audio content without experience.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>,
    color: 'from-pink-500 to-rose-500',
    gradient: 'bg-gradient-to-br from-pink-50 to-rose-50',
    toolsCount: 20,
    badge: 'TRENDING',
    lastUpdated: 'January 2024'
  },
  {
    id: 'coding-development',
    title: 'Coding & Development',
    description: 'AI programming assistants and development tools',
    detailedDescription: 'Essential AI coding assistants and development tools for programmers. Write code faster, debug smarter and build better apps.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
    color: 'from-gray-600 to-gray-800',
    gradient: 'bg-gradient-to-br from-gray-50 to-slate-50',
    toolsCount: 20,
    lastUpdated: 'December 2023'
  },
  {
    id: 'education-learning',
    title: 'Education & Learning',
    description: 'AI-powered educational tools and learning platforms',
    detailedDescription: 'Innovative AI tools for education, online learning and skill development. Learn faster and more effectively with AI assistance.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    color: 'from-amber-500 to-orange-500',
    gradient: 'bg-gradient-to-br from-amber-50 to-orange-50',
    toolsCount: 20,
    lastUpdated: 'January 2024'
  },
  {
    id: 'productivity-office',
    title: 'Productivity & Office',
    description: 'AI tools for productivity, project management and office work',
    detailedDescription: 'Supercharge your productivity with AI-powered office tools, project management and collaboration platforms.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    color: 'from-emerald-500 to-teal-500',
    gradient: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    toolsCount: 20,
    lastUpdated: 'December 2023'
  },
  {
    id: 'sales-marketing',
    title: 'Sales & Marketing',
    description: 'AI-driven sales tools, lead generation and marketing automation',
    detailedDescription: 'Powerful AI tools for sales professionals and marketers. Generate leads, automate campaigns and close more deals.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>,
    color: 'from-violet-500 to-purple-600',
    gradient: 'bg-gradient-to-br from-violet-50 to-purple-50',
    toolsCount: 20,
    popular: true,
    lastUpdated: 'January 2024'
  }
]

export default function TopListsPage() {
  const trendingLists = topListCategories.filter(cat => cat.trending)
  const popularLists = topListCategories.filter(cat => cat.popular)

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <Link
              href="/"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Homepage
            </Link>
            
            <div className="mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4 px-2">
                🏆 <span className="text-gradient-primary">TOP AI Tools</span> Lists
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Carefully curated collections of the best AI tools in each category. 
                Find the perfect tools for your specific needs and stay ahead of the curve.
              </p>
            </div>

            {/* Stats - Mobilní optimalizace */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-8 mb-6 sm:mb-8 max-w-lg mx-auto">
              <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                <div className="text-lg sm:text-2xl font-bold text-purple-600">{topListCategories.length}</div>
                <div className="text-xs sm:text-sm text-gray-600">Categories</div>
              </div>
              <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                <div className="text-lg sm:text-2xl font-bold text-purple-600">{topListCategories.length * 20}</div>
                <div className="text-xs sm:text-sm text-gray-600">AI Tools</div>
              </div>
              <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                <div className="text-lg sm:text-2xl font-bold text-purple-600">Weekly</div>
                <div className="text-xs sm:text-sm text-gray-600">Updates</div>
              </div>
            </div>
          </div>

          {/* Trending Lists */}
          {trendingLists.length > 0 && (
            <div className="mb-8 sm:mb-12">
              <div className="flex items-center gap-2 mb-4 sm:mb-6 px-2">
                <FireIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Trending Now</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {trendingLists.map(category => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </div>
          )}

          {/* Popular Lists */}
          {popularLists.length > 0 && (
            <div className="mb-8 sm:mb-12">
              <div className="flex items-center gap-2 mb-4 sm:mb-6 px-2">
                <StarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Most Popular</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {popularLists.map(category => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </div>
          )}

          {/* All Categories */}
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center gap-2 mb-4 sm:mb-6 px-2">
              <TrophyFilledIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">All Categories</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {topListCategories.map(category => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// Mobilní optimalizovaná komponenta pro kartičky kategorií
function CategoryCard({ category }: { category: TopListCategory }) {
  return (
    <Link
      href={`/top-lists/${category.id}`}
      className="group block"
    >
      <div className={`${category.gradient} rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 h-auto sm:h-64 relative`}>
        
        {/* Badge */}
        {category.badge && (
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
            <span className={`px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${category.color} shadow-sm`}>
              {category.badge}
            </span>
          </div>
        )}

        {/* Icon and title */}
        <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-r ${category.color} text-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
            {category.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors leading-tight">
              {category.title}
            </h3>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <TrophyFilledIcon className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />
              <span>TOP {category.toolsCount}</span>
            </div>
          </div>
        </div>

        {/* Description - na mobilu kratší */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 sm:line-clamp-3">
          {category.detailedDescription}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Updated {category.lastUpdated}
          </div>
          <div className="flex items-center gap-2">
            {category.trending && (
              <div className="flex items-center gap-1 text-xs text-red-600">
                <FireIcon className="w-3 h-3" />
                <span className="hidden sm:inline">Hot</span>
              </div>
            )}
            {category.popular && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <StarIcon className="w-3 h-3" />
                <span className="hidden sm:inline">Popular</span>
              </div>
            )}
            <div className="text-xs text-gray-500 group-hover:text-purple-600 transition-colors">
              View list →
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
} 