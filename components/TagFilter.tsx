'use client'

import React, { useState } from 'react'

interface TagFilterProps {
  tags?: string[];
  selectedTags?: Set<string>;
  onTagsChange?: (tags: Set<string>) => void;
}

export default function TagFilter({ tags: propTags, selectedTags: propSelectedTags, onTagsChange: propOnTagsChange }: TagFilterProps = {}) {
  const [showAllTags, setShowAllTags] = useState(false)
  const [localSelectedTags, setLocalSelectedTags] = useState<Set<string>>(new Set())
  
  // Use only props or local state - NO STORE!
  const selectedTags = propSelectedTags !== undefined ? propSelectedTags : localSelectedTags
  const setSelectedTags = propOnTagsChange || setLocalSelectedTags

  const toggleTag = (tag: string) => {
    const newTags = new Set(selectedTags)
    if (newTags.has(tag)) {
      newTags.delete(tag)
    } else {
      newTags.add(tag)
    }
    setSelectedTags(newTags)
  }

  // FIXED CATEGORIES - as originally, no API loading!
  const availableTags = propTags || [
    'automation',
    'Healthcare', 
    'Website Builder',
    'video-generation',
    'E-commerce',
    'video-editing',
    'Accounting Software',
    'AI & Video',
    'Financial Technology',
    'AI Website Builder',
    'Robo-Advisor',
    'Accounting Services',
    'music',
    'content creation'
  ]

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
    <div className="space-y-4 mb-4">
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