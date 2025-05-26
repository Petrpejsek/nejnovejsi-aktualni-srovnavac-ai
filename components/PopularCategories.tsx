'use client'

import React, { useState, useEffect } from 'react'

interface PopularCategoriesProps {
  tags?: string[];
  onCategorySelect: (category: string) => void;
}

export default function PopularCategories({ tags, onCategorySelect }: PopularCategoriesProps) {
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [fetchedTags, setFetchedTags] = useState<string[]>([])

  // On mount fetch all tags if not provided via props
  useEffect(() => {
    if (tags && tags.length > 0) return

    const loadTags = async () => {
      try {
        const res = await fetch('/api/products?categoriesOnly=true', {
          cache: 'no-store'
        })
        if (!res.ok) throw new Error('Failed to load tags')
        const data = await res.json()
        if (Array.isArray(data.tags)) {
          setFetchedTags(data.tags)
        }
      } catch (err) {
        console.warn('PopularCategories: error loading tags', err)
      }
    }

    loadTags()
  }, [tags])

  const popularCategories = tags && tags.length > 0 ? tags : fetchedTags

  const buttonClass = `
    px-3 
    py-1.5 
    text-xs 
    font-medium 
    rounded-md 
    transition-all 
    bg-purple-50 
    text-purple-600 
    hover:bg-purple-100 
    hover:text-purple-700
    border-none
  `

  return (
    <div className="mt-8 max-w-4xl mx-auto">
      <div className="space-y-4">
        <div className={`flex flex-wrap justify-center gap-2 relative ${!showAllCategories ? 'max-h-[60px] overflow-hidden' : ''}`}>
          {popularCategories.map((category) => (
            <button
              key={category}
              onClick={() => onCategorySelect(category)}
              className={buttonClass}
            >
              {category}
            </button>
          ))}
          {!showAllCategories && popularCategories.length > 15 && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          )}
        </div>
        {popularCategories.length > 15 && (
          <div className="flex justify-center mt-3">
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-full transition-all"
            >
              {showAllCategories ? (
                <>
                  <span>Show Less</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  <span>Show {popularCategories.length - 15} More Categories</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 