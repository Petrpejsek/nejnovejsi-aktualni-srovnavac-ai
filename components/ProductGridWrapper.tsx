'use client'

import React, { useState } from 'react'
import ProductGrid from './ProductGrid'
import TagFilter from './TagFilter'

export default function ProductGridWrapper() {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())

  return (
    <>
      <TagFilter selectedTags={selectedTags} onTagsChange={setSelectedTags} />
      <ProductGrid selectedTags={selectedTags} />
    </>
  )
} 