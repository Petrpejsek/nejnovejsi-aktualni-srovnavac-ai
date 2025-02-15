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
                // Normalizace tagů
                let normalizedTag = tag.trim()
                
                // Sjednocení podobných tagů
                if (normalizedTag.toLowerCase() === 'text na řeč' || 
                    normalizedTag.toLowerCase() === 'text to speech') {
                  normalizedTag = 'Text to Speech'
                }
                else if (normalizedTag.toLowerCase() === 'úprava fotek' || 
                         normalizedTag.toLowerCase() === 'úprava obrázků') {
                  normalizedTag = 'Úprava obrázků'
                }
                else if (normalizedTag.toLowerCase() === 'generování obrázků' || 
                         normalizedTag.toLowerCase() === 'generování obrázkú') {
                  normalizedTag = 'Generování obrázků'
                }
                else if (normalizedTag.toLowerCase() === 'zákaznický servis' || 
                         normalizedTag.toLowerCase() === 'zákaznická podpora') {
                  normalizedTag = 'Zákaznická podpora'
                }
                else if (normalizedTag.toLowerCase() === 'projektové řízení' || 
                         normalizedTag.toLowerCase() === 'projektový management') {
                  normalizedTag = 'Projektový management'
                }
                else if (normalizedTag.toLowerCase() === 'avatary' || 
                         normalizedTag.toLowerCase() === 'digitální avatary') {
                  normalizedTag = 'Digitální avatary'
                }
                else if (normalizedTag.toLowerCase() === 'video' || 
                         normalizedTag.toLowerCase() === 'video tvorba') {
                  normalizedTag = 'Video tvorba'
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
    <div className="space-y-4">
      <div className={`flex flex-wrap gap-2 ${!showAllTags ? 'max-h-[120px] overflow-hidden' : ''}`}>
        {availableTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={buttonClass(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      {availableTags.length > 12 && (
        <div className="flex justify-center mt-2">
          <button
            onClick={() => setShowAllTags(!showAllTags)}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            {showAllTags ? 'Zobrazit méně kategorií' : 'Zobrazit více kategorií'}
          </button>
        </div>
      )}
    </div>
  )
} 