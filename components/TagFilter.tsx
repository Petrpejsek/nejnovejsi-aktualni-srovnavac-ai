'use client'

import React from 'react'

const TAG_CATEGORIES = {
  functionality: {
    title: 'Funkcionalita',
    tags: ['Chatbot', 'Text', 'Obrázky', 'Generování', 'Audio', 'Přepis', 'Kód', 'Programování']
  },
  rating: {
    title: 'Hodnocení',
    tags: ['Nejlépe hodnocené', 'Populární', 'Ověřené']
  },
  pricing: {
    title: 'Cena',
    tags: ['Zdarma', 'Free trial', 'Do 10$/měsíc', 'Do 30$/měsíc']
  }
}

interface TagFilterProps {
  selectedTags: Set<string>
  onTagsChange: (tags: Set<string>) => void
}

export default function TagFilter({ selectedTags, onTagsChange }: TagFilterProps) {
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
      {TAG_CATEGORIES.functionality.tags.map((tag) => (
        <button
          key={tag}
          onClick={() => toggleTag(tag)}
          className={buttonClass(tag)}
        >
          {tag}
        </button>
      ))}
      
      {TAG_CATEGORIES.rating.tags.map((tag) => (
        <button
          key={tag}
          onClick={() => toggleTag(tag)}
          className={buttonClass(tag)}
        >
          {tag}
        </button>
      ))}
      
      {TAG_CATEGORIES.pricing.tags.map((tag) => (
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