'use client'

import React from 'react'
import Link from 'next/link'

interface CategoryWithProducts {
  slug: string
  name: string
  description: string
  productCount: number
  topProducts: Array<{
    name: string
    description: string
  }>
}

interface TopListsClientProps {
  categories: CategoryWithProducts[]
  totalCategories: number
  totalTools: number
}

export default function TopListsClient({
  categories,
  totalCategories,
  totalTools
}: TopListsClientProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        {/* Clean Header */}
        <div className="text-center mb-16">
          <Link
            href="/"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Homepage
          </Link>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            🏆 <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">TOP AI Tools</span> Lists
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Carefully curated TOP 20 rankings of the best AI tools in each category. 
            Discover the highest-rated solutions that are transforming work in 2025.
          </p>
        </div>

        {/* All TOP 20 Lists Grid - Clean Design */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/top-lists/${category.slug}`}
                className="group block"
              >
                <div className="bg-white rounded-2xl p-8 border border-gray-100 h-full flex flex-col shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-out">
                  {/* Clean Header - No Icons */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors leading-tight mb-3">
                      TOP 20 {category.name}
                    </h3>
                    <p className="text-gray-600 text-base leading-relaxed">
                      {category.description}
                    </p>
                  </div>

                  {/* Top 3 Products Preview */}
                  <div className="mb-8 flex-1">
                    <div className="space-y-4">
                      {category.topProducts.map((product, index) => (
                        <div key={index} className="border-l-4 border-purple-200 pl-4">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                                {product.name}
                              </h4>
                              <p className="text-gray-600 text-xs leading-tight line-clamp-2">
                                {product.description.length > 80 
                                  ? product.description.substring(0, 80) + '...'
                                  : product.description
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button - Fixed at bottom with improved hover */}
                  <div className="mt-auto">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 group-hover:from-purple-100 group-hover:to-blue-100 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-gray-900">View all 20 tools</div>
                          <div className="text-xs text-gray-600">Complete ranking</div>
                        </div>
                        <svg className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No TOP 20 Lists Available</h3>
            <p className="text-gray-600">We're working on curating the best AI tools. Check back soon!</p>
          </div>
        )}

        {/* Compact SEO Content - Reduced padding */}
        <section className="max-w-4xl mx-auto mt-8">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 lg:p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">The Ultimate AI Tools Directory for 2025</h2>
            <div className="prose prose-sm max-w-none text-gray-700 space-y-2 text-sm leading-relaxed">
              <p>
                Our <strong>TOP 20 AI tools lists</strong> represent the most comprehensive and carefully curated rankings available today. 
                Each category features the highest-rated, most innovative AI solutions that are transforming how professionals work across industries.
              </p>
              <p>
                From AI writing assistants that revolutionize content creation to automation platforms that streamline complex workflows, 
                our rankings are based on performance metrics, user reviews, and real-world impact. Whether you're looking for 
                <strong> productivity AI tools</strong>, creative solutions, or business automation platforms, our TOP 20 lists help you 
                discover the perfect tools for your specific needs.
              </p>
              <p>
                Stay ahead of the rapidly evolving AI landscape with our continuously updated rankings. Each list is maintained by industry experts 
                who evaluate new tools and technologies, ensuring you always have access to the latest and most effective 
                <strong> AI solutions for 2025</strong> and beyond.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 