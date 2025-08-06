'use client'

import React from 'react'
import AiAdvisor from './AiAdvisor'
import ProductCarousel from './ProductCarousel'

interface LandingPageWithProductsProps {
  children: React.ReactNode
}

export default function LandingPageWithProducts({ children }: LandingPageWithProductsProps) {
  return (
    <>
      {children}
    </>
  )
}

// Export individual components that can be used in server components
export { AiAdvisor, ProductCarousel }