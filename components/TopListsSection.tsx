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

interface Product {
  id: string
  name: string
  description: string
  logo_url?: string
  website_url: string
  pricing_model?: string
  price_range?: string
}

// Clean professional icons for all 20 categories
const categoryIcons: { [key: string]: React.ReactNode } = {
  'writing-tools': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  'chatbots': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>,
  'image-generation': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>,
  'speech-to-text': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>,
  'text-to-speech': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.59-.79-1.59-1.75v-3.5c0-.96.71-1.75 1.59-1.75h2.24z" /></svg>,
  'video-editing': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg>,
  'automation': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>,
  'developer-tools': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>,
  'marketing': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" /></svg>,
  'customer-support': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>,
  'design-tools': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>,
  'education': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>,
  'hr-recruiting': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>,
  'legal': <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4c-2.5 0-4.5 2-4.5 4.5 0 1.5 0.7 2.8 1.8 3.5-1.1 0.7-1.8 2-1.8 3.5 0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5c0-1.5-0.7-2.8-1.8-3.5 1.1-0.7 1.8-2 1.8-3.5C16.5 6 14.5 4 12 4zM12 6c1.4 0 2.5 1.1 2.5 2.5S13.4 11 12 11s-2.5-1.1-2.5-2.5S10.6 6 12 6zM12 13c1.4 0 2.5 1.1 2.5 2.5S13.4 18 12 18s-2.5-1.1-2.5-2.5S10.6 13 12 13z"/><path d="M11 10h2v4h-2z" fill="currentColor"/></svg>,
  'healthcare': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
  'finance': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  'ecommerce': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>,
  'code-generation': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" /></svg>,
  'productivity': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
  'website-builders': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.896c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.25 2.25 0 0017.128 15H16.5l-.324-.324a1.453 1.453 0 00-2.328.377l-.036.073a1.586 1.586 0 01-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 01-5.276 3.67m0 0a9 9 0 01-10.275-4.835M15.75 9c0 .896-.393 1.7-1.016 2.25" /></svg>
}

// Professional color schemes for all 20 categories
const categoryStyles: { [key: string]: { gradient: string, iconBg: string } } = {
  'writing-tools': { gradient: 'bg-emerald-50', iconBg: 'bg-emerald-100 text-emerald-700' },
  'chatbots': { gradient: 'bg-blue-50', iconBg: 'bg-blue-100 text-blue-700' },
  'image-generation': { gradient: 'bg-purple-50', iconBg: 'bg-purple-100 text-purple-700' },
  'speech-to-text': { gradient: 'bg-indigo-50', iconBg: 'bg-indigo-100 text-indigo-700' },
  'text-to-speech': { gradient: 'bg-violet-50', iconBg: 'bg-violet-100 text-violet-700' },
  'video-editing': { gradient: 'bg-red-50', iconBg: 'bg-red-100 text-red-700' },
  'automation': { gradient: 'bg-teal-50', iconBg: 'bg-teal-100 text-teal-700' },
  'developer-tools': { gradient: 'bg-slate-50', iconBg: 'bg-slate-100 text-slate-700' },
  'marketing': { gradient: 'bg-orange-50', iconBg: 'bg-orange-100 text-orange-700' },
  'customer-support': { gradient: 'bg-cyan-50', iconBg: 'bg-cyan-100 text-cyan-700' },
  'design-tools': { gradient: 'bg-pink-50', iconBg: 'bg-pink-100 text-pink-700' },
  'education': { gradient: 'bg-amber-50', iconBg: 'bg-amber-100 text-amber-700' },
  'hr-recruiting': { gradient: 'bg-green-50', iconBg: 'bg-green-100 text-green-700' },
  'legal': { gradient: 'bg-gray-50', iconBg: 'bg-gray-100 text-gray-700' },
  'healthcare': { gradient: 'bg-rose-50', iconBg: 'bg-rose-100 text-rose-700' },
  'finance': { gradient: 'bg-yellow-50', iconBg: 'bg-yellow-100 text-yellow-700' },
  'ecommerce': { gradient: 'bg-lime-50', iconBg: 'bg-lime-100 text-lime-700' },
  'code-generation': { gradient: 'bg-zinc-50', iconBg: 'bg-zinc-100 text-zinc-700' },
  'productivity': { gradient: 'bg-sky-50', iconBg: 'bg-sky-100 text-sky-700' },
  'website-builders': { gradient: 'bg-fuchsia-50', iconBg: 'bg-fuchsia-100 text-fuchsia-700' }
}

export default function TopListsSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [topLists, setTopLists] = useState<TopList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [topListProducts, setTopListProducts] = useState<{ [listId: string]: Product[] }>({})

  // Načítání dat z API
  useEffect(() => {
    const loadTopLists = async () => {
      try {
        setLoading(true)
        // SUPER RYCHLÉ načítání - jen 3 produkty per list místo všech 20!
        const response = await fetch('/api/top-lists?status=published&includeProducts=true&productsLimit=3')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setTopLists(data || [])
        
        // Produkty jsou už naložené v data - jen je připrav pro render
        const productsData: { [listId: string]: Product[] } = {}
        for (const list of data || []) {
          if (list.productsData && list.productsData.length > 0) {
            // Vezmi jen první 3 produkty pro preview
            productsData[list.id] = Array.isArray(list.productsData) ? list.productsData.slice(0, 3) : []
          } else {
            productsData[list.id] = []
          }
        }
        
        setTopListProducts(productsData)
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
            const topProducts = topListProducts[list.id] || []
            
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
                  <div className="relative z-10 flex items-start gap-5 mb-4">
                    <div className={`w-16 h-16 rounded-2xl ${styles.iconBg} flex items-center justify-center shadow-sm`}>
                      {icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-amber-600 uppercase tracking-wider">TOP {list.products.length}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-all duration-300 leading-tight break-words hyphens-none" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                        {list.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description - zkrácený */}
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2" style={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {list.description}
                  </p>

                  {/* Preview info s produkty */}
                  <div className="mb-6 flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-purple-300"></div>
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">RANKING PREVIEW</h4>
                      <div className="flex-1 h-px bg-gray-200"></div>
                    </div>
                    
                    {/* První tři produkty */}
                    {topProducts.length > 0 ? (
                      <div className="space-y-2">
                        {topProducts.map((product, index) => (
                          <div key={product.id} className="flex items-center gap-3 bg-white/60 rounded-lg p-2 border border-white/40">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${
                              index === 0 
                                ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600' 
                                : index === 1 
                                ? 'bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500' 
                                : 'bg-gradient-to-br from-pink-400 via-purple-400 to-pink-500'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="text-base font-semibold text-gray-900 truncate flex-1">
                              {product.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="text-2xl mb-2">🏆</div>
                        <div className="text-sm font-semibold text-gray-900 mb-1">{list.products.length} AI Tools Ranked</div>
                        <div className="text-xs text-gray-600">Click to view complete ranking</div>
                    </div>
                    )}
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