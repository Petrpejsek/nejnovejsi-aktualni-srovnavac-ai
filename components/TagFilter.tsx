'use client'

import React, { useState, useEffect } from 'react'

interface TagFilterProps {
  selectedTags: Set<string>
  onTagsChange: (tags: Set<string>) => void
}

export default function TagFilter({ selectedTags, onTagsChange }: TagFilterProps) {
  const [availableTags, setAvailableTags] = useState<string[]>([])

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/products')
        if (response.ok) {
          const products = await response.json()
          // Získáme všechny unikátní tagy ze všech produktů
          const allTags = new Set<string>()
          products.forEach((product: any) => {
            const tags = typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags
            if (Array.isArray(tags)) {
              tags.forEach(tag => allTags.add(tag))
            }
          })
          setAvailableTags(Array.from(allTags))
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
    <div className="flex flex-wrap gap-2">
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
  )
} 