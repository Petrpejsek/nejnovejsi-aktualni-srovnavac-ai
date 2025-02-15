'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AiAdvisor() {
  const [query, setQuery] = useState('')
  const [productCount, setProductCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // Načtení počtu produktů
    const fetchProductCount = async () => {
      try {
        const response = await fetch('/api/products/count')
        if (response.ok) {
          const data = await response.json()
          setProductCount(data.count)
        }
      } catch (error) {
        console.error('Chyba při načítání počtu produktů:', error)
      }
    }

    fetchProductCount()
    // Aktualizace každých 30 sekund
    const interval = setInterval(fetchProductCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implementovat logiku pro zpracování dotazu
    console.log('Dotaz:', query)
    // Přesměrování na stránku s doporučeními
    router.push(`/doporuceni?query=${encodeURIComponent(query)}`)
  }

  return (
    <div className="mb-[58px] mt-[50px]">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-semibold mb-4 text-gradient-primary">
          Najděte ideální AI nástroj
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Vyberte si z našich{' '}
          <span className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent font-semibold animate-pulse">
            {productCount} AI řešení
          </span>
          {' '}a najděte to nejlepší pro vaše potřeby. Stačí popsat váš projekt nebo problém a my vám pomůžeme s výběrem.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center px-4">
        <div className="flex w-full max-w-3xl gap-3 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 to-pink-500/30 rounded-[50px] blur-md opacity-75 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative flex w-full flex-col sm:flex-row gap-3 bg-white rounded-[42px] p-1.5 shadow-lg">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Popište, v čem podnikáte nebo jaký problém potřebujete vyřešit..."
              className="flex-1 px-7 py-5 text-base rounded-[38px] border border-gray-200/80 focus:border-transparent focus:ring-2 focus:ring-purple-400/40 outline-none transition-all text-gray-600 placeholder:text-gray-400/90 font-light bg-white/90 backdrop-blur-sm hover:border-gray-300/80"
            />
            <button
              type="submit"
              className="px-10 py-5 text-white rounded-[38px] transition-all font-medium bg-gradient-primary hover-gradient-primary shadow-sm text-base w-full sm:w-auto"
            >
              Poradit
            </button>
          </div>
        </div>
      </form>
    </div>
  )
} 