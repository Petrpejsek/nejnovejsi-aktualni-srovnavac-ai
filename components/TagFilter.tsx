'use client'

import React, { useState, useEffect } from 'react'

interface TagFilterProps {
  selectedTags: Set<string>
  onTagsChange: (tags: Set<string>) => void
}

export default function TagFilter({ selectedTags, onTagsChange }: TagFilterProps) {
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [showAllTags, setShowAllTags] = useState(false)

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/products')
        if (response.ok) {
          const products = await response.json()
          // Získáme všechny unikátní tagy ze všech produktů a normalizujeme je
          const allTags = new Set<string>()
          products.forEach((product: any) => {
            const tags = typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags
            if (Array.isArray(tags)) {
              tags.forEach(tag => {
                // Normalize tags
                let normalizedTag = tag.trim()
                
                // Unify similar tags
                if (normalizedTag.toLowerCase() === 'text na řeč' || 
                    normalizedTag.toLowerCase() === 'text to speech') {
                  normalizedTag = 'Text to Speech'
                }
                else if (normalizedTag.toLowerCase() === 'úprava fotek' || 
                         normalizedTag.toLowerCase() === 'úprava obrázků') {
                  normalizedTag = 'Image Editing'
                }
                else if (normalizedTag.toLowerCase() === 'generování obrázků' || 
                         normalizedTag.toLowerCase() === 'generování obrázkú') {
                  normalizedTag = 'Image Generation'
                }
                else if (normalizedTag.toLowerCase() === 'zákaznický servis' || 
                         normalizedTag.toLowerCase() === 'zákaznická podpora') {
                  normalizedTag = 'Customer Support'
                }
                else if (normalizedTag.toLowerCase() === 'projektové řízení' || 
                         normalizedTag.toLowerCase() === 'projektový management') {
                  normalizedTag = 'Project Management'
                }
                else if (normalizedTag.toLowerCase() === 'avatary' || 
                         normalizedTag.toLowerCase() === 'digitální avatary') {
                  normalizedTag = 'Digital Avatars'
                }
                else if (normalizedTag.toLowerCase() === 'video' || 
                         normalizedTag.toLowerCase() === 'video tvorba') {
                  normalizedTag = 'Video Creation'
                }
                else if (normalizedTag.toLowerCase() === 'voiceover') {
                  normalizedTag = 'Text to Speech'
                }

                allTags.add(normalizedTag)
              })
            }
          })
          // Seřadíme tagy abecedně
          setAvailableTags(Array.from(allTags).sort())
        }
      } catch (error) {
        console.error('Chyba při načítání tagů:', error)
      }
    }

    fetchTags()
  }, [])

  const toggleTag = (tag: string) => {
    const newTags = new Set(selectedTags)
    if (newTags.has(tag)) {
      newTags.delete(tag)
    } else {
      newTags.add(tag)
    }
    onTagsChange(newTags)
  }

  const buttonClass = (tag: string) => `
    px-3 
    py-1.5 
    text-[13px] 
    font-normal 
    rounded-[14px] 
    border 
    transition-all 
    ${selectedTags.has(tag)
      ? 'bg-gradient-primary text-white border-transparent'
      : 'border-gray-200 text-gradient-primary hover:bg-gray-50/80'
    }
  `

  return (
    <div className="space-y-4 mb-8">
      <div className={`flex flex-wrap gap-2 relative ${!showAllTags ? 'max-h-[120px] overflow-hidden' : ''}`}>
        {availableTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={buttonClass(tag)}
          >
            {tag}
          </button>
        ))}
        {!showAllTags && availableTags.length > 12 && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>
      {availableTags.length > 12 && (
        <div className="flex justify-center mt-2">
          <button
            onClick={() => setShowAllTags(!showAllTags)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-full transition-all"
          >
            {showAllTags ? (
              <>
                <span>Show Less Categories</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </>
            ) : (
              <>
                <span>Show {availableTags.length - 12} More Categories</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
} 