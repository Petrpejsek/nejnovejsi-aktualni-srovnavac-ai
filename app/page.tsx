import React from 'react'
import AiAdvisor from '../components/AiAdvisor'
import ProductGridWrapper from '../components/ProductGridWrapper'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <AiAdvisor />
        <div className="mt-4">
          <ProductGridWrapper />
        </div>
      </div>
    </main>
  )
} 