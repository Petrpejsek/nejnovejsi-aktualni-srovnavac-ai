'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface TopList {
  id: string
  title: string
  description: string
  category: string
  products: string[]
  status: string
  clicks: number
  conversion: number
  createdAt: string
  updatedAt: string
}

// Ikony pro kategorie
const categoryIcons: { [key: string]: React.ReactNode } = {
  'video-editing': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  'writing-content': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  'social-media': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" /></svg>,
  'design-graphics': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v14a2 2 0 01-2 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 7v10a2 2 0 01-2 2h-4a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2z" /></svg>,
  'chatbots-assistants': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  'automation-workflow': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
}

// Barevné schéma pro kategorie
const categoryStyles: { [key: string]: { gradient: string, iconBg: string } } = {
  'video-editing': { gradient: 'bg-red-50', iconBg: 'bg-red-100 text-red-700' },
  'writing-content': { gradient: 'bg-green-50', iconBg: 'bg-green-100 text-green-700' },
  'social-media': { gradient: 'bg-blue-50', iconBg: 'bg-blue-100 text-blue-700' },
  'design-graphics': { gradient: 'bg-orange-50', iconBg: 'bg-orange-100 text-orange-700' },
  'chatbots-assistants': { gradient: 'bg-purple-50', iconBg: 'bg-purple-100 text-purple-700' },
  'automation-workflow': { gradient: 'bg-teal-50', iconBg: 'bg-teal-100 text-teal-700' }
}

export default function TopListsSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [topLists, setTopLists] = useState<TopList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Načítání dat z API
  useEffect(() => {
    const loadTopLists = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/top-lists?status=published')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setTopLists(data || [])
        setError(null)
      } catch (err) {
        console.error('Failed to load top lists:', err)
        setError(err instanceof Error ? err.message : 'Failed to load top lists')
        setTopLists([])
      } finally {
        setLoading(false)
      }
    }
    
    loadTopLists()
  }, [])

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScrollButtons()
  }, [topLists])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
      
      setTimeout(checkScrollButtons, 300)
    }
  }

  // Pokud se načítá nebo je chyba, zobraž minimální UI
  if (loading) {
    return (
      <div className="mt-20 mb-12">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    )
  }

  if (error || topLists.length === 0) {
    return null // Skryj sekci pokud nejsou data
  }

  return (
    <div className="mt-20 mb-12">
      {/* Elegantní header */}
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-3">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
            TOP AI Tools Rankings
          </h2>
          <p className="text-xl text-gray-600 font-medium">
            Expertly curated rankings of the best AI tools in each category
          </p>
        </div>
        <Link 
          href="/top-lists"
          className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-3"
        >
          View All Rankings
          <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-sm shadow-xl border border-white/20 flex items-center justify-center transition-all duration-300 ${
            canScrollLeft 
              ? 'hover:bg-white hover:shadow-2xl hover:-translate-y-1 cursor-pointer opacity-100' 
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-sm shadow-xl border border-white/20 flex items-center justify-center transition-all duration-300 ${
            canScrollRight 
              ? 'hover:bg-white hover:shadow-2xl hover:-translate-y-1 cursor-pointer opacity-100' 
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <ChevronRightIcon className="w-6 h-6 text-gray-700" />
        </button>

        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto scrollbar-hide px-4 py-8"
          onScroll={checkScrollButtons}
        >
          {topLists.map(list => {
            const styles = categoryStyles[list.category] || { gradient: 'bg-gray-50', iconBg: 'bg-gray-100 text-gray-700' }
            const icon = categoryIcons[list.category] || <SparklesIcon className="w-6 h-6" />
            
            return (
              <Link
                key={list.id}
                href={`/top-lists/${list.category}`}
                className="flex-none w-96 group"
              >
                <div className="home-top20-card relative rounded-xl p-8 border border-gray-100 h-[420px] overflow-hidden" style={{ backgroundColor: '#F9FAFB' }}>
                  
                  {/* Floating sparkles effect */}
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <SparklesIcon className="w-6 h-6 text-gray-300" />
                  </div>

                  {/* Header */}
                  <div className="relative z-10 flex items-start gap-5 mb-6">
                    <div className={`w-16 h-16 rounded-2xl ${styles.iconBg} flex items-center justify-center shadow-sm`}>
                      {icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-amber-600 uppercase tracking-wider">TOP {list.products.length}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-all duration-300 leading-tight">
                        {list.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-base mb-6 leading-relaxed">
                    {list.description}
                  </p>

                  {/* Preview info */}
                  <div className="mb-6 flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-purple-300"></div>
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">RANKING PREVIEW</h4>
                      <div className="flex-1 h-px bg-gray-200"></div>
                    </div>
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">🏆</div>
                      <div className="text-lg font-semibold text-gray-900 mb-2">{list.products.length} AI Tools Ranked</div>
                      <div className="text-sm text-gray-600">Click to view complete ranking</div>
                    </div>
                  </div>

                  {/* Elegant CTA - ukotven na dně */}
                  <div className="absolute bottom-6 left-8 right-8">
                    <div className={`${styles.gradient} rounded-2xl p-1 shadow-sm group-hover:shadow-md transition-shadow duration-300`}>
                      <div className="bg-white rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-gray-900">See all {list.products.length} tools ranked</div>
                          <div className="text-xs text-gray-600">View Complete Ranking</div>
                        </div>
                        <ArrowRightIcon className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Decorative bottom element */}
      <div className="mt-12 flex justify-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-300"></div>
          <div className="w-16 h-px bg-purple-300"></div>
          <div className="w-3 h-3 rounded-full bg-purple-400"></div>
          <div className="w-16 h-px bg-purple-300"></div>
          <div className="w-2 h-2 rounded-full bg-purple-300"></div>
        </div>
      </div>
    </div>
  )
} 