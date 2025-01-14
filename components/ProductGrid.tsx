'use client'

import React, { useState } from 'react'
import ProductCard from './ProductCard'
import CompareBar from './CompareBar'
import { useCompareStore } from '../store/compareStore'

const ALL_PRODUCTS = [
  {
    id: '1',
    title: 'ChatGPT',
    description: 'Pokročilý konverzační AI model od OpenAI, který zvládá přirozenou komunikaci, psaní textů a pomoc s kódem.',
    imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=ChatGPT',
    externalUrl: 'https://chat.openai.com',
    rating: 4.9,
    price: 'Od $20/měsíc',
    tags: ['chatbot', 'text', 'kód']
  },
  {
    id: '2',
    title: 'DALL-E',
    description: 'AI systém pro generování obrázků z textového popisu. Vytváří unikátní a kreativní vizuály podle vašich představ.',
    imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=DALL-E',
    externalUrl: 'https://labs.openai.com',
    rating: 4.7,
    price: 'Od $15/měsíc',
    tags: ['obrázky', 'umění']
  },
  {
    id: '3',
    title: 'Midjourney',
    description: 'Nástroj pro tvorbu uměleckých vizuálů pomocí AI. Vyniká v tvorbě detailních a esteticky působivých obrazů.',
    imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Midjourney',
    externalUrl: 'https://www.midjourney.com',
    rating: 4.8,
    price: 'Od $25/měsíc',
    tags: ['obrázky', 'umění']
  },
  {
    id: '4',
    title: 'Claude',
    description: 'Pokročilý AI asistent od Anthropic, který vyniká v analýze a zpracování dlouhých textů.',
    imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Claude',
    externalUrl: 'https://claude.ai',
    rating: 4.6,
    price: 'Od $30/měsíc',
    tags: ['chatbot', 'text', 'analýza']
  },
  {
    id: '5',
    title: 'Stable Diffusion',
    description: 'Open-source nástroj pro generování obrázků s možností vlastního trénování a úprav.',
    imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Stable+Diffusion',
    externalUrl: 'https://stability.ai',
    rating: 4.5,
    price: 'Od $0/měsíc',
    tags: ['obrázky', 'umění', 'open-source']
  },
  {
    id: '6',
    title: 'Copilot',
    description: 'AI asistent pro programování od GitHubu, který pomáhá s psaním kódu a dokumentace.',
    imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Copilot',
    externalUrl: 'https://github.com/features/copilot',
    rating: 4.8,
    price: 'Od $10/měsíc',
    tags: ['kód', 'programování']
  },
  {
    id: '7',
    title: 'Whisper',
    description: 'Systém pro přepis řeči na text od OpenAI s podporou mnoha jazyků.',
    imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Whisper',
    externalUrl: 'https://openai.com/research/whisper',
    rating: 4.7,
    price: 'Od $12/měsíc',
    tags: ['audio', 'text', 'přepis']
  },
  {
    id: '8',
    title: 'Jasper',
    description: 'AI nástroj pro tvorbu marketingového obsahu a copywritingu.',
    imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Jasper',
    externalUrl: 'https://www.jasper.ai',
    rating: 4.6,
    price: 'Od $40/měsíc',
    tags: ['text', 'marketing', 'copywriting']
  }
]

export default function ProductGrid() {
  const [visibleCount, setVisibleCount] = useState(6)
  const [isCompactView, setIsCompactView] = useState(false)
  const { selectedProducts, addProduct, removeProduct, clearProducts } = useCompareStore()

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 3, ALL_PRODUCTS.length))
  }

  const handleCompare = () => {
    // Logika pro srovnání je nyní v CompareBar komponentě
  }

  const visibleProducts = ALL_PRODUCTS.slice(0, visibleCount)
  const hasMoreProducts = visibleCount < ALL_PRODUCTS.length

  return (
    <div className="space-y-4 md:space-y-6 pb-20">
      <div className="flex items-center justify-end gap-2 md:hidden mb-4">
        <button
          onClick={() => setIsCompactView(false)}
          className={`p-2 text-sm rounded-lg transition-colors ${
            !isCompactView 
              ? 'bg-purple-100 text-purple-700' 
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </button>
        <button
          onClick={() => setIsCompactView(true)}
          className={`p-2 text-sm rounded-lg transition-colors ${
            isCompactView 
              ? 'bg-purple-100 text-purple-700' 
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        </button>
      </div>

      <div className={`grid gap-3 md:gap-4 ${
        isCompactView 
          ? 'grid-cols-2' 
          : 'grid-cols-1'
      } sm:grid-cols-2 lg:grid-cols-3`}>
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            isCompact={isCompactView}
            isSelected={selectedProducts.some(p => p.id === product.id)}
            onCompareToggle={() => {
              if (selectedProducts.some(p => p.id === product.id)) {
                removeProduct(product.id)
              } else {
                addProduct(product)
              }
            }}
          />
        ))}
      </div>
      
      {hasMoreProducts && (
        <div className="text-center mt-6">
          <button 
            onClick={handleLoadMore}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-purple-600/90 hover:text-purple-700/90 hover:bg-purple-50 rounded-md transition-colors"
          >
            Načíst další
          </button>
        </div>
      )}

      <CompareBar 
        selectedCount={selectedProducts.length}
        onCompare={handleCompare}
        onClear={clearProducts}
      />
    </div>
  )
} 