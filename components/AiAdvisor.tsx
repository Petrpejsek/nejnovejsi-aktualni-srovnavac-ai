'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AiAdvisor() {
  const [query, setQuery] = useState('')
  const router = useRouter()

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
          Popište svůj projekt nebo problém a my vám pomůžeme najít nejlepší AI řešení pro vaše potřeby
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <div className="flex w-[85%] gap-3 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 to-pink-500/30 rounded-[32px] blur-md opacity-75 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative flex w-full gap-3 bg-white rounded-[28px] p-1.5 shadow-lg">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Popište, v čem podnikáte nebo jaký problém potřebujete vyřešit..."
              className="flex-1 px-7 py-5 text-base rounded-[24px] border border-gray-200/80 focus:border-transparent focus:ring-2 focus:ring-purple-400/40 outline-none transition-all text-gray-600 placeholder:text-gray-400/90 font-light bg-white/90 backdrop-blur-sm hover:border-gray-300/80 shadow-sm"
            />
            <button
              type="submit"
              className="px-10 py-5 text-white rounded-[24px] transition-all font-medium bg-gradient-primary hover-gradient-primary shadow-md text-base"
            >
              Poradit
            </button>
          </div>
        </div>
      </form>
    </div>
  )
} 