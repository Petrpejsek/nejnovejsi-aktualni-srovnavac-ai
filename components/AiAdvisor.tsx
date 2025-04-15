'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProductStore } from '../store/productStore'

export default function AiAdvisor() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { pagination, fetchProducts } = useProductStore()

  useEffect(() => {
    // Načteme pouze jeden produkt pro získání celkového počtu
    fetchProducts(1, 1)
  }, [fetchProducts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!query.trim()) return
    
    try {
      setLoading(true)
      
      // Nejdřív odešleme dotaz na API pro generování doporučení
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      })
      
      if (!response.ok) {
        throw new Error('Nepodařilo se získat doporučení')
      }
      
      // Po úspěšném zpracování přesměrujeme na stránku s doporučeními
      router.push(`/recommendations?query=${encodeURIComponent(query)}`)
    } catch (error) {
      console.error('Chyba při získávání doporučení:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-[58px] mt-[50px]">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-semibold mb-4 text-gradient-primary">
          Find the Perfect AI Tool
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Choose from our{' '}
          <span className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent font-semibold animate-pulse">
            {pagination.totalProducts} AI solutions
          </span>
          {' '}and find the best one for your needs. Just describe your project or problem and we'll help you choose.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center px-4">
        <div className="flex w-full max-w-3xl gap-3 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 to-pink-500/30 rounded-[50px] blur-md opacity-75 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative flex w-full flex-col sm:flex-row gap-3 bg-white rounded-[42px] p-1.5 shadow-lg">
            <input
              type="text"
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              placeholder="Describe what you do or what problem you need to solve..."
              className="flex-1 px-7 py-5 text-base rounded-[38px] border border-gray-200/80 focus:border-transparent focus:ring-2 focus:ring-purple-400/40 outline-none transition-all text-gray-600 placeholder:text-gray-400/90 font-light bg-white/90 backdrop-blur-sm hover:border-gray-300/80"
              disabled={loading}
            />
            <button
              type="submit"
              className={`px-10 py-5 text-white rounded-[38px] transition-all font-medium bg-gradient-primary hover-gradient-primary shadow-sm text-base w-full sm:w-auto ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Advise'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
} 