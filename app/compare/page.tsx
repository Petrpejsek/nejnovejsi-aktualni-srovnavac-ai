'use client'

import React, { useState, useMemo } from 'react'
import { useCompareStore } from '../../store/compareStore'
import Link from 'next/link'

// Helper functions
const getProductCategory = (productId: string): AICategory => {
  if (productId === '1' || productId === '4' || productId === '8') return 'text'
  if (productId === '2' || productId === '3' || productId === '5') return 'image'
  if (productId === '6') return 'code'
  if (productId === '7') return 'audio'
  return 'other'
}

const getFeatureSupport = (productId: string, feature: string): FeatureSupport => {
  // Simulate feature support based on product and feature
  const supportMap: Record<string, Record<string, FeatureSupport>> = {
    '1': {
      'api': 'full',
      'customization': 'partial',
      'team_collaboration': 'none'
    },
    '2': {
      'api': 'full',
      'customization': 'full',
      'team_collaboration': 'partial'
    }
  }

  return supportMap[productId]?.[feature] || 'none'
}

// Constants
const AI_CATEGORIES = [
  {
    id: 'text',
    name: 'Text Generation',
    description: 'AI tools for creating and editing text content',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    )
  },
  {
    id: 'image',
    name: 'Image Generation',
    description: 'Tools for creating and editing images using AI',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    )
  },
  {
    id: 'code',
    name: 'Code Generation',
    description: 'AI-powered coding assistants and tools',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    )
  },
  {
    id: 'audio',
    name: 'Audio Processing',
    description: 'Tools for audio generation and processing',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
      </svg>
    )
  }
]

const FEATURES = {
  basic: [
    {
      id: 'api',
      name: 'API Access',
      description: 'Access to the API for integration'
    },
    {
      id: 'customization',
      name: 'Customization',
      description: 'Ability to customize the tool'
    }
  ],
  advanced: [
    {
      id: 'team_collaboration',
      name: 'Team Collaboration',
      description: 'Features for team collaboration'
    }
  ],
  enterprise: [
    {
      id: 'dedicated_support',
      name: 'Dedicated Support',
      description: '24/7 dedicated support'
    }
  ]
}

type AICategory = 'text' | 'image' | 'code' | 'audio' | 'other'
type FeatureSupport = 'full' | 'partial' | 'none'

export default function ComparisonPage() {
  const { selectedProducts } = useCompareStore()
  const [activeCategory, setActiveCategory] = useState<AICategory | null>(null)

  // Filter products by active category
  const filteredProducts = useMemo(() => {
    if (!activeCategory) return selectedProducts
    return selectedProducts.filter(p => getProductCategory(p.id) === activeCategory)
  }, [selectedProducts, activeCategory])

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-semibold mb-8 bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
            Compare AI Tools
          </h1>

          {selectedProducts.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                No Products Selected
              </h2>
              <p className="text-gray-600 mb-8">
                Select products you want to compare from our catalog.
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <>
              {/* Category filters */}
              <div className="flex flex-wrap gap-3 mb-8">
                {AI_CATEGORIES.map((category) => {
                  const count = selectedProducts.filter(p => getProductCategory(p.id) === category.id).length
                  if (count === 0) return null
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id as AICategory)}
                      className={`group flex items-center gap-3 px-5 py-3 rounded-[16px] transition-all ${
                        activeCategory === category.id
                          ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md hover:shadow-lg'
                          : 'border-2 border-purple-100 bg-white hover:border-purple-200 hover:shadow-sm text-gray-600 hover:text-purple-600'
                      }`}
                    >
                      <div className={`transition-colors ${
                        activeCategory === category.id ? 'text-white' : 'text-purple-400 group-hover:text-purple-500'
                      }`}>
                        {category.icon}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className={`text-xs ${
                          activeCategory === category.id ? 'text-white/90' : 'text-gray-500'
                        }`}>
                          {count} {count === 1 ? 'product' : 'products'}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Product grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-[14px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="relative aspect-video">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.hasTrial && (
                        <div className="absolute top-2 right-2 bg-purple-100 text-purple-600 text-xs font-medium px-2 py-1 rounded-full">
                          Free Trial
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {product.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {product.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <a
                        href={product.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-medium rounded-[14px] hover:opacity-90 transition-opacity w-full justify-center group"
                      >
                        Try it
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-0.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 