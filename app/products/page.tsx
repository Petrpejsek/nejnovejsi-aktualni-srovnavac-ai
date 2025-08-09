import React from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import ProductsClient from './ProductsClient'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  imageUrl: string | null
  tags: string | null
  externalUrl: string | null
  hasTrial: boolean
  hasCredit?: boolean
  isActive?: boolean
  createdAt: Date
  updatedAt: Date
}

export const revalidate = 1800 // Revalidate every 30 minutes

export const metadata: Metadata = {
  title: 'All AI Tools - Browse & Compare 500+ AI Tools | Comparee.ai',
  description: 'Discover and compare 500+ AI tools across all categories. Find the best AI solutions for writing, image generation, automation, productivity and more. Reviews, pricing, and features.',
  keywords: 'AI tools, artificial intelligence tools, AI software, AI solutions, AI productivity tools, best AI tools 2025',
  openGraph: {
    title: 'All AI Tools - Browse & Compare 500+ AI Tools | Comparee.ai',
    description: 'Discover and compare 500+ AI tools across all categories. Find the best AI solutions for your needs.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/products`,
    type: 'website'
  }
}

async function getInitialData() {
  try {
    // Get initial products (first page)
    const products = await prisma.product.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { name: 'asc' }
      ],
      take: 24, // Initial page size
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        imageUrl: true,
        tags: true,
        externalUrl: true,
        hasTrial: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Get total count
    const totalProducts = await prisma.product.count({
      where: {
        isActive: true
      }
    })

    // Get all categories for filter
    const categoryResults = await prisma.$queryRaw<Array<{category: string, count: number}>>`
      SELECT 
        category as category,
        COUNT(*) as count
      FROM "Product"
      WHERE "isActive" = true
        AND category IS NOT NULL
        AND category != ''
      GROUP BY category
      ORDER BY count DESC, category ASC
    `

    const categories = categoryResults.map(result => ({
      name: result.category,
      count: Number(result.count)
    }))

    return {
      products: products.map(product => ({
        ...product,
        price: Number(product.price) || 0
      })),
      totalProducts,
      categories
    }
  } catch (error) {
    console.error('Error loading initial data:', error)
    return {
      products: [],
      totalProducts: 0,
      categories: []
    }
  }
}

export default async function ProductsPage() {
  const { products, totalProducts, categories } = await getInitialData()

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "All AI Tools",
    "description": "Complete directory of AI tools and software",
    "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/products`,
    "numberOfItems": totalProducts,
    "itemListElement": products.slice(0, 10).map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/products/${product.id}`,
        "category": product.category,
        "offers": {
          "@type": "Offer",
          "price": product.price || 0,
          "priceCurrency": "USD"
        }
      }
    }))
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Canonical Link */}
      <link rel="canonical" href={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/products`} />

      <main className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Breadcrumb */}
            <nav className="flex mb-6" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/" className="text-gray-500 hover:text-gray-700">
                    Home
                  </Link>
                </li>
                <li>
                  <span className="text-gray-400">/</span>
                </li>
                <li>
                  <span className="text-gray-900 font-medium">All Products</span>
                </li>
              </ol>
            </nav>

            {/* Page Title and Description */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              All AI Tools
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mb-8">
              Discover and compare the complete collection of AI tools and software. 
              Find the perfect AI solutions for your business needs with detailed reviews, pricing information, and feature comparisons.
            </p>

            {/* Statistics */}
            <div className="flex items-center text-lg text-gray-600">
              <span className="font-semibold text-purple-600">{totalProducts} AI Tools Available</span>
              <span className="mx-2">·</span>
              <span className="font-semibold text-purple-600">{categories.length} Categories</span>
              <span className="mx-2">·</span>
              <span className="text-green-600 font-medium">Regularly Updated</span>
            </div>
          </div>
        </div>

        {/* Products with Client-side functionality */}
        <ProductsClient 
          initialProducts={products.map(product => ({
            ...product,
            tags: typeof product.tags === 'string' ? product.tags : JSON.stringify(product.tags)
          }))}
          initialTotalProducts={totalProducts}
          categories={categories}
        />

        {/* SEO Content Section */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Complete AI Tools Directory
              </h2>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                  Our comprehensive AI tools database features over {totalProducts} cutting-edge artificial intelligence solutions 
                  across {categories.length} specialized categories. Whether you're looking for AI writing assistants, 
                  image generation platforms, automation tools, or productivity enhancers, we've carefully curated 
                  and evaluated every tool to help you make informed decisions for your business or personal projects.
                </p>
                
                <h3 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
                  Why Choose Our AI Tools Directory?
                </h3>
                
                <ul className="text-gray-700 mb-6 leading-relaxed space-y-2">
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span><strong>Comprehensive Reviews:</strong> Detailed analysis of features, pricing, and user experience for every tool</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span><strong>Regular Updates:</strong> Database refreshed daily with the latest AI innovations and tools</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span><strong>Advanced Filtering:</strong> Find tools by category, pricing, features, and specific use cases</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span><strong>Expert Recommendations:</strong> Curated selections based on performance and user satisfaction</span>
                  </li>
                </ul>

                <h3 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
                  Popular AI Tool Categories
                </h3>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Explore our most popular categories featuring the best AI tools 2025. From content creation 
                  and design to business automation and data analysis, find specialized solutions for every industry and workflow:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
                  {categories.slice(0, 8).map((category) => (
                    <Link 
                      key={category.name}
                      href={`/categories/${category.name.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-')}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors group"
                    >
                      <span className="font-medium text-gray-900 group-hover:text-purple-600">
                        {category.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {category.count} tools
                      </span>
                    </Link>
                  ))}
                </div>

                <h3 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
                  How to Find the Perfect AI Tool
                </h3>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Finding the right AI tool for your specific needs requires careful consideration of several factors. 
                  Use our advanced search and filtering options to narrow down your choices based on:
                </p>

                <ul className="text-gray-700 mb-6 leading-relaxed space-y-2">
                  <li><strong>Use Case:</strong> Content creation, data analysis, automation, design, customer service</li>
                  <li><strong>Pricing Model:</strong> Free, freemium, subscription, one-time purchase</li>
                  <li><strong>Integration:</strong> Compatible platforms and existing software in your workflow</li>
                  <li><strong>Skill Level:</strong> Beginner-friendly tools vs. advanced professional solutions</li>
                  <li><strong>Industry Focus:</strong> Specialized tools for marketing, healthcare, finance, education</li>
                </ul>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  Each tool listing includes detailed information about features, pricing tiers, customer reviews, 
                  and integration capabilities. Take advantage of free trials whenever available to test tools 
                  before committing to a subscription.
                </p>
              </div>

              {/* CTA Section */}
              <div className="mt-12 text-center">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-4">
                    Start Exploring AI Tools Today
                  </h3>
                  <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
                    Browse our complete directory of {totalProducts} AI tools, compare features and pricing, 
                    and find the perfect solutions to transform your workflow.
                  </p>
                  <Link
                    href="/categories"
                    className="inline-flex items-center px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Browse by Category
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
} 