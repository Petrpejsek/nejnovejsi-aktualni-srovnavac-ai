'use client'

import React, { useState } from 'react'
import ProductGrid from './ProductGrid'
import TagFilter from './TagFilter'

export default function ProductGridWrapper() {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())

  return (
    <>
      <TagFilter 
        tags={[
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
        ]}
        selectedTags={selectedTags} 
        onTagsChange={setSelectedTags} 
      />
      <ProductGrid selectedTags={selectedTags} />
    </>
  )
} 