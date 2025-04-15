'use client'

import React from 'react'
import ProductGrid from './ProductGrid'
import TagFilter from './TagFilter'

export default function ProductGridWrapper() {
  return (
    <>
      <TagFilter />
      <ProductGrid />
    </>
  )
} 