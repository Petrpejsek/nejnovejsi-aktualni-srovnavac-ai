import React from 'react'
import AiAdvisor from '../components/AiAdvisor'
import ProductGridWrapper from '../components/ProductGridWrapper'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Find the Perfect AI Tool for Your Needs
        </h1>
        <p className="text-lg text-gray-600 text-center mb-12">
          Compare features, prices, and user reviews of the most popular AI tools to make the best choice for your business.
        </p>
        <AiAdvisor />
        <ProductGridWrapper />
      </div>
    </main>
  )
} 