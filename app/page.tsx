'use client'

import React, { useState } from 'react'
import AiAdvisor from '../components/AiAdvisor'
import ProductGrid from '../components/ProductGrid'
import TagFilter from '../components/TagFilter'

export default function Home() {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <AiAdvisor />
        <TagFilter selectedTags={selectedTags} onTagsChange={setSelectedTags} />
        <ProductGrid selectedTags={selectedTags} />
      </div>
    </main>
  )
} 